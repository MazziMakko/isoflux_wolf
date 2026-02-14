// =====================================================
// ISOFLUX ORCHESTRATOR - THE SINGULARITY
// Coordinating the Trinity of Order
// =====================================================

import { RulialParser } from './rulial-parser';
import { GeometricLegislator } from './geometric-legislator';
import { EntangledLedger } from './entangled-ledger';
import {
  PACS008,
  ISO20022MessageType,
  GeometricViolation,
  HSMConfig,
  EntanglementState,
  AttestationSignature,
} from './types';
import { AuditLogger } from '../audit';
import { TruthLedgerService } from '../truth-ledger';

/**
 * ISOFLUX ORCHESTRATOR
 * 
 * The central nervous system that coordinates:
 * 1. Rulial Parser (Message Validation)
 * 2. Geometric Legislator (Compliance Checking)
 * 3. Entangled Ledger (Reserve Verification)
 * 
 * Philosophy: Non-compliant transactions cannot exist.
 * Certainty through Geometry.
 */
export class IsoFluxOrchestrator {
  private parser: RulialParser;
  private legislator: GeometricLegislator;
  private ledger: EntangledLedger;
  private auditLogger: AuditLogger;
  
  private isInitialized: boolean = false;

  constructor() {
    this.parser = new RulialParser();
    this.legislator = new GeometricLegislator();
    this.ledger = new EntangledLedger();
    this.auditLogger = new AuditLogger();
  }

  /**
   * INITIALIZE SYSTEM
   * Setup HSM, load sanctions, start sentinel
   */
  async initialize(hsmConfig?: HSMConfig): Promise<void> {
    try {
      // Initialize HSM if configured
      if (hsmConfig) {
        this.ledger.initializeHSM(hsmConfig);
      }

      // Update sanctions lists
      await this.legislator.updateSanctions();

      this.isInitialized = true;

      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'ISOFLUX_INITIALIZED',
        metadata: {
          hsmConfigured: !!hsmConfig,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'ISOFLUX_INIT_FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * PROCESS TRANSACTION
   * 
   * This is the main entry point. A transaction goes through:
   * 1. Rulial Parsing (Geometric Validation)
   * 2. Compliance Checking (Regulatory Surfaces)
   * 3. Reserve Verification (Entanglement)
   * 
   * If it passes all three, it proceeds. Otherwise, it is rejected instantly.
   */
  async processTransaction(
    input: string,
    messageType: ISO20022MessageType = 'pacs.008',
    userId: string,
    organizationId?: string | null
  ): Promise<{
    success: boolean;
    transactionId?: string;
    message?: PACS008;
    violations?: GeometricViolation[];
    riskScore?: number;
    processingTime: number;
    stages: {
      parsing: { success: boolean; time: number };
      compliance: { success: boolean; time: number };
      entanglement: { success: boolean; time: number };
    };
  }> {
    if (!this.isInitialized) {
      throw new Error('IsoFlux not initialized. Call initialize() first.');
    }

    const overallStartTime = Date.now();
    const stages = {
      parsing: { success: false, time: 0 },
      compliance: { success: false, time: 0 },
      entanglement: { success: false, time: 0 },
    };

    try {
      // Log transaction attempt (org scoped for B2B / Truth Ledger)
      await this.auditLogger.log({
        userId: userId || undefined,
        organizationId: organizationId || undefined,
        action: 'SECURITY_TRANSACTION_PROCESSING_STARTED',
        metadata: {
          messageType,
          inputLength: input.length,
          timestamp: new Date().toISOString(),
        },
      });

      // ===== STAGE 1: RULIAL PARSING =====
      const parseStartTime = Date.now();
      const parseResult = await this.parser.parseMessage(input, messageType);
      stages.parsing.time = Date.now() - parseStartTime;
      stages.parsing.success = parseResult.success;

      if (!parseResult.success || !parseResult.message) {
        const processingTime = Date.now() - overallStartTime;

        await this.auditLogger.log({
          userId: userId || undefined,
          organizationId: organizationId || undefined,
          action: 'SECURITY_TRANSACTION_REJECTED_PARSING',
          metadata: {
            violationCount: parseResult.violations?.length || 0,
            processingTime,
          },
        });

        return {
          success: false,
          violations: parseResult.violations,
          processingTime,
          stages,
        };
      }

      const message = parseResult.message;

      // ===== STAGE 2: COMPLIANCE CHECKING =====
      const complianceStartTime = Date.now();
      const complianceResult = await this.legislator.checkCompliance(message);
      stages.compliance.time = Date.now() - complianceStartTime;
      stages.compliance.success = complianceResult.compliant;

      if (!complianceResult.compliant) {
        const processingTime = Date.now() - overallStartTime;

        await this.auditLogger.log({
          userId: userId || undefined,
          organizationId: organizationId || undefined,
          action: 'SECURITY_TRANSACTION_REJECTED_COMPLIANCE',
          metadata: {
            messageId: message.FIToFICstmrCdtTrf.grpHdr.msgId,
            violationCount: complianceResult.violations.length,
            riskScore: complianceResult.riskScore,
            processingTime,
          },
        });

        return {
          success: false,
          violations: complianceResult.violations,
          riskScore: complianceResult.riskScore,
          processingTime,
          stages,
        };
      }

      // ===== STAGE 3: ENTANGLEMENT VERIFICATION =====
      const entanglementStartTime = Date.now();
      
      // Extract asset information from message
      const assetId = this.extractAssetId(message);
      
      if (assetId) {
        const entanglementResult = await this.ledger.verifyEntanglement(assetId);
        stages.entanglement.time = Date.now() - entanglementStartTime;
        stages.entanglement.success = entanglementResult.valid;

        if (!entanglementResult.valid || entanglementResult.locked) {
          const processingTime = Date.now() - overallStartTime;

          await this.auditLogger.log({
            userId: userId || undefined,
            organizationId: organizationId || undefined,
            action: 'SECURITY_TRANSACTION_REJECTED_ENTANGLEMENT',
            metadata: {
              messageId: message.FIToFICstmrCdtTrf.grpHdr.msgId,
              assetId,
              ratio: entanglementResult.ratio,
              locked: entanglementResult.locked,
              alertCount: entanglementResult.alerts.length,
              processingTime,
            },
          });

          // Convert entanglement failures to violations
          const entanglementViolations: GeometricViolation[] = entanglementResult.alerts.map(alert => ({
            code: `ENTANGLEMENT_${alert.type}`,
            message: `Entanglement failure: ${alert.type}`,
            path: ['asset', assetId],
            expected: `Ratio >= 1.0`,
            received: `Ratio = ${alert.currentRatio.toFixed(4)}`,
            regulatoryBasis: ['Proof of Reserve', 'State Entanglement'],
            severity: 'FATAL',
            timestamp: alert.timestamp,
          }));

          return {
            success: false,
            violations: entanglementViolations,
            processingTime,
            stages,
          };
        }
      } else {
        // No asset verification needed (non-stablecoin transaction)
        stages.entanglement.success = true;
        stages.entanglement.time = 0;
      }

      // ===== ALL STAGES PASSED =====
      const processingTime = Date.now() - overallStartTime;
      const transactionId = message.FIToFICstmrCdtTrf.grpHdr.msgId;

      await this.auditLogger.log({
        userId: userId || undefined,
        organizationId: organizationId || undefined,
        action: 'SECURITY_TRANSACTION_APPROVED',
        metadata: {
          transactionId,
          messageType,
          riskScore: complianceResult.riskScore,
          processingTime,
          stages: {
            parsing: `${stages.parsing.time}ms`,
            compliance: `${stages.compliance.time}ms`,
            entanglement: `${stages.entanglement.time}ms`,
          },
        },
      });

      // Truth Ledger: append immutable record (disclosed in ToS); fire-and-forget
      if (organizationId) {
        const ledger = new TruthLedgerService();
        const payloadDigest = TruthLedgerService.digestPayload(message);
        ledger.append({
          organizationId,
          transactionId,
          messageType,
          payloadDigest,
        }).catch(() => {});
      }

      return {
        success: true,
        transactionId,
        message,
        riskScore: complianceResult.riskScore,
        processingTime,
        stages,
      };
    } catch (error) {
      const processingTime = Date.now() - overallStartTime;

      await this.auditLogger.log({
        userId: userId || undefined,
        organizationId: organizationId || undefined,
        action: 'SECURITY_TRANSACTION_PROCESSING_ERROR',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
      });

      throw error;
    }
  }

  /**
   * VALIDATE MESSAGE
   * Standalone validation without full processing
   */
  async validateMessage(
    data: unknown
  ): Promise<{
    valid: boolean;
    message?: PACS008;
    violations?: GeometricViolation[];
  }> {
    return this.parser.collapseWaveFunction(data);
  }

  /**
   * CHECK COMPLIANCE ONLY
   * Test compliance without parsing
   */
  async checkCompliance(message: PACS008): Promise<{
    compliant: boolean;
    violations: GeometricViolation[];
    riskScore: number;
  }> {
    return this.legislator.checkCompliance(message);
  }

  /**
   * CREATE ASSET ENTANGLEMENT
   * Lock asset and reserve in shared state
   */
  async createEntanglement(
    assetId: string,
    reserveId: string,
    initialRatio: number = 1.0
  ): Promise<EntanglementState> {
    return this.ledger.createEntanglement(assetId, reserveId, initialRatio);
  }

  /**
   * VERIFY RESERVE RATIO
   * Check asset-reserve entanglement
   */
  async verifyReserveRatio(assetId: string): Promise<{
    valid: boolean;
    ratio: number;
    locked: boolean;
  }> {
    const result = await this.ledger.verifyEntanglement(assetId);
    return {
      valid: result.valid,
      ratio: result.ratio,
      locked: result.locked,
    };
  }

  /**
   * GENERATE PROOF OF RESERVES
   * Create cryptographic attestation signed by HSM
   */
  async generateProofOfReserves(assetId: string): Promise<AttestationSignature> {
    return this.ledger.generateAttestation(assetId);
  }

  /**
   * UNLOCK ASSET
   * Release frozen asset (requires admin authorization)
   */
  async unlockAsset(assetId: string, adminUserId: string): Promise<void> {
    return this.ledger.unlockAsset(assetId, adminUserId);
  }

  /**
   * GENERATE ISO 20022 XML
   * Convert validated message to XML
   */
  generateXML(message: PACS008): string {
    return this.parser.generateXML(message);
  }

  /**
   * GET SYSTEM STATUS
   * Health check for all components
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    parser: { status: string };
    legislator: { status: string; surfaceCount: number };
    ledger: { status: string; entanglementCount: number };
  }> {
    return {
      initialized: this.isInitialized,
      parser: {
        status: 'OPERATIONAL',
      },
      legislator: {
        status: 'OPERATIONAL',
        surfaceCount: this.legislator.listRegulatorySurfaces().length,
      },
      ledger: {
        status: 'OPERATIONAL',
        entanglementCount: this.ledger.listEntanglements().length,
      },
    };
  }

  /**
   * SHUTDOWN
   * Graceful shutdown of all components
   */
  async shutdown(): Promise<void> {
    await this.ledger.stopSentinel();
    
    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'ISOFLUX_SHUTDOWN',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * EXTRACT ASSET ID
   * Extract asset identifier from message (for entanglement verification)
   */
  private extractAssetId(message: PACS008): string | null {
    // In production, extract from message based on business logic
    // For now, extract from remittance information
    
    for (const txn of message.FIToFICstmrCdtTrf.cdtTrfTxInf) {
      const remittance = txn.remittanceInformation?.unstructured;
      if (remittance && remittance.length > 0) {
        const text = remittance[0].toLowerCase();
        if (text.includes('usdc')) return 'USDC';
        if (text.includes('usdt')) return 'USDT';
        if (text.includes('dai')) return 'DAI';
      }

      // Check purpose code
      if (txn.purpose?.code === 'SECU') {
        // Securities transaction - may need verification
        return null;
      }
    }

    return null;
  }
}

export default IsoFluxOrchestrator;
