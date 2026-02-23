# 🐺 WOLF SHIELD - QUICK REFERENCE CARD

## IMMEDIATE NEXT STEPS

### 1. Environment Setup (5 minutes)
```bash
cp .env.example .env
# Edit .env - fill in your Supabase credentials
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

### 2. Database Migration (2 minutes)
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy & run: supabase/migrations/20260223000000_wolf_shield_ledger.sql
```

### 3. Generate Prisma Client (1 minute)
```bash
npm run prisma:generate
```

### 4. Start Development (1 minute)
```bash
npm run dev
# Open http://localhost:3000
```

---

## TESTING THE SYSTEM

### Create Test Organization
```sql
-- Run in Supabase SQL Editor
INSERT INTO organizations (owner_id, name, slug, hud_certification_number)
VALUES ('your-user-id', 'Test Org', 'test-org', 'HUD-TEST-001')
RETURNING id;

INSERT INTO subscriptions (organization_id, tier, status)
VALUES ('org-id-from-above', 'pro', 'active');
```

### Create Test Property & Unit
```sql
INSERT INTO properties (organization_id, name, address, city, state, zip_code)
VALUES ('org-id', 'Test Property', '123 Main St', 'Newark', 'NJ', '07102')
RETURNING id;

INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, rent_amount, status)
VALUES ('property-id', '101', 2, 1.0, 1200.00, 'VACANT')
RETURNING id;
```

### Test Ledger Entry (via API)
```typescript
// POST /api/ledger
const response = await fetch('/api/ledger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'org-id',
    propertyId: 'property-id',
    unitId: 'unit-id',
    transactionType: 'CHARGE',
    amount: 1200.00,
    description: 'Test rent charge',
    accountingPeriod: '2026-02',
  }),
});
```

---

## KEY FILES TO KNOW

| File | Purpose |
|------|---------|
| `src/lib/wolf-shield/ledger-engine.ts` | Core ledger operations |
| `src/hooks/useSystemState.ts` | User state & compliance tracking |
| `src/middleware.ts` | Route protection |
| `src/app/api/ledger/route.ts` | Ledger API endpoints |
| `prisma/schema.prisma` | Database schema |
| `supabase/migrations/20260223000000_wolf_shield_ledger.sql` | Database setup |

---

## COMMON TASKS

### Add a Ledger Entry (TypeScript)
```typescript
import { createWolfShieldLedger, getCurrentAccountingPeriod } from '@/lib/wolf-shield';

const ledger = createWolfShieldLedger();
await ledger.appendEntry({
  organizationId: 'uuid',
  propertyId: 'uuid',
  unitId: 'uuid',
  transactionType: 'PAYMENT',
  amount: 1200.00,
  description: 'Rent payment received',
  accountingPeriod: getCurrentAccountingPeriod(),
  createdBy: 'user-uuid',
});
```

### Verify Ledger Integrity
```typescript
const ledger = createWolfShieldLedger();
const result = await ledger.verifyLedgerIntegrity('org-uuid');
console.log('Valid:', result.isValid);
console.log('Total entries:', result.totalEntries);
```

### Use System State in Component
```typescript
import { useSystemState } from '@/hooks/useSystemState';

function MyComponent() {
  const { user, organization, complianceHealth, loading } = useSystemState();
  
  if (loading) return <div>Loading...</div>;
  
  return <div>
    <p>Role: {user.role}</p>
    <p>Org: {organization?.name}</p>
    <p>Health: {complianceHealth}%</p>
  </div>;
}
```

### Add Realtime Updates
```typescript
import { LiveTransactionCounter } from '@/components/wolf-shield/RealtimeLedgerMonitor';

<LiveTransactionCounter organizationId={organization.id} />
```

---

## DASHBOARD ROUTES

| Role | Route | Access |
|------|-------|--------|
| SUPER_ADMIN | `/dashboard/super-admin` | All organizations |
| PROPERTY_MANAGER | `/dashboard/property-manager` | Own organization |
| TENANT | `/dashboard/tenant` | Own unit data |

---

## API ENDPOINTS

```bash
# Create ledger entry
POST /api/ledger

# Get entries for period
GET /api/ledger?organizationId=X&accountingPeriod=2026-02

# Verify integrity
POST /api/ledger/verify
```

---

## COMPLIANCE RULES

### 🚨 CRITICAL - Never Disable in Production
- `ALLOW_LEDGER_DELETE=false` - MUST be false
- `ALLOW_LEDGER_UPDATE=false` - MUST be false
- Database triggers - MUST remain active

### Subscription Enforcement
- **TRIALING** → Full access
- **ACTIVE** → Full access
- **PAST_DUE** → Redirect to /billing
- **CANCELLED** → Redirect to home

### Accounting Periods
- Format: `YYYY-MM` (e.g., `2026-02`)
- Once closed, no new entries allowed
- Only Super Admins can close periods

---

## TROUBLESHOOTING

### Prisma Client Not Generated
```bash
npm run prisma:generate
```

### Database Connection Error
```bash
# Check .env
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
```

### Migration Not Applied
```bash
# Run manually in Supabase SQL Editor
# File: supabase/migrations/20260223000000_wolf_shield_ledger.sql
```

### Ledger Entry Rejected
- Check if period is closed
- Verify user has organization access
- Ensure all UUIDs are valid

---

## NPM SCRIPTS CHEATSHEET

```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build
npm run start            # Production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Database GUI
npm run wolf:setup       # Initialize Wolf Shield
npm run lint             # Run linter
npm run type-check       # TypeScript check
```

---

## DOCUMENTATION

📚 **Full Guides:**
- [WOLF_SHIELD_SETUP.md](./WOLF_SHIELD_SETUP.md) - Complete setup
- [WOLF_SHIELD_COMPLETE.md](./WOLF_SHIELD_COMPLETE.md) - Technical reference
- [README.md](./README.md) - Project overview

---

## 🛡️ STATUS CHECK

✅ **Prisma schema** - HUD-compliant tables defined  
✅ **Database migration** - Triggers & RLS policies  
✅ **Ledger engine** - SHA-256 chaining implemented  
✅ **System state hook** - Compliance tracking active  
✅ **Middleware** - Role + subscription routing  
✅ **Dashboards** - Super Admin, Manager, Tenant  
✅ **Realtime** - Live ledger updates  
✅ **API routes** - Ledger CRUD operations  
✅ **Documentation** - Complete setup guides  

---

**THE WOLF SHIELD IS ACTIVE. YOUR SYSTEM IS OPERATIONAL.**

🐺 **The ledger never lies.**
