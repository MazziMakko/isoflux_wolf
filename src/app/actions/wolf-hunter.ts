// =====================================================
// WOLF HUNTER: SERVER ACTIONS
// Lead approval and automated outreach triggers
// =====================================================

'use server';

import { Resend } from 'resend';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'wolf@isoflux.app';

// =====================================================
// APPROVE LEAD & TRIGGER OUTREACH
// =====================================================
export async function approveLead(leadId: string, reviewedBy: string): Promise<{
  success: boolean;
  message: string;
  emailSent?: boolean;
}> {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    // Fetch the lead
    const lead = await dataGateway.findById('hunter_leads', leadId);

    if (!lead) {
      return {
        success: false,
        message: 'Lead not found',
      };
    }

    // Update lead status to APPROVED
    await dataGateway.update('hunter_leads', leadId, {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    });

    console.log(`[Wolf Hunter] ✅ Lead approved: ${lead.company_name}`);

    // TRIGGER AUTOMATED OUTREACH
    let emailSent = false;
    if (lead.email) {
      try {
        await sendOutreachEmail(lead);
        emailSent = true;

        // Update lead status to CONTACTED
        await dataGateway.update('hunter_leads', leadId, {
          status: 'contacted',
          contacted_at: new Date().toISOString(),
        });

        console.log(`[Wolf Hunter] 📧 Outreach email sent to: ${lead.email}`);
      } catch (emailError: any) {
        console.error('[Wolf Hunter] Email failed:', emailError);
        // Lead stays APPROVED even if email fails
      }
    }

    // Audit log
    await auditLogger.logEvent({
      user_id: reviewedBy,
      action: 'HUNTER_LEAD_APPROVED',
      resource_type: 'hunter_lead',
      resource_id: leadId,
      details: {
        company_name: lead.company_name,
        tech_score: lead.tech_score,
        email_sent: emailSent,
      },
    });

    return {
      success: true,
      message: emailSent 
        ? `Lead approved and outreach email sent to ${lead.email}`
        : 'Lead approved (no email address provided)',
      emailSent,
    };

  } catch (error: any) {
    console.error('[Wolf Hunter] Approval failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to approve lead',
    };
  }
}

// =====================================================
// REJECT LEAD
// =====================================================
export async function rejectLead(leadId: string, reviewedBy: string, reason?: string): Promise<{
  success: boolean;
  message: string;
}> {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    const lead = await dataGateway.findById('hunter_leads', leadId);

    if (!lead) {
      return {
        success: false,
        message: 'Lead not found',
      };
    }

    await dataGateway.update('hunter_leads', leadId, {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      notes: reason || 'Rejected by Super Admin',
    });

    // Audit log
    await auditLogger.logEvent({
      user_id: reviewedBy,
      action: 'HUNTER_LEAD_REJECTED',
      resource_type: 'hunter_lead',
      resource_id: leadId,
      details: {
        company_name: lead.company_name,
        reason,
      },
    });

    console.log(`[Wolf Hunter] ❌ Lead rejected: ${lead.company_name}`);

    return {
      success: true,
      message: 'Lead rejected',
    };

  } catch (error: any) {
    console.error('[Wolf Hunter] Rejection failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to reject lead',
    };
  }
}

// =====================================================
// SEND OUTREACH EMAIL - PERSONALIZED COLD EMAIL
// =====================================================
async function sendOutreachEmail(lead: any): Promise<void> {
  const companyName = lead.company_name;
  const units = lead.estimated_units || 'multiple';
  const city = lead.city || 'your area';
  const painPoints = lead.pain_point_hypothesis || 'manual compliance tracking';

  // Personalized subject line
  const subject = `${companyName} - Automating HUD Compliance for ${units} Units`;

  // Personalized email body
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #50C878;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #50C878;
    }
    .cta-button {
      display: inline-block;
      background: #50C878;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🐺 IsoFlux Wolf Shield</div>
  </div>

  <p>Hi ${companyName} team,</p>

  <p>I noticed you're managing ${units} affordable housing units in ${city}. We just helped a similar portfolio digitize their HUD ledgers and eliminate manual recertifications.</p>

  <p><strong>The Challenge We're Solving:</strong></p>
  <p>Most affordable housing operators are drowning in:</p>
  <ul>
    <li>Manual rent tracking & late fee calculations</li>
    <li>HUD compliance reporting anxiety</li>
    <li>Excel/paper-based ledgers with no audit trail</li>
    <li>Missing documentation during inspections</li>
  </ul>

  <p><strong>What We Built:</strong></p>
  <p>IsoFlux Wolf Shield is HUD-compliant property management software with a <em>cryptographically immutable ledger</em>. Every transaction is hash-chained and audit-ready. It's like having a compliance officer built into your software.</p>

  <p><strong>Your Portfolio's Opportunity:</strong></p>
  <p>${painPoints}</p>

  <p>Open to a quick 15-minute call to see if we can streamline your compliance workflow?</p>

  <a href="https://calendly.com/isoflux/demo" class="cta-button">Book a Demo Call</a>

  <p>Or reply to this email with a good time to chat.</p>

  <p>Best regards,<br>
  <strong>Mazzi Makko</strong><br>
  Founder, IsoFlux<br>
  <a href="tel:+18562748668">(856) 274-8668</a><br>
  <a href="https://www.isoflux.app">www.isoflux.app</a></p>

  <div class="footer">
    <p>P.S. We're offering early-access pricing for portfolios in ${city}. First 10 operators get lifetime 20% off.</p>
    <p style="margin-top: 10px;">This email was sent because your organization was identified as an affordable housing operator. If you'd prefer not to receive these messages, <a href="https://www.isoflux.app/unsubscribe">click here to unsubscribe</a>.</p>
  </div>
</body>
</html>
  `;

  const textBody = `
Hi ${companyName} team,

I noticed you're managing ${units} affordable housing units in ${city}. We just helped a similar portfolio digitize their HUD ledgers and eliminate manual recertifications.

THE CHALLENGE WE'RE SOLVING:
Most affordable housing operators are drowning in:
- Manual rent tracking & late fee calculations
- HUD compliance reporting anxiety
- Excel/paper-based ledgers with no audit trail
- Missing documentation during inspections

WHAT WE BUILT:
IsoFlux Wolf Shield is HUD-compliant property management software with a cryptographically immutable ledger. Every transaction is hash-chained and audit-ready.

YOUR PORTFOLIO'S OPPORTUNITY:
${painPoints}

Open to a quick 15-minute call to see if we can streamline your compliance workflow?

Book a demo: https://calendly.com/isoflux/demo
Or reply with a good time to chat.

Best regards,
Mazzi Makko
Founder, IsoFlux
(856) 274-8668
www.isoflux.app

P.S. We're offering early-access pricing for portfolios in ${city}. First 10 operators get lifetime 20% off.
`;

  // Send via Resend
  const { data, error } = await resend.emails.send({
    from: `Mazzi Makko at IsoFlux <${FROM_EMAIL}>`,
    to: lead.email,
    subject,
    html: htmlBody,
    text: textBody,
    tags: [
      { name: 'campaign', value: 'wolf_hunter' },
      { name: 'lead_id', value: lead.id },
      { name: 'tech_score', value: String(lead.tech_score) },
    ],
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  console.log('[Wolf Hunter] Email sent via Resend:', data?.id);
}

// =====================================================
// BULK APPROVE (for high-score leads)
// =====================================================
export async function bulkApproveLead(leadIds: string[], reviewedBy: string): Promise<{
  success: boolean;
  approved: number;
  failed: number;
  emailsSent: number;
}> {
  let approved = 0;
  let failed = 0;
  let emailsSent = 0;

  for (const leadId of leadIds) {
    const result = await approveLead(leadId, reviewedBy);
    if (result.success) {
      approved++;
      if (result.emailSent) emailsSent++;
    } else {
      failed++;
    }
  }

  return {
    success: true,
    approved,
    failed,
    emailsSent,
  };
}
