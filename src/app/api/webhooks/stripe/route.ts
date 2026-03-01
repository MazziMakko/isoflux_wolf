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

    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, dataGateway, auditLogger);
      break;

    case 'account.updated':
      await handleConnectAccountUpdated(event.data.object as Stripe.Account, dataGateway, auditLogger);
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

  // Update subscription in database
  const existingSubs = await dataGateway.findMany('subscriptions', {
    organization_id: organizationId as any,
  });

  if (existingSubs.length > 0) {
    await dataGateway.update('subscriptions', existingSubs[0].id, {
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

  // Log to immutable ledger
  const organization = await dataGateway.findById('organizations', organizationId);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: organizationId as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : organizationId;
    const unitId = propertyId;

    await dataGateway.create('hud_append_ledger', {
      organization_id: organizationId,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: null,
      transaction_type: 'CHARGE',
      amount: 299.00,
      description: `Wolf Shield Pro subscription activated - Checkout ${session.id}`,
      accounting_period: new Date().toISOString().substring(0, 7),
      is_period_closed: false,
      created_by: organization.owner_id,
      cryptographic_hash: '',
    });
  }

  await auditLogger.logEvent({
    organization_id: organizationId,
    action: 'SUBSCRIPTION_ACTIVATED',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    details: {
      amount: 29900,
      currency: 'usd',
      checkout_session_id: session.id,
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
  if (!invoice.subscription) return;

  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: invoice.subscription as any,
  });

  if (subs.length === 0) return;

  const subscription = subs[0];

  await dataGateway.createTransaction({
    organization_id: subscription.organization_id,
    subscription_id: subscription.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    status: 'succeeded',
    description: invoice.description || 'Subscription payment',
    metadata: {
      invoice_id: invoice.id,
      invoice_number: invoice.number,
    } as any,
  });

  await auditLogger.logPaymentEvent(
    subscription.organization_id,
    'PAYMENT_SUCCESS',
    {
      amount: invoice.amount_paid,
      currency: invoice.currency,
      invoice_id: invoice.id,
    }
  );
}

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
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscriptionId as any,
  });

  if (subs.length === 0) {
    console.error('[Wolf Shield] Subscription not found:', subscriptionId);
    return;
  }

  const subscription = subs[0];
  console.log('[Wolf Shield] ⚠️ Payment failed for org:', subscription.organization_id);

  // Set status to past_due (read-only mode)
  await dataGateway.update('subscriptions', subscription.id, {
    status: 'past_due',
    metadata: {
      ...subscription.metadata as any,
      payment_failed_at: new Date().toISOString(),
      grace_period_ends: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      failed_invoice_id: invoice.id,
    },
  });

  // Create compliance alert
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
    },
  });

  // Log to immutable ledger
  const organization = await dataGateway.findById('organizations', subscription.organization_id);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: subscription.organization_id as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : subscription.organization_id;

    await dataGateway.create('hud_append_ledger', {
      organization_id: subscription.organization_id,
      property_id: propertyId,
      unit_id: propertyId,
      tenant_id: null,
      transaction_type: 'ADJUSTMENT',
      amount: -(invoice.amount_due / 100),
      description: `Payment failed - Grace period activated (7 days) - Invoice ${invoice.number}`,
      accounting_period: new Date().toISOString().substring(0, 7),
      is_period_closed: false,
      created_by: organization.owner_id,
      cryptographic_hash: '',
    });
  }

  await auditLogger.logEvent({
    organization_id: subscription.organization_id,
    action: 'PAYMENT_FAILED',
    resource_type: 'invoice',
    resource_id: invoice.id,
    details: {
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      invoice_id: invoice.id,
      attempt_count: invoice.attempt_count,
    },
  });

  console.log('[Wolf Shield] ⚠️ Account moved to grace period (read-only)');
}

/**
 * THE TREASURER'S ABANDONMENT RECOVERY SYSTEM
 * 
 * Problem: User reaches payment page, then closes browser
 * Impact: 75% of checkouts are abandoned, losing 30-40% of potential revenue
 * Solution: Track expired sessions and trigger retention emails
 * 
 * This is THE most important revenue recovery mechanism.
 * A well-timed email can recover 15-20% of abandoned checkouts.
 */
async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  console.log('🔴 THE TREASURER ALERT: Checkout session expired:', session.id);

  // Find the draft order
  const draftOrders = await dataGateway.findMany('draft_orders', {
    stripe_session_id: session.id as any,
  });

  if (draftOrders.length === 0) {
    console.warn('Draft order not found for expired session:', session.id);
    return;
  }

  const draftOrder = draftOrders[0];

  // Update draft order status
  await dataGateway.update('draft_orders', draftOrder.id, {
    status: 'expired',
    expired_at: new Date().toISOString(),
    metadata: {
      ...(draftOrder.metadata as any),
      expiration_reason: 'checkout_session_expired',
      recovered: false,
    },
  });

  // Get organization and user for personalization
  const org = await dataGateway.findById('organizations', draftOrder.organization_id);
  const user = await dataGateway.findById('users', draftOrder.user_id);

  if (!org || !user) {
    console.error('Organization or user not found for expired session');
    return;
  }

  // =====================================================
  // THE TREASURER'S RETENTION EMAIL TRIGGER
  // =====================================================
  
  // Create retention task (to be processed by email service)
  await dataGateway.create('retention_tasks', {
    user_id: draftOrder.user_id,
    organization_id: draftOrder.organization_id,
    draft_order_id: draftOrder.id,
    task_type: 'checkout_abandoned',
    priority: 'high',
    scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Send after 1 hour
    data: {
      user_email: user.email,
      user_name: user.full_name,
      organization_name: org.name,
      price_id: draftOrder.price_id,
      abandoned_at: new Date().toISOString(),
    },
    status: 'pending',
  });

  // Audit log
  await auditLogger.logEvent({
    user_id: draftOrder.user_id,
    organization_id: draftOrder.organization_id,
    action: 'CHECKOUT_ABANDONED',
    details: {
      session_id: session.id,
      draft_order_id: draftOrder.id,
      retention_email_scheduled: true,
    },
  });

  console.log(`💰 THE TREASURER: Retention email scheduled for ${user.email}`);
}

/**
 * THE TREASURER'S STRIPE CONNECT KYC MONITOR
 * 
 * Problem: Vendors/Landlords abandon KYC verification
 * Impact: Payouts fail, money stuck in platform account
 * Solution: Track account verification status and alert
 * 
 * Critical for IsoFlux's multi-tenant payment distribution.
 */
async function handleConnectAccountUpdated(
  account: Stripe.Account,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  console.log('🔐 THE TREASURER: Stripe Connect account updated:', account.id);

  // Find organization with this Connect account
  const organizations = await dataGateway.findMany('organizations', {});
  const org = organizations.find(
    (o) => (o.metadata as any)?.stripe_connect_account_id === account.id
  );

  if (!org) {
    console.warn('Organization not found for Connect account:', account.id);
    return;
  }

  // Check verification status
  const isVerified = account.charges_enabled && account.payouts_enabled;
  const requiresAction = account.requirements?.currently_due?.length > 0;

  // Update organization metadata
  await dataGateway.update('organizations', org.id, {
    metadata: {
      ...(org.metadata as any),
      stripe_connect_account_id: account.id,
      stripe_connect_verified: isVerified,
      stripe_connect_charges_enabled: account.charges_enabled,
      stripe_connect_payouts_enabled: account.payouts_enabled,
      stripe_connect_requirements: account.requirements,
      stripe_connect_last_updated: new Date().toISOString(),
    },
  });

  // If verification is incomplete and requires action
  if (!isVerified && requiresAction) {
    console.warn(`⚠️ THE TREASURER WARNING: Account ${account.id} requires action`);

    // Create alert task
    await dataGateway.create('admin_alerts', {
      alert_type: 'connect_verification_incomplete',
      severity: 'high',
      organization_id: org.id,
      data: {
        account_id: account.id,
        requirements: account.requirements?.currently_due,
        message: `Stripe Connect account for ${org.name} requires additional verification`,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }

  // Audit log
  await auditLogger.logEvent({
    organization_id: org.id,
    action: 'CONNECT_ACCOUNT_UPDATED',
    details: {
      account_id: account.id,
      verified: isVerified,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements_due: account.requirements?.currently_due?.length || 0,
    },
  });
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

  // Set status to canceled (no access)
  await dataGateway.update('subscriptions', dbSubscription.id, {
    status: 'canceled',
    metadata: {
      ...dbSubscription.metadata as any,
      canceled_at: new Date().toISOString(),
      data_retention_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  // Log to immutable ledger
  const organization = await dataGateway.findById('organizations', dbSubscription.organization_id);
  if (organization) {
    const properties = await dataGateway.findMany('properties', {
      organization_id: dbSubscription.organization_id as any,
    });
    
    const propertyId = properties.length > 0 ? properties[0].id : dbSubscription.organization_id;

    await dataGateway.create('hud_append_ledger', {
      organization_id: dbSubscription.organization_id,
      property_id: propertyId,
      unit_id: propertyId,
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

  // Schedule data retention job
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

  // Audit log
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
