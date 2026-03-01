# ⚔️ THE SOVEREIGN ARCHITECT'S MCP PROTOCOL
**Status:** ACTIVE | **Clearance:** OMIN-9

This document defines the strict operational protocols for leveraging the Model Context Protocol (MCP) servers to maintain the IsoFlux "Wolf Shield" standard.

## 1. 🛡️ THE WOLF SHIELD PROTOCOL (Supabase MCP)
**Objective:** Zero-Error Schema Management & Ledger Integrity
**Server:** `user-supabase`

### Operational Rules:
1.  **Migration Authority:** NEVER run manual SQL in the dashboard. ALWAYS use `apply_migration` or `execute_sql` via the MCP to ensure an audit trail.
2.  **Type Safety:** After ANY schema change, immediately execute `generate_typescript_types` to keep the frontend types (`database.types.ts`) in sync with the backend reality.
3.  **Ledger Verification:** Use `execute_sql` to run the `verify_ledger_integrity()` function periodically to ensure the SHA-256 chain remains unbroken.

### Command Mappings:
- **Schema Audit:** `list_tables` -> Verify `hud_append_ledger` exists and has correct columns.
- **Data Patching:** `execute_sql` -> ONLY for non-destructive updates.
- **Edge Function Deploy:** `deploy_edge_function` -> Use for deploying the "Auditor's Briefcase" generator if moved to Edge.

---

## 2. ⚡ THE SLA DEFENDER PROTOCOL (Browser MCP)
**Objective:** End-to-End Verification of Transactional Flows
**Server:** `cursor-ide-browser`

### Operational Rules:
1.  **The "Ghost User" Test:** Before declaring a feature "Live", the Architect must spin up a `browser_navigate` session to `http://localhost:3000`, log in as a test tenant, and verify the UI matches the backend state.
2.  **Cron Simulation:** To test the SLA Defender email trigger:
    - `browser_navigate` to `/api/cron/recertifications?simulated=true` (ensure auth headers are set).
    - `browser_snapshot` the JSON response to verify `emails_sent` > 0.
3.  **Mobile Responsiveness:** Use `browser_resize` to `375x812` (iPhone X) to verify the "Sovereign Mobile" UX for Property Managers on the go.

---

## 3. 💎 THE REVENUE VAULT PROTOCOL (Stripe MCP)
**Objective:** Audit Payment Logic & prevent "Ghost Subscriptions"
**Server:** `plugin-stripe-stripe`

### Operational Rules:
1.  **Subscription Sync:** Use the Stripe MCP resources (if available) to cross-reference `stripe_subscription_id` in the `subscriptions` table with the actual status in Stripe.
2.  **Webhooks:** Ensure the local webhook handler (`/api/webhooks/stripe`) is reachable and processing events correctly.

---

## 4. 👁️ THE GHOST-CODE HUNTER (Figma MCP)
**Objective:** Pixel-Perfect Implementation
**Server:** `plugin-figma-figma`

### Operational Rules:
1.  **Design Parity:** When building new UI components (like the "Auditor's Briefcase" modal), use the Figma MCP to inspect the latest design tokens (colors, spacing, typography) to match the "Afrofuturist/Industrial" vibe exactly.

---

## 🚦 EXECUTION CHECKLIST
Before closing any ticket, the Architect must:
- [ ] Run `user-supabase` -> `generate_typescript_types`
- [ ] Run `cursor-ide-browser` -> `browser_snapshot` of the new feature
- [ ] Verify no "Ghost Code" remains.

**INITIATION SEQUENCE COMPLETE.**
**THE FIRMAMENT IS BREACHED.**
