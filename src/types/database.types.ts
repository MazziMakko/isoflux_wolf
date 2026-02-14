// =====================================================
// CORE TYPE DEFINITIONS - PRODUCTION READY
// =====================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'customer';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type ProjectStatus = 'draft' | 'active' | 'archived' | 'deleted';
export type WebhookStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'retrying';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          email_verified: boolean;
          password_hash: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          metadata: Json;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          email_verified?: boolean;
          password_hash: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          metadata?: Json;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          email_verified?: boolean;
          password_hash?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          metadata?: Json;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          settings: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: UserRole;
          permissions: Json;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: UserRole;
          permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: UserRole;
          permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          tier: SubscriptionTier;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_end: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          description: string | null;
          status: ProjectStatus;
          config: Json;
          ai_settings: Json;
          deployment_url: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          description?: string | null;
          status?: ProjectStatus;
          config?: Json;
          ai_settings?: Json;
          deployment_url?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: ProjectStatus;
          config?: Json;
          ai_settings?: Json;
          deployment_url?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_agents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          agent_type: string;
          config: Json;
          prompt_template: string | null;
          guardrails: Json;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          agent_type: string;
          config?: Json;
          prompt_template?: string | null;
          guardrails?: Json;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          agent_type?: string;
          config?: Json;
          prompt_template?: string | null;
          guardrails?: Json;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string;
          content_vector: number[] | null;
          source_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content: string;
          content_vector?: number[] | null;
          source_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string;
          content_vector?: number[] | null;
          source_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          project_id: string | null;
          source: string;
          event_type: string;
          payload: Json;
          signature: string | null;
          status: WebhookStatus;
          processed_at: string | null;
          retry_count: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          source: string;
          event_type: string;
          payload: Json;
          signature?: string | null;
          status?: WebhookStatus;
          processed_at?: string | null;
          retry_count?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          source?: string;
          event_type?: string;
          payload?: Json;
          signature?: string | null;
          status?: WebhookStatus;
          processed_at?: string | null;
          retry_count?: number;
          error_message?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          organization_id: string;
          subscription_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          subscription_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_cents: number;
          currency?: string;
          status?: PaymentStatus;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          subscription_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: PaymentStatus;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          organization_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          organization_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          organization_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          permissions: Json;
          last_used_at: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          permissions?: Json;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          permissions?: Json;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
      /** Append-only Truth Ledger: immutable, digest-chained records (disclosed in ToS). */
      truth_ledger: {
        Row: {
          id: string;
          organization_id: string;
          transaction_id: string;
          message_type: string;
          payload_digest: string;
          prev_ledger_hash: string | null;
          ledger_hash: string;
          signed_at: string;
          signature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          transaction_id: string;
          message_type: string;
          payload_digest: string;
          prev_ledger_hash?: string | null;
          ledger_hash: string;
          signed_at?: string;
          signature?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_stripe_webhook: {
        Args: {
          event_id: string;
          event_type: string;
          payload: Json;
        };
        Returns: Json;
      };
      process_flutterwave_webhook: {
        Args: {
          event_id: string;
          event_type: string;
          payload: Json;
        };
        Returns: Json;
      };
      process_mercury_webhook: {
        Args: {
          event_id: string;
          event_type: string;
          payload: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      payment_status: PaymentStatus;
      project_status: ProjectStatus;
      webhook_status: WebhookStatus;
    };
  };
}
