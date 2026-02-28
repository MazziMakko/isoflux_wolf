-- =====================================================
-- WOLF SHIELD: IMPORT JOBS TABLE
-- Migration: Add rent roll import tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL, -- bytes
  file_url TEXT, -- S3 signed URL (optional, deleted after processing)
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  
  total_rows INT,
  successful_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  warning_rows INT DEFAULT 0,
  
  column_mapping JSONB, -- { "csv_column": "db_field" }
  validation_errors JSONB, -- [{ row, field, value, error, severity }]
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX idx_import_jobs_user ON import_jobs(user_id);
CREATE INDEX idx_import_jobs_property ON import_jobs(property_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_created ON import_jobs(created_at DESC);

COMMENT ON TABLE import_jobs IS 'Tracks rent roll CSV/Excel imports with validation and error reporting';

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own organization's imports
CREATE POLICY import_jobs_org_read ON import_jobs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create imports for their organization
CREATE POLICY import_jobs_org_create ON import_jobs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- STORAGE BUCKET FOR RENT ROLL IMPORTS
-- =====================================================

-- Create bucket if not exists (run in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('rent-roll-imports', 'rent-roll-imports', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (allow authenticated users to upload/download their org's files)
-- CREATE POLICY "Allow authenticated uploads"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'rent-roll-imports');

-- CREATE POLICY "Allow authenticated downloads"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'rent-roll-imports');

-- CREATE POLICY "Allow authenticated deletes"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'rent-roll-imports');
