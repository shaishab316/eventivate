import type { Prisma } from "@/db";
import { profileIncludes } from "../profile/Profile.constant";

/**
 * User omit fields for safe exposure
 */
export const userOmit = {
  password: true,
  otp_salt: true,
} as const satisfies Prisma.UserOmit;

export const userIncludes = {
  profile: {
    include: profileIncludes,
  },
} as const satisfies Prisma.UserInclude;
