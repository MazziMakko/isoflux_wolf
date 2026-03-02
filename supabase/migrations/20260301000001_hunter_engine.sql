-- =====================================================
-- HUNTER ENGINE: AUTONOMOUS LEAD HARVESTING TABLES
-- Migration Date: March 1, 2026
-- =====================================================

-- Create hunter lead status enum
DO $$ BEGIN
  CREATE TYPE hunter_lead_status AS ENUM ('pending', 'approved', 'rejected', 'contacted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- HUNTER LEADS TABLE
-- Stores scraped housing authority leads for review
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hunter_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  estimated_units INTEGER,
  tech_score INTEGER CHECK (tech_score >= 0 AND tech_score <= 100),
  status hunter_lead_status DEFAULT 'pending',
  source_url VARCHAR(1000),
  source_type VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  scouted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_company_email UNIQUE (company_name, email)
);

-- Indexes for hunter_leads
CREATE INDEX IF NOT EXISTS idx_hunter_leads_status ON public.hunter_leads(status);
CREATE INDEX IF NOT EXISTS idx_hunter_leads_tech_score ON public.hunter_leads(tech_score DESC);
CREATE INDEX IF NOT EXISTS idx_hunter_leads_scouted_at ON public.hunter_leads(scouted_at DESC);
CREATE INDEX IF NOT EXISTS idx_hunter_leads_reviewed_by ON public.hunter_leads(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_hunter_leads_source_type ON public.hunter_leads(source_type);

-- =====================================================
-- HUNTER SCOUT RUNS TABLE
-- Tracks each scraping execution
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hunter_scout_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(100) NOT NULL,
  leads_found INTEGER DEFAULT 0,
  leads_created INTEGER DEFAULT 0,
  leads_duplicate INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'running',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for hunter_scout_runs
CREATE INDEX IF NOT EXISTS idx_hunter_scout_runs_source_type ON public.hunter_scout_runs(source_type);
CREATE INDEX IF NOT EXISTS idx_hunter_scout_runs_started_at ON public.hunter_scout_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_hunter_scout_runs_status ON public.hunter_scout_runs(status);

-- =====================================================
-- RLS POLICIES: SUPER ADMIN & ADMINS ONLY
-- =====================================================

-- Enable RLS
ALTER TABLE public.hunter_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunter_scout_runs ENABLE ROW LEVEL SECURITY;

-- Super Admin can see all leads
DROP POLICY IF EXISTS hunter_leads_super_admin_all ON public.hunter_leads;
CREATE POLICY hunter_leads_super_admin_all ON public.hunter_leads
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- Admins can see all leads
DROP POLICY IF EXISTS hunter_leads_admin_all ON public.hunter_leads;
CREATE POLICY hunter_leads_admin_all ON public.hunter_leads
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Super Admin can see all scout runs
DROP POLICY IF EXISTS hunter_scout_runs_super_admin_all ON public.hunter_scout_runs;
CREATE POLICY hunter_scout_runs_super_admin_all ON public.hunter_scout_runs
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

-- Service role (cron) can insert
GRANT ALL ON public.hunter_leads TO service_role;
GRANT ALL ON public.hunter_scout_runs TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.hunter_leads IS 
'Wolf Hunter Engine: Autonomous lead harvesting from public housing authority registries';

COMMENT ON COLUMN public.hunter_leads.tech_score IS 
'Estimated likelihood of tech adoption (0-100) based on units, website, email domain';

COMMENT ON COLUMN public.hunter_leads.status IS 
'Lead status: pending (new), approved (qualified), rejected (not fit), contacted (outreach sent)';

COMMENT ON TABLE public.hunter_scout_runs IS 
'Audit trail for each Hunter Scout execution (cron runs)';
