import config from "@/config";
import argon2 from "argon2";
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

// ─── Constants ────────────────────────────────────────────────────────────────

const CIPHER = {
  ALGORITHM: "aes-256-gcm",
  IV_BYTES: 12,
  KEY: Buffer.from(config.encryption_key, "hex"),
  SEPARATOR: ":",
} as const;

const ARGON2 = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64MB
  timeCost: 3, // iterations
  parallelism: 4, // threads
} as const;

// ─── Email ────────────────────────────────────────────────────────────────────

/**
 * One-way hash — used for DB lookup/indexing without storing plaintext
 */
export function hashEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

/**
 * Two-way encrypt — used for storing + recovering original email
 */
export function encryptEmail(email: string): string {
  const iv = randomBytes(CIPHER.IV_BYTES);
  const cipher = createCipheriv(CIPHER.ALGORITHM, CIPHER.KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(email, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(CIPHER.SEPARATOR);
}

/**
 * Decrypt an encrypted email string
 */
export function decryptEmail(encryptedEmail: string): string {
  const [ivHex, tagHex, dataHex] = encryptedEmail.split(CIPHER.SEPARATOR);

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  const decipher = createDecipheriv(CIPHER.ALGORITHM, CIPHER.KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final("utf8");
}

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, ARGON2);
}

/**
 * Verify a plaintext password against an Argon2 hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await argon2.verify(hash, password);
}
