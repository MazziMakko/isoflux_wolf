# 🚀 WOLF SHIELD REVENUE SYNC - DEPLOYMENT GUIDE

## ✅ Code Deployed
**Commit**: `93803e7` - feat(revenue-sync): Wolf Shield Revenue Armor  
**Status**: Pushed to `main`, Vercel deployment triggered automatically  
**Files Changed**: 5 files, 2039 insertions, 103 deletions

---

## 🗄️ STEP 1: Deploy Database Tables

### Option A: Supabase Dashboard (Recommended)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: **Wolf Shield / IsoFlux**
3. Go to **SQL Editor**
4. Click **+ New Query**
5. Copy the entire contents of `supabase/migrations/20260225000000_revenue_sync_tables.sql`
6. Paste into SQL Editor
7. Click **Run** (bottom right)
8. Wait for success message: "Success. No rows returned"

### Option B: Supabase CLI (Advanced)

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migration
supabase db push
```

### Verify Tables Created

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('webhook_events', 'retention_tasks', 'admin_alerts', 'draft_orders');
```

Expected output:
```
webhook_events
retention_tasks
admin_alerts
draft_orders
```

---

## 🔐 STEP 2: Configure Stripe Webhook

### 2.1 Get Your Webhook Secret

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** > **Webhooks**
3. Click **+ Add endpoint**

   **Endpoint URL**:
   ```
   https://isofluxwolf.vercel.app/api/webhooks/stripe
   ```

   **Description**: Wolf Shield Revenue Sync

   **Events to listen to**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. Click **Add endpoint**
5. Click on the newly created endpoint
6. Click **Reveal** next to "Signing secret"
7. Copy the secret (starts with `whsec_...`)

### 2.2 Add to Vercel Environment Variables

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **isoflux_wolf**
3. Go to **Settings** > **Environment Variables**
4. Add the following variable:

   **Key**: `STRIPE_WEBHOOK_SECRET`  
   **Value**: `whsec_...` (paste the secret you copied)  
   **Environment**: Production

5. Click **Save**

### 2.3 Verify Other Stripe Variables

While you're in Vercel Environment Variables, verify these exist:

- [x] `STRIPE_SECRET_KEY` (starts with `sk_live_...` for production)
- [x] `STRIPE_PRICE_ID_MONTHLY` (should be `price_wolf_shield_299` or your actual price ID)

---

## 🧪 STEP 3: Test Webhook Integration

### Local Testing (Optional)

If you want to test locally first:

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to localhost
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Production Testing

1. **Test Payment Success**:
   - Go to your live site: https://isofluxwolf.vercel.app
   - Sign up for a new account
   - Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
   - Complete checkout
   - Check Supabase `webhook_events` table for `checkout.session.completed` event
   - Verify subscription status changed to `active`

2. **Test Payment Failure** (requires live mode):
   - Use declining card: `4000 0000 0000 0341`
   - Check for `invoice.payment_failed` event
   - Verify subscription status changed to `past_due`
   - Check for compliance alert created

3. **Monitor Webhook Logs**:
   ```sql
   -- Latest webhooks
   SELECT event_id, event_type, status, received_at, processed_at
   FROM webhook_events
   ORDER BY received_at DESC
   LIMIT 20;
   
   -- Failed webhooks (investigate these)
   SELECT event_id, event_type, error_message
   FROM webhook_events
   WHERE status = 'failed'
   ORDER BY received_at DESC;
   ```

---

## 📊 STEP 4: Monitor Revenue Events

### Check Immutable Ledger

```sql
-- Revenue events from webhooks
SELECT 
  created_at,
  transaction_type,
  amount,
  description,
  organization_id
FROM hud_append_ledger
WHERE description LIKE '%Wolf Shield%'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Subscription Status

```sql
-- Active subscriptions
SELECT 
  o.name AS organization,
  s.status,
  s.tier,
  s.current_period_end,
  s.stripe_customer_id
FROM subscriptions s
JOIN organizations o ON s.organization_id = o.id
WHERE s.status IN ('active', 'trialing', 'past_due')
ORDER BY s.current_period_end ASC;
```

### Check Failed Payments (Grace Period)

```sql
-- Organizations in grace period
SELECT 
  o.name,
  s.status,
  s.metadata->>'grace_period_ends' AS grace_period_ends,
  ca.message
FROM subscriptions s
JOIN organizations o ON s.organization_id = o.id
LEFT JOIN compliance_alerts ca ON ca.organization_id = o.id 
  AND ca.alert_type = 'SUBSCRIPTION_PAST_DUE'
WHERE s.status = 'past_due';
```

---

## ⚙️ STEP 5: Set Up Monitoring & Alerts

### Webhook Health Dashboard

Create a saved query in Supabase for quick monitoring:

```sql
-- Webhook health (last 24 hours)
SELECT 
  event_type,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'succeeded') AS succeeded,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  AVG(EXTRACT(EPOCH FROM (processed_at - received_at))) AS avg_process_time_sec
FROM webhook_events
WHERE received_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY total DESC;
```

### Key Metrics to Watch

**Daily Checks**:
- [ ] All webhooks processed successfully (0 failed)
- [ ] Average processing time < 5 seconds
- [ ] No signature verification failures

**Weekly Checks**:
- [ ] MRR trending upward
- [ ] Churn rate < 5%
- [ ] Payment recovery rate > 70% (past_due → active)

### Alert Thresholds

Set up alerts (Vercel/Datadog/Sentry) for:

1. **Webhook Signature Failures**: > 10 in 5 minutes
   - Severity: **HIGH** (possible attack)
   - Action: Alert #security-alerts Slack channel

2. **Webhook Processing Failures**: > 5 in 5 minutes
   - Severity: **CRITICAL** (revenue at risk)
   - Action: Page on-call engineer

3. **High Webhook Latency**: p95 > 5 seconds
   - Severity: **MEDIUM** (performance degradation)
   - Action: Alert #engineering

---

## 🐛 STEP 6: Troubleshooting

### Issue: Webhook not received

**Symptoms**: Payment completes, but subscription not activated

**Diagnosis**:
1. Check Stripe Dashboard > Webhooks > [Your endpoint]
2. Look for recent webhook attempts
3. Check HTTP response code

**Fix**:
- 400/401: Signature verification failed → Check `STRIPE_WEBHOOK_SECRET` in Vercel
- 500: Server error → Check Vercel logs for error message
- Timeout: Processing taking too long → Check database connection

### Issue: Duplicate webhook processing

**Symptoms**: Multiple ledger entries for same event

**Diagnosis**:
```sql
-- Find duplicate events
SELECT event_id, COUNT(*)
FROM webhook_events
GROUP BY event_id
HAVING COUNT(*) > 1;
```

**Fix**: Idempotency should prevent this. If occurring:
1. Check in-memory cache is working
2. Consider Redis for production idempotency

### Issue: Subscription not moving from past_due to active

**Symptoms**: Customer paid, but still in read-only mode

**Diagnosis**:
```sql
-- Check if payment_succeeded webhook received
SELECT * FROM webhook_events
WHERE event_type = 'invoice.payment_succeeded'
AND payload->>'subscription' = '<stripe_subscription_id>'
ORDER BY received_at DESC;
```

**Fix**:
1. If webhook exists with status `failed`, check `error_message`
2. If webhook missing, check Stripe Dashboard for failed delivery
3. Manually update subscription:
   ```sql
   UPDATE subscriptions
   SET status = 'active',
       metadata = metadata - 'grace_period_ends'
   WHERE stripe_subscription_id = '<stripe_subscription_id>';
   ```

---

## 📋 Post-Deployment Checklist

### Immediate (Today)
- [x] Code deployed to Vercel
- [ ] Database migration executed in Supabase
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Test checkout flow end-to-end
- [ ] Verify webhook appears in `webhook_events` table
- [ ] Check subscription status changes correctly

### First 24 Hours
- [ ] Monitor webhook processing (no failures)
- [ ] Check for signature verification errors (should be 0)
- [ ] Verify MRR calculation matches Stripe
- [ ] Test payment failure flow (past_due status)
- [ ] Review Vercel logs for errors

### First Week
- [ ] Monitor grace period conversions (past_due → active)
- [ ] Check abandoned cart recovery tasks created
- [ ] Review Super Admin alerts for payment issues
- [ ] Verify immutable ledger entries for all revenue events
- [ ] Schedule webhook secret rotation (90 days)

### First Month
- [ ] Calculate churn rate
- [ ] Measure payment recovery rate
- [ ] Analyze MRR growth
- [ ] Review security logs for attack patterns
- [ ] Plan Phase 2 enhancements (Redis, rate limiting)

---

## 🎯 Success Criteria

### Revenue Protection
- ✅ Payments activate subscriptions within 5 seconds
- ✅ Failed payments trigger grace period alerts
- ✅ Subscription cancellations schedule data retention
- ✅ 100% of revenue events logged to immutable ledger

### Security
- ✅ 0 signature verification failures from legitimate traffic
- ✅ 0 replay attacks (duplicate event processing)
- ✅ 100% webhook events logged for audit trail
- ✅ All PII protected by RLS policies

### Operational
- ✅ Webhook processing time < 5 seconds (p95)
- ✅ 0% webhook processing failures
- ✅ MRR matches Stripe dashboard
- ✅ Super Admin dashboard shows real-time metrics

---

## 🆘 Emergency Contacts

**Technical Issues**:
- Support: thenationofmazzi@gmail.com
- Phone: (856) 274-8668

**Stripe Issues**:
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com

**Vercel Issues**:
- Dashboard: https://vercel.com/dashboard
- Status: https://vercel-status.com

---

## 📚 Reference Documentation

- **Architecture**: `REVENUE_SYNC_IMPLEMENTATION.md`
- **Security**: `SECURITY_REVIEW_REVENUE_SYNC.md`
- **API Route**: `src/app/api/webhooks/stripe/route.ts`
- **Migration**: `supabase/migrations/20260225000000_revenue_sync_tables.sql`

---

# 🛡️ WOLF SHIELD REVENUE SYNC - READY TO DEPLOY

**Status**: Code pushed, awaiting database migration and Stripe configuration  
**Next Step**: Execute database migration in Supabase  
**ETA to Live**: 15 minutes (migration + webhook setup + testing)

---

*Sovereign Architect standing by. The Money Logic is locked and loaded. Deploy when ready.*
