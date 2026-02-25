'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from '@/components/ui/AnimatedCard';
import { Clock, CreditCard, Check, X } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadBillingInfo();
  }, []);

  async function loadBillingInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        setOrganization(membership.organizations);

        // Get subscription
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .single();

        if (sub) {
          setSubscription(sub);

          // Calculate days remaining if on trial
          if (sub.status === 'TRIALING' && sub.trial_end_date) {
            const days = differenceInDays(new Date(sub.trial_end_date), new Date());
            setDaysRemaining(days > 0 ? days : 0);
          }
        }
      }
    } catch (error) {
      console.error('Error loading billing:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    // TODO: Integrate with Stripe Checkout
    window.location.href = '/api/stripe/create-checkout-session';
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? You can reactivate anytime.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      alert('Subscription canceled successfully');
      loadBillingInfo();
    } catch (error: any) {
      alert('Error canceling subscription: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const isTrialing = subscription?.status === 'TRIALING';
  const isActive = subscription?.status === 'ACTIVE';
  const isCanceled = subscription?.status === 'CANCELED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your Wolf Shield subscription</p>
        </div>

        {/* Trial Warning Banner */}
        {isTrialing && daysRemaining !== null && (
          <Card className="mb-6 border-yellow-500 bg-yellow-900/30 p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Your Trial Ends in {daysRemaining} Day{daysRemaining === 1 ? '' : 's'}
                </h3>
                <p className="text-yellow-200 mb-4">
                  Upgrade now to keep all your data and continue managing your properties without interruption.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Upgrade to Pro ($299/month)
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Canceled Banner */}
        {isCanceled && (
          <Card className="mb-6 border-red-500 bg-red-900/30 p-6">
            <div className="flex items-start gap-4">
              <X className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2">Subscription Paused</h3>
                <p className="text-red-200 mb-4">
                  Your account is paused. Upgrade to reactivate and continue using Wolf Shield.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Reactivate Subscription
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="mb-6 border-slate-700 bg-slate-800/50 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Current Plan</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">Status</div>
              <div className={`text-lg font-bold ${
                isActive ? 'text-emerald-400' :
                isTrialing ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {isActive && '✓ Active'}
                {isTrialing && '⏰ Free Trial'}
                {isCanceled && '✗ Canceled'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-slate-400 mb-1">Plan</div>
              <div className="text-lg font-bold text-white">
                {isActive ? 'Pro ($299/month)' : 'Free Trial'}
              </div>
            </div>

            {isTrialing && subscription?.trial_end_date && (
              <div>
                <div className="text-sm text-slate-400 mb-1">Trial Ends</div>
                <div className="text-lg font-bold text-white">
                  {format(new Date(subscription.trial_end_date), 'MMM dd, yyyy')}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm text-slate-400 mb-1">Organization</div>
              <div className="text-lg font-bold text-white">
                {organization?.name || 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Card */}
        <Card className="mb-6 border-emerald-500 bg-slate-800/50 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Wolf Shield Pro</h2>
            <div className="text-5xl font-bold text-emerald-400 mb-4">
              $299<span className="text-xl text-slate-400">/month</span>
            </div>
            <p className="text-slate-300 mb-6">Everything you need to manage your properties</p>
            
            <div className="text-left max-w-md mx-auto mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Unlimited Properties & Units</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">HUD Compliance Automation</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Immutable Ledger Protection</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Document Management</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Priority Support</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Cancel Anytime</span>
              </div>
            </div>

            {!isActive && (
              <button
                onClick={handleUpgrade}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </Card>

        {/* Cancel Option */}
        {(isActive || isTrialing) && (
          <div className="text-center">
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-red-400 text-sm underline"
            >
              Cancel subscription
            </button>
          </div>
        )}

        {/* Support */}
        <Card className="mt-6 border-slate-700 bg-slate-800/50 p-6">
          <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
          <p className="text-slate-300 text-sm">
            Contact us at{' '}
            <a href="mailto:thenationofmazzi@gmail.com" className="text-emerald-400 hover:underline">
              thenationofmazzi@gmail.com
            </a>
            {' '}or call{' '}
            <a href="tel:+18562748668" className="text-emerald-400 hover:underline">
              (856) 274-8668
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
