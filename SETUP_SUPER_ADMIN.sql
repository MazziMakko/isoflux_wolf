-- =====================================================
-- SUPER ADMIN SETUP - SUPABASE SQL EDITOR
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

-- Step 1: Insert/Update Super Admin profile in public.users
-- Replace the UUID with your actual auth.users ID from the script output
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  password_hash,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,  -- Your User ID from script
  'thenationofmazzi@gmail.com',
  'Mazzi Makko',
  'SUPER_ADMIN',  -- IMPORTANT: Case-sensitive enum value
  'managed_by_supabase_auth',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  full_name = 'Mazzi Makko',
  role = 'SUPER_ADMIN',
  email_verified = true,
  updated_at = NOW();

-- Step 2: Create organization (if doesn't exist)
INSERT INTO public.organizations (
  id,
  owner_id,
  name,
  slug,
  settings,
  metadata,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,  -- Same User ID
  'Wolf Shield Admin',
  'wolf-shield-admin',
  '{}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Get the organization ID (for next steps)
-- Run this to get the org_id, then use it in steps 4 & 5
SELECT id, name, slug, owner_id 
FROM public.organizations 
WHERE owner_id = 'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid;

-- Step 4: Create organization membership
-- Replace [ORG_ID] with the ID from Step 3
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  permissions,
  created_at
)
VALUES (
  '[ORG_ID]'::uuid,  -- Replace with org ID from Step 3
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,
  'ADMIN',
  '[]'::jsonb,
  NOW()
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Step 5: Create active subscription
-- Replace [ORG_ID] with the ID from Step 3
INSERT INTO public.subscriptions (
  organization_id,
  tier,
  status,
  metadata,
  created_at,
  updated_at
)
VALUES (
  '[ORG_ID]'::uuid,  -- Replace with org ID from Step 3
  'ENTERPRISE',
  'ACTIVE',
  '{"super_admin": true}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (organization_id) 
DO UPDATE SET
  status = 'ACTIVE',
  tier = 'ENTERPRISE',
  updated_at = NOW();

-- Step 6: Verify everything was created
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.role as user_role,
  o.id as org_id,
  o.name as org_name,
  om.role as member_role,
  s.status as subscription_status,
  s.tier as subscription_tier
FROM public.users u
LEFT JOIN public.organizations o ON o.owner_id = u.id
LEFT JOIN public.organization_members om ON om.user_id = u.id AND om.organization_id = o.id
LEFT JOIN public.subscriptions s ON s.organization_id = o.id
WHERE u.email = 'thenationofmazzi@gmail.com';

-- =====================================================
-- EXPECTED RESULT:
-- user_id: df00ab5c-c714-4c03-a420-2ebc8c74ee71
-- email: thenationofmazzi@gmail.com
-- full_name: Mazzi Makko
-- user_role: SUPER_ADMIN
-- org_id: [some UUID]
-- org_name: Wolf Shield Admin
-- member_role: ADMIN
-- subscription_status: ACTIVE
-- subscription_tier: ENTERPRISE
-- =====================================================
