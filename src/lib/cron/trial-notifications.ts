// =====================================================
// TRIAL EXPIRATION NOTIFICATION SYSTEM
// Automatically notifies users when trial is ending
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { addDays, differenceInDays, format } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrialUser {
  user_id: string;
  email: string;
  full_name: string;
  organization_name: string;
  trial_start: string;
  trial_end: string;
  days_remaining: number;
}

export async function checkTrialExpirations() {
  console.log('🕐 Checking trial expirations...');

  try {
    // Get all users with TRIALING subscriptions
    const { data: trialingUsers, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        organization_id,
        status,
        trial_end_date,
        created_at,
        organizations!inner (
          id,
          name,
          owner_id,
          users!inner (
            id,
            email,
            full_name
          )
        )
      `)
      .eq('status', 'TRIALING')
      .not('trial_end_date', 'is', null);

    if (error) {
      console.error('❌ Error fetching trialing users:', error);
      return;
    }

    if (!trialingUsers || trialingUsers.length === 0) {
      console.log('✅ No users on trial');
      return;
    }

    console.log(`📊 Found ${trialingUsers.length} users on trial`);

    // Process each trial user
    for (const sub of trialingUsers) {
      const org = sub.organizations as any;
      const user = org.users;
      const trialEnd = new Date(sub.trial_end_date);
      const now = new Date();
      const daysRemaining = differenceInDays(trialEnd, now);

      // Send notifications at 7 days, 3 days, 1 day, and expiration
      if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
        await sendTrialReminderEmail({
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          organization_name: org.name,
          trial_start: sub.created_at,
          trial_end: sub.trial_end_date,
          days_remaining: daysRemaining,
        });
      } else if (daysRemaining === 0) {
        // Trial expired today
        await handleTrialExpiration(sub.id, sub.organization_id, user);
      } else if (daysRemaining < 0) {
        // Trial expired in the past - shouldn't happen, but handle it
        await handleTrialExpiration(sub.id, sub.organization_id, user);
      }
    }

    console.log('✅ Trial expiration check complete');
  } catch (error) {
    console.error('❌ Trial expiration check failed:', error);
  }
}

async function sendTrialReminderEmail(user: TrialUser) {
  console.log(`📧 Sending ${user.days_remaining}-day reminder to ${user.email}`);

  const subject = `Your Wolf Shield trial ends in ${user.days_remaining} day${user.days_remaining === 1 ? '' : 's'}`;
  
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .brand {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
      margin: 0;
    }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 1px solid #475569;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #fbbf24;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .countdown {
      background: #1e293b;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .countdown-number {
      font-size: 48px;
      font-weight: bold;
      color: #fbbf24;
      margin: 0;
    }
    .countdown-text {
      color: #94a3b8;
      margin: 5px 0 0 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 10px;
      text-align: center;
    }
    .button-secondary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    .pricing {
      background: #1e293b;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .price {
      font-size: 36px;
      font-weight: bold;
      color: #10b981;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #475569;
    }
    .footer p {
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐺</div>
      <h2 class="brand">Wolf Shield</h2>
    </div>
    
    <div class="card">
      <h1>⏰ Your Trial is Ending Soon!</h1>
      
      <p>Hi ${user.full_name},</p>
      
      <p>Your <strong>30-day free trial</strong> of Wolf Shield is ending soon. You have:</p>
      
      <div class="countdown">
        <div class="countdown-number">${user.days_remaining}</div>
        <p class="countdown-text">day${user.days_remaining === 1 ? '' : 's'} remaining</p>
      </div>
      
      <p>We hope Wolf Shield has made your property management easier! To keep using all the features you love, upgrade to the Pro plan:</p>
      
      <div class="pricing">
        <p class="price">$299<span style="font-size: 20px; color: #64748b;">/month</span></p>
        <p style="color: #10b981; margin: 10px 0;">✓ Unlimited Properties & Units</p>
        <p style="color: #10b981; margin: 10px 0;">✓ HUD Compliance Automation</p>
        <p style="color: #10b981; margin: 10px 0;">✓ Immutable Ledger Protection</p>
        <p style="color: #10b981; margin: 10px 0;">✓ Priority Support</p>
      </div>
      
      <p style="text-align: center;">
        <a href="https://www.isoflux.app/dashboard/billing?action=upgrade" class="button">
          Upgrade to Pro ($299/mo)
        </a>
        <a href="https://www.isoflux.app/dashboard/billing" class="button button-secondary">
          View Billing Details
        </a>
      </p>
      
      <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
        <strong>What happens when my trial ends?</strong><br>
        If you don't upgrade, your account will be paused. You'll still be able to export your data, but you won't be able to add new properties or tenants.
      </p>
      
      <p style="font-size: 14px; color: #94a3b8;">
        <strong>Need more time to decide?</strong><br>
        Contact us at <a href="mailto:support@isoflux.app" style="color: #3b82f6;">support@isoflux.app</a> or call <a href="tel:+18562748668" style="color: #3b82f6;">(856) 274-8668</a>
      </p>
    </div>
    
    <div class="footer">
      <p>
        Wolf Shield by New Jerusalem Holdings, LLC<br>
        Wyoming, USA
      </p>
      <p style="font-size: 12px;">
        <a href="https://www.isoflux.app/dashboard/billing?action=cancel" style="color: #64748b;">Cancel my subscription</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // TODO: Integrate with your email service (Resend, SendGrid, etc.)
  // For now, log the email
  console.log(`✅ Email prepared for ${user.email} (${user.days_remaining} days)`);
  
  // Example with Resend:
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'Wolf Shield <support@isoflux.app>',
  //     to: user.email,
  //     subject,
  //     html: emailHtml,
  //   }),
  // });

  // Log to audit trail
  await supabase.from('audit_logs').insert({
    user_id: user.user_id,
    action: 'TRIAL_REMINDER_SENT',
    resource_type: 'subscription',
    metadata: {
      days_remaining: user.days_remaining,
      email_sent_to: user.email,
    },
  });
}

async function handleTrialExpiration(subscriptionId: string, organizationId: string, user: any) {
  console.log(`⏰ Trial expired for ${user.email}`);

  // Update subscription status to CANCELED
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'CANCELED',
      metadata: {
        trial_expired: true,
        expired_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (updateError) {
    console.error('❌ Failed to update subscription:', updateError);
    return;
  }

  // Send trial expiration email
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .brand {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
      margin: 0;
    }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 1px solid #475569;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #ef4444;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .pricing {
      background: #1e293b;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .price {
      font-size: 36px;
      font-weight: bold;
      color: #10b981;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐺</div>
      <h2 class="brand">Wolf Shield</h2>
    </div>
    
    <div class="card">
      <h1>Your Trial Has Ended</h1>
      
      <p>Hi ${user.full_name},</p>
      
      <p>Your <strong>30-day free trial</strong> of Wolf Shield has ended.</p>
      
      <p>Your account is now <strong>paused</strong>. You can still:</p>
      <ul style="color: #cbd5e1;">
        <li>Log in to your dashboard</li>
        <li>View your existing data</li>
        <li>Export reports and documents</li>
      </ul>
      
      <p>But you won't be able to add new properties, tenants, or leases.</p>
      
      <div class="pricing">
        <p style="color: #cbd5e1; margin-bottom: 10px;">Upgrade to Pro and keep everything running:</p>
        <p class="price">$299<span style="font-size: 20px; color: #64748b;">/month</span></p>
        <p style="color: #64748b; font-size: 14px; margin-top: 10px;">Cancel anytime</p>
      </div>
      
      <p style="text-align: center;">
        <a href="https://www.isoflux.app/dashboard/billing?action=upgrade" class="button">
          Upgrade Now
        </a>
      </p>
      
      <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
        <strong>Have questions?</strong><br>
        We're here to help! Email us at <a href="mailto:support@isoflux.app" style="color: #3b82f6;">support@isoflux.app</a> or call <a href="tel:+18562748668" style="color: #3b82f6;">(856) 274-8668</a>
      </p>
    </div>
    
    <div class="footer">
      <p style="color: #64748b; font-size: 14px;">
        Wolf Shield by New Jerusalem Holdings, LLC | Wyoming, USA
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // TODO: Send email via your email service
  console.log(`✅ Trial expiration email prepared for ${user.email}`);

  // Log to audit trail
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'TRIAL_EXPIRED',
    resource_type: 'subscription',
    metadata: {
      subscription_id: subscriptionId,
      organization_id: organizationId,
    },
  });
}

// Export for cron job
export default checkTrialExpirations;
