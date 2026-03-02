# 🚀 SUPER ADMIN SETUP - MANUAL STEPS

## ✅ GOOD NEWS: Password is Already Set!

The setup script successfully set your password in Supabase Auth:
```
Email:    thenationofmazzi@gmail.com
Password: Isoflux@856$
User ID:  df00ab5c-c714-4c03-a420-2ebc8c74ee71
```

## ⚠️ ISSUE: Profile Missing in public.users

The Supabase PostgREST API schema cache is out of sync. We need to manually create the profile.

---

## 🛠️ OPTION 1: Run SQL in Supabase (FASTEST)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Go to: **SQL Editor** → **New Query**

2. **Copy and run this SQL:**

```sql
-- Create Super Admin profile
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
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,
  'thenationofmazzi@gmail.com',
  'Mazzi Makko',
  'SUPER_ADMIN',
  'managed_by_supabase_auth',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'SUPER_ADMIN',
  email_verified = true;
```

3. **Click "Run"** and verify you see: **Success. No rows returned**

4. **Create organization:**

```sql
-- Create organization
INSERT INTO public.organizations (
  id,
  owner_id,
  name,
  slug,
  settings,
  metadata
)
VALUES (
  gen_random_uuid(),
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,
  'Wolf Shield Admin',
  'wolf-shield-admin',
  '{}'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;
```

5. **Copy the returned `id` (org_id) and create membership:**

```sql
-- Replace [ORG_ID] with the ID from previous step
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  permissions
)
VALUES (
  '[ORG_ID]'::uuid,
  'df00ab5c-c714-4c03-a420-2ebc8c74ee71'::uuid,
  'ADMIN',
  '[]'::jsonb
);

-- Create subscription
INSERT INTO public.subscriptions (
  organization_id,
  tier,
  status,
  metadata
)
VALUES (
  '[ORG_ID]'::uuid,
  'ENTERPRISE',
  'ACTIVE',
  '{"super_admin": true}'::jsonb
);
```

6. **Verify setup:**

```sql
SELECT 
  u.email,
  u.full_name,
  u.role,
  o.name as org_name,
  s.status as subscription_status
FROM public.users u
LEFT JOIN public.organizations o ON o.owner_id = u.id
LEFT JOIN public.subscriptions s ON s.organization_id = o.id
WHERE u.email = 'thenationofmazzi@gmail.com';
```

**Expected result:**
- role: SUPER_ADMIN
- org_name: Wolf Shield Admin
- subscription_status: ACTIVE

---

## 🛠️ OPTION 2: Use Password Reset Flow

Since your password is already set in Supabase Auth, this should work:

1. Navigate to: `http://localhost:3000/login`
2. Enter:
   - Email: `thenationofmazzi@gmail.com`
   - Password: `Isoflux@856$`
3. If it fails with "No profile", the login API should auto-create it
4. Try again after auto-creation

---

## 🛠️ OPTION 3: Run Prisma Migrations

The schema cache issue suggests Supabase doesn't know about your schema. Run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Then retry the setup script
node scripts/setup-super-admin-sql.js
```

---

## ✅ AFTER SETUP: Test Login

1. Navigate to: `http://localhost:3000/login`
2. Enter:
   - Email: `thenationofmazzi@gmail.com`
   - Password: `Isoflux@856$`
3. Should redirect to: `/dashboard/super-admin` ✅
4. Should see: Platform metrics, Wolf Hunter tab

---

## 🆘 STILL NOT WORKING?

### Check Supabase Auth
1. Go to: Supabase Dashboard → Authentication → Users
2. Find: thenationofmazzi@gmail.com
3. Verify: "Confirmed" status

### Check Database
1. Go to: Supabase Dashboard → Table Editor
2. Check `public.users` table
3. Find row with your email
4. Verify `role` column = `SUPER_ADMIN` (case-sensitive!)

### Use Forgot Password
1. Go to: `http://localhost:3000/forgot-password`
2. Enter: `thenationofmazzi@gmail.com`
3. Check email for reset link
4. Set new password
5. Login with new password

---

## 📁 Files Available

- `SETUP_SUPER_ADMIN.sql` - Complete SQL script for Supabase SQL Editor
- `scripts/setup-super-admin-sql.js` - Node.js script (password already set!)
- `CRITICAL_FIX_SUPER_ADMIN_LOGIN.md` - Full documentation

---

**RECOMMENDED: Use Option 1 (SQL in Supabase) - it's the fastest and most reliable!**
