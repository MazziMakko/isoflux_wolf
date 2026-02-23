-- =====================================================
-- WOLF SHIELD HUD-SECURE PRO: COMPLETE DATABASE SCHEMA
-- Enhanced Append Ledger + Properties + Units + Compliance
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENHANCED APPEND LEDGER (THE WOLF SHIELD)
-- =====================================================

-- Drop existing if migrating
DROP TABLE IF EXISTS hud_append_ledger CASCADE;
DROP TRIGGER IF EXISTS enforce_no_delete ON hud_append_ledger;
DROP TRIGGER IF EXISTS enforce_no_update ON hud_append_ledger;
DROP TRIGGER IF EXISTS enforce_open_period_insert ON hud_append_ledger;
DROP FUNCTION IF EXISTS prevent_ledger_delete();
DROP FUNCTION IF EXISTS prevent_ledger_update();
DROP FUNCTION IF EXISTS prevent_insert_closed_period();

-- Create the HUD Append Ledger Table
CREATE TABLE hud_append_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    tenant_id UUID REFERENCES public.users(id),
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('CHARGE', 'PAYMENT', 'ADJUSTMENT', 'FEE', 'RECERTIFICATION_LOG', 'MAINTENANCE_RESOLVED', 'INCOME_APPROVED', 'NOTICE_GENERATED')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    
    -- Audit & Hard-Close Logic
    accounting_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g., '2026-02')
    is_period_closed BOOLEAN DEFAULT FALSE,
    cryptographic_hash TEXT NOT NULL, -- Hash of previous row + current data to prove no tampering
    
    -- Timestamps & Actor
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL
);

-- Index for fast querying by property and accounting period
CREATE INDEX idx_ledger_org_period ON hud_append_ledger(organization_id, accounting_period);
CREATE INDEX idx_ledger_property ON hud_append_ledger(property_id);
CREATE INDEX idx_ledger_unit ON hud_append_ledger(unit_id);
CREATE INDEX idx_ledger_tenant ON hud_append_ledger(tenant_id);
CREATE INDEX idx_ledger_created_at ON hud_append_ledger(created_at);

-- ==========================================
-- STRICT AUDIT TRIGGERS (THE WOLF "SHIELD")
-- ==========================================

-- 1. Prevent ANY Deletions
CREATE OR REPLACE FUNCTION prevent_ledger_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'HUD Compliance Violation: Deleting records from the append ledger is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_no_delete
BEFORE DELETE ON hud_append_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_delete();

-- 2. Prevent ANY Updates (Except closing an accounting period)
CREATE OR REPLACE FUNCTION prevent_ledger_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow updates if changing 'is_period_closed' from FALSE to TRUE
    IF OLD.is_period_closed = FALSE AND NEW.is_period_closed = TRUE AND OLD.amount = NEW.amount AND OLD.transaction_type = NEW.transaction_type THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'HUD Compliance Violation: Modifying ledger records is strictly prohibited. You must create an offsetting adjustment transaction.';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_no_update
BEFORE UPDATE ON hud_append_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_update();

-- 3. Prevent Inserts into Closed Periods
CREATE OR REPLACE FUNCTION prevent_insert_closed_period()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there is already a closed record for this property and period
    IF EXISTS (
        SELECT 1 FROM hud_append_ledger 
        WHERE property_id = NEW.property_id 
        AND accounting_period = NEW.accounting_period 
        AND is_period_closed = TRUE
    ) THEN
        RAISE EXCEPTION 'HUD Compliance Violation: The accounting period % is closed. Adjustments must be posted to the current open period.', NEW.accounting_period;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_open_period_insert
BEFORE INSERT ON hud_append_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_insert_closed_period();

-- =====================================================
-- PROPERTIES & UNITS (HUD-Specific)
-- =====================================================

-- Properties table (already exists, but ensure HUD fields)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS hud_property_id VARCHAR(100) UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_units INT DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupancy_rate DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS compliance_health DECIMAL(5, 2) DEFAULT 0.00;

-- Units table (already exists, ensure proper structure)
ALTER TABLE units ADD COLUMN IF NOT EXISTS hud_subsidy_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE units ADD COLUMN IF NOT EXISTS tenant_portion DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE units ADD COLUMN IF NOT EXISTS last_inspection_date TIMESTAMPTZ;

-- =====================================================
-- LEASES & RECERTIFICATION TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    tenant_id UUID REFERENCES public.users(id) NOT NULL,
    
    -- Lease Details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAST', 'EVICTED', 'TERMINATED')),
    recertification_status VARCHAR(20) DEFAULT 'UP_TO_DATE' CHECK (recertification_status IN ('UP_TO_DATE', 'DUE_90', 'DUE_60', 'DUE_30', 'OVERDUE')),
    
    -- HUD Specifics
    hud_tenant_portion DECIMAL(10, 2) DEFAULT 0.00,
    hud_subsidy_amount DECIMAL(10, 2) DEFAULT 0.00,
    last_recertification_date TIMESTAMPTZ,
    next_recertification_due TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_recert_status ON leases(recertification_status);
CREATE INDEX idx_leases_recert_due ON leases(next_recertification_due);

-- =====================================================
-- COMPLIANCE ALERTS (90-60-30 Day Notices)
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    tenant_id UUID REFERENCES public.users(id),
    lease_id UUID REFERENCES public.leases(id),
    
    -- Alert Details
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('90_DAY', '60_DAY', '30_DAY', 'OVERDUE', 'MAINTENANCE_SLA', 'DOCUMENT_PENDING')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_org ON compliance_alerts(organization_id);
CREATE INDEX idx_alerts_property ON compliance_alerts(property_id);
CREATE INDEX idx_alerts_unread ON compliance_alerts(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_unresolved ON compliance_alerts(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_alerts_type ON compliance_alerts(alert_type);

-- =====================================================
-- VENDORS & MAINTENANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(50) CHECK (specialty IN ('PLUMBING', 'ELECTRICAL', 'HVAC', 'GENERAL', 'APPLIANCE', 'PEST_CONTROL', 'LANDSCAPING')),
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_specialty ON vendors(specialty);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    tenant_id UUID REFERENCES public.users(id),
    
    -- Request Details
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('EMERGENCY', 'ROUTINE')),
    description TEXT NOT NULL,
    photo_url TEXT,
    
    -- Assignment & Status
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    vendor_id UUID REFERENCES public.vendors(id),
    assigned_to UUID REFERENCES public.users(id),
    
    -- SLA Tracking
    sla_deadline TIMESTAMPTZ NOT NULL, -- Auto-calculated: 24hrs for EMERGENCY, 30 days for ROUTINE
    is_sla_breached BOOLEAN DEFAULT FALSE,
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id),
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_org ON maintenance_requests(organization_id);
CREATE INDEX idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_unit ON maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_sla ON maintenance_requests(sla_deadline);
CREATE INDEX idx_maintenance_breached ON maintenance_requests(is_sla_breached) WHERE is_sla_breached = TRUE;

-- =====================================================
-- TENANT DOCUMENTS (Income Verification, Leases)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    tenant_id UUID REFERENCES public.users(id) NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) NOT NULL,
    
    -- Document Details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('INCOME_VERIFICATION', 'LEASE_AGREEMENT', 'ID', 'W2', 'PAYSTUB', 'BANK_STATEMENT', 'OTHER')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT, -- bytes
    mime_type VARCHAR(100),
    
    -- Review Status
    status VARCHAR(20) DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_org ON tenant_documents(organization_id);
CREATE INDEX idx_documents_property ON tenant_documents(property_id);
CREATE INDEX idx_documents_tenant ON tenant_documents(tenant_id);
CREATE INDEX idx_documents_status ON tenant_documents(status);
CREATE INDEX idx_documents_type ON tenant_documents(document_type);
CREATE INDEX idx_documents_pending ON tenant_documents(status) WHERE status = 'PENDING_REVIEW';

-- =====================================================
-- WAITLIST & APPLICANTS (HUD Priority Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS applicant_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    
    -- Applicant Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- HUD Priority Levels (1 = Highest Priority)
    hud_priority_level INT DEFAULT 3 CHECK (hud_priority_level BETWEEN 1 AND 5),
    priority_reason VARCHAR(255), -- "Displaced by natural disaster", "Veteran", etc.
    
    -- Application Status
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HOUSED', 'WITHDRAWN')),
    
    -- Desired Unit Preferences
    preferred_bedrooms INT,
    preferred_move_in_date DATE,
    
    -- Metadata
    application_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_org ON applicant_waitlist(organization_id);
CREATE INDEX idx_waitlist_property ON applicant_waitlist(property_id);
CREATE INDEX idx_waitlist_priority ON applicant_waitlist(hud_priority_level);
CREATE INDEX idx_waitlist_status ON applicant_waitlist(status);

-- =====================================================
-- SUPER ADMIN FLAGS
-- =====================================================

-- Add super admin flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_super_admin ON users(is_super_admin) WHERE is_super_admin = TRUE;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Leases: Organization members only
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY leases_select_member ON leases FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY leases_insert_admin ON leases FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'property_manager', 'admin')
  )
);

-- Compliance Alerts: Organization members only
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_select_member ON compliance_alerts FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- Maintenance Requests: Tenants can view own, PMs can view all
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY maintenance_select_own_or_pm ON maintenance_requests FOR SELECT USING (
  tenant_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'property_manager', 'admin')
  )
);

-- Tenant Documents: Tenants can upload own, PMs can review
ALTER TABLE tenant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select_own_or_pm ON tenant_documents FOR SELECT USING (
  tenant_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'property_manager', 'admin')
  )
);

CREATE POLICY documents_insert_tenant ON tenant_documents FOR INSERT WITH CHECK (
  tenant_id = auth.uid()
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON applicant_waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE hud_append_ledger IS 'Wolf Shield: Immutable append-only ledger for HUD compliance. UPDATE/DELETE operations are blocked by triggers.';
COMMENT ON TABLE leases IS 'Tenant leases with HUD recertification tracking (90-60-30 day alerts)';
COMMENT ON TABLE compliance_alerts IS 'System-generated compliance alerts for property managers';
COMMENT ON TABLE maintenance_requests IS 'Work orders with SLA enforcement (24hr emergency, 30 day routine)';
COMMENT ON TABLE tenant_documents IS 'Secure document storage for income verification and lease agreements';
COMMENT ON TABLE applicant_waitlist IS 'HUD-compliant waitlist with priority level auto-sorting';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
