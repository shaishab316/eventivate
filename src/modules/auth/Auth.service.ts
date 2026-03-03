import { prisma } from "@/db";
import type {
  IRegisterJWTPayload,
  SForgotPassword,
  SForgotPasswordPayload,
  SLoginUser,
  SRegisterUser,
  SSendPasswordResetEmail,
  SSendVerificationEmail,
  SVerifyEmail,
} from "./Auth.interface";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";
import { signToken, verifyToken } from "@/utils/jwt";
import { generateOtp } from "@/utils/otp";
import config from "@/config";
import { sendMail } from "@/utils/mailer";
import { logger } from "@/utils/logger";
import { debuglog as debug } from "node:util";
import { UserServices } from "../user/User.service";
import { decryptPayload, encryptPayload, verifyPassword } from "@/utils/crypto";
import { omit } from "@/utils/omit";
import { userOmit } from "../user/User.constant";

const debuglog = debug("app:modules:auth:service");

/**
 * Registers a new user by checking for existing email, generating a verification token, and sending a verification email. If the email is already registered, it throws a ServerError with a BAD_REQUEST status. The function returns an access token and its expiration time, which the user can use to verify their email address within 15 minutes.
 */
const registerUser: SRegisterUser = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ServerError(
      statusCodes.BAD_REQUEST,
      "User with this email already exists. Please log in instead.",
    );
  }

  const access_token = signToken(
    {
      type: "register",

      //? important: we encrypt the entire payload (which may contain email, password, and other registration details) to ensure that sensitive information is not exposed in the token's payload. This encrypted string can be safely included in the token, and we can decrypt it later during the email verification process to retrieve the original registration details without ever exposing them in plaintext form.
      encrypted_body: encryptPayload(JSON.stringify(payload)),
    } satisfies IRegisterJWTPayload,
    "15m",
  );

  await sendVerificationEmail({
    email: payload.email,
    token: access_token,
  });

  return {
    access_token,
    expires_in: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
  };
};

/**
 * Sends a verification email to the user with a one-time password (OTP) and a verification link. The OTP is generated using a secret that combines a server-side key and the user's email, ensuring that it is unique and can be validated later when the user attempts to verify their email. The email is sent asynchronously, and any errors during the sending process are logged without affecting the user registration flow.
 */
const sendVerificationEmail: SSendVerificationEmail = async ({
  email,
  token,
}) => {
  const otp = await generateOtp({
    secret: config.otp_key + email,
    digits: 6, //? 6 digits is standard for email verification OTPs
    period: 15 * 60, //? 15 minutes validity
  });

  /**
   * Fire and forget email sending - we don't want to block the registration process if email sending fails, but we log the error for monitoring and debugging purposes.
   */
  sendMail({
    to: email,
    subject: `Welcome to Getavails! Please verify your email`,
    html: `
      <p>Hello,</p>
      <p>Thank you for registering with Getavails.</p>
      <p>Your verification OTP is: <strong>${otp}</strong></p>
      <p>${config.server_url}/api/v1/auth/verify-email?token=${token}&otp=${otp}</p>
      <p>This OTP is valid for 15 minutes.</p>
    `,
  })
    .then(({ accepted }) => {
      debuglog("Verification email sent to %s, accepted: %o", email, accepted);
    })
    .catch((err) => {
      logger.error("Failed to send verification email: %o", {
        error: err,
        email,
      });
    });
};

/**
 * Sends a password reset email to the user with a one-time password (OTP) and a reset link. The OTP is generated using a secret that combines a server-side key and the user's email, ensuring that it is unique and can be validated later when the user attempts to reset their password. The email is sent asynchronously, and any errors during the sending process are logged without affecting the user experience.
 */
const sendPasswordResetEmail: SSendPasswordResetEmail = async ({
  email,
  otp_salt,
}) => {
  const otp = await generateOtp({
    secret: config.otp_key + otp_salt,
    digits: 6,
    period: 15 * 60,
  });

  sendMail({
    to: email,
    subject: `Getavails Password Reset Request`,
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password for your Getavails account.</p>
      <p>Your password reset OTP is: <strong>${otp}</strong></p>
      <p>${config.server_url}/api/v1/auth/reset-password?email=${email}&otp=${otp}</p>
      <p>This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
    `,
  })
    .then(({ accepted }) => {
      debuglog(
        "Password reset email sent to %s, accepted: %o",
        email,
        accepted,
      );
    })
    .catch((err) => {
      logger.error("Failed to send password reset email: %o", {
        error: err,
        email,
      });
    });
};

/**
 * Verifies the user's email by validating the provided OTP against the expected value generated from the token's payload. If the token is valid and the OTP matches, it creates a new user in the database and generates access and refresh tokens for authentication. If the token type is incorrect or the OTP is invalid/expired, it throws a ServerError with an UNAUTHORIZED status. The function returns the newly created user and their authentication tokens upon successful verification.
 */
const verifyEmail: SVerifyEmail = async ({ otp, token }) => {
  try {
    const { type: tokenType, encrypted_body } = verifyToken(
      token,
    ) as IRegisterJWTPayload;

    /**
     * Step 1: Verify the token type to ensure it's meant for registration. This prevents misuse of tokens that might be intended for other purposes (e.g., password reset, access tokens) and adds an extra layer of security by ensuring that only tokens generated for the registration process can be used to verify email addresses.
     */
    if (tokenType !== "register") {
      throw new ServerError(statusCodes.UNAUTHORIZED, "Invalid token type");
    }

    const payload = JSON.parse(decryptPayload(encrypted_body));

    const expectedOtp = await generateOtp({
      secret: config.otp_key + payload.email,
      digits: 6,
      period: 15 * 60,
    });

    /**
     * Step 2: Validate the provided OTP against the expected value. This ensures that the user has access to the email address they registered with, as they must provide the correct OTP sent to that email. If the OTP is incorrect or has expired (i.e., it's no longer valid after 15 minutes), the verification process fails, and an appropriate error is thrown to inform the user of the issue.
     */
    if (otp !== expectedOtp) {
      throw new ServerError(statusCodes.UNAUTHORIZED, "Invalid or expired OTP");
    }

    /**
     * Step 3: Create the user in the database and generate authentication tokens. Once the email is verified, a new user record is created using the information from the token's payload. After successful creation, access and refresh tokens are generated for the user, allowing them to authenticate and access protected resources in subsequent requests. This step finalizes the registration process and provides the user with the necessary credentials to use their account.
     */
    const newUser = await UserServices.createUser({
      ...payload,
      is_verified: true,
    });

    /**
     * Step 4: Generate access and refresh tokens for the newly created user. The access token is typically short-lived and used for authenticating API requests, while the refresh token is longer-lived and can be used to obtain new access tokens without requiring the user to log in again. Both tokens include the user's ID and a type identifier to ensure they are used correctly in future authentication flows.
     */
    const access_token = signToken(
      {
        type: "access",
        user_id: newUser.user_id,
      },
      config.access_token_expiry,
    );

    const refresh_token = signToken(
      {
        type: "refresh",
        user_id: newUser.user_id,
      },
      config.refresh_token_expiry,
    );

    return {
      user: newUser,
      tokens: {
        access_token,
        refresh_token,
      },
    };
  } catch (error) {
    logger.error("Email verification failed: %o", {
      error,
      otp,
      token,
    });

    throw error;
  }
};

/**
 * Logs in a user by validating their email and password. It retrieves the user from the database based on the provided email, checks if the password matches using a secure comparison, and if valid, generates access and refresh tokens for authentication. If the email does not exist or the password is incorrect, it throws a ServerError with an UNAUTHORIZED status. The function returns the authenticated user and their tokens upon successful login.
 */
const loginUser: SLoginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user?.password) {
    throw new ServerError(
      statusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const isPasswordValid = await verifyPassword(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ServerError(
      statusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const access_token = signToken(
    {
      type: "access",
      user_id: user.user_id,
    },
    config.access_token_expiry,
  );

  const refresh_token = signToken(
    {
      type: "refresh",
      user_id: user.user_id,
    },
    config.refresh_token_expiry,
  );

  return {
    user: omit(user, userOmit),
    tokens: {
      access_token,
      refresh_token,
    },
  };
};

/**
 * Handles forgot password requests by checking if the provided email exists in the database and, if it does, sending a password reset email with a one-time password (OTP). The function returns an expiration time for the OTP, which is typically set to 15 minutes from the time of generation. If the email does not exist, it still returns a success response without indicating that the email is not registered, to prevent potential attackers from enumerating valid email addresses.
 */
const forgotPassword: SForgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    //? For security reasons, we don't want to reveal whether an email is registered or not, so we simply return without throwing an error if the user is not found.
    return {
      expire_at: new Date().toISOString(), // Return current time as expire_at for non-existent users to prevent timing attacks
    };
  }

  /**
   * Send password reset email with OTP. The OTP is generated using a secret that combines a server-side key and the user's unique OTP salt, ensuring that it is unique and can be validated later when the user attempts to reset their password. The email is sent asynchronously, and any errors during the sending process are logged without affecting the user experience. The function returns an expiration time for the OTP, which is typically set to 15 minutes from the time of generation.
   */
  await sendPasswordResetEmail({
    email,
    otp_salt: user.otp_salt,
  });

  return {
    expire_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
  };
};

export const AuthServices = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
};
