# 🐺 WOLF SHIELD: FINAL DATABASE SETUP - START HERE

**Status:** ✅ All keys configured, ready for manual migration  
**Time Required:** 9 minutes  
**Your Password:** `JoatWays@856$` (confirmed working)

---

## 🎯 WHAT YOU NEED TO DO NOW

### Open These Two Things:

1. **Browser Tab:** https://app.supabase.com/project/qmctxtmmzeutlgegjrnb/sql
2. **VS Code:** Your IsoFlux project (already open)

---

## 📋 COPY/PASTE 3 SQL FILES (9 MINUTES)

### Migration 1: Wolf Shield Ledger Core (3 min)

**File:** `c:\Dev\IsoFlux\supabase\migrations\20260223000000_wolf_shield_ledger.sql`

1. Open file in VS Code
2. `Ctrl+A` → `Ctrl+C` (Select All → Copy)
3. Go to Supabase SQL Editor
4. Click "New query"
5. `Ctrl+V` (Paste)
6. Click "RUN"
7. ✅ Wait for "Success"

---

### Migration 2: Complete Schema (3 min)

**File:** `c:\Dev\IsoFlux\supabase\migrations\20260224000000_wolf_shield_complete.sql`

1. Click "New query" in Supabase
2. Open file in VS Code
3. `Ctrl+A` → `Ctrl+C`
4. Paste in Supabase
5. Click "RUN"
6. ✅ Wait for "Success"

---

### Migration 3: Bucket Security (3 min)

**File:** `c:\Dev\IsoFlux\supabase\BUCKET_SECURITY.sql`

1. Click "New query"
2. Open file in VS Code
3. `Ctrl+A` → `Ctrl+C`
4. Paste in Supabase
5. Click "RUN"
6. ✅ Wait for "Success. 1 row inserted"

---

## ✅ VERIFY (2 MIN)

1. **Supabase → Table Editor** → Should see 15+ tables including `hud_append_ledger`
2. **Supabase → Storage** → Should see `tenant-documents` bucket (PRIVATE)

---

## 🚀 NEXT: VERCEL SETUP (5 MIN)

After migrations complete, add these to **Vercel → Settings → Environment Variables**:

```bash
DATABASE_URL=postgresql://postgres.qmctxtmmzeutlgegjrnb:JoatWays%40856%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
WOLF_SHIELD_ENABLED=true
LEDGER_AUTO_VERIFY=true
ALLOW_LEDGER_DELETE=false
ALLOW_LEDGER_UPDATE=false
```

Then: **Redeploy Vercel** → **Test Homepage** → **Submit to Stripe**

---

**Let me know when migrations are done and I'll help with Vercel!** 🐺🛡️
