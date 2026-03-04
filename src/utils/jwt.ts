import jwt from "jsonwebtoken";
import config from "@/config";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT = {
  ALGORITHM: "HS256",
  ISSUER: process.env.npm_package_name,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppJwtType = "access" | "refresh" | "register" | "reset_password";

export interface AppJwtPayload extends JwtPayload {
  type: AppJwtType;
}

type JwtPayload = Record<string, unknown>;
type TimeUnit = `${number}${"s" | "m" | "h" | "d" | "w"}`;

/**
 * Signs a JWT token with the given payload and expiration time.
 */
export function signToken(payload: JwtPayload, expiresIn: TimeUnit): string {
  return jwt.sign(payload, config.jwt_secret, {
    algorithm: JWT.ALGORITHM,
    issuer: JWT.ISSUER,
    expiresIn,
  });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 */
export function verifyToken<T extends JwtPayload>(token: string): T {
  try {
    return jwt.verify(token, config.jwt_secret, {
      algorithms: [JWT.ALGORITHM],
      issuer: JWT.ISSUER,
    }) as T;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ServerError(statusCodes.UNAUTHORIZED, "Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new ServerError(statusCodes.UNAUTHORIZED, "Invalid token");
    } else {
      throw new ServerError(
        statusCodes.INTERNAL_SERVER_ERROR,
        "Failed to verify token",
      );
    }
  }
}
