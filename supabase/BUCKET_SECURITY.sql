-- =====================================================
-- SUPABASE BUCKET SECURITY CONFIGURATION
-- Critical: tenant-documents MUST be PRIVATE
-- =====================================================

-- 1. CREATE THE TENANT-DOCUMENTS BUCKET (Run in Supabase SQL Editor)
-- This bucket stores sensitive PII: income verification docs, SSNs, W-2s
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-documents',
  'tenant-documents',
  false, -- CRITICAL: MUST BE FALSE (private bucket)
  10485760, -- 10MB max file size
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- 2. BUCKET POLICIES: Row-Level Security (RLS)
-- Only authenticated users can upload, and only to their own folder

-- Policy 1: Tenants can upload to their own folder
CREATE POLICY "Tenants can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'TENANT'
);

-- Policy 2: Tenants can view their own documents
CREATE POLICY "Tenants can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tenant-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Property Managers can view documents in their properties
CREATE POLICY "Property managers can view tenant documents in their properties"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tenant-documents' AND
  EXISTS (
    SELECT 1 FROM public.tenants t
    INNER JOIN public.units u ON t.unit_id = u.id
    INNER JOIN public.properties p ON u.property_id = p.id
    INNER JOIN public.organization_members om ON p.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
      AND t.user_id::text = (storage.foldername(name))[1]
  )
);

-- Policy 4: Property Managers can delete documents (for compliance)
CREATE POLICY "Property managers can delete tenant documents in their properties"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tenant-documents' AND
  EXISTS (
    SELECT 1 FROM public.tenants t
    INNER JOIN public.units u ON t.unit_id = u.id
    INNER JOIN public.properties p ON u.property_id = p.id
    INNER JOIN public.organization_members om ON p.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
      AND t.user_id::text = (storage.foldername(name))[1]
      AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'PROPERTY_MANAGER'
  )
);

-- Policy 5: Super Admins can view all documents (for platform support)
CREATE POLICY "Super admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tenant-documents' AND
  (SELECT is_super_admin FROM public.users WHERE id = auth.uid()) = true
);

-- 3. ENABLE RLS ON STORAGE.OBJECTS TABLE
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION CHECKLIST (Run in Supabase Dashboard)
-- =====================================================

-- ✓ Navigate to: Storage → tenant-documents
-- ✓ Confirm "Public" toggle is OFF
-- ✓ Try to access a file URL without auth → Should return 403 Forbidden
-- ✓ Generate a signed URL (expires in 1 hour) → Should work only when authenticated

-- =====================================================
-- CODE IMPLEMENTATION: SIGNED URLs (Frontend)
-- =====================================================

-- In your Next.js app, NEVER use .getPublicUrl() for tenant-documents
-- ALWAYS use .createSignedUrl() with short expiration

-- Example (TypeScript):
-- const { data, error } = await supabase.storage
--   .from('tenant-documents')
--   .createSignedUrl('tenant-123/income-verification.pdf', 3600); // 1 hour
--
-- if (error) throw error;
-- const signedUrl = data.signedUrl; // Use this URL in your UI

-- =====================================================
-- DISASTER RECOVERY: BUCKET ACCESS AUDIT
-- =====================================================

-- Query to check if bucket is accidentally public
SELECT id, name, public
FROM storage.buckets
WHERE id = 'tenant-documents';

-- Expected result:
-- id: tenant-documents
-- name: tenant-documents
-- public: false ← MUST BE FALSE

-- Query to list all RLS policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- EMERGENCY LOCKDOWN (If breach detected)
-- =====================================================

-- Immediately disable all access (run in SQL Editor)
-- REVOKE ALL ON storage.objects FROM authenticated, anon, service_role;
-- 
-- Then notify security team and investigate

-- =====================================================
-- COMPLIANCE NOTES
-- =====================================================

-- 1. Encryption at Rest: Supabase encrypts all data with AES-256 by default
-- 2. Encryption in Transit: All connections use TLS 1.3
-- 3. Data Retention: Documents are kept for 7 years (HUD requirement)
-- 4. Data Deletion: When a tenant leaves, PM can trigger deletion
-- 5. Audit Trail: Every upload/download is logged to hud_append_ledger

-- =====================================================
-- FINAL VERIFICATION COMMAND
-- =====================================================

-- Test public access (should FAIL)
-- curl https://[your-supabase-url]/storage/v1/object/public/tenant-documents/test.pdf
-- Expected: {"error":"Object not found"} or 403 Forbidden

-- Test signed URL access (should SUCCEED only with valid token)
-- curl https://[your-supabase-url]/storage/v1/object/sign/tenant-documents/test.pdf?token=[signed-token]
-- Expected: File contents (if token is valid and user has permission)
