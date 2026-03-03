import z from "zod";

/**
 * Shared validation schemas for the Auth module. These schemas define the expected structure and constraints for the input data for various authentication-related operations, such as user registration, email verification, login, and password reset. By centralizing these validation rules, we ensure consistency across the application and make it easier to maintain and update the validation logic as needed.
 */
const validator = {
  email: z.email().transform((email) => email.toLowerCase()),
  password: z
    .string("Password must be between 6 and 32 characters")
    .min(6, "Password must be between 6 and 32 characters")
    .max(32, "Password must be between 6 and 32 characters"),
  otp: z
    .string("OTP must be a string")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
  token: z.string("Token must be a string").max(1000, "Token is too long"),
};

const registerUserSchema = z.object({
  body: z.object({
    email: validator.email,
    password: validator.password,
  }),
});

const verifyEmailSchema = z.object({
  query: z.object({
    token: validator.token,
    otp: validator.otp,
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    email: validator.email,
    password: validator.password,
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: validator.email,
  }),
});

const resetPasswordOtpVerifySchema = z.object({
  body: z.object({
    email: validator.email,
    otp: validator.otp,
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: validator.token,
    password: validator.password,
  }),
});

export const AuthValidations = {
  registerUserSchema,
  verifyEmailSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordOtpVerifySchema,
  resetPasswordSchema,
};
