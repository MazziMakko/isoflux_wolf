/**
 * =====================================================
 * COMPLIANCE ROUTER: DYNAMIC ROUTING LOGIC
 * Routes users based on role & subscription status
 * =====================================================
 */

import type { SystemState, DynamicRoute, UserRole, SubscriptionStatus } from './types';

// =====================================================
// ROUTE DEFINITIONS
// =====================================================

export const DYNAMIC_ROUTES: DynamicRoute[] = [
  // Super Admin Dashboard
  {
    pattern: '/dashboard/super-admin',
    accessControl: {
      allowedRoles: ['SUPER_ADMIN'],
      requiredSubscriptionStatus: ['ACTIVE', 'TRIALING'],
      fallbackRoute: '/dashboard',
    },
  },
  // Property Manager Dashboard
  {
    pattern: '/dashboard/property-manager',
    accessControl: {
      allowedRoles: ['PROPERTY_MANAGER', 'SUPER_ADMIN'],
      requiredSubscriptionStatus: ['ACTIVE', 'TRIALING'],
      fallbackRoute: '/billing',
    },
    redirectLogic: (state: SystemState) => {
      // If subscription is past_due, force to billing
      if (state.subscription?.status === 'PAST_DUE') {
        return '/billing';
      }
      return null;
    },
  },
  // Tenant Dashboard
  {
    pattern: '/dashboard/tenant',
    accessControl: {
      allowedRoles: ['TENANT'],
      requiredSubscriptionStatus: ['ACTIVE', 'TRIALING'],
      fallbackRoute: '/dashboard',
    },
    redirectLogic: (state: SystemState) => {
      // If tenant has overdue recertification, force to document vault
      // This would require fetching tenant data - handled in middleware
      return null;
    },
  },
  // Billing (accessible when past_due)
  {
    pattern: '/billing',
    accessControl: {
      allowedRoles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'ADMIN'],
      requiredSubscriptionStatus: ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED'],
      fallbackRoute: '/dashboard',
    },
  },
  // General Dashboard
  {
    pattern: '/dashboard',
    accessControl: {
      allowedRoles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'ADMIN', 'EDITOR', 'VIEWER'],
      requiredSubscriptionStatus: ['ACTIVE', 'TRIALING'],
      fallbackRoute: '/billing',
    },
  },
];

// =====================================================
// ROUTING LOGIC
// =====================================================

/**
 * Determine where a user should be redirected based on their system state
 */
export function getRedirectPath(state: SystemState, requestedPath: string): string | null {
  const route = DYNAMIC_ROUTES.find((r) => requestedPath.startsWith(r.pattern));

  if (!route) {
    // No specific route found, allow access
    return null;
  }

  // Check role access
  if (!route.accessControl.allowedRoles.includes(state.user.role)) {
    return route.accessControl.fallbackRoute;
  }

  // Check subscription status
  if (
    state.subscription &&
    !route.accessControl.requiredSubscriptionStatus.includes(state.subscription.status)
  ) {
    return route.accessControl.fallbackRoute;
  }

  // Run custom redirect logic
  if (route.redirectLogic) {
    const customRedirect = route.redirectLogic(state);
    if (customRedirect) {
      return customRedirect;
    }
  }

  // User has access
  return null;
}

/**
 * Get the default dashboard path for a user based on their role
 */
export function getDefaultDashboard(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'PROPERTY_MANAGER':
      return '/dashboard/property-manager';
    case 'TENANT':
      return '/dashboard/tenant';
    case 'ADMIN':
    case 'EDITOR':
    case 'VIEWER':
      return '/dashboard';
    default:
      return '/';
  }
}

/**
 * Check if user can access dashboard at all
 */
export function canAccessDashboard(state: SystemState): boolean {
  // Must have ACTIVE or TRIALING subscription (or PAST_DUE for billing access)
  if (!state.subscription) {
    return false;
  }

  const allowedStatuses: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE'];
  return allowedStatuses.includes(state.subscription.status);
}

/**
 * Enforce strict role-based routing
 */
export function enforceRoleAccess(
  userRole: UserRole,
  requestedPath: string
): { allowed: boolean; redirect?: string } {
  // Super admin can access everything
  if (userRole === 'SUPER_ADMIN') {
    return { allowed: true };
  }

  // Property Manager restrictions
  if (userRole === 'PROPERTY_MANAGER') {
    // Cannot access super-admin routes
    if (requestedPath.startsWith('/dashboard/super-admin')) {
      return { allowed: false, redirect: '/dashboard/property-manager' };
    }
    // Cannot access tenant-specific routes
    if (requestedPath.startsWith('/dashboard/tenant')) {
      return { allowed: false, redirect: '/dashboard/property-manager' };
    }
  }

  // Tenant restrictions
  if (userRole === 'TENANT') {
    // Can only access tenant dashboard
    if (
      requestedPath.startsWith('/dashboard') &&
      !requestedPath.startsWith('/dashboard/tenant')
    ) {
      return { allowed: false, redirect: '/dashboard/tenant' };
    }
  }

  return { allowed: true };
}
