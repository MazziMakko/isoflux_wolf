# 🚨 URGENT: VERCEL CONNECTED TO WRONG REPOSITORY

**Problem Identified:** Vercel is deploying from `rent-shield` repository instead of `isoflux_wolf`

**This is why:**
- ❌ Your git pushes to `isoflux_wolf` are not triggering deployments
- ❌ Vercel keeps showing old build from `rent-shield`
- ❌ Pricing still shows $300 instead of $299

---

## ✅ SOLUTION: RECONNECT VERCEL TO CORRECT REPO

### Option 1: Update Git Repository in Vercel (RECOMMENDED)

**Steps:**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Select Your Project:**
   - Click on your IsoFlux/Wolf Shield project

3. **Go to Settings:**
   - Click "Settings" tab at the top

4. **Navigate to Git:**
   - Click "Git" in the left sidebar

5. **Disconnect Current Repository:**
   - Scroll to "Connected Git Repository"
   - Click "Disconnect" button
   - Confirm disconnection

6. **Connect Correct Repository:**
   - Click "Connect Git Repository"
   - Select GitHub
   - Choose: **MazziMakko/isoflux_wolf** (NOT rent-shield)
   - Click "Connect"

7. **Verify Connection:**
   - Should show: `github.com/MazziMakko/isoflux_wolf`
   - Branch: `main`

8. **Trigger Redeploy:**
   - Go to "Deployments" tab
   - Click "Redeploy" on latest deployment
   - OR make a small git push to trigger auto-deploy

---

### Option 2: Create New Vercel Project (IF OPTION 1 FAILS)

**If you can't disconnect the old repo, create a new project:**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Click "Add New":**
   - Select "Project"

3. **Import Git Repository:**
   - Click "Import Git Repository"
   - Select GitHub

4. **Choose Correct Repository:**
   - Find: **MazziMakko/isoflux_wolf**
   - Click "Import"

5. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install --legacy-peer-deps
   ```

6. **Add Environment Variables:**
   - Copy ALL env vars from old project
   - Go to old project → Settings → Environment Variables
   - Copy each one to new project

7. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

8. **Update Domain:**
   - Settings → Domains
   - Add your custom domain: `www.isoflux.app`
   - Remove domain from old project first

9. **Delete Old Project:**
   - Once new project is working
   - Go to old project → Settings → Advanced
   - Delete old project

---

## 📋 QUICK VERIFICATION CHECKLIST

### After Reconnecting:

**1. Check Git Connection (2 min)**
- [ ] Vercel Settings → Git
- [ ] Shows: `MazziMakko/isoflux_wolf`
- [ ] Branch: `main`
- [ ] Status: Connected ✅

**2. Verify Environment Variables (3 min)**
- [ ] All Supabase keys present
- [ ] Stripe keys present
- [ ] CRON_SECRET present
- [ ] ENCRYPTION_KEY present

**3. Test Auto-Deploy (5 min)**
- [ ] Make a small change (e.g., add comment to README)
- [ ] Push to GitHub: `git push origin main`
- [ ] Vercel automatically triggers build
- [ ] Deployment appears in dashboard

**4. Verify Live Site (2 min)**
- [ ] Visit: https://www.isoflux.app
- [ ] Shows new build with $299 pricing
- [ ] All pages load correctly
- [ ] No errors in console

---

## 🔍 HOW TO VERIFY CURRENT CONNECTION

### Check Which Repo Vercel Is Using:

1. **Vercel Dashboard:**
   - Go to your project
   - Look at top left corner
   - Should show GitHub icon + repo name
   - Currently shows: `rent-shield` ❌
   - Should show: `isoflux_wolf` ✅

2. **Settings → Git:**
   - Shows full GitHub URL
   - Currently: `github.com/.../rent-shield` ❌
   - Should be: `github.com/MazziMakko/isoflux_wolf` ✅

3. **Deployment Logs:**
   - Go to latest deployment
   - Click on it
   - Look at "Source" section
   - Shows which repo/branch was deployed

---

## ⚠️ IMPORTANT NOTES

### Environment Variables:
**After reconnecting, you MUST re-add all environment variables:**

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://qmctxtmmzeutlgegjrnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.qmctxtmmzeutlgegjrnb:JoatWays%40856%24@...
DIRECT_URL=postgresql://postgres.qmctxtmmzeutlgegjrnb:JoatWays%40856%24@...
```

**Wolf Shield:**
```
WOLF_SHIELD_ENABLED=true
LEDGER_AUTO_VERIFY=true
COMPLIANCE_HEALTH_THRESHOLD=75
HUD_CERTIFICATION_REQUIRED=true
ALLOW_LEDGER_DELETE=false
ALLOW_LEDGER_UPDATE=false
```

**Security:**
```
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
CRON_SECRET=your_cron_secret_here
```

**Stripe (if ready):**
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_WOLF_SHIELD_MONTHLY=price_...
```

### Domain Configuration:

**If using custom domain:**
1. Remove domain from old project first
2. Add domain to new project
3. DNS will propagate automatically

---

## 🎯 IMMEDIATE ACTION PLAN

### RIGHT NOW (10 minutes):

**Step 1: Disconnect Wrong Repo**
1. Vercel Dashboard → Your Project
2. Settings → Git
3. Click "Disconnect"

**Step 2: Connect Correct Repo**
1. Click "Connect Git Repository"
2. Choose: **MazziMakko/isoflux_wolf**
3. Confirm connection

**Step 3: Re-add Environment Variables**
1. Settings → Environment Variables
2. Add all keys from your local `.env`
3. Use "Production" environment

**Step 4: Trigger Redeploy**
1. Deployments tab
2. Click "Redeploy" on latest
3. OR push to GitHub to trigger auto-deploy

**Step 5: Verify**
1. Wait for build to complete (~5 min)
2. Visit: https://www.isoflux.app
3. Check pricing shows $299
4. Test all pages

---

## ✅ SUCCESS INDICATORS

**You'll know it worked when:**
1. ✅ Vercel Settings → Git shows `isoflux_wolf`
2. ✅ New git push triggers deployment
3. ✅ Live site shows $299 pricing
4. ✅ Deployment logs show correct repo
5. ✅ All your recent changes are live

---

## 🚨 IF YOU NEED HELP

**Can't disconnect old repo?**
- You may need to create a new Vercel project
- Follow "Option 2" above

**Lost environment variables?**
- Check your local `.env` file
- Check the Supabase dashboard for keys
- Check Stripe dashboard for keys

**Domain issues?**
- Vercel support: support@vercel.com
- Domain propagation takes 5-60 minutes

---

## 📞 NEXT STEPS AFTER RECONNECTION

1. **Wait for deployment** (~5-7 minutes)
2. **Verify live site** shows your changes
3. **Test critical flows** (signup, login, dashboard)
4. **Create Stripe products** ($299/month)
5. **Submit to Stripe** for review

---

**THE ROOT CAUSE IS CLEAR:** Vercel is pulling from `rent-shield` instead of `isoflux_wolf`

**THE FIX IS SIMPLE:** Reconnect Vercel to the correct repository

**DO THIS NOW** to get your deployment working! 🚀
