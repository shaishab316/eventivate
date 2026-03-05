import type { Prisma } from "@/db";
import { profileIncludes } from "../profile/Profile.constant";

/**
 * User omit fields for safe exposure
 */
export const userOmit = {
  password: true,
  otp_salt: true,
} as const satisfies Prisma.UserOmit;

/**
 * User includes. This is used to specify which related data should be included when fetching a user. For example, when fetching a user, we want to include the profile.
 */
export const userIncludes = {
  profile: {
    include: profileIncludes,
  },
} as const satisfies Prisma.UserInclude;
