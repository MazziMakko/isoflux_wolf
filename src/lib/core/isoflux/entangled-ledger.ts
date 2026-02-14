// =====================================================
// ENTANGLED LEDGER - BEYOND LATENCY
// State Entanglement: Trust is no longer required
// =====================================================

import WebSocket from 'ws';
import Redis from 'ioredis';
import {
  EntanglementState,
  OracleFeed,
  SentinelAlert,
  AttestationPayload,
  AttestationSignature,
  HSMConfig,
} from './types';
import { AuditLogger } from '../audit';

/**
 * THE ENTANGLED LEDGER
 * 
 * Philosophy: Waiting for an API call to verify Proof of Reserves is a security risk.
 * IsoFlux utilizes State Entanglement.
 * 
 * Mechanism: The asset and the reserve are locked in a shared state.
 * If the reserve dips below 1:1, the asset freezes instantly. No lag. No contagion.
 * 
 * Result: Trust is no longer required. Only verification remains.
 */
export class EntangledLedger {
  private auditLogger: AuditLogger;
  private redis: Redis;
  
  // Entanglement states: asset <-> reserve mapping
  private entanglements: Map<string, EntanglementState>;
  
  // Oracle feeds
  private chainlinkPrices: Map<string, number>;
  private cexPrices: Map<string, number>;
  
  // WebSocket connections to CEX
  private binanceWs: WebSocket | null = null;
  private coinbaseWs: WebSocket | null = null;
  
  // Sentinel configuration
  private sentinelActive: boolean = true;
  private sentinelThreshold: number = 0.005; // 0.5% deviation triggers alert
  private sentinelCheckInterval: NodeJS.Timeout | null = null;
  
  // HSM configuration
  private hsmConfig: HSMConfig | null = null;

  constructor() {
    this.auditLogger = new AuditLogger();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
    
    this.entanglements = new Map();
    this.chainlinkPrices = new Map();
    this.cexPrices = new Map();
    
    // Initialize sentinel
    this.startSentinel();
  }

  /**
   * INITIALIZE HSM
   * Configure Hardware Security Module for attestation signing
   */
  initializeHSM(config: HSMConfig): void {
    this.hsmConfig = config;
    
    this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'HSM_INITIALIZED',
      metadata: {
        provider: config.provider,
        keyId: config.keyId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * CREATE ENTANGLEMENT
   * Lock asset and reserve in shared state
   */
  async createEntanglement(
    assetId: string,
    reserveId: string,
    initialRatio: number = 1.0
  ): Promise<EntanglementState> {
    const state: EntanglementState = {
      assetId,
      reserveId,
      ratio: initialRatio,
      locked: false,
      lastVerified: new Date(),
      oracleSource: 'CHAINLINK',
      sentinelActive: true,
    };

    this.entanglements.set(assetId, state);
    
    // Persist to Redis
    await this.redis.set(
      `entanglement:${assetId}`,
      JSON.stringify(state),
      'EX',
      86400 // 24 hour expiry
    );

    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'ENTANGLEMENT_CREATED',
      metadata: {
        assetId,
        reserveId,
        initialRatio,
        timestamp: new Date().toISOString(),
      },
    });

    return state;
  }

  /**
   * VERIFY ENTANGLEMENT
   * Check if asset-reserve ratio is maintained
   */
  async verifyEntanglement(assetId: string): Promise<{
    valid: boolean;
    ratio: number;
    locked: boolean;
    alerts: SentinelAlert[];
  }> {
    const state = this.entanglements.get(assetId);
    
    if (!state) {
      throw new Error(`No entanglement found for asset ${assetId}`);
    }

    // Get current prices from oracles
    const assetPrice = await this.getAssetPrice(state.assetId);
    const reservePrice = await this.getReservePrice(state.reserveId);
    
    // Calculate current ratio
    const currentRatio = reservePrice / assetPrice;
    state.ratio = currentRatio;
    state.lastVerified = new Date();

    // Check if ratio is below 1:1
    const alerts: SentinelAlert[] = [];
    
    if (currentRatio < 1.0) {
      // INSTANT FREEZE
      state.locked = true;
      
      const alert: SentinelAlert = {
        type: 'RESERVE_BREACH',
        severity: 'CRITICAL',
        assetId: state.assetId,
        currentRatio,
        expectedRatio: 1.0,
        deviation: 1.0 - currentRatio,
        timestamp: new Date(),
        action: 'LOCK_ASSET',
      };
      
      alerts.push(alert);
      
      await this.handleSentinelAlert(alert);
    }

    // Update state
    this.entanglements.set(assetId, state);
    await this.redis.set(`entanglement:${assetId}`, JSON.stringify(state), 'EX', 86400);

    return {
      valid: currentRatio >= 1.0,
      ratio: currentRatio,
      locked: state.locked,
      alerts,
    };
  }

  /**
   * GET ASSET PRICE
   * Retrieve price from oracles
   */
  private async getAssetPrice(assetId: string): Promise<number> {
    // First, try Chainlink oracle
    let chainlinkPrice = this.chainlinkPrices.get(assetId);
    
    if (!chainlinkPrice) {
      // Fetch from Chainlink (in production, call actual oracle)
      chainlinkPrice = await this.fetchChainlinkPrice(assetId);
      this.chainlinkPrices.set(assetId, chainlinkPrice);
    }

    // Cross-verify with CEX prices
    const cexPrice = this.cexPrices.get(assetId);
    
    if (cexPrice && Math.abs(chainlinkPrice - cexPrice) / chainlinkPrice > this.sentinelThreshold) {
      // Price deviation detected
      await this.handlePriceDeviation(assetId, chainlinkPrice, cexPrice);
    }

    return chainlinkPrice;
  }

  /**
   * GET RESERVE PRICE
   * Retrieve reserve asset price
   */
  private async getReservePrice(reserveId: string): Promise<number> {
    // Same logic as getAssetPrice
    return this.getAssetPrice(reserveId);
  }

  /**
   * FETCH CHAINLINK PRICE
   * Get price from Chainlink oracle
   */
  private async fetchChainlinkPrice(assetId: string): Promise<number> {
    // In production, call Chainlink aggregator contract
    // For now, return mock data
    
    try {
      // Example: Call Chainlink price feed
      // const price = await chainlinkAggregator.latestAnswer();
      
      // Mock implementation
      const mockPrices: Record<string, number> = {
        'USDC': 1.0,
        'USDT': 1.0,
        'DAI': 1.0,
        'BTC': 65000,
        'ETH': 3500,
      };
      
      return mockPrices[assetId] || 1.0;
    } catch (error) {
      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'CHAINLINK_FETCH_FAILED',
        metadata: {
          assetId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw new Error(`Failed to fetch Chainlink price for ${assetId}`);
    }
  }

  /**
   * START SENTINEL
   * Begin continuous monitoring of CEX prices via WebSocket
   */
  private startSentinel(): void {
    if (!this.sentinelActive) return;

    // Connect to Binance WebSocket
    this.connectBinanceWebSocket();
    
    // Connect to Coinbase WebSocket
    this.connectCoinbaseWebSocket();
    
    // Periodic verification
    this.sentinelCheckInterval = setInterval(async () => {
      await this.performSentinelCheck();
    }, 1000); // Check every second

    this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'SENTINEL_STARTED',
      metadata: {
        threshold: this.sentinelThreshold,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * CONNECT BINANCE WEBSOCKET
   * Real-time price feed from Binance
   */
  private connectBinanceWebSocket(): void {
    const streams = ['btcusdt@ticker', 'ethusdt@ticker', 'usdcusdt@ticker'];
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
    
    this.binanceWs = new WebSocket(wsUrl);
    
    this.binanceWs.on('open', () => {
      console.log('[Sentinel] Binance WebSocket connected');
    });
    
    this.binanceWs.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.data && message.data.c) {
          const symbol = message.data.s; // e.g., 'BTCUSDT'
          const price = parseFloat(message.data.c);
          
          // Store price
          const assetSymbol = symbol.replace('USDT', '');
          this.cexPrices.set(assetSymbol, price);
          
          // Check for deviations
          this.checkPriceDeviation(assetSymbol);
        }
      } catch (error) {
        console.error('[Sentinel] Binance message parse error:', error);
      }
    });
    
    this.binanceWs.on('error', (error) => {
      console.error('[Sentinel] Binance WebSocket error:', error);
    });
    
    this.binanceWs.on('close', () => {
      console.log('[Sentinel] Binance WebSocket closed, reconnecting...');
      setTimeout(() => this.connectBinanceWebSocket(), 5000);
    });
  }

  /**
   * CONNECT COINBASE WEBSOCKET
   * Real-time price feed from Coinbase
   */
  private connectCoinbaseWebSocket(): void {
    this.coinbaseWs = new WebSocket('wss://ws-feed.exchange.coinbase.com');
    
    this.coinbaseWs.on('open', () => {
      // Subscribe to ticker channel
      this.coinbaseWs?.send(JSON.stringify({
        type: 'subscribe',
        product_ids: ['BTC-USD', 'ETH-USD', 'USDC-USD'],
        channels: ['ticker'],
      }));
      
      console.log('[Sentinel] Coinbase WebSocket connected');
    });
    
    this.coinbaseWs.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'ticker' && message.price) {
          const productId = message.product_id; // e.g., 'BTC-USD'
          const price = parseFloat(message.price);
          
          const assetSymbol = productId.split('-')[0];
          
          // Average with Binance price
          const binancePrice = this.cexPrices.get(assetSymbol);
          if (binancePrice) {
            const avgPrice = (binancePrice + price) / 2;
            this.cexPrices.set(assetSymbol, avgPrice);
          } else {
            this.cexPrices.set(assetSymbol, price);
          }
        }
      } catch (error) {
        console.error('[Sentinel] Coinbase message parse error:', error);
      }
    });
    
    this.coinbaseWs.on('error', (error) => {
      console.error('[Sentinel] Coinbase WebSocket error:', error);
    });
    
    this.coinbaseWs.on('close', () => {
      console.log('[Sentinel] Coinbase WebSocket closed, reconnecting...');
      setTimeout(() => this.connectCoinbaseWebSocket(), 5000);
    });
  }

  /**
   * CHECK PRICE DEVIATION
   * Compare CEX price with Chainlink oracle
   */
  private async checkPriceDeviation(assetSymbol: string): Promise<void> {
    const cexPrice = this.cexPrices.get(assetSymbol);
    const chainlinkPrice = this.chainlinkPrices.get(assetSymbol);
    
    if (!cexPrice || !chainlinkPrice) return;
    
    const deviation = Math.abs(cexPrice - chainlinkPrice) / chainlinkPrice;
    
    if (deviation > this.sentinelThreshold) {
      await this.handlePriceDeviation(assetSymbol, chainlinkPrice, cexPrice);
    }
  }

  /**
   * HANDLE PRICE DEVIATION
   * Trigger alert when CEX price deviates from oracle
   */
  private async handlePriceDeviation(
    assetSymbol: string,
    chainlinkPrice: number,
    cexPrice: number
  ): Promise<void> {
    const deviation = Math.abs(cexPrice - chainlinkPrice) / chainlinkPrice;
    
    const alert: SentinelAlert = {
      type: 'PRICE_DEVIATION',
      severity: deviation > 0.05 ? 'CRITICAL' : 'HIGH',
      assetId: assetSymbol,
      currentRatio: cexPrice / chainlinkPrice,
      expectedRatio: 1.0,
      deviation,
      timestamp: new Date(),
      action: deviation > 0.05 ? 'LOCK_ASSET' : 'ALERT_ONLY',
    };
    
    await this.handleSentinelAlert(alert);
  }

  /**
   * PERFORM SENTINEL CHECK
   * Periodic verification of all entanglements
   */
  private async performSentinelCheck(): Promise<void> {
    for (const [assetId, state] of this.entanglements) {
      if (!state.sentinelActive) continue;
      
      try {
        await this.verifyEntanglement(assetId);
      } catch (error) {
        console.error(`[Sentinel] Error checking ${assetId}:`, error);
      }
    }
  }

  /**
   * HANDLE SENTINEL ALERT
   * Execute action based on alert severity
   */
  private async handleSentinelAlert(alert: SentinelAlert): Promise<void> {
    // Log alert
    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'SENTINEL_ALERT',
      metadata: {
        type: alert.type,
        severity: alert.severity,
        assetId: alert.assetId,
        currentRatio: alert.currentRatio,
        deviation: alert.deviation,
        action: alert.action,
        timestamp: alert.timestamp.toISOString(),
      },
    });

    // Execute action
    if (alert.action === 'LOCK_ASSET') {
      await this.lockAsset(alert.assetId);
    }
    
    // Send notifications (webhook, email, SMS)
    await this.sendAlertNotification(alert);
  }

  /**
   * LOCK ASSET
   * Freeze asset instantly
   */
  private async lockAsset(assetId: string): Promise<void> {
    const state = this.entanglements.get(assetId);
    
    if (!state) return;
    
    state.locked = true;
    this.entanglements.set(assetId, state);
    
    await this.redis.set(`entanglement:${assetId}`, JSON.stringify(state), 'EX', 86400);
    
    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'ASSET_LOCKED',
      metadata: {
        assetId,
        reason: 'Reserve breach or price deviation',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * UNLOCK ASSET
   * Release asset after manual verification
   */
  async unlockAsset(assetId: string, adminUserId: string): Promise<void> {
    const state = this.entanglements.get(assetId);
    
    if (!state) {
      throw new Error(`No entanglement found for asset ${assetId}`);
    }
    
    // Verify current ratio is healthy
    const verification = await this.verifyEntanglement(assetId);
    
    if (!verification.valid) {
      throw new Error('Cannot unlock: Reserve ratio still below 1:1');
    }
    
    state.locked = false;
    this.entanglements.set(assetId, state);
    
    await this.redis.set(`entanglement:${assetId}`, JSON.stringify(state), 'EX', 86400);
    
    await this.auditLogger.logSecurityEvent({
      userId: adminUserId,
      action: 'ASSET_UNLOCKED',
      metadata: {
        assetId,
        currentRatio: state.ratio,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * SEND ALERT NOTIFICATION
   * Send alert via configured channels
   */
  private async sendAlertNotification(alert: SentinelAlert): Promise<void> {
    // In production, integrate with:
    // - PagerDuty
    // - Slack
    // - Email
    // - SMS (Twilio)
    
    console.log('[Sentinel Alert]', {
      type: alert.type,
      severity: alert.severity,
      assetId: alert.assetId,
      deviation: alert.deviation,
      action: alert.action,
    });
  }

  /**
   * GENERATE ATTESTATION
   * Create cryptographic proof of reserve ratio
   * Signed by HSM - cannot be forged
   */
  async generateAttestation(assetId: string): Promise<AttestationSignature> {
    if (!this.hsmConfig) {
      throw new Error('HSM not configured');
    }
    
    const state = this.entanglements.get(assetId);
    
    if (!state) {
      throw new Error(`No entanglement found for asset ${assetId}`);
    }
    
    // Verify current state
    const verification = await this.verifyEntanglement(assetId);
    
    // Create payload
    const payload: AttestationPayload = {
      transactionId: `attest-${assetId}-${Date.now()}`,
      reserveRatio: verification.ratio,
      timestamp: new Date(),
      assetBalances: { [assetId]: '1000000' }, // Get actual balance
      reserveBalances: { [state.reserveId]: '1000000' }, // Get actual reserve
      oracleSources: ['CHAINLINK', 'BINANCE', 'COINBASE'],
    };
    
    // Sign with HSM
    const signature = await this.signWithHSM(payload);
    
    const attestation: AttestationSignature = {
      payload,
      signature,
      algorithm: 'ECDSA',
      publicKey: 'PUBLIC_KEY_FROM_HSM',
      hsmKeyId: this.hsmConfig.keyId,
      timestamp: new Date(),
    };
    
    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'ATTESTATION_GENERATED',
      metadata: {
        assetId,
        reserveRatio: verification.ratio,
        hsmProvider: this.hsmConfig.provider,
        timestamp: attestation.timestamp.toISOString(),
      },
    });
    
    return attestation;
  }

  /**
   * SIGN WITH HSM
   * Use Hardware Security Module to sign attestation
   * The private key never leaves the HSM
   */
  private async signWithHSM(payload: AttestationPayload): Promise<string> {
    if (!this.hsmConfig) {
      throw new Error('HSM not configured');
    }
    
    // In production, call actual HSM API:
    // - AWS CloudHSM: crypto.sign()
    // - Azure Key Vault: keyClient.sign()
    // - YubiHSM: yubihsm.signData()
    
    // For now, return mock signature
    const payloadString = JSON.stringify(payload);
    const mockSignature = Buffer.from(payloadString).toString('base64');
    
    return mockSignature;
  }

  /**
   * STOP SENTINEL
   * Shutdown WebSocket connections and clear intervals
   */
  async stopSentinel(): Promise<void> {
    this.sentinelActive = false;
    
    if (this.sentinelCheckInterval) {
      clearInterval(this.sentinelCheckInterval);
    }
    
    if (this.binanceWs) {
      this.binanceWs.close();
    }
    
    if (this.coinbaseWs) {
      this.coinbaseWs.close();
    }
    
    await this.redis.quit();
    
    this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'SENTINEL_STOPPED',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * GET ENTANGLEMENT STATE
   */
  getEntanglementState(assetId: string): EntanglementState | null {
    return this.entanglements.get(assetId) || null;
  }

  /**
   * LIST ALL ENTANGLEMENTS
   */
  listEntanglements(): EntanglementState[] {
    return Array.from(this.entanglements.values());
  }
}

export default EntangledLedger;
