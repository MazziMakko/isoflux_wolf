-- =====================================================
-- SUPER ADMIN CROSS-ORG RLS BYPASS
-- Grants Super Admin (role = 'super_admin' in users table)
-- unrestricted access to all tables for platform oversight
-- =====================================================

-- =====================================================
-- USERS TABLE: Super Admin can see all users
-- =====================================================
DROP POLICY IF EXISTS users_super_admin_all ON public.users;
CREATE POLICY users_super_admin_all ON public.users
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- ORGANIZATIONS: Super Admin can see all orgs
-- =====================================================
DROP POLICY IF EXISTS organizations_super_admin_all ON public.organizations;
CREATE POLICY organizations_super_admin_all ON public.organizations
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- SUBSCRIPTIONS: Super Admin can see all subscriptions
-- =====================================================
DROP POLICY IF EXISTS subscriptions_super_admin_all ON public.subscriptions;
CREATE POLICY subscriptions_super_admin_all ON public.subscriptions
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- PROPERTIES: Super Admin can see all properties
-- =====================================================
DROP POLICY IF EXISTS properties_super_admin_all ON public.properties;
CREATE POLICY properties_super_admin_all ON public.properties
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- UNITS: Super Admin can see all units
-- =====================================================
DROP POLICY IF EXISTS units_super_admin_all ON public.units;
CREATE POLICY units_super_admin_all ON public.units
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- TENANTS: Super Admin can see all tenants
-- =====================================================
DROP POLICY IF EXISTS tenants_super_admin_all ON public.tenants;
CREATE POLICY tenants_super_admin_all ON public.tenants
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- HUD APPEND LEDGER: Super Admin can read across all orgs
-- (INSERT still restricted to service role + org members)
-- =====================================================
DROP POLICY IF EXISTS ledger_super_admin_select ON public.hud_append_ledger;
CREATE POLICY ledger_super_admin_select ON public.hud_append_ledger
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- TRANSACTIONS: Super Admin can see all payment transactions
-- =====================================================
DROP POLICY IF EXISTS transactions_super_admin_all ON public.transactions;
CREATE POLICY transactions_super_admin_all ON public.transactions
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- WEBHOOK EVENTS: Super Admin can see all webhooks
-- =====================================================
DROP POLICY IF EXISTS webhook_events_super_admin_all ON public.webhook_events;
CREATE POLICY webhook_events_super_admin_all ON public.webhook_events
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- AUDIT LOGS: Super Admin can see all audit logs
-- =====================================================
DROP POLICY IF EXISTS audit_logs_super_admin_all ON public.audit_logs;
CREATE POLICY audit_logs_super_admin_all ON public.audit_logs
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- COMPLIANCE ALERTS: Super Admin can see all alerts
-- =====================================================
DROP POLICY IF EXISTS compliance_alerts_super_admin_all ON public.compliance_alerts;
CREATE POLICY compliance_alerts_super_admin_all ON public.compliance_alerts
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- =====================================================
-- VERIFICATION: Check that Super Admin can access all
-- =====================================================
COMMENT ON POLICY users_super_admin_all ON public.users IS 
'Super Admin (users.role = super_admin) has unrestricted cross-org access for platform oversight';

COMMENT ON POLICY ledger_super_admin_select ON public.hud_append_ledger IS 
'Super Admin can read all ledger entries across organizations for compliance monitoring';
