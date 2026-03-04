import { EUserRole, prisma } from "@/db";
import catchAsync from "./catchAsync";
import { AppJwtType, verifyToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";
import type { IAccessJWTPayload } from "@/modules/auth/Auth.interface";
import type { MSafeUser } from "@/modules/user/User.interface";
import { userOmit } from "@/modules/user/User.constant";

/**
 * Authentication middleware that verifies JWT tokens and checks user permissions based on the provided options.
 */
export function auth(options: AuthOptions) {
  return catchAsync(async (req, _, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(
        options.allow_anonymous
          ? undefined
          : new ServerError(
              statusCodes.UNAUTHORIZED,
              "Please log in to continue",
            ),
      );
    }

    try {
      const user = await getUserFromToken(options.token_type, token);

      if (!user) {
        return next(
          new ServerError(
            statusCodes.UNAUTHORIZED,
            "Your session has expired, please log in again",
          ),
        );
      }

      checkPermissions(user, options);

      //? attach user to request for downstream handlers
      req.user = user;

      next();
    } catch (error) {
      logger.error("Auth error:", error);

      next(error);
    }
  });
}

/**
 * Checks if the user has the necessary permissions based on the provided options.
 */
export function checkPermissions(user: MSafeUser, options: AuthOptions) {
  if (
    options.allowed_roles?.length &&
    !options.allowed_roles.includes(user.role)
  ) {
    throw new ServerError(
      statusCodes.FORBIDDEN,
      "You are not allowed to access this page",
    );
  }

  if (options.should_admin && !user.is_admin) {
    throw new ServerError(
      statusCodes.FORBIDDEN,
      "This page is for admins only",
    );
  }

  if (options.should_verified && !user.is_verified) {
    throw new ServerError(
      statusCodes.FORBIDDEN,
      "Please verify your email address before continuing",
    );
  }
}

/**
 * Fetches the user associated with the given JWT token.
 */
export async function getUserFromToken(
  type: AppJwtType,
  token: string,
): Promise<MSafeUser | null> {
  if (type === "access") {
    const { user_id } = verifyToken(token) as IAccessJWTPayload;

    return prisma.user.findUnique({ where: { user_id }, omit: userOmit });
  }

  // add more token types here as needed (e.g. refresh, invite, etc.)
  return null;
}

export interface AuthOptions {
  token_type: AppJwtType;
  should_admin?: boolean;
  should_verified?: boolean;
  allowed_roles?: EUserRole[];
  allow_anonymous?: boolean;
}
