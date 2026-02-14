# 💰 THE TREASURER - QUICK REFERENCE

## 🚀 Quick Start (5 Minutes)

### 1. Run Database Migration
```bash
supabase db push
# OR
psql -h YOUR_HOST -U postgres -f supabase/migrations/treasurer_revenue_protection.sql
```

### 2. Add Environment Variables
```env
CRON_SECRET=your_32_char_random_secret
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx
SENDGRID_API_KEY=SG.xxxxx  # Or AWS SES
```

### 3. Setup Cron (Choose One)

**Vercel** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/process-retention",
    "schedule": "*/15 * * * *"
  }]
}
```

**External** (cron-job.org):
- URL: `https://isoflux.app/api/cron/process-retention`
- Schedule: `*/15 * * * *`
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

### 4. Configure Stripe Webhooks
Add these events:
- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired` ← NEW
- ✅ `account.updated` ← NEW

### 5. Test
```bash
# Create checkout
curl -X POST https://isoflux.app/api/checkout/create-session \
  -H "Authorization: Bearer TOKEN" \
  -d '{"priceId":"price_test","successUrl":"...","cancelUrl":"..."}'

# Trigger retention cron
curl https://isoflux.app/api/cron/process-retention \
  -H "Authorization: Bearer CRON_SECRET"
```

---

## 📊 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout/create-session` | POST | Create idempotent checkout |
| `/api/cron/process-retention` | GET/POST | Process retention emails |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

---

## 🗄️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `draft_orders` | Track checkout attempts | `idempotency_key`, `status` |
| `retention_tasks` | Queue retention emails | `task_type`, `scheduled_at` |
| `admin_alerts` | Critical ops alerts | `alert_type`, `severity` |

---

## 📈 Analytics Queries

### Revenue Recovery Rate
```sql
SELECT * FROM v_revenue_recovery_metrics ORDER BY date DESC LIMIT 7;
```

### Pending Retention Tasks
```sql
SELECT COUNT(*) FROM retention_tasks WHERE status='pending' AND scheduled_at<=NOW();
```

### Connect Verification Status
```sql
SELECT COUNT(*) FILTER(WHERE is_verified) as verified,
       COUNT(*) FILTER(WHERE NOT is_verified) as unverified
FROM v_connect_verification_status;
```

### Abandonment Rate (Last 7 Days)
```sql
SELECT
  COUNT(*) FILTER(WHERE status='completed') as completed,
  COUNT(*) FILTER(WHERE status IN ('expired','recovered')) as abandoned,
  ROUND(COUNT(*) FILTER(WHERE status IN ('expired','recovered'))::DECIMAL / 
        NULLIF(COUNT(*),0) * 100, 2) as abandonment_pct
FROM draft_orders WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 🛡️ Security Features

✅ Webhook signature verification  
✅ UUID-based idempotency keys  
✅ Cron secret authentication  
✅ Row-level security (RLS)  
✅ Draft orders before Stripe calls  
✅ Audit trail for all events  

---

## 💰 Expected ROI

**Example**: $100k/month in checkouts
- Abandoned: $75k (75%)
- Recovered: $11.25k-$15k (15-20%)
- Email cost: $500
- **Net gain**: $10.75k-$14.5k/month
- **ROI**: 21x-29x

---

## 🔧 Troubleshooting

### Cron not running?
```bash
# Test manually
curl https://isoflux.app/api/cron/process-retention \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check logs for "THE TREASURER" prefix
```

### Emails not sending?
1. Check `retention_tasks` table for `status='failed'`
2. Verify email service credentials (SendGrid/SES)
3. Check `src/lib/core/retention-email-service.ts` config

### Draft orders not created?
1. Check `/api/checkout/create-session` auth
2. Verify `draft_orders` table exists
3. Check RLS policies

---

## 📚 Full Documentation

- **Complete Guide**: `docs/TREASURER_SYSTEM.md`
- **Completion Report**: `TREASURER_COMPLETE.md`
- **Database Schema**: `supabase/migrations/treasurer_revenue_protection.sql`

---

**The Treasurer** | Version 1.0.0 | 100% Revenue Protection
