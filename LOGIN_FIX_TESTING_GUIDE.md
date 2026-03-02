# 🚀 LOGIN FIX - TESTING GUIDE

## Quick Test Protocol

### Step 1: Verify Super Admin Account

**Run the admin setup script:**
```bash
cd c:\Dev\IsoFlux
node scripts/create-mazzi-admin.js
```

**Expected Output:**
```
🐺 Creating Mazzi Makko SUPER ADMIN account...
✅ Auth user created (or found)
✅ User profile created
✅ Organization created
✅ Organization membership created
✅ Subscription created (ACTIVE)

📧 Email: thenationofmazzi@gmail.com
🔑 Password: Isoflux@856$
👤 Role: super_admin
```

### Step 2: Test Super Admin Login

1. Navigate to: https://www.isoflux.app/login (or http://localhost:3000/login)
2. Login with:
   - Email: `thenationofmazzi@gmail.com`
   - Password: `Isoflux@856$`
3. **Expected:** Immediate redirect to `/dashboard/super-admin`
4. **Should NOT see:** Any subscription checks or billing redirects

### Step 3: Test Property Manager Login

1. If you have a test property manager account, login
2. **Expected:** Redirect to `/dashboard/property-manager`
3. Verify subscription status is checked:
   - `trialing` or `active` → dashboard access ✅
   - `past_due` → redirect to `/billing` ⚠️
   - `cancelled` → redirect to `/` ❌

### Step 4: Test Session Recovery

1. Clear browser cookies (but keep localStorage)
2. Try to access `/dashboard`
3. **Expected:** Redirect to `/login?autoretry=1&redirect=/dashboard`
4. Login page should auto-restore session and redirect to dashboard

### Step 5: Test localStorage Keys

Open browser DevTools Console and run:
```javascript
// After login, verify these keys exist
console.log(localStorage.getItem('wolf_shield_token')); // Should show JWT
console.log(localStorage.getItem('wolf_shield_user')); // Should show user JSON
console.log(localStorage.getItem('wolf_shield_org')); // Should show org JSON
console.log(localStorage.getItem('wolf_shield_refresh_token')); // Should show refresh token
```

---

## Common Issues & Fixes

### Issue: "Invalid credentials" despite correct password

**Cause:** User profile exists in `auth.users` but missing from `public.users`

**Fix:** The login route now auto-creates the profile. If this fails, run:
```sql
-- In Supabase SQL Editor
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';
-- Copy the ID, then:

INSERT INTO public.users (id, email, full_name, role, password_hash, email_verified)
VALUES (
  'COPIED_UUID_HERE'::uuid,
  'YOUR_EMAIL',
  'Your Name',
  'property_manager',
  'managed_by_supabase_auth',
  true
);
```

### Issue: Redirect loop on dashboard

**Cause:** Middleware can't read Supabase session

**Fix 1:** Clear all cookies and localStorage, then re-login
**Fix 2:** Check `wolf_shield_token` cookie exists:
```javascript
document.cookie.split(';').find(c => c.includes('wolf_shield_token'))
```

### Issue: Super Admin getting subscription check

**Cause:** User role is `'SUPER_ADMIN'` (uppercase) instead of `'super_admin'` (lowercase)

**Fix:** Update the role in database:
```sql
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'thenationofmazzi@gmail.com';
```

---

## Database Verification Queries

### Check User Role Format
```sql
SELECT email, role, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```
**Expected:** Roles should be lowercase with underscores (`super_admin`, `property_manager`, `tenant`)

### Check Subscription Status Format
```sql
SELECT o.name, s.status, s.tier
FROM subscriptions s
JOIN organizations o ON o.id = s.organization_id
ORDER BY s.created_at DESC
LIMIT 10;
```
**Expected:** Status should be lowercase (`active`, `trialing`, `past_due`)

### Check Super Admin Account
```sql
SELECT 
  u.email,
  u.role,
  o.name as org_name,
  s.status as subscription_status,
  s.tier as subscription_tier
FROM users u
LEFT JOIN organization_members om ON om.user_id = u.id
LEFT JOIN organizations o ON o.id = om.organization_id
LEFT JOIN subscriptions s ON s.organization_id = o.id
WHERE u.email = 'thenationofmazzi@gmail.com';
```
**Expected:**
- role: `super_admin`
- org_name: `Wolf Shield Admin`
- subscription_status: `active`
- subscription_tier: `enterprise`

---

## Troubleshooting Commands

### Reset localStorage (in browser console)
```javascript
localStorage.clear();
location.href = '/login';
```

### Check Middleware Logs (in terminal running Next.js)
```bash
# Look for these log lines:
[Middleware] Profile missing for authenticated user: ...
[Login] No profile found for user: ...
[Login] No organization found for user: ...
```

### Force Session Refresh
```javascript
// In browser console
const token = localStorage.getItem('wolf_shield_token');
const refreshToken = localStorage.getItem('wolf_shield_refresh_token');
if (token && refreshToken) {
  location.href = `/login?autoretry=1&redirect=/dashboard`;
}
```

---

## Success Criteria

✅ Super Admin logs in → immediate dashboard access, no subscription check
✅ Property Manager logs in → subscription checked, dashboard access if valid
✅ Tenant logs in → restricted to `/dashboard/tenant`
✅ Expired session → auto-recovery via `?autoretry=1`
✅ Missing profile → auto-created during login
✅ Missing org → auto-created during login
✅ All localStorage keys use `wolf_shield_*` prefix

---

## Next Steps After Successful Login

1. **Test Role-Based Routing:**
   - Super Admin: Access `/dashboard/super-admin` ✅
   - Property Manager: Try to access `/dashboard/super-admin` → should redirect ❌
   - Tenant: Try to access `/dashboard/property-manager` → should redirect ❌

2. **Test Subscription Enforcement:**
   - Update a subscription to `past_due` in database
   - Try to access dashboard → should redirect to `/billing`

3. **Test Logout:**
   - Click logout
   - Verify all `wolf_shield_*` keys are cleared from localStorage
   - Try to access `/dashboard` → should redirect to `/login`

---

**Built by:** IsoFlux-Core, Sovereign Architect Protocol
**Fix Applied:** March 1, 2026
**Status:** ✅ OPERATIONAL
