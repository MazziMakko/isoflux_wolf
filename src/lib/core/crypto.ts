// =====================================================
// CRYPTOGRAPHIC UTILITIES - PRODUCTION GRADE
// =====================================================

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const ALGORITHM = 'aes-256-gcm';
const SALT_ROUNDS = 12;

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API Key with prefix
 */
export function generateApiKey(prefix: string = 'ffx'): string {
  const randomPart = generateSecureToken(24);
  return `${prefix}_${randomPart}`;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string, secretKey?: string): string {
  const key = secretKey || process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error('Encryption key must be 32 characters');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string, secretKey?: string): string {
  const key = secretKey || process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error('Encryption key must be 32 characters');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate JWT token
 */
export async function generateJWT(
  payload: Record<string, any>,
  expiresIn: string = '24h'
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyJWT(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Hash data for comparison (e.g., webhook signatures)
 */
export function createHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmacSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(payload: any, secret: string): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHmacSignature(data, secret);
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const signedPayload = `${payload}`;
    const expectedSignature = createHmacSignature(signedPayload, secret);
    
    const signatures = signature.split(',').map(sig => {
      const [key, value] = sig.split('=');
      return { key, value };
    });

    const v1Signature = signatures.find(s => s.key === 'v1')?.value;
    
    if (!v1Signature) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(v1Signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return `${data.slice(0, visibleChars)}${'*'.repeat(data.length - visibleChars)}`;
}

/**
 * Generate secure OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % digits.length];
  }
  
  return otp;
}

export default {
  generateSecureToken,
  generateApiKey,
  hashPassword,
  comparePassword,
  encrypt,
  decrypt,
  generateJWT,
  verifyJWT,
  createHmacSignature,
  verifyHmacSignature,
  generateWebhookSignature,
  verifyStripeSignature,
  maskSensitiveData,
  generateOTP,
};
