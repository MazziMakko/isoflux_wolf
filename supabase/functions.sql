-- =====================================================
-- STRIPE WEBHOOK VERIFICATION & PROCESSING
-- =====================================================

CREATE OR REPLACE FUNCTION process_stripe_webhook(
  event_id UUID,
  event_type TEXT,
  payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  subscription_data JSONB;
  customer_id TEXT;
  org_id UUID;
BEGIN
  -- Update webhook status to processing
  UPDATE webhook_events 
  SET status = 'processing', processed_at = NOW()
  WHERE id = event_id;

  -- Handle different event types
  CASE event_type
    WHEN 'customer.subscription.created', 'customer.subscription.updated' THEN
      subscription_data := payload->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Find organization by stripe customer ID
      SELECT id INTO org_id FROM organizations 
      WHERE (metadata->>'stripe_customer_id') = customer_id;
      
      IF org_id IS NOT NULL THEN
        -- Upsert subscription
        INSERT INTO subscriptions (
          organization_id,
          stripe_subscription_id,
          stripe_customer_id,
          tier,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          metadata
        ) VALUES (
          org_id,
          subscription_data->>'id',
          customer_id,
          CASE subscription_data->'items'->'data'->0->'price'->>'id'
            WHEN 'price_starter' THEN 'starter'::subscription_tier
            WHEN 'price_pro' THEN 'pro'::subscription_tier
            WHEN 'price_enterprise' THEN 'enterprise'::subscription_tier
            ELSE 'free'::subscription_tier
          END,
          (subscription_data->>'status')::subscription_status,
          to_timestamp((subscription_data->>'current_period_start')::bigint),
          to_timestamp((subscription_data->>'current_period_end')::bigint),
          (subscription_data->>'cancel_at_period_end')::boolean,
          subscription_data
        )
        ON CONFLICT (stripe_subscription_id) 
        DO UPDATE SET
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          cancel_at_period_end = EXCLUDED.cancel_at_period_end,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      END IF;

    WHEN 'customer.subscription.deleted' THEN
      subscription_data := payload->'data'->'object';
      UPDATE subscriptions 
      SET status = 'cancelled'::subscription_status, updated_at = NOW()
      WHERE stripe_subscription_id = subscription_data->>'id';

    WHEN 'invoice.payment_succeeded' THEN
      subscription_data := payload->'data'->'object';
      -- Record transaction
      INSERT INTO transactions (
        organization_id,
        stripe_payment_intent_id,
        amount_cents,
        currency,
        status,
        description,
        metadata
      )
      SELECT 
        s.organization_id,
        subscription_data->>'payment_intent',
        (subscription_data->>'amount_paid')::int,
        subscription_data->>'currency',
        'succeeded'::payment_status,
        subscription_data->>'description',
        subscription_data
      FROM subscriptions s
      WHERE s.stripe_subscription_id = subscription_data->>'subscription';

    WHEN 'invoice.payment_failed' THEN
      subscription_data := payload->'data'->'object';
      UPDATE subscriptions 
      SET status = 'past_due'::subscription_status, updated_at = NOW()
      WHERE stripe_subscription_id = subscription_data->>'subscription';

    ELSE
      -- Log unhandled event type
      result := jsonb_build_object('status', 'unhandled', 'event_type', event_type);
  END CASE;

  -- Mark webhook as succeeded
  UPDATE webhook_events 
  SET status = 'succeeded', processed_at = NOW()
  WHERE id = event_id;

  result := jsonb_build_object('status', 'success', 'event_id', event_id);
  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Mark webhook as failed
    UPDATE webhook_events 
    SET 
      status = 'failed', 
      error_message = SQLERRM,
      retry_count = retry_count + 1
    WHERE id = event_id;
    
    RAISE;
END;
$$;

-- =====================================================
-- FLUTTERWAVE WEBHOOK PROCESSING
-- =====================================================

CREATE OR REPLACE FUNCTION process_flutterwave_webhook(
  event_id UUID,
  event_type TEXT,
  payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  transaction_data JSONB;
  org_id UUID;
BEGIN
  UPDATE webhook_events 
  SET status = 'processing', processed_at = NOW()
  WHERE id = event_id;

  transaction_data := payload->'data';

  -- Find organization by transaction metadata
  org_id := (transaction_data->'meta'->>'organization_id')::UUID;

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Organization ID not found in webhook payload';
  END IF;

  -- Handle charge completed
  IF event_type = 'charge.completed' AND transaction_data->>'status' = 'successful' THEN
    INSERT INTO transactions (
      organization_id,
      amount_cents,
      currency,
      status,
      description,
      metadata
    ) VALUES (
      org_id,
      (transaction_data->>'amount')::numeric * 100,
      transaction_data->>'currency',
      'succeeded'::payment_status,
      transaction_data->>'narration',
      transaction_data
    );
  END IF;

  UPDATE webhook_events 
  SET status = 'succeeded', processed_at = NOW()
  WHERE id = event_id;

  RETURN jsonb_build_object('status', 'success');

EXCEPTION
  WHEN OTHERS THEN
    UPDATE webhook_events 
    SET status = 'failed', error_message = SQLERRM, retry_count = retry_count + 1
    WHERE id = event_id;
    RAISE;
END;
$$;

-- =====================================================
-- MERCURY WEBHOOK PROCESSING
-- =====================================================

CREATE OR REPLACE FUNCTION process_mercury_webhook(
  event_id UUID,
  event_type TEXT,
  payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  transaction_data JSONB;
  org_id UUID;
BEGIN
  UPDATE webhook_events 
  SET status = 'processing', processed_at = NOW()
  WHERE id = event_id;

  transaction_data := payload->'data';

  -- Mercury transaction processing
  IF event_type = 'transaction.updated' THEN
    -- Extract organization from metadata
    org_id := (transaction_data->'metadata'->>'organization_id')::UUID;
    
    IF org_id IS NOT NULL THEN
      INSERT INTO transactions (
        organization_id,
        amount_cents,
        currency,
        status,
        description,
        metadata
      ) VALUES (
        org_id,
        (transaction_data->>'amount')::numeric * 100,
        'USD',
        CASE transaction_data->>'status'
          WHEN 'completed' THEN 'succeeded'::payment_status
          WHEN 'failed' THEN 'failed'::payment_status
          ELSE 'pending'::payment_status
        END,
        transaction_data->>'description',
        transaction_data
      );
    END IF;
  END IF;

  UPDATE webhook_events 
  SET status = 'succeeded', processed_at = NOW()
  WHERE id = event_id;

  RETURN jsonb_build_object('status', 'success');

EXCEPTION
  WHEN OTHERS THEN
    UPDATE webhook_events 
    SET status = 'failed', error_message = SQLERRM, retry_count = retry_count + 1
    WHERE id = event_id;
    RAISE;
END;
$$;

-- =====================================================
-- WEBHOOK RETRY FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION retry_failed_webhooks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Retry failed webhooks with exponential backoff
  UPDATE webhook_events
  SET status = 'retrying'
  WHERE status = 'failed'
    AND retry_count < 5
    AND created_at > NOW() - INTERVAL '24 hours'
    AND created_at < NOW() - (INTERVAL '1 minute' * POWER(2, retry_count));
END;
$$;

COMMENT ON FUNCTION process_stripe_webhook IS 'Process and validate Stripe webhook events';
COMMENT ON FUNCTION process_flutterwave_webhook IS 'Process Flutterwave payment webhooks';
COMMENT ON FUNCTION process_mercury_webhook IS 'Process Mercury banking webhooks';
