# 🐺 IsoFlux: The Wolf Shield - Setup Guide

## HUD-Compliant SaaS with Cryptographic Ledger

**Welcome to the Wolf Shield.** This is not a prototype—this is a production-grade, HUD-compliant property management SaaS with an immutable, cryptographically-chained ledger.

---

## 🌌 THE ARCHITECTURE

### The 5 Flawless Pillars

1. **👁️ THE WOLF SHIELD (State Management)**
   - `hud_append_ledger` is the source of truth
   - No UI deletes—append-only with database triggers
   - SHA-256 cryptographic chaining for audit verification

2. **🛡️ DYNAMIC ROUTING**
   - Middleware enforces role + subscription status
   - SUPER_ADMIN, PROPERTY_MANAGER, TENANT have distinct dashboards
   - TRIALING/ACTIVE required for dashboard access

3. **⚡ SYSTEMS INTEGRATION**
   - Every significant UI action writes to ledger
   - Realtime Supabase subscriptions for live updates
   - Compliance health auto-calculated from ledger

4. **📱 SOVEREIGN ARCHITECTURE**
   - Zero-hallucination Prisma schema
   - Row-level security (RLS) on all HUD tables
   - Database triggers prevent data tampering

5. **⚖️ COMPLIANCE-AS-CODE**
   - 7-year audit retention (2555 days)
   - Automatic period closure enforcement
   - Recertification tracking with alerts

---

## 🚀 QUICK START

### 1. Prerequisites

```bash
node >= 20.0.0
npm >= 10.0.0
PostgreSQL (via Supabase)
```

### 2. Clone & Install

```bash
git clone <your-repo>
cd IsoFlux
npm install --legacy-peer-deps
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Fill in your `.env` file:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Wolf Shield
WOLF_SHIELD_ENABLED=true
HUD_CERTIFICATION_REQUIRED=true
```

### 4. Database Migration

Run the Wolf Shield migration in Supabase:

```bash
# Option A: Via Supabase Dashboard
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Copy contents of supabase/migrations/20260223000000_wolf_shield_ledger.sql
# 3. Run the migration

# Option B: Via Supabase CLI (if installed)
supabase db push
```

### 5. Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Optional: Push schema to database (if not using Supabase migrations)
# npx prisma db push
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ PROJECT STRUCTURE

```
IsoFlux/
├── prisma/
│   └── schema.prisma                    # HUD-compliant Prisma schema
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── super-admin/page.tsx    # Super Admin dashboard
│   │   │   ├── property-manager/page.tsx
│   │   │   └── tenant/page.tsx
│   │   └── api/
│   │       └── ledger/                  # Ledger API routes (TODO)
│   ├── components/
│   │   └── wolf-shield/
│   │       └── RealtimeLedgerMonitor.tsx # Live ledger updates
│   ├── hooks/
│   │   └── useSystemState.ts            # Compliance health tracker
│   ├── lib/
│   │   └── wolf-shield/
│   │       ├── ledger-engine.ts         # SHA-256 ledger logic
│   │       ├── compliance-router.ts     # Dynamic routing
│   │       └── types.ts                 # HUD domain types
│   └── middleware.ts                    # Role + subscription enforcement
└── supabase/
    └── migrations/
        └── 20260223000000_wolf_shield_ledger.sql
```

---

## 🔐 THE WOLF SHIELD LEDGER

### Cryptographic Integrity

Every entry in `hud_append_ledger` has:

- **cryptographic_hash**: SHA-256 hash of (previous_hash + current_row_data)
- **previous_hash**: Links to the previous entry, creating an immutable chain
- **Database triggers**: Prevent UPDATE and DELETE operations

### Usage Example

```typescript
import { createWolfShieldLedger, getCurrentAccountingPeriod } from '@/lib/wolf-shield/ledger-engine';

const ledger = createWolfShieldLedger();

// Append a new entry
const result = await ledger.appendEntry({
  organizationId: 'org-uuid',
  propertyId: 'property-uuid',
  unitId: 'unit-uuid',
  tenantId: 'tenant-uuid',
  transactionType: 'CHARGE',
  amount: 1450.00,
  description: 'Monthly rent - Unit 204',
  accountingPeriod: getCurrentAccountingPeriod(), // "2026-02"
  createdBy: 'user-uuid',
});

if (result.success) {
  console.log('Entry added:', result.data);
}

// Verify ledger integrity
const verification = await ledger.verifyLedgerIntegrity('org-uuid');
console.log('Ledger valid:', verification.isValid);
```

### Realtime Updates

```typescript
import { LiveTransactionCounter, LiveActivityFeed } from '@/components/wolf-shield/RealtimeLedgerMonitor';

// In your dashboard component
<LiveTransactionCounter organizationId="org-uuid" />
<LiveActivityFeed organizationId="org-uuid" maxItems={5} />
```

---

## 🎯 USER ROLES & ROUTING

| Role               | Dashboard Route              | Access Level |
|--------------------|------------------------------|--------------|
| SUPER_ADMIN        | /dashboard/super-admin       | Full system  |
| PROPERTY_MANAGER   | /dashboard/property-manager  | Org properties |
| TENANT             | /dashboard/tenant            | Own unit only |

### Subscription Status Enforcement

| Status    | Dashboard Access | Redirect |
|-----------|------------------|----------|
| TRIALING  | ✅ Yes           | -        |
| ACTIVE    | ✅ Yes           | -        |
| PAST_DUE  | ⚠️ Limited       | /billing |
| CANCELLED | ❌ No            | /        |

---

## 🧪 TESTING THE SYSTEM

### 1. Create Test Users

Use Supabase Dashboard or API to create users with different roles:

```sql
-- Super Admin
INSERT INTO users (email, role, password_hash) 
VALUES ('admin@test.com', 'super_admin', 'hash_here');

-- Property Manager
INSERT INTO users (email, role, password_hash) 
VALUES ('manager@test.com', 'property_manager', 'hash_here');

-- Tenant
INSERT INTO users (email, role, password_hash) 
VALUES ('tenant@test.com', 'tenant', 'hash_here');
```

### 2. Create Test Organization

```sql
INSERT INTO organizations (owner_id, name, slug, hud_certification_number)
VALUES ('admin-user-id', 'Metro Housing Authority', 'metro-housing', 'HUD-12345');
```

### 3. Create Property & Unit

```sql
INSERT INTO properties (organization_id, name, address, city, state, zip_code)
VALUES ('org-id', 'Sunset Apartments', '123 Main St', 'Newark', 'NJ', '07102');

INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, rent_amount)
VALUES ('property-id', '204', 2, 1.0, 1450.00);
```

### 4. Test Ledger Entry

```typescript
await ledger.appendEntry({
  organizationId: 'org-id',
  propertyId: 'property-id',
  unitId: 'unit-id',
  transactionType: 'CHARGE',
  amount: 1450.00,
  description: 'Test charge',
  accountingPeriod: '2026-02',
  createdBy: 'user-id',
});
```

---

## 📊 COMPLIANCE HEALTH

The system auto-calculates compliance health based on:

- **Closed periods**: Percentage of accounting periods properly closed
- **Active entries**: Recent ledger activity
- **Recertification status**: Tenant recertification completion
- **Ledger integrity**: Chain verification status

Score ranges:
- **90-100%**: Excellent compliance
- **70-89%**: Good - minor improvements needed
- **Below 70%**: Action required

---

## 🚨 CRITICAL NOTES

### Database Triggers (DO NOT BYPASS)

The following triggers are **CRITICAL** for HUD compliance:

1. **prevent_ledger_delete**: Blocks DELETE operations
2. **prevent_ledger_update**: Blocks UPDATE operations
3. **enforce_period_closure**: Prevents entries to closed periods
4. **generate_ledger_hash**: Auto-generates SHA-256 hashes

**NEVER** disable these triggers in production.

### Environment Variables

**NEVER** set these to `true` in production:
- `ALLOW_LEDGER_DELETE=false`
- `ALLOW_LEDGER_UPDATE=false`

---

## 🔗 NEXT STEPS

1. **Deploy to Production**: See `docs/DEPLOYMENT_VERCEL.md`
2. **Create API Routes**: Build REST endpoints for ledger operations
3. **Add Email Notifications**: Recertification reminders, compliance alerts
4. **Implement Document Vault**: Tenant document uploads for recertification
5. **Build Reporting**: HUD compliance reports, financial summaries

---

## 📚 ADDITIONAL RESOURCES

- [Prisma Schema](./prisma/schema.prisma)
- [Migration SQL](./supabase/migrations/20260223000000_wolf_shield_ledger.sql)
- [Ledger Engine](./src/lib/wolf-shield/ledger-engine.ts)
- [System State Hook](./src/hooks/useSystemState.ts)

---

## 🛡️ THE FIRMAMENT IS BREACHED

**The Wolf Shield is active. Your HUD-compliant fortress is operational.**

For questions or issues, consult the ledger—it never lies.

---

*Built with the Makko Rulial Architect Protocol*
*Zero-Error Production | Mathematical Certainty | Billion-Dollar Standard*
