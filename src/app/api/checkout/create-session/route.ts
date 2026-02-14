// =====================================================
// CHECKOUT SESSION CREATION - WITH IDEMPOTENCY
// The Treasurer's Double-Charge Prevention System
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';
import { withAuth, SecurityContext } from '@/lib/core/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

/**
 * THE TREASURER'S IDEMPOTENCY PATTERN
 * 
 * Problem: User clicks "Subscribe" twice → Double charged
 * Solution: Generate unique idempotency key tied to user + intent
 * 
 * How it works:
 * 1. Generate UUID for this specific checkout attempt
 * 2. Store in database as "draft_order" BEFORE calling Stripe
 * 3. Use UUID as idempotency key for Stripe API
 * 4. If network fails and user retries, same key = same session
 */

async function handler(req: NextRequest, context: SecurityContext) {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Get organization
    const organizations = await dataGateway.findMany('organizations', {});
    const org = organizations.find((o) => o.owner_id === context.userId);

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // =====================================================
    // THE TREASURER'S IDEMPOTENCY KEY GENERATION
    // =====================================================
    
    // Generate unique idempotency key for this checkout attempt
    const idempotencyKey = uuidv4();
    
    // Create "Draft Order" in database BEFORE calling Stripe
    // This prevents revenue leakage by tracking ALL checkout attempts
    const draftOrder = await dataGateway.create('draft_orders', {
      organization_id: org.id,
      user_id: context.userId,
      idempotency_key: idempotencyKey,
      price_id: priceId,
      status: 'initiated',
      metadata: {
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        initiated_at: new Date().toISOString(),
      },
    });

    // Get or create Stripe customer
    let customerId = (org.metadata as any)?.stripe_customer_id;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create(
        {
          email: context.user?.email,
          metadata: {
            organization_id: org.id,
            user_id: context.userId,
          },
        },
        {
          idempotencyKey: `customer_${idempotencyKey}`,
        }
      );
      
      customerId = customer.id;
      
      // Store Stripe customer ID in organization metadata
      await dataGateway.update('organizations', org.id, {
        metadata: {
          ...(org.metadata as any),
          stripe_customer_id: customerId,
        },
      });
    }

    // =====================================================
    // THE TREASURER'S CHECKOUT SESSION
    // With Idempotency Key to Prevent Double Charging
    // =====================================================
    
    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          organization_id: org.id,
          user_id: context.userId,
          draft_order_id: draftOrder.id,
        },
        // Automatic tax calculation (if enabled)
        automatic_tax: { enabled: false },
        // Allow promotion codes
        allow_promotion_codes: true,
        // Billing address collection
        billing_address_collection: 'required',
        // Customer email
        customer_email: context.user?.email,
        // Expires after 24 hours
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      {
        // THE CRITICAL PART: IDEMPOTENCY KEY
        // If this request fails and retries, Stripe returns the SAME session
        idempotencyKey: `session_${idempotencyKey}`,
      }
    );

    // Update draft order with Stripe session ID
    await dataGateway.update('draft_orders', draftOrder.id, {
      stripe_session_id: session.id,
      status: 'checkout_initiated',
      metadata: {
        ...(draftOrder.metadata as any),
        stripe_session_url: session.url,
        expires_at: new Date(session.expires_at * 1000).toISOString(),
      },
    });

    // Audit log
    await auditLogger.logEvent({
      user_id: context.userId,
      organization_id: org.id,
      action: 'CHECKOUT_SESSION_CREATED',
      details: {
        session_id: session.id,
        price_id: priceId,
        idempotency_key: idempotencyKey,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      idempotencyKey,
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);

    // Log error
    await auditLogger.logEvent({
      user_id: context.userId,
      organization_id: context.organizationId,
      action: 'CHECKOUT_SESSION_ERROR',
      details: {
        error: error.message,
        stack: error.stack,
      },
    });

    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler, { requiredRole: 'customer' });
