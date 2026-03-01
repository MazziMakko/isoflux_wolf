# 🔍 DATABASE INSPECTION - MANUAL METHOD

## ⚠️ Direct Connection Failed

The automated inspection script is encountering password authentication issues. This is common with Supabase pooler connections.

---

## ✅ RECOMMENDED: Use Supabase SQL Editor

Since direct PostgreSQL connections are having authentication issues, please use the Supabase SQL Editor to run these inspection queries.

### 🔗 Go to SQL Editor
**URL**: https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql

---

## 📋 INSPECTION QUERIES

Copy and paste each query below into the SQL Editor and click "Run":

### Query 1: List All Tables
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE columns.table_schema = 'public' 
   AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**What to look for**: You should see 15-21 tables including `hud_append_ledger`, `subscriptions`, `users`, `organizations`, etc.

---

### Query 2: Inspect hud_append_ledger Schema
```sql
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'hud_append_ledger'
ORDER BY ordinal_position;
```

**What to look for**: Should show 13 columns (id, organization_id, property_id, unit_id, tenant_id, transaction_type, amount, description, accounting_period, is_period_closed, cryptographic_hash, created_at, created_by)

---

### Query 3: Check RLS Status on hud_append_ledger
```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'hud_append_ledger';
```

**What to look for**: `rowsecurity` should be `t` (true)

---

### Query 4: List RLS Policies
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'hud_append_ledger'
ORDER BY policyname;
```

**What to look for**: Should see 2-3 policies for SELECT, INSERT, and possibly service_role

---

### Query 5: Check Immutability Triggers
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'hud_append_ledger'
ORDER BY trigger_name;
```

**What to look for**: Should see 3 triggers:
- `enforce_no_delete`
- `enforce_no_update`
- `enforce_open_period_insert`

---

### Query 6: Verify Foreign Keys
```sql
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'hud_append_ledger'
ORDER BY tc.constraint_type;
```

**What to look for**: Should see foreign keys to organizations, properties, units, and users tables

---

## 📊 WHAT TO REPORT BACK

After running the queries, please share:

1. **Total number of tables** (from Query 1)
2. **Does `hud_append_ledger` exist?** (from Query 1)
3. **How many columns in `hud_append_ledger`?** (from Query 2)
4. **Is RLS enabled?** (from Query 3)
5. **How many RLS policies?** (from Query 4)
6. **Are there 3 triggers?** (from Query 5)

---

## 🔧 TROUBLESHOOTING

### If You See "relation does not exist" Errors
This means the migration hasn't been run yet. You need to:
1. Open: `c:\Dev\IsoFlux\supabase\migrations\20260228200000_wolf_shield_complete_migration.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Then run the inspection queries above

### If Tables Exist But Missing Columns
Some columns might be missing. Run this to see what's there:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'hud_append_ledger'
ORDER BY ordinal_position;
```

### If RLS is Disabled
Run this to enable it:
```sql
ALTER TABLE hud_append_ledger ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 ALTERNATIVE: Quick Health Check

If you just want to verify everything is working, run this single comprehensive query:

```sql
SELECT 
  'Tables' as check_type,
  COUNT(*)::text as result
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT 
  'hud_append_ledger exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'hud_append_ledger'
  ) THEN 'YES' ELSE 'NO' END

UNION ALL

SELECT 
  'hud_append_ledger columns',
  COUNT(*)::text
FROM information_schema.columns
WHERE table_name = 'hud_append_ledger'

UNION ALL

SELECT 
  'RLS enabled',
  CASE WHEN rowsecurity THEN 'YES' ELSE 'NO' END
FROM pg_tables
WHERE tablename = 'hud_append_ledger'

UNION ALL

SELECT 
  'RLS policies',
  COUNT(*)::text
FROM pg_policies
WHERE tablename = 'hud_append_ledger'

UNION ALL

SELECT 
  'Triggers',
  COUNT(*)::text
FROM information_schema.triggers
WHERE event_object_table = 'hud_append_ledger';
```

**Expected Output**:
```
check_type                  | result
---------------------------+--------
Tables                      | 15-21
hud_append_ledger exists    | YES
hud_append_ledger columns   | 13
RLS enabled                 | YES
RLS policies                | 2-3
Triggers                    | 3
```

---

## 📞 NEXT STEPS

1. Run the queries above in Supabase SQL Editor
2. Share the results (just copy/paste the output)
3. I'll confirm your schema is correct
4. Then we can proceed with application testing

---

*Sovereign Architect: Direct connection blocked by authentication. Manual inspection method provided. Standing by for your findings from Supabase SQL Editor.*
