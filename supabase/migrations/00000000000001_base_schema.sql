-- =====================================================
-- WOLF SHIELD: BASE SCHEMA (Organizations & Users)
-- Must run AFTER cleanup, BEFORE ledger migration
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- BASE ENUMS
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin',
    'property_manager',
    'tenant',
    'member'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'INCOMPLETE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM (
    'STARTER',
    'PRO',
    'ENTERPRISE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_status subscription_status DEFAULT 'TRIALING',
  subscription_tier subscription_tier DEFAULT 'STARTER',
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- HUD compliance fields
  hud_certification_number VARCHAR(100),
  compliance_health DECIMAL(5, 2) DEFAULT 0.00,
  last_audit_date TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  default_organization_id UUID REFERENCES organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORGANIZATION MEMBERS (Join Table)
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_default_org ON users(default_organization_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Try to get organization_id from the record
  IF TG_OP = 'DELETE' THEN
    org_id := OLD.organization_id;
  ELSE
    org_id := NEW.organization_id;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    org_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_members_updated_at ON organization_members;
CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: Members can view their orgs
CREATE POLICY organizations_select_member ON organizations FOR SELECT USING (
  id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- Organizations: Only admins can update
CREATE POLICY organizations_update_admin ON organizations FOR UPDATE USING (
  id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Users: Can view own profile
CREATE POLICY users_select_own ON users FOR SELECT USING (id = auth.uid());

-- Users: Can update own profile
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = auth.uid());

-- Organization Members: Can view members of own orgs
CREATE POLICY org_members_select_own_org ON organization_members FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Audit Logs: Read-only for org members
CREATE POLICY audit_logs_select_member ON audit_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organizations IS 'Wolf Shield organizations with HUD compliance tracking';
COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE organization_members IS 'Multi-tenant organization membership with role-based access';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all database operations';

-- =====================================================
-- BASE SCHEMA COMPLETE
-- =====================================================
