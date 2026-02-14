-- =====================================================
-- THE TREASURER'S DATABASE EXTENSIONS
-- Revenue Protection Infrastructure
-- =====================================================

-- Draft Orders Table (The Abandonment Trap Detector)
CREATE TABLE IF NOT EXISTS draft_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- The Treasurer's Idempotency System
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  
  -- Stripe Integration
  stripe_session_id VARCHAR(255) UNIQUE,
  price_id VARCHAR(255) NOT NULL,
  
  -- Status Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'initiated',
  -- Status values: 'initiated', 'checkout_initiated', 'completed', 'expired', 'recovered'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  
  -- Metadata for recovery analytics
  metadata JSONB DEFAULT '{}',
  
  -- Indexes for fast lookups
  CONSTRAINT draft_orders_status_check CHECK (status IN ('initiated', 'checkout_initiated', 'completed', 'expired', 'recovered'))
);

CREATE INDEX idx_draft_orders_user_id ON draft_orders(user_id);
CREATE INDEX idx_draft_orders_org_id ON draft_orders(organization_id);
CREATE INDEX idx_draft_orders_stripe_session ON draft_orders(stripe_session_id);
CREATE INDEX idx_draft_orders_status ON draft_orders(status);
CREATE INDEX idx_draft_orders_idempotency ON draft_orders(idempotency_key);

-- Retention Tasks Table (The Revenue Recovery Engine)
CREATE TABLE IF NOT EXISTS retention_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  draft_order_id UUID REFERENCES draft_orders(id) ON DELETE SET NULL,
  
  -- Task Configuration
  task_type VARCHAR(100) NOT NULL,
  -- Task types: 'checkout_abandoned', 'trial_ending', 'payment_failed', 'subscription_cancelled'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  -- Priority: 'low', 'medium', 'high', 'urgent'
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  
  -- Task Data
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: 'pending', 'processing', 'completed', 'failed', 'skipped'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT retention_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT retention_tasks_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped'))
);

CREATE INDEX idx_retention_tasks_user_id ON retention_tasks(user_id);
CREATE INDEX idx_retention_tasks_org_id ON retention_tasks(organization_id);
CREATE INDEX idx_retention_tasks_status ON retention_tasks(status);
CREATE INDEX idx_retention_tasks_scheduled ON retention_tasks(scheduled_at);
CREATE INDEX idx_retention_tasks_type ON retention_tasks(task_type);

-- Admin Alerts Table (The Connect KYC Monitor)
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Alert Configuration
  alert_type VARCHAR(100) NOT NULL,
  -- Types: 'connect_verification_incomplete', 'payout_failed', 'high_chargeback_rate', 'suspicious_activity'
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  -- Severity: 'low', 'medium', 'high', 'critical'
  
  -- Alert Data
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: 'pending', 'acknowledged', 'resolved', 'dismissed'
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  CONSTRAINT admin_alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT admin_alerts_status_check CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed'))
);

CREATE INDEX idx_admin_alerts_org_id ON admin_alerts(organization_id);
CREATE INDEX idx_admin_alerts_status ON admin_alerts(status);
CREATE INDEX idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX idx_admin_alerts_type ON admin_alerts(alert_type);
CREATE INDEX idx_admin_alerts_assigned ON admin_alerts(assigned_to);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Draft Orders RLS
ALTER TABLE draft_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own draft orders"
  ON draft_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own draft orders"
  ON draft_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all draft orders"
  ON draft_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

-- Retention Tasks RLS
ALTER TABLE retention_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own retention tasks"
  ON retention_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all retention tasks"
  ON retention_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

-- Admin Alerts RLS
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all alerts"
  ON admin_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage alerts"
  ON admin_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

-- =====================================================
-- TREASURER ANALYTICS VIEWS
-- =====================================================

-- Abandoned Checkout Analytics
CREATE OR REPLACE VIEW v_abandoned_checkouts AS
SELECT
  do.id AS draft_order_id,
  do.organization_id,
  do.user_id,
  u.email AS user_email,
  u.full_name AS user_name,
  org.name AS organization_name,
  do.price_id,
  do.status,
  do.created_at AS abandoned_at,
  do.metadata,
  CASE
    WHEN rt.status = 'completed' THEN TRUE
    ELSE FALSE
  END AS recovery_email_sent,
  rt.processed_at AS recovery_email_sent_at
FROM draft_orders do
LEFT JOIN users u ON do.user_id = u.id
LEFT JOIN organizations org ON do.organization_id = org.id
LEFT JOIN retention_tasks rt ON rt.draft_order_id = do.id
WHERE do.status IN ('expired', 'recovered');

-- Connect Account Verification Status
CREATE OR REPLACE VIEW v_connect_verification_status AS
SELECT
  org.id AS organization_id,
  org.name AS organization_name,
  org.metadata->>'stripe_connect_account_id' AS account_id,
  (org.metadata->>'stripe_connect_verified')::BOOLEAN AS is_verified,
  (org.metadata->>'stripe_connect_charges_enabled')::BOOLEAN AS charges_enabled,
  (org.metadata->>'stripe_connect_payouts_enabled')::BOOLEAN AS payouts_enabled,
  org.metadata->'stripe_connect_requirements' AS requirements,
  (org.metadata->>'stripe_connect_last_updated')::TIMESTAMPTZ AS last_updated
FROM organizations org
WHERE org.metadata ? 'stripe_connect_account_id';

-- Revenue Recovery Metrics
CREATE OR REPLACE VIEW v_revenue_recovery_metrics AS
SELECT
  DATE_TRUNC('day', do.created_at) AS date,
  COUNT(*) FILTER (WHERE do.status = 'expired') AS total_abandoned,
  COUNT(*) FILTER (WHERE do.status = 'recovered') AS total_recovered,
  ROUND(
    (COUNT(*) FILTER (WHERE do.status = 'recovered')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE do.status IN ('expired', 'recovered')), 0)) * 100,
    2
  ) AS recovery_rate_percent
FROM draft_orders do
WHERE do.status IN ('expired', 'recovered')
GROUP BY DATE_TRUNC('day', do.created_at)
ORDER BY date DESC;

-- =====================================================
-- AUTOMATED CLEANUP FUNCTIONS
-- =====================================================

-- Clean up old draft orders (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_draft_orders()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM draft_orders
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('expired', 'completed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Clean up processed retention tasks (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_retention_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM retention_tasks
  WHERE processed_at < NOW() - INTERVAL '30 days'
  AND status IN ('completed', 'skipped');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE draft_orders IS 'The Treasurer: Tracks all checkout attempts to prevent revenue leakage from abandoned carts';
COMMENT ON TABLE retention_tasks IS 'The Treasurer: Automated retention email tasks to recover abandoned checkouts';
COMMENT ON TABLE admin_alerts IS 'The Treasurer: Critical alerts for Stripe Connect verification and payout issues';
COMMENT ON VIEW v_abandoned_checkouts IS 'Analytics view for abandoned checkout recovery performance';
COMMENT ON VIEW v_connect_verification_status IS 'Monitor Stripe Connect account verification status';
COMMENT ON VIEW v_revenue_recovery_metrics IS 'Daily revenue recovery rate metrics';
