-- =====================================================
-- WOLF SHIELD: COMPLETE MIGRATION (ALL-IN-ONE)
-- Run this single migration to set up everything
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE ENUMS (if they don't exist)
-- =====================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'property_manager', 'tenant', 'editor', 'viewer', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'incomplete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- STEP 2: ADD MISSING ENUM VALUES (if needed)
-- =====================================================
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'property_manager';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- STEP 3: CREATE CORE TABLES
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  metadata JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Fix existing organizations (if owner_id is NULL, use first super_admin user)
DO $$
DECLARE
  first_admin_id UUID;
BEGIN
  SELECT id INTO first_admin_id FROM public.users WHERE role = 'super_admin' LIMIT 1;
  IF first_admin_id IS NULL THEN
    SELECT id INTO first_admin_id FROM public.users LIMIT 1;
  END IF;
  
  IF first_admin_id IS NOT NULL THEN
    UPDATE public.organizations SET owner_id = first_admin_id WHERE owner_id IS NULL;
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_owner_id_fkey') THEN
    ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'viewer',
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Add columns if they don't exist
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- Subscriptions Table (REQUIRED FOR REVENUE SYNC)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  tier subscription_tier DEFAULT 'free',
  status subscription_status DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- =====================================================
-- STEP 4: REVENUE SYNC TABLES
-- =====================================================

-- Webhook Events Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'processing',
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_type ON public.webhook_events(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);

-- Retention Tasks Table
CREATE TABLE IF NOT EXISTS public.retention_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  task_type VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  data JSONB,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_tasks_scheduled ON public.retention_tasks(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_retention_tasks_org ON public.retention_tasks(organization_id);

-- Admin Alerts Table
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  message TEXT NOT NULL,
  data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_status ON public.admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON public.admin_alerts(severity);

-- Draft Orders Table
CREATE TABLE IF NOT EXISTS public.draft_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255) UNIQUE,
  price_id VARCHAR(255) NOT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_draft_orders_org ON public.draft_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_draft_orders_session ON public.draft_orders(stripe_session_id);

-- =====================================================
-- STEP 5: IMPORT JOBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_path TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_rows INT DEFAULT 0,
  successful_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  warning_rows INT DEFAULT 0,
  column_mapping JSONB,
  validation_errors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON public.import_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON public.import_jobs(status);

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: CREATE RLS POLICIES
-- =====================================================

-- Webhook events: Service role only
DROP POLICY IF EXISTS webhook_events_service_role ON public.webhook_events;
CREATE POLICY webhook_events_service_role ON public.webhook_events
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Retention tasks: Service role only
DROP POLICY IF EXISTS retention_tasks_service_role ON public.retention_tasks;
CREATE POLICY retention_tasks_service_role ON public.retention_tasks
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin alerts: Super admins and org members
DROP POLICY IF EXISTS admin_alerts_super_admin ON public.admin_alerts;
CREATE POLICY admin_alerts_super_admin ON public.admin_alerts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS admin_alerts_org_admin ON public.admin_alerts;
CREATE POLICY admin_alerts_org_admin ON public.admin_alerts
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'property_manager')
    )
  );

-- Draft orders: Users can see their own
DROP POLICY IF EXISTS draft_orders_own ON public.draft_orders;
CREATE POLICY draft_orders_own ON public.draft_orders
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Import jobs: Organization members can see their org's imports
DROP POLICY IF EXISTS import_jobs_org_members ON public.import_jobs;
CREATE POLICY import_jobs_org_members ON public.import_jobs
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS import_jobs_org_members_insert ON public.import_jobs;
CREATE POLICY import_jobs_org_members_insert ON public.import_jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- API Keys: Admins can manage their org's API keys
DROP POLICY IF EXISTS api_keys_admins_view ON public.api_keys;
CREATE POLICY api_keys_admins_view ON public.api_keys
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'super_admin')
    )
  );

DROP POLICY IF EXISTS api_keys_admins_create ON public.api_keys;
CREATE POLICY api_keys_admins_create ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'super_admin')
    )
  );

DROP POLICY IF EXISTS api_keys_admins_delete ON public.api_keys;
CREATE POLICY api_keys_admins_delete ON public.api_keys
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'super_admin')
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Wolf Shield Complete Migration: ALL TABLES CREATED';
  RAISE NOTICE '✅ Core tables: users, organizations, subscriptions, transactions';
  RAISE NOTICE '✅ Revenue Sync: webhook_events, retention_tasks, admin_alerts, draft_orders';
  RAISE NOTICE '✅ Import: import_jobs table';
  RAISE NOTICE '✅ RLS: All policies configured';
END $$;
