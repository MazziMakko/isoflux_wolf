/**
 * =====================================================
 * STRIPE CONFIGURATION: WOLF SHIELD HUD-SECURE PRO
 * $299/month flat fee with 30-day trial
 * =====================================================
 */

// Stripe Product & Price IDs
// Create these in Stripe Dashboard:
// Product: "Wolf Shield HUD-Secure Pro"
// Price: $299/month (price_xxx)
// Trial: 30 days

export const STRIPE_CONFIG = {
  // Product
  PRODUCT_ID: process.env.STRIPE_PRODUCT_WOLF_SHIELD || '',
  
  // Pricing
  PRICE_ID_MONTHLY: process.env.STRIPE_PRICE_WOLF_SHIELD_MONTHLY || 'price_wolf_shield_299', // $299/mo
  
  // Features
  TRIAL_PERIOD_DAYS: 30,
  MONTHLY_PRICE: 299.00,
  CURRENCY: 'usd',
  
  // Billing
  BILLING_CYCLE: 'monthly' as const,
  FLAT_FEE: true, // Not per-unit pricing
  
  // Success/Cancel URLs
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
} as const;

// Stripe Checkout Session Configuration
export function getCheckoutSessionConfig(customerId?: string) {
  return {
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_CONFIG.PRICE_ID_MONTHLY,
        quantity: 1,
      },
    ],
    mode: 'subscription' as const,
    success_url: STRIPE_CONFIG.SUCCESS_URL,
    cancel_url: STRIPE_CONFIG.CANCEL_URL,
    customer: customerId,
    subscription_data: {
      trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
      metadata: {
        product: 'wolf_shield_hud_secure_pro',
        billing_model: 'flat_fee',
      },
    },
    allow_promotion_codes: true,
    consent_collection: {
      terms_of_service: 'required' as const,
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: 'I agree to the [Master Subscription Agreement](https://wolfshield.app/msa) and [Privacy Policy](https://wolfshield.app/privacy-policy)',
      },
    },
    metadata: {
      clickwrap_accepted: 'true',
      msa_url: 'https://wolfshield.app/msa',
      privacy_policy_url: 'https://wolfshield.app/privacy-policy',
      acceptance_timestamp: new Date().toISOString(),
    },
  };
}

// Customer Portal Configuration
export const CUSTOMER_PORTAL_CONFIG = {
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
};
