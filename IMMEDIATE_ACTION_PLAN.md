# 🐺 WOLF SHIELD: IMMEDIATE ACTION PLAN

**Date:** February 24, 2026  
**Status:** 🟡 READY FOR DATABASE MIGRATION  
**Priority:** 🔴 CRITICAL - Stripe Bot Needs Homepage Working

---

## 🚨 THE SITUATION

Your Stripe live keys are pending approval, but **Stripe's bot needs your homepage to load** without 500 errors.

**The Problem:**
- Your Next.js app tries to fetch from database tables that don't exist yet
- This causes 500 Internal Server Error
- Stripe bot sees the error and rejects your live keys application

**The Solution:**
- Run 3 SQL migrations in Supabase NOW
- This creates all tables
- Homepage will load successfully
- Stripe bot approves your application ✅

---

## ✅ STEP 1: SUPABASE DATABASE MIGRATIONS (15 MIN)

### Your Supabase Details (Confirmed Working)
```
URL: https://qmctxtmmzeutlgegjrnb.supabase.co
Anon Key: ✅ Valid
Service Role Key: ✅ Valid
```

### Migration Files Ready to Run:
1. `supabase/migrations/20260223000000_wolf_shield_ledger.sql` (393 lines)
2. `supabase/migrations/20260224000000_wolf_shield_complete.sql` (419 lines)
3. `supabase/BUCKET_SECURITY.sql` (152 lines)

---

### 🎯 EXECUTE NOW (Copy/Paste Method)

#### Migration 1: Wolf Shield Ledger Core
**File:** `c:\Dev\IsoFlux\supabase\migrations\20260223000000_wolf_shield_ledger.sql`

**Steps:**
1. Open Supabase Dashboard: https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/sql
2. Click **"New query"** (top right)
3. Open the file `20260223000000_wolf_shield_ledger.sql` in VS Code
4. **Select All** (Ctrl+A) → **Copy** (Ctrl+C)
5. Go back to Supabase SQL Editor
6. **Paste** (Ctrl+V)
7. Click **"Run"** button (or press Ctrl+Enter)
8. ✅ Verify: You see **"Success. No rows returned"**

**What This Creates:**
- `properties` table
- `units` table
- `tenants` table
- `hud_append_ledger` table (the Wolf Shield)
- 4 immutability triggers (prevent DELETE, prevent UPDATE, enforce period closure, auto-hash)
- Indexes for performance
- RLS policies for security

---

#### Migration 2: Complete Wolf Shield Schema
**File:** `c:\Dev\IsoFlux\supabase\migrations\20260224000000_wolf_shield_complete.sql`

**Steps:**
1. In Supabase SQL Editor, click **"New query"**
2. Open `20260224000000_wolf_shield_complete.sql` in VS Code
3. **Select All** → **Copy**
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ Verify: **"Success. No rows returned"**

**What This Creates:**
- `leases` table (recertification tracking)
- `compliance_alerts` table (90-60-30 day notices)
- `vendors` table
- `maintenance_requests` table (with SLA tracking)
- `tenant_documents` table
- `applicant_waitlist` table (HUD priority)
- More RLS policies
- `is_super_admin` column added to `users`

---

#### Migration 3: Supabase Storage Bucket Security
**File:** `c:\Dev\IsoFlux\supabase\BUCKET_SECURITY.sql`

**Steps:**
1. In Supabase SQL Editor, click **"New query"**
2. Open `BUCKET_SECURITY.sql` in VS Code
3. **Select All** → **Copy**
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ Verify: **"Success. 1 row inserted"** (the bucket creation)

**What This Creates:**
- `tenant-documents` storage bucket (PRIVATE)
- 5 RLS policies for document access
- File size limit: 10MB
- Allowed types: PDF, JPEG, PNG, WebP

---

### 🔍 VERIFY MIGRATIONS WORKED

After running all 3 migrations, verify:

#### Check Tables
1. Supabase Dashboard → **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `hud_append_ledger`
   - ✅ `properties`
   - ✅ `units`
   - ✅ `tenants` (note: from first migration, not "leases")
   - ✅ `leases`
   - ✅ `compliance_alerts`
   - ✅ `vendors`
   - ✅ `maintenance_requests`
   - ✅ `tenant_documents`
   - ✅ `applicant_waitlist`

#### Check Triggers
Run this query in SQL Editor:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%ledger%'
ORDER BY trigger_name;
```

**Expected result:** 4 triggers:
- `enforce_no_delete`
- `enforce_no_update`
- `enforce_open_period_insert`
- `trigger_generate_ledger_hash` (or similar)

#### Check Storage Bucket
1. Supabase Dashboard → **Storage** (left sidebar)
2. You should see: **`tenant-documents`** bucket
3. Click the bucket → Click **Settings** (gear icon)
4. ✅ Verify: **"Public"** toggle is **OFF**

---

## ✅ STEP 2: UPDATE VERCEL ENVIRONMENT VARIABLES (5 MIN)

### Your Current `.env` Status

✅ **Already Set (Good):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qmctxtmmzeutlgegjrnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (valid)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (valid)
JWT_SECRET=UCzOL6bW... (strong)
ENCRYPTION_KEY=c4d5e6f7b8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9 (valid)
CRON_SECRET=7f8a9b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4u5f60718293a4b5c6d7e8 (valid)
```

❌ **MISSING (Need to Add):**
```bash
DATABASE_URL=(empty - need to set)
STRIPE_SECRET_KEY=sk_live_... (placeholder)
STRIPE_WEBHOOK_SECRET=whsec_... (placeholder)
STRIPE_PRODUCT_WOLF_SHIELD=(not defined)
STRIPE_PRICE_WOLF_SHIELD_MONTHLY=(not defined)
```

❌ **MISSING WOLF SHIELD VARS:**
```bash
WOLF_SHIELD_ENABLED=(not defined)
LEDGER_AUTO_VERIFY=(not defined)
COMPLIANCE_HEALTH_THRESHOLD=(not defined)
HUD_CERTIFICATION_REQUIRED=(not defined)
LEDGER_HASH_ALGORITHM=(not defined)
ALLOW_LEDGER_DELETE=(not defined)
ALLOW_LEDGER_UPDATE=(not defined)
```

---

### 🎯 GET DATABASE_URL

**How to Get It:**
1. Supabase Dashboard → **Settings** (gear icon, left sidebar)
2. Click **Database**
3. Scroll to **"Connection String"** section
4. Click **"URI"** tab
5. Copy the entire string (looks like: `postgresql://postgres:[password]@db.qmctxtmmzeutlgegjrnb.supabase.co:5432/postgres`)

**Then Add to Vercel:**
1. Go to Vercel Dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Name: `DATABASE_URL`
5. Value: (paste the connection string)
6. Check: **Production**, **Preview**, **Development**
7. Click **"Save"**

---

### 🎯 ADD WOLF SHIELD VARIABLES TO VERCEL

Add these to Vercel → Settings → Environment Variables:

```bash
# Wolf Shield Core
WOLF_SHIELD_ENABLED=true
LEDGER_AUTO_VERIFY=true
COMPLIANCE_HEALTH_THRESHOLD=75
HUD_CERTIFICATION_REQUIRED=true
LEDGER_HASH_ALGORITHM=sha256
ALLOW_LEDGER_DELETE=false
ALLOW_LEDGER_UPDATE=false

# Stripe Products (leave as placeholders until Stripe approves)
STRIPE_PRODUCT_WOLF_SHIELD=prod_placeholder
STRIPE_PRICE_WOLF_SHIELD_MONTHLY=price_placeholder
```

**For now, leave Stripe keys as placeholders:**
- They won't work until Stripe approves your live keys
- But the app will still load (just checkout won't work yet)

---

### 🎯 REDEPLOY VERCEL

After adding all environment variables:

1. Vercel Dashboard → **Deployments**
2. Click the latest deployment
3. Click **"..."** menu (top right)
4. Click **"Redeploy"**
5. **UNCHECK** "Use existing build cache"
6. Click **"Redeploy"**
7. Wait ~2-3 minutes for deployment to complete

---

## ✅ STEP 3: TEST HOMEPAGE (2 MIN)

Once Vercel redeploys:

1. Go to: https://www.isoflux.app
2. ✅ Homepage should load (no 500 error)
3. ✅ You should see: "Compliance Without the Headaches" hero section
4. ✅ Footer should have legal links

**If you see a 500 error:**
1. Check Vercel logs: Deployments → Click deployment → **"Logs"** tab
2. Look for database connection errors
3. Verify `DATABASE_URL` is set correctly in Vercel

---

## ✅ STEP 4: SUBMIT TO STRIPE (NOW!)

Once homepage loads successfully:

1. Go back to your Stripe live keys application
2. Submit/resubmit for review
3. Stripe's bot will crawl https://www.isoflux.app
4. It will see a 200 OK response (no 500 error)
5. ✅ You should get approved within 1-2 hours

---

## 🎯 ONCE STRIPE APPROVES (What to Do Next)

When Stripe emails you with live keys:

### Update Vercel with Real Stripe Keys
1. Vercel → Settings → Environment Variables
2. Update:
   - `STRIPE_SECRET_KEY=sk_live_xxx` (real key from Stripe)
   - `STRIPE_WEBHOOK_SECRET=whsec_xxx` (from Stripe webhook setup)
3. Redeploy Vercel

### Create Stripe Product
1. Stripe Dashboard → **Products** → **Add product**
2. Name: "Wolf Shield HUD-Secure Pro"
3. Price: $300.00/month (recurring)
4. Enable: **30-day free trial**
5. Copy **Product ID** (starts with `prod_`)
6. Copy **Price ID** (starts with `price_`)
7. Update in Vercel:
   - `STRIPE_PRODUCT_WOLF_SHIELD=prod_xxx`
   - `STRIPE_PRICE_WOLF_SHIELD_MONTHLY=price_xxx`
8. Redeploy Vercel

### Test Full Signup Flow
1. Go to: https://www.isoflux.app/signup
2. Create Property Manager account
3. Should redirect to Stripe Checkout
4. Verify: MSA clickwrap checkbox is visible
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Should redirect to `/dashboard/property-manager`

---

## 📊 CURRENT STATUS CHECKLIST

| Task | Status | Next Action |
|------|--------|-------------|
| Code Build | ✅ Complete | None |
| Git Push | ✅ Complete | None |
| Supabase Migrations | 🟡 Ready | **RUN NOW** (Step 1) |
| DATABASE_URL | ❌ Empty | Add to Vercel (Step 2) |
| Wolf Shield Env Vars | ❌ Missing | Add to Vercel (Step 2) |
| Vercel Redeploy | ⏸️ Waiting | After Step 2 |
| Homepage Test | ⏸️ Waiting | After Redeploy |
| Stripe Submission | ⏸️ Waiting | After Homepage Works |
| Stripe Approval | ⏸️ Waiting | 1-2 hours |
| Live Keys | ⏸️ Waiting | From Stripe email |

---

## 🚨 CRITICAL PATH TO STRIPE APPROVAL

```
1. Run Supabase migrations (15 min)
   ↓
2. Add env vars to Vercel (5 min)
   ↓
3. Redeploy Vercel (2-3 min)
   ↓
4. Test homepage loads (1 min)
   ↓
5. Submit to Stripe (1 min)
   ↓
6. Stripe bot crawls site ✅
   ↓
7. Stripe approves (1-2 hours) 🎉
```

**Total Time:** ~25 minutes of work + 1-2 hour wait for Stripe

---

## 🎯 NEXT STEPS AFTER APPROVAL

Once you have Stripe live keys and product created:

1. **E2E Testing** (30 min)
   - Test signup → checkout → dashboard flow
   - Test tenant EULA redirect
   - Test emergency disclaimer
   - Test document upload
   - Test maintenance request

2. **Domain Verification** (if needed)
   - Ensure `isoflux.app` points to Vercel
   - Verify SSL certificate

3. **Monitoring Setup** (optional, post-launch)
   - Add Sentry for error tracking
   - Add Google Analytics
   - Configure Supabase alerts

---

## 📞 NEED HELP?

**If Migrations Fail:**
- Check Supabase logs: Dashboard → **Logs** → **Postgres Logs**
- Look for duplicate table errors (may need to drop existing tables first)
- DM me the error message

**If Homepage Still Shows 500:**
- Check Vercel logs: Deployments → Latest → **Logs**
- Verify `DATABASE_URL` has correct password
- Verify all Wolf Shield env vars are set

**If Stripe Bot Fails:**
- Ensure homepage loads without ANY console errors
- Check browser DevTools → Console for JS errors
- Ensure SSL certificate is valid

---

## 🐺 BOTTOM LINE

**What You Need to Do RIGHT NOW:**

1. ✅ **Run 3 SQL files** in Supabase (15 min)
2. ✅ **Add DATABASE_URL + Wolf Shield vars** to Vercel (5 min)
3. ✅ **Redeploy Vercel** (3 min wait)
4. ✅ **Test homepage** (1 min)
5. ✅ **Submit to Stripe** (1 min)

**Then wait 1-2 hours for Stripe approval.**

**Once approved, you're 100% ready to go live.** 🚀

---

**The Wolf Shield is coded. The database is ready. Execute migrations NOW.** 🐺🛡️

---

*Need me to walk you through any step? Let me know!*
