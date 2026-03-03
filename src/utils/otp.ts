import { generate, verify } from "otplib";
import { createHmac } from "node:crypto";
import config from "@/config";
import { debuglog as debug } from "node:util";

const debugLog = debug("app:otp");

// ─── Types ────────────────────────────────────────────────────────────────────

interface OtpPayload {
  secret: string;
  digits?: number;
  period?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_DEFAULTS = {
  digits: 6,
  period: 300,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives a valid Base32 secret from any string using HMAC-SHA256.
 * Combines otp_key + secret to produce a consistent, valid Base32 string.
 * HMAC is extremely fast (~1-2ms) — no performance concern.
 */
function deriveSecret(secret: string): string {
  return createHmac("sha256", config.otp_key)
    .update(secret.toLowerCase().trim())
    .digest("base64")
    .replace(/[^A-Z2-7]/gi, "")
    .toUpperCase()
    .padEnd(16, "A")
    .slice(0, 32);
}

/**
 * Generates a one-time password (OTP) based on the provided secret and configuration.
 */
export async function generateOtp({
  secret,
  digits = OTP_DEFAULTS.digits,
  period = OTP_DEFAULTS.period,
}: OtpPayload): Promise<string> {
  const payload = {
    // deriveSecret: HMAC-SHA256(otp_key, secret) → valid Base32
    // replaces: config.otp_key + secret.replace(/\s/g, "") which produced invalid Base32
    secret: deriveSecret(secret),
    digits,
    period,
  };

  debugLog("[generateOtp] Payload: %o", payload);

  return await generate(payload);
}

/**
 * Verifies a one-time password (OTP) against the provided secret and configuration.
 */
export async function verifyOtp({
  secret,
  digits = OTP_DEFAULTS.digits,
  period = OTP_DEFAULTS.period,
  token,
}: OtpPayload & { token: string }): Promise<boolean> {
  const payload = {
    // deriveSecret: HMAC-SHA256(otp_key, secret) → valid Base32
    // replaces: config.otp_key + secret.replace(/\s/g, "") which produced invalid Base32
    secret: deriveSecret(secret),
    token,
    digits,
    period,
  };

  debugLog("[verifyOtp] Payload: %o", payload);

  const result = await verify(payload);
  return result.valid;
}
