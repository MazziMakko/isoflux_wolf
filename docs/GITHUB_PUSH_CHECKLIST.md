# GitHub push checklist

Use this before pushing (especially first push or after adding env/secrets).

## 0. First-time: init and remote

If the project is not yet a git repo:

```bash
cd c:\Dev\IsoFlux
git init
git add .
git status
git commit -m "Initial commit: IsoFlux (The Compliance Wolf)"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/isoflux.git
git push -u origin main
```

If the repo already exists on GitHub, clone it first or add the remote to an existing init.

## 1. Never commit secrets

- **`.env`** – ignored; never add. Contains local Supabase keys, `DATABASE_URL`, Stripe, JWT, etc.
- **`.env.production`** – ignored; never add.
- **`.env.local`**, **`.env.development`** – ignored.
- Only **`.env.example`** and **`.env.production.example`** are committed (placeholders only).

If you ever added `.env` or another env file with real keys:

```bash
# Remove from index only (keeps file on disk)
git rm --cached .env
git rm --cached .env.production
# Commit the removal, then push
```

## 2. Confirm ignored files

```bash
git status
```

You should **not** see:

- `.env`
- `node_modules/`
- `.next/`
- `.env.production`
- `*.pem`

## 3. Optional: check for accidental secrets

```bash
git diff --cached | grep -E "password|secret|sk_live|sk_test|SUPABASE_SERVICE_ROLE|DATABASE_URL=postgres"
# Should be empty or only in .env.example with placeholder values
```

## 4. Push

```bash
git add .
git status
git commit -m "Your message"
git remote add origin https://github.com/YOUR_ORG/isoflux.git   # first time only
git push -u origin main
```

## 5. After push

- Set **Secrets** / **Environment variables** in GitHub (Actions) or in your host (Vercel, etc.) – never in the repo.
- Use **`.env.example`** and **`.env.production.example`** as the list of required variables.
