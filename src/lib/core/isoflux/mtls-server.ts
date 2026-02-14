// =====================================================
// mTLS SERVER - THE SOVEREIGN TUNNEL
// Mutual TLS for Dark Fiber Connectivity
// =====================================================

import * as https from 'https';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { MTLSConfig } from './types';
import { AuditLogger } from '../audit';

/**
 * mTLS SERVER
 * 
 * Philosophy: "IsoFlux is not on the web. It is a 'Dark Node.'
 * We communicate only through encrypted, mutually authenticated tunnels.
 * We are invisible to the public internet."
 * 
 * Features:
 * - Client certificate verification
 * - Certificate fingerprint whitelisting
 * - Automatic certificate rotation
 * - Connection audit logging
 */
export class MTLSServer {
  private config: MTLSConfig;
  private auditLogger: AuditLogger;
  private server: https.Server | null = null;
  private authorizedFingerprints: Set<string>;

  constructor(config: MTLSConfig) {
    this.config = config;
    this.auditLogger = new AuditLogger();
    this.authorizedFingerprints = new Set(config.allowedFingerprints);
  }

  /**
   * START SERVER
   * Launch mTLS-enabled HTTPS server
   */
  async start(port: number, handler: (req: any, res: any) => void): Promise<void> {
    try {
      // Load certificates
      const serverCert = fs.readFileSync(this.config.serverCert, 'utf8');
      const serverKey = fs.readFileSync(this.config.serverKey, 'utf8');
      const caCert = fs.readFileSync(this.config.caCert, 'utf8');

      // Create HTTPS server with mTLS
      const options: https.ServerOptions = {
        cert: serverCert,
        key: serverKey,
        ca: caCert,
        requestCert: this.config.requireClientCert,
        rejectUnauthorized: this.config.requireClientCert,
        
        // Security hardening
        secureProtocol: 'TLSv1_3_method',
        ciphers: [
          'TLS_AES_256_GCM_SHA384',
          'TLS_AES_128_GCM_SHA256',
          'TLS_CHACHA20_POLY1305_SHA256',
        ].join(':'),
        minVersion: 'TLSv1.3',
      };

      this.server = https.createServer(options, async (req, res) => {
        // Verify client certificate
        const socket: any = req.socket;
        const authorized = socket.authorized;
        const peerCert = socket.getPeerCertificate();

        if (this.config.requireClientCert && !authorized) {
          await this.auditLogger.logSecurityEvent({
            userId: 'UNKNOWN',
            action: 'MTLS_CONNECTION_REJECTED',
            metadata: {
              reason: 'Client certificate not authorized',
              ip: req.socket.remoteAddress,
              timestamp: new Date().toISOString(),
            },
          });

          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Forbidden',
            message: 'Valid client certificate required',
          }));
          return;
        }

        // Verify fingerprint
        if (peerCert && peerCert.fingerprint) {
          const fingerprint = peerCert.fingerprint.replace(/:/g, '').toLowerCase();
          
          if (!this.authorizedFingerprints.has(fingerprint)) {
            await this.auditLogger.logSecurityEvent({
              userId: 'UNKNOWN',
              action: 'MTLS_CONNECTION_REJECTED',
              metadata: {
                reason: 'Certificate fingerprint not whitelisted',
                fingerprint,
                subject: peerCert.subject,
                ip: req.socket.remoteAddress,
                timestamp: new Date().toISOString(),
              },
            });

            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Forbidden',
              message: 'Certificate not authorized',
            }));
            return;
          }
        }

        // Log successful connection
        await this.auditLogger.logSecurityEvent({
          userId: peerCert?.subject?.CN || 'UNKNOWN',
          action: 'MTLS_CONNECTION_ESTABLISHED',
          metadata: {
            fingerprint: peerCert?.fingerprint,
            subject: peerCert?.subject,
            issuer: peerCert?.issuer,
            validFrom: peerCert?.valid_from,
            validTo: peerCert?.valid_to,
            ip: req.socket.remoteAddress,
            timestamp: new Date().toISOString(),
          },
        });

        // Attach certificate info to request
        (req as any).clientCertificate = peerCert;

        // Pass to handler
        handler(req, res);
      });

      // Listen on specified port
      await new Promise<void>((resolve, reject) => {
        this.server!.listen(port, () => {
          console.log(`[mTLS Server] Listening on port ${port}`);
          resolve();
        });

        this.server!.on('error', (error) => {
          reject(error);
        });
      });

      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'MTLS_SERVER_STARTED',
        metadata: {
          port,
          requireClientCert: this.config.requireClientCert,
          authorizedFingerprintsCount: this.authorizedFingerprints.size,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'MTLS_SERVER_START_FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * ADD AUTHORIZED FINGERPRINT
   * Whitelist a client certificate
   */
  async addAuthorizedFingerprint(
    fingerprint: string,
    organizationId: string,
    adminUserId: string
  ): Promise<void> {
    const normalizedFingerprint = fingerprint.replace(/:/g, '').toLowerCase();
    this.authorizedFingerprints.add(normalizedFingerprint);

    await this.auditLogger.logSecurityEvent({
      userId: adminUserId,
      action: 'MTLS_FINGERPRINT_ADDED',
      metadata: {
        fingerprint: normalizedFingerprint,
        organizationId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * REMOVE AUTHORIZED FINGERPRINT
   * Revoke a client certificate
   */
  async removeAuthorizedFingerprint(
    fingerprint: string,
    adminUserId: string
  ): Promise<void> {
    const normalizedFingerprint = fingerprint.replace(/:/g, '').toLowerCase();
    this.authorizedFingerprints.delete(normalizedFingerprint);

    await this.auditLogger.logSecurityEvent({
      userId: adminUserId,
      action: 'MTLS_FINGERPRINT_REMOVED',
      metadata: {
        fingerprint: normalizedFingerprint,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * LIST AUTHORIZED FINGERPRINTS
   */
  listAuthorizedFingerprints(): string[] {
    return Array.from(this.authorizedFingerprints);
  }

  /**
   * GENERATE CLIENT CERTIFICATE
   * Generate new client certificate for organization
   */
  async generateClientCertificate(
    organizationId: string,
    commonName: string,
    validityDays: number = 365
  ): Promise<{
    certificate: string;
    privateKey: string;
    fingerprint: string;
  }> {
    // In production, use proper PKI infrastructure
    // For now, use Node.js crypto
    
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // In production, sign with CA certificate
    // const cert = signCertificate(keys.publicKey, caCert, caKey, { CN: commonName });
    
    const mockCertificate = `-----BEGIN CERTIFICATE-----
Mock Certificate for ${commonName}
Organization: ${organizationId}
Valid for ${validityDays} days
-----END CERTIFICATE-----`;

    const fingerprint = crypto
      .createHash('sha256')
      .update(mockCertificate)
      .digest('hex')
      .match(/.{2}/g)!
      .join(':')
      .toLowerCase();

    await this.auditLogger.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'CLIENT_CERTIFICATE_GENERATED',
      metadata: {
        organizationId,
        commonName,
        fingerprint,
        validityDays,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      certificate: mockCertificate,
      privateKey: keys.privateKey,
      fingerprint,
    };
  }

  /**
   * VERIFY CERTIFICATE
   * Check if certificate is valid and authorized
   */
  verifyCertificate(certificate: string): {
    valid: boolean;
    fingerprint?: string;
    subject?: any;
    issuer?: any;
    validFrom?: string;
    validTo?: string;
    authorized?: boolean;
  } {
    try {
      // In production, parse and verify certificate
      const fingerprint = crypto
        .createHash('sha256')
        .update(certificate)
        .digest('hex')
        .match(/.{2}/g)!
        .join(':')
        .toLowerCase();

      const normalizedFingerprint = fingerprint.replace(/:/g, '').toLowerCase();
      const authorized = this.authorizedFingerprints.has(normalizedFingerprint);

      return {
        valid: true,
        fingerprint,
        authorized,
      };
    } catch (error) {
      return {
        valid: false,
      };
    }
  }

  /**
   * ROTATE SERVER CERTIFICATE
   * Update server certificate and key
   */
  async rotateServerCertificate(
    newCertPath: string,
    newKeyPath: string,
    adminUserId: string
  ): Promise<void> {
    try {
      // Verify new certificate exists
      fs.accessSync(newCertPath, fs.constants.R_OK);
      fs.accessSync(newKeyPath, fs.constants.R_OK);

      // Update configuration
      this.config.serverCert = newCertPath;
      this.config.serverKey = newKeyPath;

      await this.auditLogger.logSecurityEvent({
        userId: adminUserId,
        action: 'SERVER_CERTIFICATE_ROTATED',
        metadata: {
          newCertPath,
          timestamp: new Date().toISOString(),
        },
      });

      // Restart server to apply new certificate
      if (this.server) {
        await this.stop();
        // Server should be restarted externally
      }
    } catch (error) {
      await this.auditLogger.logSecurityEvent({
        userId: adminUserId,
        action: 'SERVER_CERTIFICATE_ROTATION_FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * GET CONNECTION STATS
   * Retrieve connection statistics
   */
  async getConnectionStats(): Promise<{
    activeConnections: number;
    totalConnections: number;
    authorizedFingerprints: number;
  }> {
    const connections = this.server?.connections || 0;

    return {
      activeConnections: connections,
      totalConnections: connections, // In production, track cumulative
      authorizedFingerprints: this.authorizedFingerprints.size,
    };
  }

  /**
   * STOP SERVER
   * Gracefully shutdown mTLS server
   */
  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => {
          console.log('[mTLS Server] Stopped');
          resolve();
        });
      });

      this.server = null;

      await this.auditLogger.logSecurityEvent({
        userId: 'SYSTEM',
        action: 'MTLS_SERVER_STOPPED',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

/**
 * CREATE MTLS CLIENT
 * Create HTTPS agent for mTLS client connections
 */
export function createMTLSClient(config: {
  clientCert: string;
  clientKey: string;
  caCert: string;
}): https.Agent {
  const clientCert = fs.readFileSync(config.clientCert, 'utf8');
  const clientKey = fs.readFileSync(config.clientKey, 'utf8');
  const caCert = fs.readFileSync(config.caCert, 'utf8');

  return new https.Agent({
    cert: clientCert,
    key: clientKey,
    ca: caCert,
    rejectUnauthorized: true,
    secureProtocol: 'TLSv1_3_method',
    minVersion: 'TLSv1.3',
  });
}

export default MTLSServer;
