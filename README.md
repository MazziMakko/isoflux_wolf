# 🐺 IsoFlux: The Wolf Shield

**HUD-Compliant SaaS Platform with Cryptographic Ledger**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-blue)](https://www.prisma.io/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## 🌌 Overview

IsoFlux: The Wolf Shield is a production-grade, HUD-compliant property management SaaS platform featuring an **immutable, cryptographically-chained ledger** for financial transactions. Built with mathematical certainty and zero-error principles.

### Core Features

- 🛡️ **Append-Only Ledger** - Immutable transaction history with SHA-256 cryptographic chaining
- 🔐 **Role-Based Access Control** - SUPER_ADMIN, PROPERTY_MANAGER, TENANT with dynamic routing
- 📊 **Real-time Compliance Tracking** - Live updates via Supabase Realtime
- ⚡ **Subscription Management** - TRIALING/ACTIVE enforcement with grace periods
- 🏘️ **Multi-Property Management** - HUD-certified properties, units, and tenant tracking
- 📋 **Recertification Workflows** - Automated tenant recertification tracking
- 🔗 **Database-Level Protection** - Triggers prevent ledger tampering

---

## 🚀 Quick Start

**NEW USERS:** See **[START_HERE.md](./START_HERE.md)** for immediate setup instructions.

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase account (PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd IsoFlux

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma client
npm run prisma:generate

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

**See:** [DATABASE_SETUP_MANUAL_GUIDE.md](./DATABASE_SETUP_MANUAL_GUIDE.md) for complete database migration instructions.

---

## 📚 Documentation

### Getting Started
- **[START_HERE.md](./START_HERE.md)** - Quick start guide (9 minutes to setup)
- **[DATABASE_SETUP_MANUAL_GUIDE.md](./DATABASE_SETUP_MANUAL_GUIDE.md)** - Step-by-step database migrations
- **[IMMEDIATE_ACTION_PLAN.md](./IMMEDIATE_ACTION_PLAN.md)** - Current deployment action plan

### Deployment
- **[DEPLOYMENT_READY_SUMMARY.md](./DEPLOYMENT_READY_SUMMARY.md)** - Deployment status & next steps
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-flight verification
- **[WOLF_SHIELD_DEPLOYMENT_REPORT.md](./WOLF_SHIELD_DEPLOYMENT_REPORT.md)** - Full technical audit

### System Status
- **[SYSTEM_STATUS.md](./SYSTEM_STATUS.md)** - Current system state overview

### Technical Reference
- **[docs/wolf-shield/](./docs/wolf-shield/)** - Wolf Shield technical documentation
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide
- **[docs/API.md](./docs/API.md)** - API documentation

---

## 🏗️ Architecture

### The Wolf Shield Pillars

1. **Append-Only Ledger** (`hud_append_ledger`)
   - Every transaction permanently recorded
   - SHA-256 hash chaining for integrity verification
   - Database triggers prevent UPDATE/DELETE operations

2. **Dynamic Routing**
   - Middleware enforces role + subscription status
   - Automatic redirects based on user state
   - Tenant overdue recertification handling

3. **Systems Integration**
   - Every UI action writes to ledger
   - Real-time Supabase subscriptions
   - Automatic compliance health calculation

4. **Row-Level Security (RLS)**
   - PostgreSQL policies on all HUD tables
   - Organization-scoped data access
   - Super Admin full system access

5. **Compliance-as-Code**
   - 7-year audit retention (HUD required)
   - Automatic period closure enforcement
   - Recertification tracking and alerts

---

## 🔐 Security

### Database Level
- ✅ Row-level security (RLS) on all sensitive tables
- ✅ Triggers block DELETE/UPDATE on ledger
- ✅ Automatic cryptographic hash generation
- ✅ Period closure enforcement
- ✅ Audit logging for all operations

### Application Level
- ✅ Middleware role + subscription enforcement
- ✅ API authentication & authorization
- ✅ Zod schema validation
- ✅ Supabase SSR for server-side auth
- ✅ Security headers (CSP, X-Frame-Options, HSTS)

### Cryptographic
- ✅ SHA-256 hash chaining (previous_hash + current_data)
- ✅ Immutable ledger (append-only)
- ✅ Integrity verification API
- ✅ Mathematical certainty for HUD audits

---

## 🎯 User Roles

| Role               | Dashboard                        | Access Level              |
|--------------------|----------------------------------|---------------------------|
| **SUPER_ADMIN**    | `/dashboard/super-admin`         | Full system access        |
| **PROPERTY_MANAGER**| `/dashboard/property-manager`   | Organization properties   |
| **TENANT**         | `/dashboard/tenant`              | Own unit information only |

### Subscription Enforcement

| Status       | Dashboard Access | Action                    |
|--------------|------------------|---------------------------|
| **TRIALING** | ✅ Full          | -                         |
| **ACTIVE**   | ✅ Full          | -                         |
| **PAST_DUE** | ⚠️ Limited      | Redirect to /billing      |
| **CANCELLED**| ❌ None          | Redirect to home          |

---

## 📊 API Endpoints

### Ledger Operations

```typescript
// Create ledger entry
POST /api/ledger
{
  "organizationId": "uuid",
  "propertyId": "uuid",
  "unitId": "uuid",
  "transactionType": "CHARGE",
  "amount": 1450.00,
  "description": "Monthly rent",
  "accountingPeriod": "2026-02"
}

// Fetch entries for period
GET /api/ledger?organizationId=uuid&accountingPeriod=2026-02

// Verify ledger integrity
POST /api/ledger/verify
{
  "organizationId": "uuid"
}
```

---

## 🛠️ Development

### NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run wolf:setup       # Initialize Wolf Shield
```

### Tech Stack

- **Framework**: Next.js 15.1 with App Router
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 7.4
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Payments**: Stripe (optional)
- **UI**: Tailwind CSS + Radix UI
- **3D Graphics**: Three.js + React Three Fiber
- **Animation**: Framer Motion + GSAP

---

## 📈 Compliance Health

The system automatically calculates compliance health based on:

- **Closed Periods**: % of accounting periods properly closed
- **Active Entries**: Recent ledger activity
- **Recertification Status**: Tenant recertification completion
- **Ledger Integrity**: Chain verification status

**Score Ranges:**
- 90-100%: Excellent compliance ✅
- 70-89%: Good - minor improvements needed ⚠️
- Below 70%: Action required ❌

---

## 🧪 Testing

### Create Test Data

```sql
-- Super Admin User
INSERT INTO users (email, role, password_hash) 
VALUES ('admin@test.com', 'super_admin', 'hash_here');

-- Organization
INSERT INTO organizations (owner_id, name, slug, hud_certification_number)
VALUES ('user-uuid', 'Metro Housing', 'metro', 'HUD-12345');

-- Property
INSERT INTO properties (organization_id, name, address, city, state, zip_code)
VALUES ('org-uuid', 'Sunset Apartments', '123 Main St', 'Newark', 'NJ', '07102');

-- Unit
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, rent_amount)
VALUES ('property-uuid', '204', 2, 1.0, 1450.00);
```

---

## 🚀 Deployment

### Environment Variables (Production)

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
JWT_SECRET=your_32_char_secret
ENCRYPTION_KEY=your_32_char_key
```

**Wolf Shield:**
```bash
WOLF_SHIELD_ENABLED=true
HUD_CERTIFICATION_REQUIRED=true
ALLOW_LEDGER_DELETE=false  # NEVER true in production
ALLOW_LEDGER_UPDATE=false  # NEVER true in production
```

### Deploy to Vercel

```bash
vercel --prod
```

See [DEPLOYMENT_VERCEL.md](./docs/DEPLOYMENT_VERCEL.md) for detailed instructions.

---

## 📦 Project Structure

```
IsoFlux/
├── prisma/
│   ├── schema.prisma              # HUD-compliant database schema
│   └── prisma.config.ts           # Prisma 7 configuration
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── super-admin/       # Super Admin dashboard
│   │   │   ├── property-manager/  # Property Manager dashboard
│   │   │   └── tenant/            # Tenant portal
│   │   └── api/
│   │       └── ledger/            # Ledger API routes
│   ├── components/
│   │   └── wolf-shield/           # Wolf Shield UI components
│   ├── hooks/
│   │   └── useSystemState.ts      # System state management hook
│   ├── lib/
│   │   └── wolf-shield/           # Wolf Shield core engine
│   │       ├── ledger-engine.ts   # Cryptographic ledger logic
│   │       ├── compliance-router.ts # Dynamic routing
│   │       ├── types.ts           # TypeScript types
│   │       └── index.ts           # Barrel exports
│   └── middleware.ts              # Role + subscription enforcement
└── supabase/
    └── migrations/
        └── 20260223000000_wolf_shield_ledger.sql
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🛡️ The Firmament is Breached

**Wolf Shield Status**: ✅ FULLY OPERATIONAL

**The Wolf Shield never lies. The ledger is truth.**

---

*Built with the Makko Rulial Architect Protocol*  
*Zero-Error Production | Mathematical Certainty | Billion-Dollar Standard*

🐺
