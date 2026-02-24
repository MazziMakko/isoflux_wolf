# 🐺 WOLF SHIELD: DATABASE MIGRATION CHECKLIST

**Fresh start migration - Run these 5 SQL files in order**

---

## 📋 MIGRATION CHECKLIST

Open Supabase SQL Editor: https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/sql/new

---

### ☐ 1. Cleanup (3 min)
**File:** `supabase\migrations\00000000000000_cleanup_old_database.sql`

- [ ] Open file in VS Code
- [ ] `Ctrl+A` → `Ctrl+C` (Select All → Copy)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "RUN"
- [ ] **Expected:** `Success. No rows returned`

**What it does:** Drops all old tables, enums, functions, and buckets

---

### ☐ 2. Base Schema (3 min)
**File:** `supabase\migrations\00000000000001_base_schema.sql`

- [ ] Click "New query"
- [ ] Open file in VS Code
- [ ] `Ctrl+A` → `Ctrl+C`
- [ ] Paste into SQL Editor
- [ ] Click "RUN"
- [ ] **Expected:** `Success. No rows returned`

**What it does:** Creates `organizations`, `users`, `organization_members`, `audit_logs`

---

### ☐ 3. Wolf Shield Ledger (4 min)
**File:** `supabase\migrations\20260223000000_wolf_shield_ledger.sql`

- [ ] Click "New query"
- [ ] Open file in VS Code
- [ ] `Ctrl+A` → `Ctrl+C`
- [ ] Paste into SQL Editor
- [ ] Click "RUN"
- [ ] **Expected:** `Success. No rows returned`

**What it does:** Creates `properties`, `units`, `tenants`, `hud_append_ledger` + immutability triggers

---

### ☐ 4. Complete Schema (3 min)
**File:** `supabase\migrations\20260224000000_wolf_shield_complete.sql`

- [ ] Click "New query"
- [ ] Open file in VS Code
- [ ] `Ctrl+A` → `Ctrl+C`
- [ ] Paste into SQL Editor
- [ ] Click "RUN"
- [ ] **Expected:** `Success. No rows returned`

**What it does:** Creates `maintenance_requests`, `compliance_alerts`, `tenant_documents`, etc.

---

### ☐ 5. Bucket Security (2 min)
**File:** `supabase\BUCKET_SECURITY.sql`

- [ ] Click "New query"
- [ ] Open file in VS Code
- [ ] `Ctrl+A` → `Ctrl+C`
- [ ] Paste into SQL Editor
- [ ] Click "RUN"
- [ ] **Expected:** `Success. 1 row inserted`

**What it does:** Creates private `tenant-documents` bucket with RLS policies

---

## ✅ VERIFICATION (2 min)

### Check Tables:
https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/editor

Should see **14 tables:**
- [ ] `organizations`
- [ ] `users`
- [ ] `organization_members`
- [ ] `audit_logs`
- [ ] `properties`
- [ ] `units`
- [ ] `tenants`
- [ ] `leases`
- [ ] `hud_append_ledger` ⭐
- [ ] `maintenance_requests`
- [ ] `compliance_alerts`
- [ ] `tenant_documents`
- [ ] `vendors`
- [ ] `applicant_waitlist`

### Check Storage:
https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/storage/buckets

- [ ] `tenant-documents` bucket exists
- [ ] "Public" toggle is **OFF**

---

## 🎯 TOTAL TIME: ~15 MINUTES

Once complete, you're ready for:
1. Vercel deployment
2. Stripe product setup
3. Production testing

---

**Let me know when you're done or if you hit any errors!** 🐺🛡️
