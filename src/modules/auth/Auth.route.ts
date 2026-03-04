import { purifyRequest } from "@/middlewares/purifyRequest";
import { Router } from "express";
import { AuthValidations } from "./Auth.validation";
import { AuthControllers } from "./Auth.controller";

const router = Router();

/**
 * Route for registering a new user
 */
router.post(
  "/register-user",
  purifyRequest(AuthValidations.registerUserSchema),
  AuthControllers.registerUser,
);

/**
 * Route for verifying a user's email address using a token and OTP
 */
router.get(
  "/verify-email",
  purifyRequest(AuthValidations.verifyEmailSchema),
  AuthControllers.verifyEmail,
);

/**
 * Route for logging in a user
 */
router.post(
  "/login",
  purifyRequest(AuthValidations.loginUserSchema),
  AuthControllers.loginUser,
);

/**
 * Route for handling forgot password requests
 */
router.post(
  "/forgot-password",
  purifyRequest(AuthValidations.forgotPasswordSchema),
  AuthControllers.forgotPassword,
);

/**
 * Route for verifying the OTP for password reset and generating a reset token
 */
router.post(
  "/reset-password-otp-verify",
  purifyRequest(AuthValidations.resetPasswordOtpVerifySchema),
  AuthControllers.resetPasswordOtpVerify,
);

/**
 * Route for resetting the user's password using the reset token and new password
 */
router.post(
  "/reset-password",
  purifyRequest(AuthValidations.resetPasswordSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
