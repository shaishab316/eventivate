import { prisma } from "@/db";
import type { SRegisterUser, SSendVerificationEmail } from "./Auth.interface";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";
import { signToken } from "@/utils/jwt";
import { generateOtp } from "@/utils/otp";
import config from "@/config";
import { sendMail } from "@/utils/mailer";
import { logger } from "@/utils/logger";
import { debuglog as debug } from "node:util";

const debuglog = debug("app:modules:auth:service");

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
      body: payload,
    },
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

export const AuthServices = {
  registerUser,
};
