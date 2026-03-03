import { Prisma } from "@/db";

/**
 * User omit fields for safe exposure
 */
export const userOmit = {
  password: true,
  otp_salt: true,
} as const satisfies Prisma.UserOmit;
