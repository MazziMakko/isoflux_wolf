import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { createWolfShieldLedger } from '@/lib/wolf-shield/ledger-engine';

interface RecertificationEmailData {
  tenantName: string;
  tenantEmail: string;
  unitNumber: string;
  propertyName: string;
  daysUntilDue: number;
  dueDate: Date;
  propertyManagerEmail?: string;
}

export class SlaDefenderService {
  private supabase;
  private ledger;
  private resend: Resend | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.ledger = createWolfShieldLedger();
    
    // Lazy initialization of Resend to avoid build-time errors if env var is missing
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Send 90-60-30 day recertification notice
   */
  async sendRecertificationNotice(data: RecertificationEmailData) {
    if (!this.resend) {
      console.warn('SLA Defender: RESEND_API_KEY missing, skipping email');
      return { success: false, error: 'RESEND_API_KEY missing configuration' };
    }

    // 1. Construct Email Content
    const subject = `ACTION REQUIRED: ${data.daysUntilDue}-Day Recertification Notice for Unit ${data.unitNumber}`;
    
    // Simple Branded HTML Template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">IsoFlux</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Compliance Notice</h2>
          <p style="color: #475569; line-height: 1.6;">Dear ${data.tenantName},</p>
          
          <p style="color: #475569; line-height: 1.6;">
            This is an automated notice that your <strong>Annual Recertification</strong> for Unit ${data.unitNumber} at ${data.propertyName} is due in <strong>${data.daysUntilDue} days</strong>.
          </p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #334155;"><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #334155;"><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">Action Required</span></p>
          </div>

          <p style="color: #475569; line-height: 1.6;">
            Failure to complete this recertification by the due date may result in the loss of your housing assistance or termination of tenancy.
          </p>

          <p style="color: #475569; line-height: 1.6;">
            Please log in to your tenant portal or contact the property manager immediately to submit your income documentation.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tenant/documents" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Submit Documents</a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Securely sent by IsoFlux SLA Defender.<br>
            Reference ID: ${new Date().getTime()}
          </p>
        </div>
      </div>
    `;

    try {
      // 2. Send Email via Resend
      const { data: emailData, error: emailError } = await this.resend.emails.send({
        from: 'IsoFlux Compliance <compliance@isoflux.app>', // Update with verified domain
        to: [data.tenantEmail],
        cc: data.propertyManagerEmail ? [data.propertyManagerEmail] : undefined,
        subject: subject,
        html: html,
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        return { success: false, error: emailError.message };
      }

      // 3. Log to Ledger (Immutable Proof)
      // We log specifically that the NOTICE was SENT
      const ledgerEntry = {
        organizationId: '00000000-0000-0000-0000-000000000000', // Need org context, usually passed in data
        propertyId: '00000000-0000-0000-0000-000000000000',     // Need prop context
        unitId: '00000000-0000-0000-0000-000000000000',         // Need unit context
        tenantId: null,                                         // Need tenant context
        transactionType: 'RECERTIFICATION_LOG' as const,
        amount: 0,
        description: `SLA DEFENDER: ${data.daysUntilDue}-Day Notice Sent to ${data.tenantEmail}. MessageID: ${emailData?.id}`,
        accountingPeriod: new Date().toISOString().slice(0, 7),
        createdBy: '00000000-0000-0000-0000-000000000000', // System
      };

      // Return success with email ID for the caller to perform the actual ledger insert 
      // (since caller has the IDs)
      return { success: true, messageId: emailData?.id };

    } catch (error) {
      console.error('SLA Defender Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
