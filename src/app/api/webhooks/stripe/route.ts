// =====================================================
// STRIPE WEBHOOK HANDLER - PRODUCTION READY
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Log webhook event
    const webhookEvent = await dataGateway.createWebhookEvent({
      source: 'stripe',
      event_type: event.type,
      payload: event as any,
      signature,
      status: 'processing',
    });

    if (!webhookEvent) {
      return NextResponse.json(
        { error: 'Failed to create webhook event' },
        { status: 500 }
      );
    }

    // Process event based on type
    try {
      await processStripeEvent(event, dataGateway, auditLogger);

      // Update webhook status
      await dataGateway.updateWebhookStatus(webhookEvent.id, 'succeeded');

      return NextResponse.json({ received: true, eventId: webhookEvent.id });
    } catch (error: any) {
      console.error('Webhook processing error:', error);

      // Update webhook status with error
      await dataGateway.updateWebhookStatus(
        webhookEvent.id,
        'failed',
        error.message
      );

      // Still return 200 to prevent Stripe retries for application errors
      return NextResponse.json(
        { received: true, error: error.message },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processStripeEvent(
  event: Stripe.Event,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, dataGateway);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, dataGateway);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice, dataGateway, auditLogger);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice, dataGateway, auditLogger);
      break;

    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, dataGateway);
      break;

    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, dataGateway, auditLogger);
      break;

    case 'account.updated':
      await handleConnectAccountUpdated(event.data.object as Stripe.Account, dataGateway, auditLogger);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  dataGateway: DataGateway
) {
  const customerId = subscription.customer as string;
  
  // Find organization by Stripe customer ID
  const organizations = await dataGateway.findMany('organizations', {});
  const org = organizations.find(
    o => (o.metadata as any)?.stripe_customer_id === customerId
  );

  if (!org) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Determine tier from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const tierMap: Record<string, 'free' | 'starter' | 'pro' | 'enterprise'> = {
    [process.env.STRIPE_PRICE_STARTER || 'price_starter']: 'starter',
    [process.env.STRIPE_PRICE_PRO || 'price_pro']: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise']: 'enterprise',
  };
  const tier = tierMap[priceId] || 'free';

  // Upsert subscription
  const existingSub = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscription.id as any,
  });

  if (existingSub.length > 0) {
    await dataGateway.updateSubscription(existingSub[0].id, {
      status: subscription.status as any,
      tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata as any,
    });
  } else {
    await dataGateway.create('subscriptions', {
      organization_id: org.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      tier,
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata as any,
    });
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  dataGateway: DataGateway
) {
  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: subscription.id as any,
  });

  if (subs.length > 0) {
    await dataGateway.updateSubscription(subs[0].id, {
      status: 'cancelled',
    });
  }
}

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
  if (!invoice.subscription) return;

  const subs = await dataGateway.findMany('subscriptions', {
    stripe_subscription_id: invoice.subscription as any,
  });

  if (subs.length === 0) return;

  const subscription = subs[0];

  await dataGateway.updateSubscription(subscription.id, {
    status: 'past_due',
  });

  await auditLogger.logPaymentEvent(
    subscription.organization_id,
    'PAYMENT_FAILED',
    {
      amount: invoice.amount_due,
      currency: invoice.currency,
      invoice_id: invoice.id,
    }
  );
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  dataGateway: DataGateway
) {
  // Update draft order status
  const draftOrders = await dataGateway.findMany('draft_orders', {
    stripe_session_id: session.id as any,
  });

  if (draftOrders.length > 0) {
    await dataGateway.update('draft_orders', draftOrders[0].id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  console.log('Checkout completed:', session.id);
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
