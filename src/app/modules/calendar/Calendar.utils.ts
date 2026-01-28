import { google } from 'googleapis';
import crypto from 'crypto';
import config from '../../../config';

export const googleAuth = new google.auth.OAuth2(
  config.googleOAuth.client_id,
  config.googleOAuth.client_secret,
  config.googleOAuth.redirect_uri,
);

// 32-byte encryption key from environment (must be hex string)
const ENCRYPTION_KEY = Buffer.from(
  config.googleOAuth.token_encryption_key,
  'hex',
);

/**
 * Encrypts Google refresh tokens for secure database storage.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * Format: base64(iv + authTag + encryptedData)
 * - IV: 12 bytes
 * - Auth Tag: 16 bytes
 * - Encrypted: variable
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts Google refresh tokens from database.
 * Throws if auth tag verification fails (tampered data).
 */
function decrypt(data: string): string {
  const buffer = Buffer.from(data, 'base64');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    buffer.subarray(0, 12), // IV
  );

  decipher.setAuthTag(buffer.subarray(12, 28)); // Auth tag

  return (
    decipher.update(buffer.subarray(28), undefined, 'utf8') +
    decipher.final('utf8')
  );
}

export const GoogleTokenEncryption = {
  encrypt,
  decrypt,
};
