-- =====================================================
-- WOLF SHIELD: RENT-ROLL-IMPORTS STORAGE BUCKET
-- Purpose: Enable CSV/Excel rent roll uploads for import system
-- Security: Private bucket with RLS organization isolation
-- =====================================================

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKET
-- =====================================================

-- Create the bucket (private, 10MB limit, CSV/Excel only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rent-roll-imports',
  'rent-roll-imports',
  false,  -- Private bucket
  10485760,  -- 10MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: ENABLE RLS ON STORAGE.OBJECTS
-- =====================================================

-- Ensure RLS is enabled (safe to run multiple times)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Users can upload rent rolls to own org folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own org rent rolls" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own org rent rolls" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to rent rolls" ON storage.objects;

-- Policy 1: Upload - Users can only upload to their organization folder
CREATE POLICY "Users can upload rent rolls to own org folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rent-roll-imports'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: Read - Users can only read files from their organization
CREATE POLICY "Users can read own org rent rolls"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'rent-roll-imports'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Policy 3: Delete - Users can only delete files from their organization
CREATE POLICY "Users can delete own org rent rolls"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rent-roll-imports'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Policy 4: Service role - Backend has full access for processing
CREATE POLICY "Service role full access to rent rolls"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'rent-roll-imports')
WITH CHECK (bucket_id = 'rent-roll-imports');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'rent-roll-imports';

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- List all policies on storage.objects for this bucket
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%rent roll%'
ORDER BY policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ STORAGE BUCKET CREATED: rent-roll-imports';
  RAISE NOTICE '✅ File Size Limit: 10MB';
  RAISE NOTICE '✅ Allowed Types: CSV, Excel (.xls, .xlsx)';
  RAISE NOTICE '✅ RLS Enabled: Organization isolation active';
  RAISE NOTICE '✅ Policies Created: 4 (Upload, Read, Delete, Service Role)';
  RAISE NOTICE '';
  RAISE NOTICE '🛡️ Security: Users can only access their own org files';
  RAISE NOTICE '🔒 Privacy: Bucket is private (not publicly accessible)';
  RAISE NOTICE '📊 Ready: CSV import system is now operational';
END $$;
