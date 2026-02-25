-- =====================================================
-- MAZZI MAKKO ADMIN PROFILE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, create the auth user (if not already created via signup)
-- This would normally be done via the signup API, but we can create manually:

-- OPTION 1: If Mazzi hasn't signed up yet, create the user manually
-- Replace 'YOUR_PASSWORD_HERE' with a strong password
/*
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'thenationofmazzi@gmail.com',
  crypt('YOUR_PASSWORD_HERE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Mazzi Makko"}'::jsonb
);
*/

-- OPTION 2: If Mazzi already signed up, find the user ID
-- SELECT id, email, created_at FROM auth.users WHERE email = 'thenationofmazzi@gmail.com';

-- Then, upgrade the user to SUPER_ADMIN role
UPDATE public.users
SET role = 'SUPER_ADMIN'
WHERE email = 'thenationofmazzi@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE email = 'thenationofmazzi@gmail.com';

-- Check their organization membership
SELECT 
  om.user_id,
  om.organization_id,
  om.role as membership_role,
  o.name as org_name,
  o.slug,
  u.role as user_role
FROM organization_members om
JOIN users u ON u.id = om.user_id
JOIN organizations o ON o.id = om.organization_id
WHERE u.email = 'thenationofmazzi@gmail.com';

-- If needed, create a test organization for Mazzi
/*
INSERT INTO organizations (name, slug, owner_id, settings, metadata)
VALUES (
  'Mazzi Management',
  'mazzi-management-admin',
  (SELECT id FROM users WHERE email = 'thenationofmazzi@gmail.com'),
  '{}'::jsonb,
  '{"admin_account": true}'::jsonb
)
RETURNING *;
*/

-- =====================================================
-- EXPECTED RESULT:
-- Mazzi's account should now have:
-- - role: 'SUPER_ADMIN'
-- - Full dashboard access
-- - Ability to manage all organizations
-- =====================================================
