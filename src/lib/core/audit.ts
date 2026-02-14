// =====================================================
// AUDIT LOGGER - COMPLIANCE & SECURITY TRACKING
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

interface AuditLogEntry {
  userId?: string | null;
  organizationId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  reason?: string;
}

interface SecurityEvent {
  userId: string;
  action: string;
  reason: string;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Log general audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        user_id: entry.userId || null,
        organization_id: entry.organizationId || null,
        action: entry.action,
        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        metadata: entry.metadata || {},
      });

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'MFA_ENABLED',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: `AUTH_${action}`,
      resourceType: 'user',
      resourceId: userId,
      metadata,
    });
  }

  /**
   * Log security events (violations, unauthorized access attempts)
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.log({
      userId: event.userId,
      action: `SECURITY_${event.action}`,
      metadata: {
        ...event.metadata,
        reason: event.reason,
        severity: 'high',
      },
    });

    // Additional alerting logic could go here
    if (this.shouldAlert(event.action)) {
      await this.sendSecurityAlert(event);
    }
  }

  /**
   * Log data access events (GDPR compliance)
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'READ' | 'WRITE' | 'DELETE',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: `DATA_${action}`,
      resourceType,
      resourceId,
      metadata,
    });
  }

  /**
   * Log payment events
   */
  async logPaymentEvent(
    organizationId: string,
    action: 'PAYMENT_INITIATED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'REFUND',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      organizationId,
      action: `PAYMENT_${action}`,
      resourceType: 'transaction',
      metadata,
    });
  }

  /**
   * Log webhook events
   */
  async logWebhookEvent(
    source: string,
    eventType: string,
    status: 'SUCCESS' | 'FAILED',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `WEBHOOK_${status}`,
      resourceType: 'webhook',
      metadata: {
        source,
        eventType,
        ...metadata,
      },
    });
  }

  /**
   * Log API key usage
   */
  async logApiKeyUsage(
    organizationId: string,
    apiKeyId: string,
    endpoint: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      organizationId,
      action: 'API_KEY_USAGE',
      resourceType: 'api_key',
      resourceId: apiKeyId,
      metadata: {
        endpoint,
        ...metadata,
      },
    });
  }

  /**
   * Query audit logs
   */
  async queryLogs(filters: {
    userId?: string;
    organizationId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    return data;
  }

  /**
   * Check if security event should trigger alert
   */
  private shouldAlert(action: string): boolean {
    const alertActions = [
      'AUTHORIZATION_FAILED',
      'MULTIPLE_LOGIN_FAILURES',
      'SUSPICIOUS_ACTIVITY',
      'DATA_BREACH_ATTEMPT',
    ];
    return alertActions.includes(action);
  }

  /**
   * Send security alert (integrate with monitoring service)
   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Integration with services like Sentry, PagerDuty, or custom alerting
    console.error('SECURITY ALERT:', {
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      reason: event.reason,
      metadata: event.metadata,
    });

    // TODO: Implement actual alerting (Email, Slack, PagerDuty, etc.)
  }

  /**
   * Generate audit report
   */
  async generateReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const logs = await this.queryLogs({
      organizationId,
      startDate,
      endDate,
    });

    // Aggregate statistics
    const stats = {
      totalEvents: logs.length,
      authEvents: logs.filter(l => l.action.startsWith('AUTH_')).length,
      securityEvents: logs.filter(l => l.action.startsWith('SECURITY_')).length,
      dataAccess: logs.filter(l => l.action.startsWith('DATA_')).length,
      paymentEvents: logs.filter(l => l.action.startsWith('PAYMENT_')).length,
      webhookEvents: logs.filter(l => l.action.startsWith('WEBHOOK_')).length,
      uniqueUsers: new Set(logs.map(l => l.user_id).filter(Boolean)).size,
    };

    return {
      organizationId,
      period: { startDate, endDate },
      stats,
      recentEvents: logs.slice(0, 50),
    };
  }
}

export default AuditLogger;
