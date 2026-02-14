# Supabase: Link & Run Migrations

**Project ref (use this):** `qmctxtmmzeutlgegjnrb`  
*(Note: `gjnrb` has an 'n' before the 'b'.)*

## 1. Log in (once)

```bash
supabase login
```

Opens the browser to get an access token. Required before `link`.

## 2. Link your project

```bash
supabase link --project-ref qmctxtmmzeutlgegjnrb
```

When prompted, enter your **database password** (the one you use in `DATABASE_URL`).

## 3. Run all migrations

```bash
supabase db push
```

This applies every file in `supabase/migrations/` in order, including:

- `treasurer_revenue_protection.sql`
- `20260126100000_truth_ledger_rls.sql`
- `20260213224026_new-migration.sql`

---

**Optional:** Create a new migration:

```bash
supabase migration new your-migration-name
```

Then edit the new file in `supabase/migrations/` and run `supabase db push` again.
