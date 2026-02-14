# Next Moves: IsoFlux Complete

Truth Ledger is migrated. Here’s what’s done and what’s left to make IsoFlux “complete” as the Compliance Wolf.

---

## Done (Compliance Wolf core)

| Item | Status |
|------|--------|
| Dual auth (session + X-API-Key) for all IsoFlux routes | Done |
| Org scoping in orchestrator + audit | Done |
| Idempotency on `/api/isoflux/process` | Done (in-memory) |
| Validate schema tightened (no `z.any()`) | Done |
| Reserves/attestation `params` fix | Done |
| Truth Ledger table + service + migration | Done |
| API key create/list (`/api/organization/api-keys`) | Done |
| Dashboard “Reactor API Keys” page | Done |
| Rate limiting (per-org, 100/15min) | Done (in-memory) |
| RLS for truth_ledger (conditional on org tables) | Done |

---

## Next moves (in order)

### 1. Apply base schema (required for app + API keys)

Your DB has `truth_ledger` but not `organizations`, `users`, `organization_members`, `api_keys`, or `audit_logs`. Until these exist:

- Login/signup and dashboard won’t work.
- API key create/list will fail (no `api_keys` / `organizations`).

**Action:** Apply the base schema to Supabase.

**Option A – Supabase CLI (after link):**

```bash
supabase db push
```

This runs all migrations in `supabase/migrations/`, including `treasurer_revenue_protection.sql`. It does **not** run `supabase/schema.sql` (that’s the full schema). So you need the core tables created by a migration or by running `schema.sql` once.

**Option B – Run `schema.sql` once:**

In Supabase Dashboard → SQL Editor, run the contents of `supabase/schema.sql` (creates users, organizations, organization_members, projects, audit_logs, api_keys, etc.). Then run any remaining migrations if needed.

**Option C – One “base” migration:**

We can add a single migration that creates only the tables the app and API keys need (users, organizations, organization_members, api_keys, audit_logs) so `supabase db push` brings the DB to a working state without running the full schema.sql by hand.

**Done:** A base schema migration was added: **`supabase/migrations/20260125000000_base_schema.sql`**. It creates enums, `users`, `organizations`, `organization_members`, `subscriptions`, `projects`, `transactions`, `audit_logs`, `api_keys`, indexes, and basic RLS so the app and Treasurer migrations can run.

**Apply it (from your machine, where DATABASE_URL works):**

```bash
npm run db:migrate:base
```

This applies `20260125000000_base_schema.sql` (users, organizations, organization_members, api_keys, audit_logs, etc.). After that, login, signup, dashboard, and Reactor API keys will work.

Alternatively, use Supabase CLI after `supabase link`: **`supabase db push`** runs all migrations in order (base → truth_ledger → new-migration → treasurer).

---

### 2. Legal: disclose Truth Ledger

Add one sentence to Terms of Service and Privacy Policy so the ledger is explicitly disclosed.

**Suggested text:**

- **Terms:** “Processed messages may be recorded in a cryptographically signed, append-only audit ledger for regulatory compliance and dispute resolution.”
- **Privacy:** Same sentence in the “Data we collect / How we use data” section.

---

### 3. Reactor API docs (public)

Give fintechs a single place to integrate:

- **Where:** e.g. `/docs/reactor-api` or a “Developers” section on the site.
- **Content:**  
  - How to get an API key (dashboard → Reactor API Keys).  
  - Base URL (e.g. `https://www.isoflux.app` or your API host).  
  - Endpoints: `POST /api/isoflux/process`, `POST /api/isoflux/validate`, `GET /api/isoflux/status`, plus reserves/attestation if you expose them.  
  - Auth: `X-API-Key: <key>`.  
  - Optional: `Idempotency-Key` for process.  
  - Rate limits: e.g. 100 requests per 15 minutes per organization.

---

### 4. Optional later

- **truth_ledger FK:** When `organizations` exists, add a migration that does `ALTER TABLE truth_ledger ADD CONSTRAINT ... REFERENCES public.organizations(id)` and, if needed, (re)create the RLS policy so org members only see their org’s rows.
- **Persistent idempotency:** Replace in-memory idempotency with a Supabase table or Redis for production.
- **Persistent rate limit:** Replace in-memory rate limit with Redis or a Supabase-backed store for multi-instance production.
- **Marketing:** Homepage or /services line: “High-Efficiency Compliance & Translation Engine for Fintechs” (the Mask).

---

## Summary

**Immediate:** Apply base schema (Option C migration recommended) so login, dashboard, and API keys work.  
**Then:** Truth Ledger disclosure in Terms/Privacy and a short Reactor API doc.  
**Later:** FK for truth_ledger, persistent idempotency/rate limit, and marketing copy as you scale.
