-- =====================================================
-- CREATE MAZZI MAKKO SUPER ADMIN ACCOUNT
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create the auth user (if not exists)
-- You'll need to do this manually in Supabase Auth dashboard:
-- Email: thenationofmazzi@gmail.com
-- Password: [Set a strong password]
-- OR run this if you have service role access:

/*
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'thenationofmazzi@gmail.com',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mazzi Makko", "role": "super_admin"}'::jsonb,
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;
*/

-- Step 2: Get the user ID from Auth (after creating above)
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users

-- Step 3: Create/Update the public.users profile with SUPER_ADMIN role
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
  'USER_ID_HERE'::uuid,  -- Replace with actual UUID
  'thenationofmazzi@gmail.com',
  'Mazzi Makko',
  'SUPER_ADMIN',
  'managed_by_supabase_auth',
  true,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET
  role = 'SUPER_ADMIN',
  full_name = 'Mazzi Makko',
  email_verified = true,
  updated_at = now();

-- Step 4: Create organization for Mazzi
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
  'USER_ID_HERE'::uuid,  -- Replace with actual UUID
  'Wolf Shield Admin',
  'wolf-shield-admin',
  '{}'::jsonb,
  '{"is_platform_admin": true}'::jsonb,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Step 5: Add Mazzi to organization (use the organization ID from above)
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  permissions,
  created_at
)
VALUES (
  'ORG_ID_HERE'::uuid,  -- Replace with organization ID from Step 4
  'USER_ID_HERE'::uuid,  -- Replace with user ID
  'admin',
  ARRAY['all']::text[],
  now()
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Step 6: Create ACTIVE subscription (no trial needed for admin)
INSERT INTO public.subscriptions (
  organization_id,
  tier,
  status,
  metadata,
  created_at,
  updated_at
)
VALUES (
  'ORG_ID_HERE'::uuid,  -- Replace with organization ID
  'enterprise',
  'ACTIVE',
  '{"lifetime_access": true, "platform_admin": true}'::jsonb,
  now(),
  now()
)
ON CONFLICT (organization_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if user was created correctly
SELECT id, email, role, full_name, email_verified 
FROM public.users 
WHERE email = 'thenationofmazzi@gmail.com';

-- Check organization
SELECT id, name, owner_id 
FROM public.organizations 
WHERE slug = 'wolf-shield-admin';

-- Check membership
SELECT om.*, o.name as org_name 
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
WHERE om.user_id IN (
  SELECT id FROM public.users WHERE email = 'thenationofmazzi@gmail.com'
);

-- Check subscription
SELECT s.*, o.name as org_name 
FROM public.subscriptions s
JOIN public.organizations o ON o.id = s.organization_id
WHERE o.owner_id IN (
  SELECT id FROM public.users WHERE email = 'thenationofmazzi@gmail.com'
);

-- =====================================================
-- MANUAL STEPS (If SQL doesn't work)
-- =====================================================

/*
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" or "Invite user"
3. Enter:
   - Email: thenationofmazzi@gmail.com
   - Password: [Set secure password]
   - Auto Confirm: YES
   - User Metadata: {"full_name": "Mazzi Makko", "role": "super_admin"}
4. Copy the UUID of the created user
5. Run Steps 3-6 above, replacing USER_ID_HERE with the actual UUID
*/
