-- =====================================================
-- FIX MAZZI'S ACCOUNT - Create Missing Profile
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Find Mazzi's auth user ID
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'thenationofmazzi@gmail.com';

-- Step 2: Check if profile exists in public.users
SELECT id, email, full_name, role, email_verified, created_at
FROM public.users
WHERE email = 'thenationofmazzi@gmail.com';

-- Step 3: If profile doesn't exist, create it manually
-- Replace 'USER_ID_FROM_STEP_1' with the actual UUID from Step 1
/*
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  password_hash,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with actual UUID from auth.users
  'thenationofmazzi@gmail.com',
  'Mazzi Makko',
  'property_manager',  -- lowercase to match enum
  'managed_by_supabase_auth',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();
*/

-- Step 4: Create organization if it doesn't exist
-- Replace 'USER_ID' with the actual UUID
/*
INSERT INTO public.organizations (
  id,
  owner_id,
  name,
  slug,
  settings,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'USER_ID',  -- Replace with Mazzi's user ID
  'Mazzi Management',
  'mazzi-management-' || substr(md5(random()::text), 1, 6),
  '{}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW()
)
RETURNING id, name, slug;
*/

-- Step 5: Add organization member
-- Replace 'ORG_ID' and 'USER_ID' with actual values
/*
INSERT INTO public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  permissions,
  joined_at
) VALUES (
  gen_random_uuid(),
  'ORG_ID',  -- Replace with organization ID from Step 4
  'USER_ID',  -- Replace with Mazzi's user ID
  'admin',  -- lowercase to match enum
  '[]'::jsonb,
  NOW()
)
ON CONFLICT (organization_id, user_id) DO NOTHING;
*/

-- Step 6: Create subscription
-- Replace 'ORG_ID' with actual organization ID
/*
INSERT INTO public.subscriptions (
  id,
  organization_id,
  tier,
  status,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ORG_ID',  -- Replace with organization ID
  'free',
  'trialing',  -- lowercase to match enum
  '{}'::jsonb,
  NOW(),
  NOW()
);
*/

-- Step 7: Verify everything is set up
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  o.id as org_id,
  o.name as org_name,
  om.role as org_role,
  s.status as subscription_status
FROM public.users u
LEFT JOIN public.organization_members om ON om.user_id = u.id
LEFT JOIN public.organizations o ON o.id = om.organization_id
LEFT JOIN public.subscriptions s ON s.organization_id = o.id
WHERE u.email = 'thenationofmazzi@gmail.com';

-- =====================================================
-- EXPECTED RESULT:
-- User should have:
-- - Profile in public.users (role: property_manager)
-- - Organization
-- - Organization membership (role: admin)
-- - Subscription (status: trialing)
-- =====================================================
