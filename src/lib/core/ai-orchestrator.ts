// =====================================================
// AI ORCHESTRATION - AGENTIC AI WITH GUARDRAILS
// =====================================================

import { SecurityKernel } from './security';
import { AuditLogger } from './audit';
import DataGateway from './data-gateway';
import type { Database } from '@/types/database.types';

type AIAgentConfig = Database['public']['Tables']['ai_agents']['Row'];

interface AIRequest {
  prompt: string;
  context?: Record<string, any>;
  userId: string;
  organizationId: string;
  projectId?: string;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

interface Guardrail {
  type: 'content_filter' | 'rate_limit' | 'token_limit' | 'pii_detection' | 'custom';
  config: Record<string, any>;
  enabled: boolean;
}

export class AIOrchestrator {
  private security: SecurityKernel;
  private auditLogger: AuditLogger;
  private dataGateway: DataGateway;
  private ollamaUrl: string;

  constructor() {
    this.security = SecurityKernel.getInstance();
    this.auditLogger = new AuditLogger();
    this.dataGateway = new DataGateway(true);
    this.ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  }

  /**
   * Main orchestration method with full security and monitoring
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // 1. Sanitize input (PII removal)
      const sanitizedPrompt = this.security.sanitizePII(request.prompt);

      // 2. Load agent configuration and guardrails
      const agentConfig = request.projectId
        ? await this.loadAgentConfig(request.projectId)
        : null;

      // 3. Apply guardrails
      const guardrailCheck = await this.applyGuardrails(sanitizedPrompt, agentConfig);
      if (!guardrailCheck.passed) {
        throw new Error(`Guardrail violation: ${guardrailCheck.reason}`);
      }

      // 4. RAG: Retrieve relevant knowledge
      const ragContext = request.projectId
        ? await this.retrieveKnowledge(request.projectId, sanitizedPrompt)
        : '';

      // 5. Build final prompt with context
      const finalPrompt = this.buildPrompt(sanitizedPrompt, ragContext, request.context);

      // 6. Call AI model (Ollama or fallback)
      const aiResponse = await this.callAIModel(finalPrompt, agentConfig);

      // 7. Post-process and validate response
      const validatedResponse = await this.validateResponse(aiResponse, agentConfig);

      // 8. Audit logging
      await this.auditLogger.log({
        userId: request.userId,
        organizationId: request.organizationId,
        action: 'AI_REQUEST_COMPLETED',
        resourceType: 'ai_agent',
        resourceId: agentConfig?.id,
        metadata: {
          projectId: request.projectId,
          processingTime: Date.now() - startTime,
          tokenUsage: validatedResponse.usage,
        },
      });

      return validatedResponse;
    } catch (error: any) {
      // Error handling and logging
      await this.auditLogger.log({
        userId: request.userId,
        organizationId: request.organizationId,
        action: 'AI_REQUEST_FAILED',
        metadata: {
          error: error.message,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  /**
   * Load agent configuration from database
   */
  private async loadAgentConfig(projectId: string): Promise<AIAgentConfig | null> {
    const agents = await this.dataGateway.getProjectAgents(projectId);
    return agents.find(a => a.is_active) || null;
  }

  /**
   * Apply guardrails to protect against misuse
   */
  private async applyGuardrails(
    prompt: string,
    agentConfig: AIAgentConfig | null
  ): Promise<{ passed: boolean; reason?: string }> {
    const guardrails: Guardrail[] = (agentConfig?.guardrails as Guardrail[]) || [];

    for (const guardrail of guardrails) {
      if (!guardrail.enabled) continue;

      switch (guardrail.type) {
        case 'content_filter':
          const contentCheck = this.checkContentFilter(prompt, guardrail.config);
          if (!contentCheck.passed) return contentCheck;
          break;

        case 'token_limit':
          const tokenCheck = this.checkTokenLimit(prompt, guardrail.config);
          if (!tokenCheck.passed) return tokenCheck;
          break;

        case 'pii_detection':
          const piiCheck = this.checkPIIDetection(prompt);
          if (!piiCheck.passed) return piiCheck;
          break;

        default:
          break;
      }
    }

    return { passed: true };
  }

  /**
   * Content filter guardrail
   */
  private checkContentFilter(
    prompt: string,
    config: Record<string, any>
  ): { passed: boolean; reason?: string } {
    const bannedKeywords = config.bannedKeywords || [];
    const lowerPrompt = prompt.toLowerCase();

    for (const keyword of bannedKeywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return {
          passed: false,
          reason: `Content contains banned keyword: ${keyword}`,
        };
      }
    }

    return { passed: true };
  }

  /**
   * Token limit guardrail
   */
  private checkTokenLimit(
    prompt: string,
    config: Record<string, any>
  ): { passed: boolean; reason?: string } {
    const maxTokens = config.maxTokens || 4000;
    const estimatedTokens = Math.ceil(prompt.length / 4); // Rough estimate

    if (estimatedTokens > maxTokens) {
      return {
        passed: false,
        reason: `Prompt exceeds token limit: ${estimatedTokens} > ${maxTokens}`,
      };
    }

    return { passed: true };
  }

  /**
   * PII detection guardrail
   */
  private checkPIIDetection(prompt: string): { passed: boolean; reason?: string } {
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
    ];

    for (const pattern of piiPatterns) {
      if (pattern.test(prompt)) {
        return {
          passed: false,
          reason: 'Prompt contains potential PII',
        };
      }
    }

    return { passed: true };
  }

  /**
   * RAG: Retrieve relevant knowledge from knowledge base
   */
  private async retrieveKnowledge(projectId: string, query: string): Promise<string> {
    try {
      const results = await this.dataGateway.searchKnowledgeBase(projectId, query);
      
      if (results.length === 0) return '';

      return results
        .slice(0, 3)
        .map(r => `[Source: ${r.title}]\n${r.content}`)
        .join('\n\n');
    } catch (error) {
      console.error('RAG retrieval error:', error);
      return '';
    }
  }

  /**
   * Build final prompt with context and RAG data
   */
  private buildPrompt(
    userPrompt: string,
    ragContext: string,
    additionalContext?: Record<string, any>
  ): string {
    let prompt = '';

    if (ragContext) {
      prompt += `Context from knowledge base:\n${ragContext}\n\n`;
    }

    if (additionalContext) {
      prompt += `Additional context:\n${JSON.stringify(additionalContext, null, 2)}\n\n`;
    }

    prompt += `User request:\n${userPrompt}`;

    return prompt;
  }

  /**
   * Call AI model (Ollama local or cloud fallback)
   */
  private async callAIModel(
    prompt: string,
    agentConfig: AIAgentConfig | null
  ): Promise<AIResponse> {
    const model = agentConfig?.config?.model || process.env.OLLAMA_MODEL || 'llama3.2';

    try {
      // Try local Ollama first
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama request failed');
      }

      const data = await response.json();

      return {
        content: data.response,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        metadata: {
          model: data.model,
          provider: 'ollama',
        },
      };
    } catch (error) {
      // Fallback to template-based response
      if (process.env.AI_FALLBACK_ENABLED === 'true') {
        return this.fallbackResponse(prompt);
      }

      throw new Error('AI service unavailable and fallback disabled');
    }
  }

  /**
   * Fallback response when AI service is unavailable
   */
  private fallbackResponse(prompt: string): AIResponse {
    return {
      content: 'AI service is temporarily unavailable. This is a fallback response. Please try again later.',
      metadata: {
        provider: 'fallback',
        fallback: true,
      },
    };
  }

  /**
   * Validate AI response
   */
  private async validateResponse(
    response: AIResponse,
    agentConfig: AIAgentConfig | null
  ): Promise<AIResponse> {
    // Apply output validation rules
    // Check for harmful content, ensure JSON structure if required, etc.

    return response;
  }

  /**
   * Stream response (for real-time applications)
   */
  async *streamResponse(request: AIRequest): AsyncGenerator<string> {
    const sanitizedPrompt = this.security.sanitizePII(request.prompt);
    const model = process.env.OLLAMA_MODEL || 'llama3.2';

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: sanitizedPrompt,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Streaming failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            yield data.response;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

export default AIOrchestrator;
