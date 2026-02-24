-- =====================================================
-- WOLF SHIELD: DATABASE CLEANUP & FRESH START
-- Drops old tables and prepares for clean migration
-- =====================================================

-- ⚠️ WARNING: This will DELETE ALL existing data
-- Only run this if you want to start completely fresh

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- =====================================================
-- DROP ALL EXISTING TABLES (in correct order due to foreign keys)
-- =====================================================

-- Drop Wolf Shield tables if they exist
DROP TABLE IF EXISTS hud_append_ledger CASCADE;
DROP TABLE IF EXISTS tenant_documents CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS compliance_alerts CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS applicant_waitlist CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Drop old/conflicting tables if they exist
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- =====================================================
-- DROP ALL EXISTING TYPES/ENUMS
-- =====================================================

DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS recertification_status CASCADE;
DROP TYPE IF EXISTS unit_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;

-- =====================================================
-- DROP ALL EXISTING FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS prevent_ledger_delete() CASCADE;
DROP FUNCTION IF EXISTS prevent_ledger_update() CASCADE;
DROP FUNCTION IF EXISTS prevent_insert_closed_period() CASCADE;
DROP FUNCTION IF EXISTS enforce_period_closure() CASCADE;
DROP FUNCTION IF EXISTS generate_ledger_hash() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_audit_event() CASCADE;

-- =====================================================
-- DROP STORAGE BUCKETS (if they exist)
-- =====================================================

DELETE FROM storage.buckets WHERE id = 'tenant-documents';
DELETE FROM storage.buckets WHERE id = 'project-files';

-- Re-enable triggers
SET session_replication_role = 'origin';

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================

-- Verify all tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected result: Empty or only system tables

-- =====================================================
-- NEXT STEPS:
-- 1. Verify this script completed successfully
-- 2. Run: 20260223000000_wolf_shield_ledger.sql
-- 3. Run: 20260224000000_wolf_shield_complete.sql
-- 4. Run: BUCKET_SECURITY.sql
-- =====================================================
