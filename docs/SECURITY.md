# IsoFlux (The Compliance Wolf) — Security

## Hardening Summary

- **SQL injection:** No raw SQL. All data access via Supabase client (parameterized). No string concatenation into queries.
- **XSS:** No `dangerouslySetInnerHTML` with user input. React escapes by default. User content in emails is template-bound.
- **IDOR:** API routes scope by `organizationId` from auth (session or API key). Row-Level Security (RLS) on Supabase where applied.
- **Auth:** JWT (httpOnly cookie recommended in production). API keys hashed; `X-API-Key` validated server-side only. Passwords hashed with bcrypt.
- **Input:** Request bodies validated with Zod. Process/validate APIs use strict schemas (e.g. `messageType` enum). Reject invalid payloads with 400.
- **Secrets:** No hardcoded secrets. Use env (e.g. Vercel/DO) or a secret manager. `.env` in `.gitignore`.
- **Headers:** Security headers set in `next.config.js` and `vercel.json` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.).
- **Stripe webhooks:** Signature verified with `STRIPE_WEBHOOK_SECRET`. Idempotency where applicable.
- **Prompt injection / poisoning:** No user-controlled text passed as system prompts. AI paths use fixed prompts and structured inputs; treat all user content as untrusted data, not instructions.
- **Rate limiting:** In-memory per-org on IsoFlux API (100/15min). Consider Redis for multi-instance.

## Recommendations

1. Re-enable ESLint and TypeScript checks in build once lint/type errors are fixed (`eslint.ignoreDuringBuilds`, `typescript.ignoreBuildErrors` in `next.config.js`).
2. Use httpOnly cookies for JWT in production so the token is not in localStorage.
3. Add CSP (Content-Security-Policy) header when possible.
4. Run `npm run lint` and `npm run type-check` before releases.
