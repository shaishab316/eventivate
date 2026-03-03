import { type Prisma, prisma } from "@/db";
import type { SCreateUser } from "./User.interface";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";
import { userOmit } from "./User.constant";
import { generateOtpSalt, hashPassword } from "@/utils/crypto";

/**
 * Service to create a new user
 *
 * Assumption (recommended):
 * - `user_id` is GENERATED at DB level from `user_sl` (e.g. `u_` || user_sl)
 * - Therefore we DO NOT write `user_id` in application code
 */
const createUser: SCreateUser = async (payload) => {
  /**
   * Step 0: Hash password if provided
   */
  if (payload.password) {
    payload.password = await hashPassword(payload.password);
  }

  const existingWhere: Prisma.UserWhereInput = { OR: [] };

  if (payload.email) {
    existingWhere.OR?.push({ email: payload.email });
  }

  // If you don't add any OR conditions, Prisma treats OR: [] as always-false in some contexts.
  // If email is required, this is fine; otherwise guard:
  if (!existingWhere.OR?.length) {
    throw new ServerError(
      statusCodes.BAD_REQUEST,
      "Email is required to create a user",
    );
  }

  /**
   * Step 1: Check if user already exists
   */
  const existing = await prisma.user.findFirst({ where: existingWhere });

  if (existing) {
    throw new ServerError(
      statusCodes.BAD_REQUEST,
      "User already exists with the provided email",
    );
  }

  /**
   * Step 2: Create the user (single query)
   *
   * IMPORTANT:
   * - Do NOT set `user_id` here.
   * - DB generates `user_sl` (autoincrement)
   * - DB generates `user_id` based on `user_sl`
   */
  const createdUser = await prisma.user.create({
    data: {
      ...payload,

      user_id: Math.random().toString(36).substring(2, 10),
      otp_salt: generateOtpSalt(),
    },
    omit: userOmit,
  });

  return createdUser;
};

export const UserServices = {
  createUser,
};
