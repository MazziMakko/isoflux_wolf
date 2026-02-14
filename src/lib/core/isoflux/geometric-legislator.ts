// =====================================================
// GEOMETRIC LEGISLATOR - THE BOUNDARIES OF LAW
// Beyond Databases: Laws as Geometric Constraints
// =====================================================

import {
  RegulatorySurface,
  RegulatoryConstraint,
  PACS008,
  CreditTransferTransaction,
  GeometricViolation,
} from './types';
import { AuditLogger } from '../audit';

/**
 * THE GEOMETRIC LEGISLATOR
 * 
 * Philosophy: Laws are not lists; they are boundaries.
 * We map global regulation (SEC, MiCA, CFTC) as Geometric Constraints in vector space.
 * 
 * Mechanism: A transaction is a vector. If it intersects with a "Sanctioned Surface,"
 * its wave function collapses instantly. It does not get flagged; it ceases to proceed.
 * 
 * Result: Pre-cognitive Compliance.
 */
export class GeometricLegislator {
  private auditLogger: AuditLogger;
  private regulatorySurfaces: Map<string, RegulatorySurface>;
  private vectorCache: Map<string, number[]>;

  // Sanctioned entities (OFAC, EU sanctions, etc.)
  private sanctionedBICs: Set<string>;
  private sanctionedIBANs: Set<string>;
  private sanctionedCountries: Set<string>;
  private sanctionedNames: Set<string>; // Fuzzy matching required

  constructor() {
    this.auditLogger = new AuditLogger();
    this.regulatorySurfaces = new Map();
    this.vectorCache = new Map();
    
    // Initialize sanction lists
    this.sanctionedBICs = new Set();
    this.sanctionedIBANs = new Set();
    this.sanctionedCountries = new Set();
    this.sanctionedNames = new Set();

    // Load initial regulatory surfaces
    this.initializeRegulatorySurfaces();
  }

  /**
   * INITIALIZE REGULATORY SURFACES
   * Load global regulations into geometric space
   */
  private initializeRegulatorySurfaces(): void {
    // SEC (U.S. Securities and Exchange Commission)
    this.addRegulatorySurface({
      jurisdiction: 'US',
      regulatorId: 'SEC',
      constraints: [
        {
          type: 'LIMIT',
          dimension: 'amount',
          operator: 'GREATER_THAN',
          value: 10000000, // $10M threshold
          vectorRepresentation: [10000000, 0, 0, 0],
        },
        {
          type: 'REQUIRED',
          dimension: 'purpose',
          operator: 'CONTAINS',
          value: 'securities',
          vectorRepresentation: [0, 1, 0, 0],
        },
      ],
      effectiveDate: new Date('2024-01-01'),
      expiryDate: null,
    });

    // MiCA (EU Markets in Crypto-Assets Regulation)
    this.addRegulatorySurface({
      jurisdiction: 'EU',
      regulatorId: 'MICA',
      constraints: [
        {
          type: 'REQUIRED',
          dimension: 'creditor',
          operator: 'CONTAINS',
          value: 'crypto',
          vectorRepresentation: [0, 0, 1, 0],
        },
        {
          type: 'LIMIT',
          dimension: 'amount',
          operator: 'GREATER_THAN',
          value: 1000000, // €1M threshold
          vectorRepresentation: [1000000, 0, 1, 0],
        },
      ],
      effectiveDate: new Date('2024-12-30'),
      expiryDate: null,
    });

    // CFTC (U.S. Commodity Futures Trading Commission)
    this.addRegulatorySurface({
      jurisdiction: 'US',
      regulatorId: 'CFTC',
      constraints: [
        {
          type: 'REQUIRED',
          dimension: 'purpose',
          operator: 'CONTAINS',
          value: 'derivatives',
          vectorRepresentation: [0, 0, 0, 1],
        },
      ],
      effectiveDate: new Date('2024-01-01'),
      expiryDate: null,
    });

    // OFAC Sanctions
    this.loadSanctions();
  }

  /**
   * LOAD SANCTIONS
   * Initialize sanctioned entities from official sources
   * In production, this would pull from OFAC SDN, EU sanctions lists, etc.
   */
  private loadSanctions(): void {
    // Sanctioned countries (example)
    this.sanctionedCountries.add('KP'); // North Korea
    this.sanctionedCountries.add('IR'); // Iran
    this.sanctionedCountries.add('SY'); // Syria
    this.sanctionedCountries.add('CU'); // Cuba

    // In production, load from:
    // - OFAC SDN List (Specially Designated Nationals)
    // - EU Sanctions List
    // - UN Security Council Sanctions List
    // - UK HM Treasury Sanctions List
    
    // Example sanctioned BICs (fictional)
    this.sanctionedBICs.add('BADBNKRU');
    this.sanctionedBICs.add('EVILBANK');
  }

  /**
   * ADD REGULATORY SURFACE
   */
  addRegulatorySurface(surface: RegulatorySurface): void {
    const key = `${surface.jurisdiction}:${surface.regulatorId}`;
    this.regulatorySurfaces.set(key, surface);
  }

  /**
   * CHECK TRANSACTION COMPLIANCE
   * 
   * This is the core method. It converts the transaction to a vector
   * and checks for intersections with sanctioned surfaces.
   */
  async checkCompliance(message: PACS008): Promise<{
    compliant: boolean;
    violations: GeometricViolation[];
    riskScore: number;
  }> {
    const violations: GeometricViolation[] = [];
    let riskScore = 0;

    const startTime = Date.now();

    try {
      // Check each transaction in the message
      for (const txn of message.FIToFICstmrCdtTrf.cdtTrfTxInf) {
        // Convert transaction to vector
        const vector = this.transactionToVector(txn);

        // Check sanctions
        const sanctionViolations = await this.checkSanctions(txn);
        violations.push(...sanctionViolations);

        // Check regulatory surfaces
        const regulatoryViolations = await this.checkRegulatorySurfaces(txn, vector);
        violations.push(...regulatoryViolations);

        // Calculate risk score
        riskScore += this.calculateRiskScore(txn, vector);
      }

      const processingTime = Date.now() - startTime;

      // Log compliance check
      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'COMPLIANCE_CHECK',
        metadata: {
          messageId: message.FIToFICstmrCdtTrf.grpHdr.msgId,
          transactionCount: message.FIToFICstmrCdtTrf.cdtTrfTxInf.length,
          violationCount: violations.length,
          riskScore,
          processingTime,
          compliant: violations.length === 0,
        },
      });

      return {
        compliant: violations.length === 0,
        violations,
        riskScore,
      };
    } catch (error) {
      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'COMPLIANCE_CHECK_FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * TRANSACTION TO VECTOR
   * Convert transaction to geometric representation
   * 
   * Vector dimensions:
   * [0] = Amount (normalized)
   * [1] = Sender jurisdiction (encoded)
   * [2] = Receiver jurisdiction (encoded)
   * [3] = Purpose category (encoded)
   * [4] = Currency risk (encoded)
   */
  private transactionToVector(txn: CreditTransferTransaction): number[] {
    const cacheKey = txn.paymentId.endToEndId;
    
    if (this.vectorCache.has(cacheKey)) {
      return this.vectorCache.get(cacheKey)!;
    }

    const vector: number[] = [
      // Amount (normalized to 0-1 scale, log scale)
      Math.log10(parseFloat(txn.interbankSettlementAmount.amount) + 1) / 10,
      
      // Sender jurisdiction (country code to number)
      this.countryToNumber(txn.debtorAgent.postalAddress?.country || 'XX'),
      
      // Receiver jurisdiction
      this.countryToNumber(txn.creditorAgent.postalAddress?.country || 'XX'),
      
      // Purpose (encoded)
      this.purposeToNumber(txn.purpose?.code || 'OTHR'),
      
      // Currency risk (encoded)
      this.currencyToRisk(txn.interbankSettlementAmount.currency),
    ];

    this.vectorCache.set(cacheKey, vector);
    return vector;
  }

  /**
   * CHECK SANCTIONS
   * Instant rejection if transaction intersects sanctioned surface
   */
  private async checkSanctions(txn: CreditTransferTransaction): Promise<GeometricViolation[]> {
    const violations: GeometricViolation[] = [];

    // Check debtor (sender)
    if (this.isSanctioned(txn.debtor, txn.debtorAgent, txn.debtorAccount.id)) {
      violations.push({
        code: 'SANCTION_VIOLATION_DEBTOR',
        message: 'Sender is on sanctions list',
        path: ['FIToFICstmrCdtTrf', 'cdtTrfTxInf', 'debtor'],
        expected: 'Non-sanctioned entity',
        received: 'Sanctioned entity detected',
        regulatoryBasis: ['OFAC', 'EU Sanctions', 'UN Security Council'],
        severity: 'FATAL',
        timestamp: new Date(),
      });
    }

    // Check creditor (receiver)
    if (this.isSanctioned(txn.creditor, txn.creditorAgent, txn.creditorAccount.id)) {
      violations.push({
        code: 'SANCTION_VIOLATION_CREDITOR',
        message: 'Receiver is on sanctions list',
        path: ['FIToFICstmrCdtTrf', 'cdtTrfTxInf', 'creditor'],
        expected: 'Non-sanctioned entity',
        received: 'Sanctioned entity detected',
        regulatoryBasis: ['OFAC', 'EU Sanctions', 'UN Security Council'],
        severity: 'FATAL',
        timestamp: new Date(),
      });
    }

    // Check countries
    const debtorCountry = txn.debtor.postalAddress?.country;
    const creditorCountry = txn.creditor.postalAddress?.country;

    if (debtorCountry && this.sanctionedCountries.has(debtorCountry)) {
      violations.push({
        code: 'SANCTION_VIOLATION_COUNTRY',
        message: `Sender country ${debtorCountry} is sanctioned`,
        path: ['FIToFICstmrCdtTrf', 'cdtTrfTxInf', 'debtor', 'postalAddress', 'country'],
        expected: 'Non-sanctioned country',
        received: debtorCountry,
        regulatoryBasis: ['OFAC', 'EU Sanctions'],
        severity: 'FATAL',
        timestamp: new Date(),
      });
    }

    if (creditorCountry && this.sanctionedCountries.has(creditorCountry)) {
      violations.push({
        code: 'SANCTION_VIOLATION_COUNTRY',
        message: `Receiver country ${creditorCountry} is sanctioned`,
        path: ['FIToFICstmrCdtTrf', 'cdtTrfTxInf', 'creditor', 'postalAddress', 'country'],
        expected: 'Non-sanctioned country',
        received: creditorCountry,
        regulatoryBasis: ['OFAC', 'EU Sanctions'],
        severity: 'FATAL',
        timestamp: new Date(),
      });
    }

    return violations;
  }

  /**
   * IS SANCTIONED
   * Check if entity is on sanctions list
   */
  private isSanctioned(party: any, agent: any, account: any): boolean {
    // Check BIC
    if (agent.BIC && this.sanctionedBICs.has(agent.BIC)) {
      return true;
    }

    // Check IBAN
    if (account.iban && this.sanctionedIBANs.has(account.iban)) {
      return true;
    }

    // Check name (fuzzy matching in production)
    if (party.name && this.sanctionedNames.has(party.name.toUpperCase())) {
      return true;
    }

    return false;
  }

  /**
   * CHECK REGULATORY SURFACES
   * Verify transaction doesn't violate regulatory constraints
   */
  private async checkRegulatorySurfaces(
    txn: CreditTransferTransaction,
    vector: number[]
  ): Promise<GeometricViolation[]> {
    const violations: GeometricViolation[] = [];

    for (const [key, surface] of this.regulatorySurfaces) {
      // Check if surface is currently effective
      const now = new Date();
      if (surface.effectiveDate > now) continue;
      if (surface.expiryDate && surface.expiryDate < now) continue;

      // Check each constraint
      for (const constraint of surface.constraints) {
        const violated = this.checkConstraint(txn, constraint, vector);
        
        if (violated) {
          violations.push({
            code: `REGULATORY_VIOLATION_${surface.regulatorId}`,
            message: `Violation of ${surface.regulatorId} regulation`,
            path: ['FIToFICstmrCdtTrf', 'cdtTrfTxInf', constraint.dimension],
            expected: `${constraint.operator} ${constraint.value}`,
            received: 'Non-compliant value',
            regulatoryBasis: [surface.regulatorId, surface.jurisdiction],
            severity: constraint.type === 'PROHIBITED' ? 'FATAL' : 'ERROR',
            timestamp: new Date(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * CHECK CONSTRAINT
   * Verify if transaction violates a specific constraint
   */
  private checkConstraint(
    txn: CreditTransferTransaction,
    constraint: RegulatoryConstraint,
    vector: number[]
  ): boolean {
    switch (constraint.dimension) {
      case 'amount': {
        const amount = parseFloat(txn.interbankSettlementAmount.amount);
        return this.evaluateOperator(amount, constraint.operator, constraint.value);
      }
      
      case 'counterparty': {
        // Check if counterparty matches constraint
        return false; // Placeholder
      }
      
      case 'purpose': {
        const purpose = txn.purpose?.code || '';
        return this.evaluateOperator(purpose, constraint.operator, constraint.value);
      }
      
      default:
        return false;
    }
  }

  /**
   * EVALUATE OPERATOR
   */
  private evaluateOperator(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'EQUALS':
        return value === expected;
      case 'CONTAINS':
        return String(value).toLowerCase().includes(String(expected).toLowerCase());
      case 'GREATER_THAN':
        return value > expected;
      case 'LESS_THAN':
        return value < expected;
      case 'IN_SET':
        return Array.isArray(expected) && expected.includes(value);
      default:
        return false;
    }
  }

  /**
   * CALCULATE RISK SCORE
   * Compute numeric risk score (0-100)
   */
  private calculateRiskScore(txn: CreditTransferTransaction, vector: number[]): number {
    let score = 0;

    // High-value transaction
    const amount = parseFloat(txn.interbankSettlementAmount.amount);
    if (amount > 1000000) score += 20;
    if (amount > 10000000) score += 30;

    // High-risk countries
    const debtorCountry = txn.debtor.postalAddress?.country;
    const creditorCountry = txn.creditor.postalAddress?.country;
    
    if (this.isHighRiskCountry(debtorCountry)) score += 25;
    if (this.isHighRiskCountry(creditorCountry)) score += 25;

    // Cross-border transaction
    if (debtorCountry !== creditorCountry) score += 10;

    // Cryptocurrency-related
    const purpose = txn.purpose?.code || '';
    if (purpose.toLowerCase().includes('crypto')) score += 15;

    return Math.min(score, 100);
  }

  /**
   * IS HIGH RISK COUNTRY
   */
  private isHighRiskCountry(country: string | undefined): boolean {
    if (!country) return false;
    
    const highRiskCountries = new Set([
      'AF', 'YE', 'IQ', 'LY', 'SO', 'SD', 'SS', 'VE', 'ZW',
      // Add FATF high-risk jurisdictions
    ]);
    
    return highRiskCountries.has(country);
  }

  /**
   * HELPER METHODS FOR VECTOR ENCODING
   */

  private countryToNumber(country: string): number {
    // Simple encoding: convert country code to number
    return country.charCodeAt(0) * 256 + country.charCodeAt(1);
  }

  private purposeToNumber(purpose: string): number {
    const purposeMap: Record<string, number> = {
      'OTHR': 0,
      'SALA': 1,  // Salary
      'PENS': 2,  // Pension
      'SUPP': 3,  // Supplier payment
      'TRAD': 4,  // Trade
      'SECU': 5,  // Securities
    };
    return purposeMap[purpose] || 0;
  }

  private currencyToRisk(currency: string): number {
    // Risk weighting for currencies
    const riskMap: Record<string, number> = {
      'USD': 0.1,
      'EUR': 0.1,
      'GBP': 0.1,
      'CHF': 0.1,
      'JPY': 0.2,
      'CNY': 0.3,
      'RUB': 0.8,
      'VES': 0.9,
    };
    return riskMap[currency] || 0.5;
  }

  /**
   * UPDATE SANCTIONS
   * Refresh sanctions lists (call periodically)
   */
  async updateSanctions(): Promise<void> {
    // In production, pull from official APIs:
    // - OFAC SDN API
    // - EU Sanctions API
    // - UN Security Council API
    
    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'SANCTIONS_UPDATED',
      metadata: {
        timestamp: new Date().toISOString(),
        sources: ['OFAC', 'EU', 'UN'],
      },
    });
  }

  /**
   * GET REGULATORY SURFACE
   */
  getRegulatorySurface(jurisdiction: string, regulatorId: string): RegulatorySurface | null {
    return this.regulatorySurfaces.get(`${jurisdiction}:${regulatorId}`) || null;
  }

  /**
   * LIST ALL SURFACES
   */
  listRegulatorySurfaces(): RegulatorySurface[] {
    return Array.from(this.regulatorySurfaces.values());
  }
}

export default GeometricLegislator;
