-- =====================================================
-- THE WOLF SHIELD: HUD-COMPLIANT LEDGER MIGRATION
-- Cryptographic Append-Only Ledger with Triggers
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS (HUD-Specific)
-- =====================================================

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM (
    'CHARGE',
    'PAYMENT',
    'ADJUSTMENT',
    'FEE',
    'RECERTIFICATION_LOG',
    'MAINTENANCE_REQUEST',
    'MAINTENANCE_APPROVAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE recertification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'OVERDUE',
    'COMPLETED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE unit_status AS ENUM (
    'VACANT',
    'OCCUPIED',
    'MAINTENANCE',
    'RESERVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update existing user_role enum to include HUD roles
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'property_manager';
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- HUD TABLES
-- =====================================================

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  hud_property_id VARCHAR(100) UNIQUE,
  total_units INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units Table
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms DECIMAL(3, 1) DEFAULT 0,
  square_feet INT,
  rent_amount DECIMAL(10, 2) NOT NULL,
  status unit_status DEFAULT 'VACANT',
  current_tenant_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, unit_number)
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  lease_start_date TIMESTAMPTZ NOT NULL,
  lease_end_date TIMESTAMPTZ NOT NULL,
  recertification_status recertification_status DEFAULT 'PENDING',
  next_recertification_due TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for current_tenant_id after tenants table is created
ALTER TABLE units ADD CONSTRAINT fk_units_current_tenant 
  FOREIGN KEY (current_tenant_id) REFERENCES tenants(id);

-- =====================================================
-- THE WOLF SHIELD: APPEND-ONLY LEDGER
-- =====================================================

CREATE TABLE IF NOT EXISTS hud_append_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0.00,
  description TEXT NOT NULL,
  accounting_period VARCHAR(7) NOT NULL, -- YYYY-MM format
  is_period_closed BOOLEAN DEFAULT FALSE,
  cryptographic_hash VARCHAR(64) NOT NULL, -- SHA-256 hash
  previous_hash VARCHAR(64), -- Hash of previous record in chain
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_hud_id ON properties(hud_property_id);

CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_current_tenant ON units(current_tenant_id);

CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit_id ON tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenants_recert_status ON tenants(recertification_status);

CREATE INDEX IF NOT EXISTS idx_ledger_org_period ON hud_append_ledger(organization_id, accounting_period);
CREATE INDEX IF NOT EXISTS idx_ledger_property ON hud_append_ledger(property_id);
CREATE INDEX IF NOT EXISTS idx_ledger_unit ON hud_append_ledger(unit_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON hud_append_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_hash ON hud_append_ledger(cryptographic_hash);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON hud_append_ledger(created_at);

-- =====================================================
-- WOLF SHIELD PROTECTION: DATABASE TRIGGERS
-- =====================================================

-- Function: Prevent DELETE on ledger (Append-Only)
CREATE OR REPLACE FUNCTION prevent_ledger_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'WOLF SHIELD VIOLATION: Cannot delete entries from hud_append_ledger. This ledger is append-only for HUD compliance.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Prevent UPDATE on ledger (Immutable)
CREATE OR REPLACE FUNCTION prevent_ledger_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'WOLF SHIELD VIOLATION: Cannot update entries in hud_append_ledger. Records are immutable for audit compliance.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Enforce Period Closure (No new entries to closed periods)
CREATE OR REPLACE FUNCTION enforce_period_closure()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trying to insert into a closed period
  IF EXISTS (
    SELECT 1 FROM hud_append_ledger 
    WHERE organization_id = NEW.organization_id 
    AND accounting_period = NEW.accounting_period 
    AND is_period_closed = TRUE
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'WOLF SHIELD VIOLATION: Cannot add entries to closed accounting period %. Contact Super Admin to reopen.', NEW.accounting_period;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-generate cryptographic hash (SHA-256 chain)
CREATE OR REPLACE FUNCTION generate_ledger_hash()
RETURNS TRIGGER AS $$
DECLARE
  prev_hash VARCHAR(64);
  hash_input TEXT;
BEGIN
  -- Get the hash of the most recent record for this organization
  SELECT cryptographic_hash INTO prev_hash
  FROM hud_append_ledger
  WHERE organization_id = NEW.organization_id
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  -- Store previous hash for chaining
  NEW.previous_hash := prev_hash;
  
  -- Create hash input: previousHash + currentRowData
  hash_input := COALESCE(prev_hash, 'GENESIS') || 
                NEW.organization_id::TEXT ||
                NEW.property_id::TEXT ||
                NEW.unit_id::TEXT ||
                COALESCE(NEW.tenant_id::TEXT, '') ||
                NEW.transaction_type::TEXT ||
                NEW.amount::TEXT ||
                NEW.description ||
                NEW.accounting_period ||
                NEW.created_by::TEXT ||
                EXTRACT(EPOCH FROM NEW.created_at)::TEXT;
  
  -- Generate SHA-256 hash
  NEW.cryptographic_hash := encode(digest(hash_input, 'sha256'), 'hex');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers to hud_append_ledger
DROP TRIGGER IF EXISTS trigger_prevent_ledger_delete ON hud_append_ledger;
CREATE TRIGGER trigger_prevent_ledger_delete
  BEFORE DELETE ON hud_append_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_delete();

DROP TRIGGER IF EXISTS trigger_prevent_ledger_update ON hud_append_ledger;
CREATE TRIGGER trigger_prevent_ledger_update
  BEFORE UPDATE ON hud_append_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_update();

DROP TRIGGER IF EXISTS trigger_enforce_period_closure ON hud_append_ledger;
CREATE TRIGGER trigger_enforce_period_closure
  BEFORE INSERT ON hud_append_ledger
  FOR EACH ROW EXECUTE FUNCTION enforce_period_closure();

DROP TRIGGER IF EXISTS trigger_generate_ledger_hash ON hud_append_ledger;
CREATE TRIGGER trigger_generate_ledger_hash
  BEFORE INSERT ON hud_append_ledger
  FOR EACH ROW EXECUTE FUNCTION generate_ledger_hash();

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Add HUD compliance fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hud_certification_number VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS compliance_health DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_audit_date TIMESTAMPTZ;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hud_append_ledger ENABLE ROW LEVEL SECURITY;

-- Properties: Organization members can view their properties
CREATE POLICY properties_select_member ON properties FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Super Admin and Property Managers can insert properties
CREATE POLICY properties_insert_admin ON properties FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'property_manager', 'admin')
  )
);

-- Units: Same as properties
CREATE POLICY units_select_member ON units FOR SELECT USING (
  property_id IN (
    SELECT id FROM properties WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY units_insert_admin ON units FOR INSERT WITH CHECK (
  property_id IN (
    SELECT id FROM properties WHERE organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'property_manager', 'admin')
    )
  )
);

-- Tenants: Can view their own data, managers can view all
CREATE POLICY tenants_select_own_or_manager ON tenants FOR SELECT USING (
  user_id = auth.uid() OR
  unit_id IN (
    SELECT id FROM units WHERE property_id IN (
      SELECT id FROM properties WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'property_manager', 'admin')
      )
    )
  )
);

-- Ledger: Read-only for all org members, insert only for authenticated users
CREATE POLICY ledger_select_member ON hud_append_ledger FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY ledger_insert_authenticated ON hud_append_ledger FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUDIT LOGGING FOR HUD TABLES
-- =====================================================

DROP TRIGGER IF EXISTS audit_properties ON properties;
CREATE TRIGGER audit_properties AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_units ON units;
CREATE TRIGGER audit_units AFTER INSERT OR UPDATE OR DELETE ON units
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_tenants ON tenants;
CREATE TRIGGER audit_tenants AFTER INSERT OR UPDATE OR DELETE ON tenants
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Ledger entries are already immutable, but log inserts
DROP TRIGGER IF EXISTS audit_ledger_insert ON hud_append_ledger;
CREATE TRIGGER audit_ledger_insert AFTER INSERT ON hud_append_ledger
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE properties IS 'HUD-certified properties managed by organizations';
COMMENT ON TABLE units IS 'Individual rental units within properties';
COMMENT ON TABLE tenants IS 'Tenant profiles linked to units and users';
COMMENT ON TABLE hud_append_ledger IS 'Wolf Shield: Immutable append-only ledger for HUD compliance with cryptographic chaining';

COMMENT ON COLUMN hud_append_ledger.cryptographic_hash IS 'SHA-256 hash of (previous_hash + current_row_data) for audit verification';
COMMENT ON COLUMN hud_append_ledger.previous_hash IS 'Hash of previous ledger entry, creating an immutable chain';
COMMENT ON COLUMN hud_append_ledger.is_period_closed IS 'When true, no new entries allowed for this accounting period';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
