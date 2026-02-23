/**
 * =====================================================
 * WOLF SHIELD: TYPE DEFINITIONS
 * HUD-Compliant Domain Types
 * =====================================================
 */

// =====================================================
// USER ROLES
// =====================================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROPERTY_MANAGER'
  | 'TENANT'
  | 'ADMIN'
  | 'EDITOR'
  | 'VIEWER'
  | 'CUSTOMER';

// =====================================================
// SUBSCRIPTION
// =====================================================

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE';

export interface Subscription {
  id: string;
  organizationId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
}

// =====================================================
// ORGANIZATION
// =====================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  hudCertificationNumber?: string;
  complianceHealth?: number; // 0-100
  lastAuditDate?: Date;
}

// =====================================================
// PROPERTY & UNITS
// =====================================================

export interface Property {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hudPropertyId?: string;
  totalUnits: number;
}

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  rentAmount: number;
  status: UnitStatus;
  currentTenantId?: string;
}

// =====================================================
// TENANTS
// =====================================================

export type RecertificationStatus = 'PENDING' | 'APPROVED' | 'OVERDUE' | 'COMPLETED';

export interface Tenant {
  id: string;
  userId: string;
  unitId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  recertificationStatus: RecertificationStatus;
  nextRecertificationDue?: Date;
}

// =====================================================
// LEDGER
// =====================================================

export type TransactionType =
  | 'CHARGE'
  | 'PAYMENT'
  | 'ADJUSTMENT'
  | 'FEE'
  | 'RECERTIFICATION_LOG'
  | 'MAINTENANCE_REQUEST'
  | 'MAINTENANCE_APPROVAL';

export interface LedgerEntry {
  id: string;
  organizationId: string;
  propertyId: string;
  unitId: string;
  tenantId?: string;
  transactionType: TransactionType;
  amount: number;
  description: string;
  accountingPeriod: string; // YYYY-MM
  isPeriodClosed: boolean;
  cryptographicHash: string;
  previousHash?: string;
  createdAt: Date;
  createdBy: string;
}

// =====================================================
// SYSTEM STATE
// =====================================================

export interface SystemState {
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName?: string;
  };
  organization?: Organization;
  subscription?: Subscription;
  complianceHealth: number;
  canAccessDashboard: boolean;
  redirectPath?: string; // Where user should be redirected based on state
}

// =====================================================
// COMPLIANCE ROUTER
// =====================================================

export interface RouteAccessControl {
  allowedRoles: UserRole[];
  requiredSubscriptionStatus: SubscriptionStatus[];
  fallbackRoute: string;
}

export interface DynamicRoute {
  pattern: string;
  accessControl: RouteAccessControl;
  redirectLogic?: (state: SystemState) => string | null;
}

// =====================================================
// REALTIME EVENTS
// =====================================================

export interface LedgerUpdateEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'hud_append_ledger';
  record: LedgerEntry;
  old_record?: LedgerEntry;
  organizationId: string;
}

export interface ComplianceAlert {
  id: string;
  organizationId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  actionRequired?: string;
  createdAt: Date;
}
