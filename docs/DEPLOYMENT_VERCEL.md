# IsoFlux (The Compliance Wolf) — Vercel Deployment

**Primary deployment path for isoflux.app.** Optimized for speed, security, and zero-downtime.

---

## ✅ Pre-deploy checklist

- [ ] **Secrets only in Vercel:** All keys (Supabase, Stripe, JWT, etc.) are set in Vercel → Settings → Environment Variables. The repo must never contain real keys; use `.env.production.example` as the list of variable names (placeholders only).
- [ ] **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (for migrations; optional on Vercel if you run migrations locally).
- [ ] **Stripe**: Live keys for production; set webhook URL to `https://www.isoflux.app/api/webhooks/stripe` (or your Vercel domain).
- [ ] **App URL**: `NEXT_PUBLIC_APP_URL=https://www.isoflux.app` (emails, redirects, canonical).
- [ ] **JWT / crypto**: `JWT_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` (min 32 chars; use Vercel env or secret manager).

---

## 🚀 Deploy to Vercel

### 1. Connect repo

- Vercel Dashboard → Add New Project → Import Git (GitHub/GitLab/Bitbucket).
- Root directory: project root (where `package.json` and `next.config.*` are).
- Framework: **Next.js** (auto-detected).

### 2. Build settings (use repo defaults)

- **Build Command:** `npm run build` (or leave default).
- **Install Command:** `npm install --legacy-peer-deps` (matches `vercel.json`).
- **Output Directory:** leave default (Next.js).
- **Node version:** 20.x (set in Vercel → Settings → General → Node.js Version, or `.nvmrc` with `20`).

### 3. Environment variables

Add in Vercel → Project → Settings → Environment Variables (Production / Preview as needed):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | `https://www.isoflux.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only; never expose |
| `DATABASE_URL` | Optional | For server-side migrations or direct PG; use Supabase connection string |
| `JWT_SECRET` | Yes | Min 32 chars |
| `ENCRYPTION_KEY` | Yes | 32 chars |
| `CRON_SECRET` | Yes | For cron/webhook verification |
| `STRIPE_*` | Yes (for payments) | Secret key, publishable key, webhook secret, price IDs |

Mark sensitive vars as **Sensitive** in Vercel so they are masked in logs.

### 4. Domain (isoflux.app)

- Vercel → Project → Settings → Domains: add `www.isoflux.app` and `isoflux.app`.
- At Namecheap (or your registrar): set **A record** for `www` to Vercel’s LB (e.g. `76.76.21.21`) or use **CNAME** `www` → `cname.vercel-dns.com` as shown in Vercel. Set apex `isoflux.app` per Vercel’s instructions (ALIAS/A flattening or CNAME).

### 5. Deploy

- Push to main (or your production branch); Vercel builds and deploys.
- Or: Vercel CLI — `vercel --prod` from project root (after `vercel link`).

---

## 🔒 Security (hardening)

- **Secrets:** Only in Vercel env (or external secret manager). Never in repo or client bundle.
- **Headers:** `vercel.json` sets security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy). Middleware adds same where applicable.
- **Auth:** Login/signup use relative `/api/auth/*`; JWT in httpOnly cookie recommended for production (optional follow-up); API keys for B2B use `X-API-Key` with server-side validation only.
- **Input:** All API bodies validated with Zod; Supabase client uses parameterized queries (no raw SQL concatenation). No `dangerouslySetInnerHTML` with user input.
- **Stripe webhooks:** Verified with `STRIPE_WEBHOOK_SECRET` (signature check); idempotency where applicable.
- **Rate limiting:** In-memory per deployment; for multi-instance consider Upstash Redis or similar in future.

---

## 🧪 After deploy

1. **Health:** `curl https://www.isoflux.app/api/health` (if you have this route).
2. **Auth:** Sign up, log in, open dashboard.
3. **API:** Create an API key in dashboard; call `/api/isoflux/validate` or `/api/isoflux/status` with `X-API-Key`.
4. **MT-MX:** Run your MT-MX translation simulation against production API (process/validate endpoints).

---

## 📁 Repo files used

- `vercel.json` — install command, security headers, region, API route `maxDuration: 60`.
- `.nvmrc` — Node 20 (Vercel uses this for build and runtime).
- `.env.production.example` — reference for required env (do not deploy this file with secrets).
- `next.config.*` — Next.js config; images use `remotePatterns` only (Next 15).

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: Node version | Repo has `.nvmrc` with `20`. In Vercel → Settings → General, set Node.js Version to **20.x** if needed. |
| Build fails: module not found | Run `npm install --legacy-peer-deps` locally; ensure `installCommand` in `vercel.json` matches. |
| Build fails: ESLint/TypeScript | Build is set to ignore lint/type errors (`next.config.js`). To enforce, set `ignoreDuringBuilds: false` and `ignoreBuildErrors: false` after fixing issues. |
| Runtime 500 on API routes | Add required env vars in Vercel (Supabase, JWT_SECRET, etc.). Check Vercel → Deployments → Function logs. |
| API route timeout | `vercel.json` sets `maxDuration: 60` for `app/api/**`. On Hobby plan max is 10s; upgrade or reduce work. |
| Blank page / wrong URL | Set `NEXT_PUBLIC_APP_URL` to your production URL so redirects and links point to the live site. |

---

## 🔄 Digital Ocean (alternative)

For self-hosted (e.g. 198.211.109.46), use `docs/DEPLOYMENT.md` (Nginx, PM2, `ecosystem.config.js`). Same env and `NEXT_PUBLIC_APP_URL`; deploy with `./deploy.sh remote` or git pull + build + PM2 restart.

---

**Status:** Vercel-ready.  
**Domain:** https://www.isoflux.app  
**Last updated:** 2026  

**Note:** Build currently uses `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` in `next.config.js` so deployment succeeds. Fix lint and route types, then set both to `false` for stricter CI.
