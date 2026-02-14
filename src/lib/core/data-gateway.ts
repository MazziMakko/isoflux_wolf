// =====================================================
// DATA GATEWAY - CENTRALIZED CRUD OPERATIONS
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { AuditLogger } from './audit';
import { z } from 'zod';

type Tables = Database['public']['Tables'];

/** organization_members row with nested organizations row (from join). */
export type UserOrganizationMember = Tables['organization_members']['Row'] & {
  organizations: Tables['organizations']['Row'] | null;
};

export class DataGateway {
  private supabase;
  private auditLogger: AuditLogger;
  /** Last error from create/update (for debugging 500s). */
  public lastError: unknown = null;

  constructor(useServiceRole: boolean = false) {
    const key = useServiceRole
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key
    );
    
    this.auditLogger = new AuditLogger();
  }

  /**
   * Generic CRUD Operations with Error Handling
   */

  async findById<T extends keyof Tables>(
    table: T,
    id: string,
    userId?: string
  ): Promise<Tables[T]['Row'] | null> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (userId && data) {
        await this.auditLogger.logDataAccess(
          userId,
          table as string,
          id,
          'READ'
        );
      }

      return data as Tables[T]['Row'];
    } catch (error) {
      this.handleError('findById', error);
      return null;
    }
  }

  async findMany<T extends keyof Tables>(
    table: T,
    filters?: Partial<Tables[T]['Row']>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    }
  ): Promise<Tables[T]['Row'][]> {
    try {
      let query = this.supabase.from(table).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as Tables[T]['Row'][]) || [];
    } catch (error) {
      this.handleError('findMany', error);
      return [];
    }
  }

  async create<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert'],
    userId?: string
  ): Promise<Tables[T]['Row'] | null> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      if (userId && result) {
        await this.auditLogger.logDataAccess(
          userId,
          table as string,
          (result as any).id,
          'WRITE'
        );
      }

      this.lastError = null;
      return result as Tables[T]['Row'];
    } catch (error) {
      this.lastError = error;
      this.handleError('create', error);
      return null;
    }
  }

  async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: Tables[T]['Update'],
    userId?: string
  ): Promise<Tables[T]['Row'] | null> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (userId && result) {
        await this.auditLogger.logDataAccess(
          userId,
          table as string,
          id,
          'WRITE',
          { operation: 'update' }
        );
      }

      return result as Tables[T]['Row'];
    } catch (error) {
      this.handleError('update', error);
      return null;
    }
  }

  /**
   * Upsert: insert or update on conflict. Use for syncing Auth user to public.users.
   */
  async upsert<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert'],
    options?: { onConflict?: string },
    userId?: string
  ): Promise<Tables[T]['Row'] | null> {
    try {
      const conflictColumn = options?.onConflict ?? 'id';
      const { data: result, error } = await this.supabase
        .from(table)
        .upsert(data as Tables[T]['Insert'], { onConflict: conflictColumn })
        .select()
        .single();

      if (error) throw error;

      if (userId && result) {
        await this.auditLogger.logDataAccess(
          userId,
          table as string,
          (result as Record<string, unknown>).id as string,
          'WRITE',
          { operation: 'upsert' }
        );
      }

      this.lastError = null;
      return result as Tables[T]['Row'];
    } catch (error) {
      this.lastError = error;
      this.handleError('upsert', error);
      return null;
    }
  }

  async delete<T extends keyof Tables>(
    table: T,
    id: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (userId) {
        await this.auditLogger.logDataAccess(
          userId,
          table as string,
          id,
          'DELETE'
        );
      }

      return true;
    } catch (error) {
      this.handleError('delete', error);
      return false;
    }
  }

  /**
   * Domain-Specific Methods
   */

  // Users
  async createUser(userData: Tables['users']['Insert']) {
    return this.create('users', userData);
  }

  async getUserByEmail(email: string): Promise<Tables['users']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data as Tables['users']['Row'] | null;
  }

  // Organizations
  async createOrganization(orgData: Tables['organizations']['Insert']) {
    return this.create('organizations', orgData);
  }

  async getOrganizationBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  /** Member row with nested organization. */
  getUserOrganizations(userId: string): Promise<UserOrganizationMember[]> {
    return this.supabase
      .from('organization_members')
      .select('*, organizations (*)')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) return [];
        return (data ?? []) as UserOrganizationMember[];
      });
  }

  // Projects
  async getOrganizationProjects(organizationId: string) {
    return this.findMany('projects', { organization_id: organizationId });
  }

  async createProject(projectData: Tables['projects']['Insert']) {
    return this.create('projects', projectData);
  }

  // Subscriptions
  async getActiveSubscription(organizationId: string): Promise<Tables['subscriptions']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (error) return null;
    return data as Tables['subscriptions']['Row'] | null;
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Tables['subscriptions']['Update']
  ) {
    return this.update('subscriptions', subscriptionId, updates);
  }

  // Webhooks
  async createWebhookEvent(eventData: Tables['webhook_events']['Insert']) {
    return this.create('webhook_events', eventData);
  }

  async getPendingWebhooks(limit: number = 100) {
    return this.findMany(
      'webhook_events',
      { status: 'pending' },
      { limit, orderBy: 'created_at', ascending: true }
    );
  }

  async updateWebhookStatus(
    webhookId: string,
    status: Tables['webhook_events']['Row']['status'],
    errorMessage?: string
  ) {
    return this.update('webhook_events', webhookId, {
      status,
      error_message: errorMessage || null,
      processed_at: status !== 'pending' ? new Date().toISOString() : null,
    });
  }

  // Transactions
  async createTransaction(transactionData: Tables['transactions']['Insert']) {
    return this.create('transactions', transactionData);
  }

  async getOrganizationTransactions(
    organizationId: string,
    limit: number = 50
  ) {
    return this.findMany(
      'transactions',
      { organization_id: organizationId },
      { limit, orderBy: 'created_at', ascending: false }
    );
  }

  // AI Agents
  async createAIAgent(agentData: Tables['ai_agents']['Insert']) {
    return this.create('ai_agents', agentData);
  }

  async getProjectAgents(projectId: string) {
    return this.findMany('ai_agents', { project_id: projectId });
  }

  // Knowledge Base (RAG)
  async addKnowledgeBaseEntry(entry: Tables['knowledge_base']['Insert']) {
    return this.create('knowledge_base', entry);
  }

  async searchKnowledgeBase(projectId: string, query: string) {
    // Basic text search (can be enhanced with vector similarity)
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .select('*')
      .eq('project_id', projectId)
      .textSearch('content', query)
      .limit(10);

    if (error) return [];
    return data;
  }

  // API Keys
  async createApiKey(keyData: Tables['api_keys']['Insert']) {
    return this.create('api_keys', keyData);
  }

  async getOrganizationApiKeys(organizationId: string) {
    return this.findMany('api_keys', {
      organization_id: organizationId,
      revoked_at: null as any,
    });
  }

  async revokeApiKey(keyId: string) {
    return this.update('api_keys', keyId, {
      revoked_at: new Date().toISOString(),
    });
  }

  /**
   * Error Handling
   */
  private handleError(operation: string, error: any): void {
    console.error(`DataGateway.${operation} error:`, {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    // Can integrate with error tracking service (Sentry, etc.)
  }

  /**
   * Transaction support
   */
  async executeTransaction<T>(
    callback: (gateway: DataGateway) => Promise<T>
  ): Promise<T> {
    // Supabase doesn't have native transactions in client library
    // This is a wrapper for future implementation
    return callback(this);
  }
}

export default DataGateway;
