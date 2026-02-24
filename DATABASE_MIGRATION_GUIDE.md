# 🐺 WOLF SHIELD: FRESH DATABASE MIGRATION

**Your old database tables are causing conflicts. Let's start completely fresh!**

---

## 🎯 APPROACH: Manual SQL Execution (Most Reliable)

Since automated approaches are blocked by Supabase's security, we'll run SQL migrations manually via the Supabase Dashboard. This is the **official recommended method** and takes about 15 minutes.

---

## 📋 STEP-BY-STEP GUIDE

### 🗑️ STEP 1: Drop Old Tables (3 MIN)

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/sql/new
   - Click **"New query"**

2. **Copy/Paste Cleanup Script:**
   - Open: `supabase\migrations\00000000000000_cleanup_old_database.sql`
   - Select All (`Ctrl+A`) → Copy (`Ctrl+C`)
   - Paste into SQL Editor
   - Click **"RUN"** (bottom right)

3. **Verify Cleanup:**
   - You should see: `Success. No rows returned`
   - At the end, the query returns empty list = all old tables dropped ✅

---

### 🏗️ STEP 2: Create Base Schema (3 MIN)

1. **New Query:**
   - Click **"New query"** again

2. **Copy/Paste Base Schema:**
   - Open: `supabase\migrations\00000000000001_base_schema.sql`
   - Select All → Copy
   - Paste into SQL Editor
   - Click **"RUN"**

3. **Expected Result:**
   - `Success. No rows returned`
   - This creates: `organizations`, `users`, `organization_members`, `audit_logs` tables

---

### 🐺 STEP 3: Create Wolf Shield Ledger (4 MIN)

1. **New Query:**
   - Click **"New query"**

2. **Copy/Paste Ledger Core:**
   - Open: `supabase\migrations\20260223000000_wolf_shield_ledger.sql`
   - Select All → Copy
   - Paste into SQL Editor
   - Click **"RUN"**

3. **Expected Result:**
   - `Success. No rows returned`
   - This creates: `properties`, `units`, `tenants`, `hud_append_ledger` + triggers

---

### 📦 STEP 4: Create Complete Wolf Shield Schema (3 MIN)

1. **New Query:**
   - Click **"New query"**

2. **Copy/Paste Complete Schema:**
   - Open: `supabase\migrations\20260224000000_wolf_shield_complete.sql`
   - Select All → Copy
   - Paste into SQL Editor
   - Click **"RUN"**

3. **Expected Result:**
   - `Success. No rows returned`
   - This creates: `maintenance_requests`, `compliance_alerts`, `tenant_documents`, `vendors`, `applicant_waitlist`

---

### 🔒 STEP 5: Set Bucket Security (2 MIN)

1. **New Query:**
   - Click **"New query"**

2. **Copy/Paste Bucket Security:**
   - Open: `supabase\BUCKET_SECURITY.sql`
   - Select All → Copy
   - Paste into SQL Editor
   - Click **"RUN"**

3. **Expected Result:**
   - `Success. 1 row inserted`
   - This creates the `tenant-documents` private bucket + RLS policies

---

## ✅ STEP 6: VERIFY (2 MIN)

### Check Tables in Supabase Dashboard:

1. **Go to Table Editor:**
   - https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/editor

2. **You should see 14 tables:**
   - ✅ `organizations`
   - ✅ `users`
   - ✅ `organization_members`
   - ✅ `audit_logs`
   - ✅ `properties`
   - ✅ `units`
   - ✅ `tenants`
   - ✅ `leases`
   - ✅ `hud_append_ledger` ⭐ (The Wolf Shield!)
   - ✅ `maintenance_requests`
   - ✅ `compliance_alerts`
   - ✅ `tenant_documents`
   - ✅ `vendors`
   - ✅ `applicant_waitlist`

### Check Storage Bucket:

1. **Go to Storage:**
   - https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/storage/buckets

2. **Verify:**
   - ✅ `tenant-documents` bucket exists
   - ✅ "Public" toggle is **OFF** (Private bucket)

---

## 🎯 TOTAL TIME: ~15 MINUTES

- 3 min: Drop old tables
- 3 min: Create base schema
- 4 min: Create ledger
- 3 min: Create complete schema
- 2 min: Set bucket security
- 2 min: Verify

---

## 🚨 TROUBLESHOOTING

### Error: "relation already exists"

**This means cleanup didn't fully work. Run this manually:**

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then start from Step 2 (Base Schema).

---

### Error: "permission denied"

- Make sure you're logged into the correct Supabase project
- Check that you have Owner/Admin role in the project
- Try logging out and back in

---

### Error: "function does not exist"

- This is normal if the function hasn't been created yet
- Continue with the next migration
- The error should resolve once the base schema is created

---

### Error: "type does not exist"

- Make sure you ran the migrations in order
- Base schema creates the enums first
- Don't skip steps!

---

## ✅ AFTER DATABASE SETUP

Once all tables are verified:

1. **Vercel Environment Variables** (5 min)
   - Add all env vars from `.env` to Vercel project settings

2. **Redeploy Vercel** (2 min)
   - Go to Vercel dashboard → Redeploy

3. **Test Homepage** (1 min)
   - Visit: https://www.isoflux.app
   - Should load without errors

4. **Create Stripe Products** (10 min)
   - Stripe Dashboard → Products → Create
   - Add product IDs to Vercel env vars

5. **Submit to Stripe for Review** (2 min)
   - Stripe Dashboard → Settings → Activate account

---

## 🐺 THE WOLF SHIELD WILL PROTECT YOUR DATA

Once migrations are complete:
- ✅ All data is immutable (append-only ledger)
- ✅ Cryptographic hashing (SHA-256 chain)
- ✅ HUD compliance enforcement
- ✅ Multi-tenant RLS security
- ✅ Private document storage

---

**Start with Step 1 now!** Let me know when you complete each step, or if you encounter any errors. 🛡️
