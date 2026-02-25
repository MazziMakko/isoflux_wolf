/**
 * =====================================================
 * useSystemState: COMPLIANCE HEALTH TRACKER
 * Tracks current user's Organization and System State
 * =====================================================
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SystemState, Organization, Subscription, UserRole } from '@/lib/wolf-shield/types';
import { WolfShieldLedger } from '@/lib/wolf-shield/ledger-engine';

// =====================================================
// HOOK STATE
// =====================================================

interface UseSystemStateReturn extends SystemState {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  ledgerEngine: WolfShieldLedger | null;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useSystemState(): UseSystemStateReturn {
  const [state, setState] = useState<SystemState>({
    user: {
      id: '',
      email: '',
      role: 'CUSTOMER',
    },
    complianceHealth: 0,
    canAccessDashboard: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ledgerEngine, setLedgerEngine] = useState<WolfShieldLedger | null>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  /**
   * Fetch system state from database
   */
  const fetchSystemState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user from Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        throw new Error('Not authenticated');
      }

      // Fetch user data with role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, full_name')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      // Fetch organization membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select(
          `
          organization_id,
          role,
          organizations (
            id,
            name,
            slug,
            hud_certification_number,
            compliance_health,
            last_audit_date
          )
        `
        )
        .eq('user_id', authUser.id)
        .limit(1)
        .single();

      let organization: Organization | undefined;
      let subscription: Subscription | undefined;
      let complianceHealth = 0;

      if (membershipData && membershipData.organizations) {
        const org = membershipData.organizations as any;
        organization = {
          id: org.id,
          name: org.name,
          slug: org.slug,
          hudCertificationNumber: org.hud_certification_number,
          complianceHealth: org.compliance_health ? parseFloat(org.compliance_health) : 0,
          lastAuditDate: org.last_audit_date ? new Date(org.last_audit_date) : undefined,
        };

        // Fetch subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionData) {
          subscription = {
            id: subscriptionData.id,
            organizationId: subscriptionData.organization_id,
            tier: subscriptionData.tier,
            status: subscriptionData.status,
            currentPeriodStart: subscriptionData.current_period_start
              ? new Date(subscriptionData.current_period_start)
              : undefined,
            currentPeriodEnd: subscriptionData.current_period_end
              ? new Date(subscriptionData.current_period_end)
              : undefined,
            trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end) : undefined,
          };
        }

        // Calculate compliance health if we have ledger access
        if (ledgerEngine && organization.id) {
          try {
            const health = await ledgerEngine.getComplianceHealth(organization.id);
            complianceHealth = health.healthScore;

            // Update organization's compliance health in DB
            await supabase
              .from('organizations')
              .update({ compliance_health: complianceHealth })
              .eq('id', organization.id);

            organization.complianceHealth = complianceHealth;
          } catch (err) {
            console.error('Error calculating compliance health:', err);
          }
        }
      }

      // Determine dashboard access
      const canAccessDashboard =
        subscription?.status === 'active' || subscription?.status === 'trialing';

      // Build redirect path if needed
      let redirectPath: string | undefined;
      if (subscription?.status === 'PAST_DUE') {
        redirectPath = '/billing';
      } else if (userData.role === 'tenant') {
        // Check recertification status
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('recertification_status')
          .eq('user_id', authUser.id)
          .single();

        if (tenantData?.recertification_status === 'OVERDUE') {
          redirectPath = '/dashboard/tenant/documents';
        }
      }

      setState({
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role as UserRole,
          fullName: userData.full_name || undefined,
        },
        organization,
        subscription,
        complianceHealth,
        canAccessDashboard,
        redirectPath,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching system state:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, ledgerEngine]);

  /**
   * Initialize ledger engine
   */
  useEffect(() => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const engine = new WolfShieldLedger(supabaseUrl, supabaseKey);
        setLedgerEngine(engine);
      }
    } catch (err) {
      console.error('Error initializing ledger engine:', err);
    }
  }, []);

  /**
   * Fetch state on mount and when ledger engine is ready
   */
  useEffect(() => {
    fetchSystemState();
  }, [fetchSystemState]);

  /**
   * Subscribe to realtime updates
   */
  useEffect(() => {
    if (!state.organization?.id) return;

    // Subscribe to ledger changes
    const ledgerSubscription = supabase
      .channel(`ledger:${state.organization.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hud_append_ledger',
          filter: `organization_id=eq.${state.organization.id}`,
        },
        (payload) => {
          console.log('Ledger update received:', payload);
          // Refresh compliance health
          fetchSystemState();
        }
      )
      .subscribe();

    // Subscribe to subscription changes
    const subscriptionChannel = supabase
      .channel(`subscription:${state.organization.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `organization_id=eq.${state.organization.id}`,
        },
        (payload) => {
          console.log('Subscription update received:', payload);
          fetchSystemState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ledgerSubscription);
      supabase.removeChannel(subscriptionChannel);
    };
  }, [state.organization?.id, fetchSystemState, supabase]);

  return {
    ...state,
    loading,
    error,
    refresh: fetchSystemState,
    ledgerEngine,
  };
}

// =====================================================
// HELPER HOOK: Check if user has specific role
// =====================================================

export function useHasRole(requiredRole: UserRole | UserRole[]): boolean {
  const { user } = useSystemState();

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}

// =====================================================
// HELPER HOOK: Check if subscription is active
// =====================================================

export function useHasActiveSubscription(): boolean {
  const { subscription } = useSystemState();
  return subscription?.status === 'active' || subscription?.status === 'trialing';
}
