# ISOFLUX → THE COMPLIANCE WOLF

**Strategic upgrade path: High-Efficiency Compliance & Translation Engine for Fintechs (API-first, behind-the-scenes setup, optional Truth Ledger).**

---

## 1. WHAT ISOFLUX IS TODAY

IsoFlux is an enterprise fintech platform that:

- **Core engine (Trinity of Order):**
  - **Rulial Parser** – FSM-based ISO 20022 message validation (MT → MX re-origination).
  - **Geometric Legislator** – Sanctions screening (OFAC, EU, UN) and regulatory surfaces (SEC, MiCA, CFTC).
  - **Entangled Ledger** – Proof-of-reserves verification, HSM-signed attestations, oracle sentinel.
- **APIs:** Five IsoFlux endpoints: `POST /api/isoflux/process`, `POST /api/isoflux/validate`, `GET /api/isoflux/status`, `GET /api/isoflux/reserves/[assetId]`, `POST /api/isoflux/attestation/[assetId]`.
- **Auth:** All IsoFlux routes use **session only** (`withAuth`). API key support exists in the security layer (`withApiKey`, `api_keys` table, `ffx_` prefix) but **is not used** by IsoFlux routes.
- **Multi-tenant:** Organizations and `organization_id` exist in DB and in `SecurityContext`, but IsoFlux **does not scope by organization** (no `organizationId` passed to orchestrator or audit for compliance events).
- **Audit:** `AuditLogger` writes to `audit_logs` (Supabase). No cryptographic chaining or immutable “Truth Ledger” yet.
- **Product positioning:** Marketing and docs are broad (“Geometry of Value”); the **Reactor** (compliance + translation engine) is not yet a separate, API-first product that fintechs/credit unions can “plug into” and be set up from behind the scenes.

So: the **engine** is strong; the **productization** (API-first, B2B, tenant isolation, optional immutable ledger) is what turns it into **The Compliance Wolf**.

---

## 2. CRITICAL FIXES (DO FIRST)

| # | Issue | Fix | Risk if skipped |
|---|--------|-----|------------------|
| 1 | **Reserves/Attestation routes** – Handlers use a non-existent third argument `{ params }`; in App Router only `(req, context)` exist, so `params` is undefined. | Use `context.params` (or `context?.params`) inside the handler. | 500s, broken assetId. |
| 2 | **Validate endpoint** – `message` is `z.any()`. | Restrict to string or object + known message-type shape (or reject unknown). | Weak validation, bad data into parser. |
| 3 | **Process endpoint** – No idempotency. | Accept `Idempotency-Key` header; persist key → result in Redis/DB; return cached 200 on replay. | Double-processing same message. |
| 4 | **IsoFlux API only supports session** – Fintechs need server-to-server. | Support **dual auth**: session **or** API key (`X-API-Key`). When API key is used, resolve `organizationId` and pass it through. | No B2B adoption. |
| 5 | **No org scoping** – Process/validate/audit don’t use `organizationId`. | Pass `organizationId` (from session or API key) into orchestrator and audit for every IsoFlux operation. | No tenant isolation; compliance/audit blur. |
| 6 | **Rate limiting** – `checkRateLimit` is a no-op (always allows). | Implement per-API-key (and per-org) rate limit with Redis or Supabase. | Abuse, cost, compliance risk. |

---

## 3. CHANGES & UPGRADES FOR “THE COMPLIANCE WOLF”

### 3.1 The Mask (Positioning)

- **Public positioning:** “High-Efficiency Compliance & Translation Engine for Fintechs” – **Reactor** cleans data and ensures ISO 20022 compliance faster than the competition.
- **Delivery:** Offer it as an **API**. Small fintechs and credit unions integrate; your code becomes part of their pipeline.
- **Implementation:** Same IsoFlux engine; expose it as a **productized API** with API-key auth, docs, and clear “Reactor” naming in paths or headers.

### 3.2 Secure, API-First System

- **Dual auth:**  
  - If `X-API-Key` present and valid → treat as B2B call; use `organizationId` from key.  
  - Else use existing session (`withAuth`).  
- **Tenant isolation:** Every Reactor call (process, validate, status, reserves, attestation) is tied to an **organization**. Orchestrator and audit receive `organizationId` (and optionally `userId` for session) so logs and future per-tenant config are correct.
- **Behind-the-scenes setup:**  
  - **API key lifecycle:** Endpoint(s) to create/revoke/list API keys (admin or org-admin only).  
  - **Dashboard:** “API Keys” or “Reactor” section where org admins create keys and see usage.  
  - No need to “market” sovereign/indigenous angle; the product is “compliance + translation API.”

### 3.3 Truth Ledger (Phase 2 – Compliant Design)

- **Concept:** Every transaction that passes through the Reactor can be recorded in an **immutable, append-only ledger** with a **cryptographic digest** (e.g. hash chain or signed payload).
- **Compliance:** This must be **disclosed** (Terms of Service, API ToS, Privacy Policy): e.g. “Processed messages may be recorded in a cryptographically signed audit ledger for regulatory and dispute resolution.” No silent recording.
- **Mechanism (high level):**  
  - New table (e.g. `truth_ledger`): `id`, `organization_id`, `transaction_id`, `message_type`, `payload_digest`, `prev_ledger_hash`, `ledger_hash`, `signed_at`, `signature`, `created_at`.  
  - On successful process (and optionally on validate): append a row; compute `ledger_hash = H(prev_ledger_hash || payload_digest || ...)`; optionally sign with HSM or internal key.  
  - Regulators or parties can verify: order of events, integrity of digest, and (if you expose it) non-repudiation.

This gives you the “we hold the real receipts” leverage **without** hidden processing: it’s an auditable, compliant Truth Ledger.

---

## 4. WHAT TO INJECT WITHOUT BREAKING EXISTING BEHAVIOR

1. **Unified auth helper**  
   - `getIsoFluxContext(req)`: returns `{ userId?, organizationId, authMethod: 'session' | 'api_key' }`.  
   - Logic: if `X-API-Key` present and valid → `organizationId` from key, `userId` optional (or null).  
   - Else use existing `getSecurityContext` → `userId` + `organizationId` from session.  
   - IsoFlux routes call this first; then require at least `organizationId` (and optionally role when session).

2. **IsoFlux routes**  
   - Switch to the unified context.  
   - For **process**: require `organizationId`; pass it (and `userId` if any) to orchestrator and audit; add idempotency key handling.  
   - For **validate, status, reserves, attestation**: same context; pass `organizationId` (and userId) to audit and any future per-tenant logic.  
   - Fix **reserves** and **attestation** to read `assetId` from `context.params` (App Router).

3. **Orchestrator (and audit)**  
   - Extend `processTransaction` (and any other entry points) to accept `organizationId` (and optional `userId`).  
   - AuditLogger already supports `organizationId`; ensure every IsoFlux audit call includes it.

4. **Truth Ledger (optional Phase 2)**  
   - Add `truth_ledger` table and a small **TruthLedgerService**: append-only, compute hash chain, optional HSM sign.  
   - Call it from the process flow **after** success; do not block the main response.  
   - Document in legal/ToS.

5. **API key management**  
   - `POST /api/admin/api-keys` (or `/api/organization/api-keys`) to create key (name, optional expiry); return raw key once (e.g. `iso_` or `ffx_` prefix).  
   - `GET` list, `DELETE` revoke.  
   - Dashboard: “Reactor API” or “API Keys” section that uses these endpoints so businesses can be set up from behind the scenes.

6. **Validate schema**  
   - Replace `z.any()` with a union of `z.string()` and a constrained object (e.g. known ISO 20022-like structure) or reject with 400.

7. **Rate limiting**  
   - Implement real limits per API key (and optionally per org) using Redis or Supabase; apply to IsoFlux (and optionally all) API routes.

---

## 5. SUMMARY

- **IsoFlux today:** Strong core (Rulial, Legislator, Entangled Ledger), good security base (RBAC, RLS, audit), but session-only IsoFlux API, no org scoping on the engine, and no productized “Reactor” API or Truth Ledger.
- **Critical fixes:** Fix reserves/attestation `params`, tighten validate schema, add idempotency to process, add dual auth and org scoping, then real rate limiting.
- **Compliance Wolf:** Same engine, exposed as a **secure, API-first Compliance & Translation Engine**; B2B onboarding via API keys and dashboard; optional **Truth Ledger** with signed, immutable records, **disclosed** in legal docs so it’s compliant and still makes you the “Judge” when regulators need the real receipts.

All of this can be injected **without breaking** existing session-based dashboard or current behavior; API-key callers simply get the same engine with tenant isolation and a path to the Truth Ledger.

---

## 6. MIGRATIONS (Truth Ledger)

**Run the Supabase migration:**

```bash
supabase db push
# or apply manually:
# psql $DATABASE_URL -f supabase/migrations/20260126100000_truth_ledger_rls.sql
```

**File:** `supabase/migrations/20260126100000_truth_ledger_rls.sql`

- Creates `truth_ledger` (append-only), indexes, and comments.
- **RLS:** SELECT allowed for organization members only; no INSERT/UPDATE/DELETE policy for `authenticated`/`anon`, so only **service_role** (backend) can append.
- Grants: `authenticated`/`anon` get SELECT only; INSERT/UPDATE/DELETE explicitly revoked for them; `service_role` has ALL.

---

## 7. NEW ENDPOINTS

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organization/api-keys | Session (admin) | List API keys for org |
| POST | /api/organization/api-keys | Session (admin) | Create API key; `rawKey` returned once |
| POST | /api/isoflux/process | Session or X-API-Key | Process transaction; optional `Idempotency-Key` |
| POST | /api/isoflux/validate | Session or X-API-Key | Validate message |
| GET | /api/isoflux/status | Session or X-API-Key | System status |
| GET | /api/isoflux/reserves/[assetId] | Session or X-API-Key | Reserve ratio |
| POST | /api/isoflux/attestation/[assetId] | Session or X-API-Key (admin for session) | Proof of reserves |
