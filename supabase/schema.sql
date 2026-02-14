-- =====================================================
-- FLUXFORGE AI - PRODUCTION DATABASE SCHEMA
-- Zero-Trust Security Architecture with RLS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer', 'customer');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'incomplete');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived', 'deleted');
CREATE TYPE webhook_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'retrying');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table with Multi-Tenant Support
CREATE TABLE users (
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

-- Organizations/Tenants
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (RBAC)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'viewer',
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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

-- Projects (SaaS Apps built by users)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'draft',
  config JSONB DEFAULT '{}',
  ai_settings JSONB DEFAULT '{}',
  deployment_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- AI Agent Configurations
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  agent_type VARCHAR(100) NOT NULL, -- 'orchestrator', 'rag', 'webhook', 'monitor'
  config JSONB NOT NULL DEFAULT '{}',
  prompt_template TEXT,
  guardrails JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAG Document Store
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_vector VECTOR(1536), -- For embeddings
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  source VARCHAR(100) NOT NULL, -- 'stripe', 'flutterwave', 'mercury', 'custom'
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT,
  status webhook_status DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (Compliance & Security)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (Secure access)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_ai_agents_project_id ON ai_agents(project_id);
CREATE INDEX idx_knowledge_base_project_id ON knowledge_base(project_id);
CREATE INDEX idx_webhook_events_project_id ON webhook_events(project_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX idx_transactions_org_id ON transactions(organization_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users: Can only see their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Organizations: Members can see their organizations
CREATE POLICY orgs_select_member ON organizations FOR SELECT USING (
  id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY orgs_update_owner ON organizations FOR UPDATE USING (owner_id = auth.uid());

-- Organization Members: Can see members of their organizations
CREATE POLICY org_members_select ON organization_members FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- Projects: Organization members can see projects
CREATE POLICY projects_select_member ON projects FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY projects_insert_admin ON projects FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Subscriptions: Organization members can view
CREATE POLICY subscriptions_select_member ON subscriptions FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- Transactions: Organization members can view their transactions
CREATE POLICY transactions_select_member ON transactions FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- Audit Logs: Only admins can view
CREATE POLICY audit_logs_select_admin ON audit_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, organization_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default roles and permissions
-- This would be handled by application logic

COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE organizations IS 'Multi-tenant organizations';
COMMENT ON TABLE projects IS 'SaaS applications built by users';
COMMENT ON TABLE ai_agents IS 'AI agent configurations for projects';
COMMENT ON TABLE knowledge_base IS 'RAG document store with embeddings';
COMMENT ON TABLE webhook_events IS 'Webhook event processing queue';
COMMENT ON TABLE audit_logs IS 'Compliance and security audit trail';
