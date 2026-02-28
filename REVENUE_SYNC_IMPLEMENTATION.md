# 🛡️ THE MONEY LOGIC - Wolf Shield Revenue Sync

## Enhanced Stripe Webhook Handler for $299/mo Subscription

### File: `src/app/api/webhooks/stripe/route.ts` (Wolf Shield Enhanced)

```typescript
// =====================================================
// WOLF SHIELD: STRIPE WEBHOOK ARMOR - $299/MO REVENUE SYNC
// =====================================================
// This handler manages the complete subscription lifecycle:
// - Instant provisioning on payment success
// - Immutable ledger logging for audit trail
// - Grace period enforcement on payment failure
// - Replay attack prevention with idempotency

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';
import { createHash } from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const WOLF_SHIELD_PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_wolf_shield_299';

// =====================================================
// IDEMPOTENCY & REPLAY ATTACK PREVENTION
// =====================================================
const processedEvents = new Map<string, number>();
const EVENT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (!timestamp) return false;
  
  // Clean up expired entries
  if (Date.now() - timestamp > EVENT_EXPIRY_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  
  return true;
}

function markEventProcessed(eventId: string) {
  processedEvents.set(eventId, Date.now());
  
  // Cleanup old entries (prevent memory leak)
  for (const [id, timestamp] of processedEvents.entries()) {
    if (Date.now() - timestamp > EVENT_EXPIRY_MS) {
      processedEvents.delete(id);
    }
  }
}

export async function POST(req: NextRequest) {
  const dataGateway = new DataGateway(true); // Service role for privileged operations
  const auditLogger = new AuditLogger();

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 1: SIGNATURE VERIFICATION (CRITICAL)
    // =====================================================
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 2: IDEMPOTENCY CHECK (REPLAY PREVENTION)
    // =====================================================
    if (isEventProcessed(event.id)) {
      console.warn('[Stripe Webhook] Duplicate event detected:', event.id);
      return NextResponse.json({ 
        received: true, 
        message: 'Event already processed' 
      });
    }

    console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

    // =====================================================
    // STEP 3: LOG TO DATABASE (AUDIT TRAIL)
    // =====================================================
    const webhookLog = await dataGateway.create('webhook_events', {
      source: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event as any,
      signature,
      status: 'processing',
      received_at: new Date().toISOString(),
    });

    if (!webhookLog) {
      console.error('[Stripe Webhook] Failed to create webhook log');
      return NextResponse.json(
        { error: 'Failed to log webhook event' },
        { status: 500 }
      );
    }

    // =====================================================
    // STEP 4: PROCESS EVENT (BUSINESS LOGIC)
    // =====================================================
    try {
      await processWolfShieldEvent(event, dataGateway, auditLogger);
      
      // Mark as processed (prevent replay)
      markEventProcessed(event.id);
      
      // Update webhook log status
      await dataGateway.update('webhook_events', webhookLog.id, {
        status: 'succeeded',
        processed_at: new Date().toISOString(),
      });

      return NextResponse.json({ 
        received: true, 
        eventId: event.id,
        webhookLogId: webhookLog.id 
      });
    } catch (error: any) {
      console.error('[Stripe Webhook] Processing error:', error);

      // Update webhook log with error
      await dataGateway.update('webhook_events', webhookLog.id, {
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString(),
      });

      // Return 200 to prevent Stripe retries for application errors
      return NextResponse.json(
        { received: true, error: error.message },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('[Stripe Webhook] Handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// WOLF SHIELD EVENT PROCESSOR
// =====================================================
async function processWolfShieldEvent(
  event: Stripe.Event,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        dataGateway,
        auditLogger
      );
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(
        event.data.object as Stripe.Invoice,
        dataGateway,
        auditLogger
      );
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(
        event.data.object as Stripe.Invoice,
        dataGateway,
        auditLogger
      );
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
        dataGateway,
        auditLogger
      );
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        dataGateway,
        auditLogger
      );
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}

// =====================================================
// CHECKOUT COMPLETED - INSTANT PROVISIONING
// =====================================================
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  console.log('[Wolf Shield] 💰 Checkout completed:', session.id);

  // Extract organization_id from metadata (set during checkout creation)
  const organizationId = session.metadata?.organization_id;
  if (!organizationId) {
    throw new Error('Missing organization_id in checkout session metadata');
  }

  // Get the subscription
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    throw new Error('No subscription attached to checkout session');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = session.customer as string;

  // =====================================================
  // STEP 1: UPDATE SUBSCRIPTION IN DATABASE
  // =====================================================
  const existingSubs = await dataGateway.findMany('subscriptions', {
    organization_id: organizationId as any,
  });

  if (existingSubs.length > 0) {
    // Update existing subscription
    await dataGateway.update('subscriptions', existingSubs[0].id, {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: 'active', // Upgrade from trialing to active
      tier: 'pro', // Wolf Shield is Pro tier
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      metadata: {
        checkout_session_id: session.id,
        activated_at: new Date().toISOString(),
      },
    });
  } else {
    // Create new subscription (shouldn't happen, but fallback)
    await dataGateway.create('subscriptions', {
      organization_id: organizationId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: 'active',
      tier: 'pro',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      metadata: {
        checkout_session_id: session.id,
        activated_at: new Date().toISOString(),
      },
    });
  }

  // =====================================================
  // STEP 2: LOG TO IMMUTABLE LEDGER (HUD AUDIT TRAIL)
  // =====================================================
  const organization = await dataGateway.findById('organizations', organizationId);
  if (!organization) {
    throw new Error(`Organization ${organizationId} not found`);
  }

  // Get a dummy property/unit for ledger entry (or create "System" entries)
  const properties = await dataGateway.findMany('properties', {
    organization_id: organizationId as any,
  });
  
  let propertyId: string;
  let unitId: string;

  if (properties.length > 0) {
    propertyId = properties[0].id;
    const units = await dataGateway.findMany('units', {
      property_id: propertyId as any,
    });
    unitId = units.length > 0 ? units[0].id : propertyId; // Fallback to propertyId if no units
  } else {
    // No properties yet, use organization ID as placeholder
    propertyId = organizationId;
    unitId = organizationId;
  }

  await dataGateway.create('hud_append_ledger', {
    organization_id: organizationId,
    property_id: propertyId,
    unit_id: unitId,
    tenant_id: null,
    transaction_type: 'CHARGE', // Revenue event
    amount: 299.00, // $299/mo
    description: `Wolf Shield Pro subscription activated - Checkout ${session.id}`,
    accounting_period: new Date().toISOString().substring(0, 7), // YYYY-MM
    is_period_closed: false,
    created_by: organization.owner_id,
    cryptographic_hash: '', // Will be generated by trigger
  });

  // =====================================================
  // STEP 3: AUDIT LOG
  // =====================================================
  await auditLogger.logEvent({
    organization_id: organizationId,
    user_id: organization.owner_id,
    action: 'SUBSCRIPTION_ACTIVATED',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    details: {
      amount: 29900, // cents
      currency: 'usd',
      checkout_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    },
  });

  console.log('[Wolf Shield] ✅ Subscription activated for org:', organizationId);
}

// =====================================================
// PAYMENT SUCCEEDED - RENEWAL CONFIRMATION
// =====================================================
async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  if (!invoice.subscription) {
    console.log('[Wolf Shield] Invoice not linked to subscription, skipping');
    return;
  }

  const subscriptionId = invoice.subscription as string;
  
  // Find subscription in database
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscriptionId as any,
  });

  if (subs.length === 0) {
    console.error('[Wolf Shield] Subscription not found:', subscriptionId);
    return;
  }

  const subscription = subs[0];

  // =====================================================
  // STEP 1: UPDATE SUBSCRIPTION STATUS
  // =====================================================
  const updates: any = {};

  // If was past_due, reactivate
  if (subscription.status === 'past_due') {
    updates.status = 'active';
    console.log('[Wolf Shield] 🎉 Payment recovered! Reactivating org:', subscription.organization_id);
  }

  // Update billing period
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  updates.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();

  await dataGateway.update('subscriptions', subscription.id, updates);

  // =====================================================
  // STEP 2: CREATE TRANSACTION RECORD
  // =====================================================
  await dataGateway.create('transactions', {
    organization_id: subscription.organization_id,
    subscription_id: subscription.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    status: 'succeeded',
    description: `Wolf Shield Pro - ${invoice.lines.data[0]?.description || 'Monthly subscription'}`,
    metadata: {
      invoice_id: invoice.id,
      invoice_number: invoice.number,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
    },
  });

  // =====================================================
  // STEP 3: LOG TO IMMUTABLE LEDGER
  // =====================================================
  const organization = await dataGateway.findById('organizations', subscription.organization_id);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: subscription.organization_id as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : subscription.organization_id;
    const unitId = propertyId;

    await dataGateway.create('hud_append_ledger', {
      organization_id: subscription.organization_id,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: null,
      transaction_type: 'PAYMENT',
      amount: invoice.amount_paid / 100, // Convert cents to dollars
      description: `Wolf Shield Pro renewal - Invoice ${invoice.number}`,
      accounting_period: new Date().toISOString().substring(0, 7),
      is_period_closed: false,
      created_by: organization.owner_id,
      cryptographic_hash: '',
    });
  }

  // =====================================================
  // STEP 4: AUDIT LOG
  // =====================================================
  await auditLogger.logEvent({
    organization_id: subscription.organization_id,
    action: subscription.status === 'past_due' ? 'PAYMENT_RECOVERED' : 'PAYMENT_SUCCEEDED',
    resource_type: 'invoice',
    resource_id: invoice.id,
    details: {
      amount: invoice.amount_paid,
      currency: invoice.currency,
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
    },
  });

  console.log('[Wolf Shield] ✅ Payment succeeded for org:', subscription.organization_id);
}

// =====================================================
// PAYMENT FAILED - GRACE PERIOD ENFORCEMENT
// =====================================================
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  if (!invoice.subscription) {
    console.log('[Wolf Shield] Invoice not linked to subscription, skipping');
    return;
  }

  const subscriptionId = invoice.subscription as string;
  
  // Find subscription in database
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscriptionId as any,
  });

  if (subs.length === 0) {
    console.error('[Wolf Shield] Subscription not found:', subscriptionId);
    return;
  }

  const subscription = subs[0];

  console.log('[Wolf Shield] ⚠️ Payment failed for org:', subscription.organization_id);

  // =====================================================
  // STEP 1: SET STATUS TO PAST_DUE (READ-ONLY MODE)
  // =====================================================
  await dataGateway.update('subscriptions', subscription.id, {
    status: 'past_due',
    metadata: {
      ...subscription.metadata as any,
      payment_failed_at: new Date().toISOString(),
      grace_period_ends: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      failed_invoice_id: invoice.id,
    },
  });

  // =====================================================
  // STEP 2: CREATE COMPLIANCE ALERT (PM DASHBOARD)
  // =====================================================
  await dataGateway.create('compliance_alerts', {
    organization_id: subscription.organization_id,
    property_id: null,
    alert_type: 'SUBSCRIPTION_PAST_DUE',
    severity: 'high',
    message: `Payment failed. Your account is now in read-only mode. Please update your payment method within 7 days to restore full access.`,
    status: 'active',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      invoice_id: invoice.id,
      next_retry: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toISOString() : null,
    },
  });

  // =====================================================
  // STEP 3: LOG TO IMMUTABLE LEDGER (AUDIT TRAIL)
  // =====================================================
  const organization = await dataGateway.findById('organizations', subscription.organization_id);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: subscription.organization_id as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : subscription.organization_id;
    const unitId = propertyId;

    await dataGateway.create('hud_append_ledger', {
      organization_id: subscription.organization_id,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: null,
      transaction_type: 'ADJUSTMENT', // Negative event
      amount: -(invoice.amount_due / 100), // Negative amount
      description: `Payment failed - Grace period activated (7 days) - Invoice ${invoice.number}`,
      accounting_period: new Date().toISOString().substring(0, 7),
      is_period_closed: false,
      created_by: organization.owner_id,
      cryptographic_hash: '',
    });
  }

  // =====================================================
  // STEP 4: AUDIT LOG
  // =====================================================
  await auditLogger.logEvent({
    organization_id: subscription.organization_id,
    action: 'PAYMENT_FAILED',
    resource_type: 'invoice',
    resource_id: invoice.id,
    details: {
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
      attempt_count: invoice.attempt_count,
      next_retry: invoice.next_payment_attempt,
    },
  });

  console.log('[Wolf Shield] ⚠️ Account moved to grace period (read-only)');
}

// =====================================================
// SUBSCRIPTION UPDATED - STATUS SYNC
// =====================================================
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscription.id as any,
  });

  if (subs.length === 0) {
    console.log('[Wolf Shield] Subscription not found, skipping update');
    return;
  }

  const dbSubscription = subs[0];

  // Update subscription status and period
  await dataGateway.update('subscriptions', dbSubscription.id, {
    status: subscription.status as any,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  console.log('[Wolf Shield] ✅ Subscription synced:', subscription.id);
}

// =====================================================
// SUBSCRIPTION DELETED - GRACEFUL SHUTDOWN
// =====================================================
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscription.id as any,
  });

  if (subs.length === 0) {
    console.error('[Wolf Shield] Subscription not found:', subscription.id);
    return;
  }

  const dbSubscription = subs[0];

  console.log('[Wolf Shield] 🔴 Subscription canceled for org:', dbSubscription.organization_id);

  // =====================================================
  // STEP 1: SET STATUS TO CANCELED (NO ACCESS)
  // =====================================================
  await dataGateway.update('subscriptions', dbSubscription.id, {
    status: 'canceled',
    metadata: {
      ...dbSubscription.metadata as any,
      canceled_at: new Date().toISOString(),
      data_retention_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    },
  });

  // =====================================================
  // STEP 2: LOG TO IMMUTABLE LEDGER (PERMANENT RECORD)
  // =====================================================
  const organization = await dataGateway.findById('organizations', dbSubscription.organization_id);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: dbSubscription.organization_id as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : dbSubscription.organization_id;
    const unitId = propertyId;

    await dataGateway.create('hud_append_ledger', {
      organization_id: dbSubscription.organization_id,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: null,
      transaction_type: 'ADJUSTMENT',
      amount: 0.00,
      description: `Subscription canceled - Data retained for 90 days`,
      accounting_period: new Date().toISOString().substring(0, 7),
      is_period_closed: false,
      created_by: organization.owner_id,
      cryptographic_hash: '',
    });
  }

  // =====================================================
  // STEP 3: SCHEDULE DATA RETENTION JOB
  // =====================================================
  await dataGateway.create('retention_tasks', {
    organization_id: dbSubscription.organization_id,
    task_type: 'soft_delete_org_data',
    priority: 'low',
    scheduled_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      subscription_id: dbSubscription.id,
      canceled_at: new Date().toISOString(),
    },
    status: 'pending',
  });

  // =====================================================
  // STEP 4: AUDIT LOG
  // =====================================================
  await auditLogger.logEvent({
    organization_id: dbSubscription.organization_id,
    action: 'SUBSCRIPTION_CANCELED',
    resource_type: 'subscription',
    resource_id: subscription.id,
    details: {
      subscription_id: subscription.id,
      canceled_at: new Date().toISOString(),
      data_retention_days: 90,
    },
  });

  console.log('[Wolf Shield] ✅ Subscription canceled, data retention scheduled');
}
```

---

## Security Enhancements

### 1. Idempotency Implementation
```typescript
// In-memory cache for processed events (production: use Redis)
const processedEvents = new Map<string, number>();

// Check if event already processed
if (isEventProcessed(event.id)) {
  return NextResponse.json({ received: true, message: 'Already processed' });
}

// Mark as processed after successful handling
markEventProcessed(event.id);
```

### 2. Signature Verification
```typescript
// Stripe SDK automatically verifies HMAC signature
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
// Throws error if signature invalid (prevents spoofing)
```

### 3. Webhook Event Logging
```typescript
// Every webhook logged to database before processing
const webhookLog = await dataGateway.create('webhook_events', {
  event_id: event.id,
  event_type: event.type,
  payload: event,
  signature,
  status: 'processing',
});
// Updated to 'succeeded' or 'failed' after processing
```

---

## Environment Variables Required

```bash
# .env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_MONTHLY=price_wolf_shield_299
```

---

## Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

---

## Next Steps

1. ✅ Add `webhook_events` table to schema
2. ✅ Add `retention_tasks` table for scheduled jobs
3. ✅ Implement email notifications on payment events
4. ✅ Create admin dashboard for failed payment monitoring
5. ✅ Set up Redis for production-grade idempotency
