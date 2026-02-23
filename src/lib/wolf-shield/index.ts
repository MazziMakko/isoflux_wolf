/**
 * =====================================================
 * WOLF SHIELD: BARREL EXPORTS
 * Centralized exports for all Wolf Shield components
 * =====================================================
 */

// Core Engine
export {
  WolfShieldLedger,
  createWolfShieldLedger,
  getCurrentAccountingPeriod,
  isValidAccountingPeriod,
} from './ledger-engine';

// Types
export type {
  UserRole,
  SubscriptionTier,
  SubscriptionStatus,
  Subscription,
  Organization,
  Property,
  UnitStatus,
  Unit,
  RecertificationStatus,
  Tenant,
  TransactionType,
  LedgerEntry,
  SystemState,
  RouteAccessControl,
  DynamicRoute,
  LedgerUpdateEvent,
  ComplianceAlert,
} from './types';

// Compliance Router
export {
  DYNAMIC_ROUTES,
  getRedirectPath,
  getDefaultDashboard,
  canAccessDashboard,
  enforceRoleAccess,
} from './compliance-router';

// Constants
export const WOLF_SHIELD_VERSION = '1.0.0';
export const LEDGER_HASH_ALGORITHM = 'SHA256';
export const HUD_AUDIT_RETENTION_DAYS = 2555; // 7 years

// Helper Functions
export function isHudCompliant(complianceHealth: number): boolean {
  return complianceHealth >= 70;
}

export function formatAccountingPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseAccountingPeriod(period: string): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1);
}
