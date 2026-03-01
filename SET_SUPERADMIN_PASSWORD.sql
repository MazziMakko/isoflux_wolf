-- =====================================================
-- SET SUPER ADMIN PASSWORD
-- Purpose: Update Mazzi's super admin account password
-- Password: JoatWays@856
-- =====================================================

-- IMPORTANT: Run this in Supabase SQL Editor
-- This uses the auth schema to update the password

-- Update the password in auth.users
UPDATE auth.users
SET 
  encrypted_password = crypt('JoatWays@856', gen_salt('bf')),
  updated_at = now()
WHERE id = 'df00ab5c-c714-4c03-a420-2ebc8c74ee71';

-- Ensure the public.users profile exists with correct role
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,
  'thenationofmazzi@gmail.com',
  'Mazzi Makko',
  'super_admin',
  true,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET
  role = 'super_admin',
  email = 'thenationofmazzi@gmail.com',
  full_name = 'Mazzi Makko',
  email_verified = true,
  updated_at = now();

-- Verify the update
SELECT 
  u.id,
  u.email,
  u.role,
  u.full_name,
  u.email_verified,
  au.confirmed_at,
  au.last_sign_in_at
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = 'df00ab5c-c714-4c03-a420-2ebc8c74ee71';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PASSWORD UPDATED';
  RAISE NOTICE '✅ Email: thenationofmazzi@gmail.com';
  RAISE NOTICE '✅ Password: JoatWays@856';
  RAISE NOTICE '✅ Role: super_admin';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Login at: http://localhost:3000/login';
  RAISE NOTICE '🌐 Production: https://isofluxwolf.vercel.app/login';
END $$;
