-- =====================================================
-- WOLF SHIELD: REVENUE SYNC DATABASE TABLES
-- Migration: Add webhook tracking and retention tasks
-- =====================================================

-- =====================================================
-- WEBHOOK EVENTS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source VARCHAR(50) NOT NULL, -- 'stripe', 'mercury', 'flutterwave'
  event_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe event ID (prevents duplicate processing)
  event_type VARCHAR(100) NOT NULL, -- 'invoice.payment_succeeded', etc.
  
  payload JSONB NOT NULL, -- Full webhook payload
  signature TEXT NOT NULL, -- Webhook signature for verification
  
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'succeeded', 'failed'
  error_message TEXT, -- Error details if processing failed
  
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_source_type ON webhook_events(source, event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at DESC);

COMMENT ON TABLE webhook_events IS 'Audit log for all incoming webhook events from payment providers';
COMMENT ON COLUMN webhook_events.event_id IS 'Unique event ID from payment provider (used for idempotency)';

-- =====================================================
-- RETENTION TASKS TABLE (Scheduled Background Jobs)
-- =====================================================
CREATE TABLE IF NOT EXISTS retention_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  task_type VARCHAR(100) NOT NULL, -- 'soft_delete_org_data', 'checkout_abandoned', 'payment_reminder'
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  scheduled_at TIMESTAMPTZ NOT NULL, -- When to execute the task
  executed_at TIMESTAMPTZ, -- When task was actually executed
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  
  data JSONB, -- Task-specific data (e.g., email params, org data to delete)
  result JSONB, -- Task execution result
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_retention_tasks_scheduled ON retention_tasks(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_retention_tasks_org ON retention_tasks(organization_id);
CREATE INDEX idx_retention_tasks_status ON retention_tasks(status);
CREATE INDEX idx_retention_tasks_type ON retention_tasks(task_type);

COMMENT ON TABLE retention_tasks IS 'Scheduled background tasks for retention, cleanup, and notifications';
COMMENT ON COLUMN retention_tasks.task_type IS 'Type of task: soft_delete_org_data, checkout_abandoned, payment_reminder';

-- =====================================================
-- ADMIN ALERTS TABLE (For Super Admin Dashboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(100) NOT NULL, -- 'connect_verification_incomplete', 'subscription_churn_risk', etc.
  severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  message TEXT NOT NULL,
  data JSONB, -- Alert-specific data
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved'
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_alerts_status ON admin_alerts(status);
CREATE INDEX idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX idx_admin_alerts_org ON admin_alerts(organization_id);
CREATE INDEX idx_admin_alerts_created ON admin_alerts(created_at DESC);

COMMENT ON TABLE admin_alerts IS 'High-priority alerts for Super Admin dashboard monitoring';

-- =====================================================
-- DRAFT ORDERS TABLE (For Abandoned Checkout Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS draft_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  stripe_session_id VARCHAR(255) UNIQUE, -- Stripe checkout session ID
  price_id VARCHAR(255) NOT NULL, -- Stripe price ID (e.g., price_wolf_shield_299)
  
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  
  metadata JSONB
);

CREATE INDEX idx_draft_orders_org ON draft_orders(organization_id);
CREATE INDEX idx_draft_orders_user ON draft_orders(user_id);
CREATE INDEX idx_draft_orders_session ON draft_orders(stripe_session_id);
CREATE INDEX idx_draft_orders_status ON draft_orders(status);

COMMENT ON TABLE draft_orders IS 'Tracks checkout sessions for abandoned cart recovery';

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Add grace_period_ends to subscriptions metadata (already using JSONB metadata column)
COMMENT ON COLUMN subscriptions.metadata IS 'Stores grace_period_ends, payment_failed_at, data_retention_until, etc.';

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================

-- Webhook events: Only service role can access
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_service_role ON webhook_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Retention tasks: Only service role can access
ALTER TABLE retention_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY retention_tasks_service_role ON retention_tasks
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin alerts: Super admins can read all, org admins can read their own
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_alerts_super_admin ON admin_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY admin_alerts_org_admin ON admin_alerts
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Draft orders: Users can read their own
ALTER TABLE draft_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY draft_orders_own ON draft_orders
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- CRON JOB FUNCTION (Process Retention Tasks)
-- =====================================================

CREATE OR REPLACE FUNCTION process_retention_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by a cron job (e.g., every hour)
  -- It processes all pending retention tasks that are due
  
  -- Mark tasks as processing
  UPDATE retention_tasks
  SET status = 'processing', updated_at = NOW()
  WHERE status = 'pending'
  AND scheduled_at <= NOW();
  
  -- Actual processing happens in API endpoint: /api/cron/process-retention
  -- This just marks them as ready for processing
END;
$$;

COMMENT ON FUNCTION process_retention_tasks() IS 'Marks pending retention tasks as ready for processing (called by cron)';
