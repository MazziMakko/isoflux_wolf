-- =====================================================
-- BASE SCHEMA - Minimal tables for IsoFlux app
-- Run first so organizations, users, api_keys, audit_logs exist.
-- Treasurer and app (login, dashboard, API keys) depend on these.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums (ignore if already exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer', 'customer');
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

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  metadata JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'viewer',
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'draft',
  config JSONB DEFAULT '{}',
  ai_settings JSONB DEFAULT '{}',
  deployment_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Ensure tables that may pre-exist (e.g. from Supabase) have required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'organization_id') THEN
      ALTER TABLE public.audit_logs ADD COLUMN organization_id UUID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'organization_id') THEN
      ALTER TABLE public.projects ADD COLUMN organization_id UUID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'organization_id') THEN
      ALTER TABLE public.subscriptions ADD COLUMN organization_id UUID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'organization_id') THEN
      ALTER TABLE public.transactions ADD COLUMN organization_id UUID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organization_members' AND column_name = 'organization_id') THEN
      ALTER TABLE public.organization_members ADD COLUMN organization_id UUID;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'organization_id') THEN
      ALTER TABLE public.api_keys ADD COLUMN organization_id UUID;
    END IF;
  END IF;
END $$;

-- Indexes (create only when table/column exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'organization_id') THEN
    CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(organization_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'organization_id') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(organization_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'organization_id') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'organization_id') THEN
    CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON public.api_keys(organization_id);
  END IF;
END $$;

-- RLS (enable only on tables that exist)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','organizations','organization_members','subscriptions','projects','transactions','audit_logs','api_keys']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- Basic policies (only on tables that exist and have required columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    DROP POLICY IF EXISTS "users_select_own" ON public.users;
    CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
    DROP POLICY IF EXISTS "users_update_own" ON public.users;
    CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    DROP POLICY IF EXISTS "orgs_select_member" ON public.organizations;
    CREATE POLICY "orgs_select_member" ON public.organizations FOR SELECT USING (
      id IN (SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid())
    );
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organization_members' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
    CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
      organization_id IN (SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "projects_select_member" ON public.projects;
    CREATE POLICY "projects_select_member" ON public.projects FOR SELECT USING (
      organization_id IN (SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid())
    );
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "subscriptions_select_member" ON public.subscriptions;
    CREATE POLICY "subscriptions_select_member" ON public.subscriptions FOR SELECT USING (
      organization_id IN (SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid())
    );
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "transactions_select_member" ON public.transactions;
    CREATE POLICY "transactions_select_member" ON public.transactions FOR SELECT USING (
      organization_id IN (SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid())
    );
  END IF;
END $$;

-- Service role can do everything (only on tables that exist)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','organizations','organization_members','subscriptions','projects','transactions','audit_logs','api_keys']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    COMMENT ON TABLE public.users IS 'IsoFlux base schema: user accounts';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    COMMENT ON TABLE public.organizations IS 'IsoFlux base schema: tenants';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    COMMENT ON TABLE public.api_keys IS 'IsoFlux Reactor API keys per organization';
  END IF;
END $$;
