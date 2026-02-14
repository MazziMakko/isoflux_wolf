// =====================================================
// ISOFLUX - TYPE DEFINITIONS
// The Geometry of Value: Strict Type Theory
// =====================================================

import { z } from 'zod';

/**
 * ISO 20022 Message Types
 * Each message type represents a geometric boundary in compliance space
 */
export type ISO20022MessageType = 
  | 'pacs.008' // Customer Credit Transfer
  | 'pacs.009' // Financial Institution Credit Transfer
  | 'camt.053' // Bank to Customer Statement
  | 'camt.054' // Bank to Customer Debit/Credit Notification
  | 'pain.001' // Customer Credit Transfer Initiation
  | 'pain.002'; // Customer Payment Status Report

/**
 * Rulial Parser States
 * Finite State Machine for deterministic message processing
 */
export type ParserState =
  | 'IDLE'                    // Initial state, awaiting input
  | 'TOKENIZING'              // Breaking input into structural components
  | 'BUILDING_TREE'           // Constructing syntax tree
  | 'VALIDATING_GEOMETRY'     // Verifying structural integrity
  | 'CHECKING_COMPLIANCE'     // Regulatory constraint validation
  | 'COMPLETED'               // Successfully validated
  | 'REJECTED';               // Geometric violation detected

/**
 * Geometric Violation - Compliance failure descriptor
 */
export interface GeometricViolation {
  code: string;
  message: string;
  path: string[];
  expected: string;
  received: string;
  regulatoryBasis: string[];
  severity: 'FATAL' | 'ERROR' | 'WARNING';
  timestamp: Date;
}

/**
 * State Entanglement - Reserve lock status
 */
export interface EntanglementState {
  assetId: string;
  reserveId: string;
  ratio: number;
  locked: boolean;
  lastVerified: Date;
  oracleSource: string;
  sentinelActive: boolean;
}

/**
 * Regulatory Surface - Geometric boundary in compliance space
 */
export interface RegulatorySurface {
  jurisdiction: string;
  regulatorId: string;
  constraints: RegulatoryConstraint[];
  effectiveDate: Date;
  expiryDate: Date | null;
}

export interface RegulatoryConstraint {
  type: 'SANCTION' | 'LIMIT' | 'PROHIBITED' | 'REQUIRED';
  dimension: string; // e.g., 'counterparty', 'amount', 'currency', 'purpose'
  operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN_SET';
  value: any;
  vectorRepresentation: number[]; // Geometric encoding
}

// =====================================================
// ISO 20022 PACS.008 SCHEMA (Customer Credit Transfer)
// The "Platonic Form" of a valid payment message
// =====================================================

/**
 * Party Identification
 */
export const PartyIdentificationSchema = z.object({
  name: z.string().min(1).max(140),
  postalAddress: z.object({
    streetName: z.string().optional(),
    buildingNumber: z.string().optional(),
    postCode: z.string().optional(),
    townName: z.string().optional(),
    country: z.string().length(2), // ISO 3166-1 alpha-2
  }).optional(),
  identification: z.object({
    organisationId: z.object({
      BICOrBEI: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).optional(),
      other: z.object({
        id: z.string(),
        schemeName: z.string(),
      }).optional(),
    }).optional(),
    privateId: z.object({
      dateAndPlaceOfBirth: z.object({
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        cityOfBirth: z.string(),
        countryOfBirth: z.string().length(2),
      }).optional(),
      other: z.object({
        id: z.string(),
        schemeName: z.string(),
      }).optional(),
    }).optional(),
  }).optional(),
});

/**
 * Account Identification
 */
export const AccountIdentificationSchema = z.object({
  iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/).optional(),
  other: z.object({
    id: z.string(),
    schemeName: z.string(),
  }).optional(),
});

/**
 * Financial Institution Identification
 */
export const FinancialInstitutionSchema = z.object({
  BIC: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/),
  clearingSystemMemberId: z.object({
    memberId: z.string(),
    clearingSystemId: z.string(),
  }).optional(),
  name: z.string().optional(),
  postalAddress: PartyIdentificationSchema.shape.postalAddress.optional(),
});

/**
 * Amount - The quantum of value transfer
 */
export const AmountSchema = z.object({
  currency: z.string().length(3), // ISO 4217
  amount: z.string().regex(/^\d{1,18}(\.\d{1,5})?$/), // Up to 18 digits, 5 decimal places
});

/**
 * Payment Identification
 */
export const PaymentIdentificationSchema = z.object({
  instructionId: z.string().max(35),
  endToEndId: z.string().max(35),
  transactionId: z.string().max(35).optional(),
  UETR: z.string().uuid().optional(), // Unique End-to-end Transaction Reference
});

/**
 * Remittance Information
 */
export const RemittanceInformationSchema = z.object({
  unstructured: z.array(z.string().max(140)).max(10).optional(),
  structured: z.array(z.object({
    referredDocumentInformation: z.object({
      type: z.string(),
      number: z.string(),
      relatedDate: z.string().optional(),
    }).optional(),
    referredDocumentAmount: AmountSchema.optional(),
    creditorReferenceInformation: z.object({
      type: z.string(),
      reference: z.string(),
    }).optional(),
  })).optional(),
});

/**
 * Credit Transfer Transaction (pacs.008 Core)
 * This is the "Geometric Invariant" - any deviation is non-compliant
 */
export const CreditTransferTransactionSchema = z.object({
  paymentId: PaymentIdentificationSchema,
  interbankSettlementAmount: AmountSchema,
  interbankSettlementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  chargeBearer: z.enum(['DEBT', 'CRED', 'SHAR', 'SLEV']), // OUR, BEN, SHA, SLEV
  debtor: PartyIdentificationSchema,
  debtorAccount: z.object({
    id: AccountIdentificationSchema,
    currency: z.string().length(3).optional(),
  }),
  debtorAgent: FinancialInstitutionSchema,
  creditorAgent: FinancialInstitutionSchema,
  creditor: PartyIdentificationSchema,
  creditorAccount: z.object({
    id: AccountIdentificationSchema,
    currency: z.string().length(3).optional(),
  }),
  remittanceInformation: RemittanceInformationSchema.optional(),
  purpose: z.object({
    code: z.string().length(4).optional(), // ISO 20022 ExternalPurpose1Code
    proprietary: z.string().optional(),
  }).optional(),
  regulatoryReporting: z.array(z.object({
    debitCreditReportingIndicator: z.enum(['CRED', 'DEBT']),
    authority: z.object({
      name: z.string(),
      country: z.string().length(2),
    }),
    details: z.array(z.object({
      type: z.string(),
      information: z.string(),
    })),
  })).optional(),
});

/**
 * PACS.008 Full Message Schema
 */
export const PACS008Schema = z.object({
  FIToFICstmrCdtTrf: z.object({
    grpHdr: z.object({
      msgId: z.string().max(35),
      creDtTm: z.string().datetime(),
      nbOfTxs: z.string().regex(/^\d{1,15}$/),
      settlementInformation: z.object({
        settlementMethod: z.enum(['INDA', 'INGA', 'COVE', 'CLRG']),
        clearingSystem: z.object({
          code: z.string().optional(),
          proprietary: z.string().optional(),
        }).optional(),
      }),
      instructingAgent: FinancialInstitutionSchema.optional(),
      instructedAgent: FinancialInstitutionSchema.optional(),
    }),
    cdtTrfTxInf: z.array(CreditTransferTransactionSchema),
  }),
});

export type PACS008 = z.infer<typeof PACS008Schema>;
export type CreditTransferTransaction = z.infer<typeof CreditTransferTransactionSchema>;
export type PartyIdentification = z.infer<typeof PartyIdentificationSchema>;
export type FinancialInstitution = z.infer<typeof FinancialInstitutionSchema>;
export type Amount = z.infer<typeof AmountSchema>;

// =====================================================
// HARDWARE SECURITY MODULE (HSM) TYPES
// =====================================================

export interface HSMConfig {
  provider: 'AWS_CLOUDHSM' | 'AZURE_KEY_VAULT' | 'YUBIHSM' | 'THALES';
  endpoint: string;
  keyId: string;
  region?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    tenantId?: string;
    clientId?: string;
  };
}

export interface AttestationPayload {
  transactionId: string;
  reserveRatio: number;
  timestamp: Date;
  assetBalances: Record<string, string>;
  reserveBalances: Record<string, string>;
  oracleSources: string[];
}

export interface AttestationSignature {
  payload: AttestationPayload;
  signature: string;
  algorithm: 'ECDSA' | 'RSA' | 'EdDSA';
  publicKey: string;
  hsmKeyId: string;
  timestamp: Date;
}

// =====================================================
// mTLS (MUTUAL TLS) CONFIGURATION
// =====================================================

export interface MTLSConfig {
  serverCert: string;         // Path to server certificate
  serverKey: string;          // Path to server private key
  clientCert: string;         // Path to client certificate
  clientKey: string;          // Path to client private key
  caCert: string;             // Path to CA certificate
  requireClientCert: boolean; // Enforce mutual authentication
  allowedFingerprints: string[]; // Whitelist of client cert fingerprints
}

// =====================================================
// ORACLE SENTINEL TYPES
// =====================================================

export interface OracleFeed {
  source: 'CHAINLINK' | 'CEX_WEBSOCKET' | 'AGGREGATED';
  assetSymbol: string;
  price: number;
  timestamp: Date;
  confidence: number;
  blockNumber?: number;
}

export interface SentinelAlert {
  type: 'DEPEG' | 'RESERVE_BREACH' | 'ORACLE_STALE' | 'PRICE_DEVIATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assetId: string;
  currentRatio: number;
  expectedRatio: number;
  deviation: number;
  timestamp: Date;
  action: 'LOCK_ASSET' | 'ALERT_ONLY' | 'HALT_SYSTEM';
}

// =====================================================
// PARSER CONTEXT
// =====================================================

export interface ParserContext {
  state: ParserState;
  input: string;
  messageType: ISO20022MessageType | null;
  tokens: any[];
  syntaxTree: any;
  validationErrors: GeometricViolation[];
  parsedMessage: PACS008 | null;
  stateHistory: ParserState[];
  startTime: Date;
  endTime: Date | null;
}
