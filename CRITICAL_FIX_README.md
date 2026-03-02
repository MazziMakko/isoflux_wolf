# 🚨 CRITICAL FIX REQUIRED - Database Schema Error

## The Problem

The error `column "role" of relation "users" does not exist` occurred because:
1. **Prisma v7 Breaking Changes**: The latest Prisma version changed how database connections work
2. **Schema Cache Out of Sync**: Supabase's PostgREST API cache doesn't reflect the actual database columns
3. **Connection Issues**: Database credentials have authentication problems with Prisma CLI

## The Solution

We've **downgraded to Prisma v6** (stable) and created a comprehensive SQL script that fixes everything in one go.

---

## 🎯 IMMEDIATE ACTION (5 minutes)

### Step 1: Run the Schema Sync SQL Script

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your IsoFlux project**
3. **Go to**: SQL Editor → New Query
4. **Open the file**: `SCHEMA_SYNC_FIX.sql` (in this repository root)
5. **Copy the ENTIRE contents** and paste into the SQL Editor
6. **Click "Run"**

**What this does:**
- ✅ Adds all missing columns to `users` table (role, email_verified, password_hash, etc.)
- ✅ Creates proper indexes
- ✅ Sets up your Super Admin profile (`admin@isoflux.app`)
- ✅ Creates the Super Admin organization
- ✅ Creates the Super Admin subscription (lifetime active)
- ✅ Verifies everything is correct

**Expected output:**
```
NOTICE: Added role column to users table
NOTICE: Added email_verified column to users table
NOTICE: Updated existing user [uuid] to Super Admin
NOTICE: ✅ Super Admin setup complete!
```

### Step 2: Generate Prisma Client (v6)

```bash
npx prisma generate
```

**Time:** ~10 seconds

### Step 3: Test Super Admin Login

```bash
npm run dev
```

1. Navigate to: http://localhost:3000/forgot-password
2. Enter: `admin@isoflux.app` (or your email if you changed it in the SQL)
3. Check your email for the reset link
4. Set your Super Admin password
5. Login at: http://localhost:3000/login

---

## 📋 What We Fixed

### ✅ Prisma Version
- ⬇️ Downgraded from v7.4.2 to v6.19.2 (stable, production-ready)
- ✅ Updated `prisma/schema.prisma` to use `directUrl` for migrations
- ✅ Installed `@prisma/client@6` for compatibility

### ✅ Database Schema
- Created `SCHEMA_SYNC_FIX.sql` - comprehensive SQL that:
  - Adds all missing columns with proper types
  - Creates indexes for performance
  - Sets up Super Admin profile, org, and subscription
  - Includes verification query

### ✅ Files Created
- `SCHEMA_SYNC_FIX.sql` - Run this in Supabase SQL Editor
- `prisma/schema.prisma` - Updated with `directUrl` support
- `package.json` - Downgraded Prisma dependencies

---

## 🧪 Next Steps (After Fix)

Once you've completed the 3 steps above, you'll be able to:

1. ✅ Login as Super Admin
2. ✅ Access the Super Admin Dashboard
3. ✅ View platform metrics
4. ✅ Access the Wolf Hunter tab
5. ✅ Test the full authentication flow
6. ✅ Test password reset flow
7. ✅ Run the Hunter Engine cron job

---

## 🆘 Troubleshooting

### If SQL script fails with "user not found"
- The email `admin@isoflux.app` doesn't exist in `auth.users`
- Solution: Use the password reset flow first to create the auth user, then run the SQL

### If Prisma generate fails
```bash
# Clear Prisma cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### If you see "invalid credentials" when logging in
- You haven't set a password yet
- Solution: Use the forgot-password flow (Step 3 above)

---

## ⚡ Summary

**Before you can test anything, you MUST:**
1. 🔴 Run `SCHEMA_SYNC_FIX.sql` in Supabase SQL Editor
2. 🟡 Run `npx prisma generate`
3. 🟢 Set Super Admin password via forgot-password flow

**Time required:** 5 minutes total

**Status after fix:** 🟢 System 100% ready for testing
