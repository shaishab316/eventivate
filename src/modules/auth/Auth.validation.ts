import z from "zod";

const validate = {
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
    email: validate.email,
    password: validate.password,
  }),
});

const verifyEmailSchema = z.object({
  query: z.object({
    token: validate.token,
    otp: validate.otp,
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    email: validate.email,
    password: validate.password,
  }),
});

export const AuthValidations = {
  registerUserSchema,
  verifyEmailSchema,
  loginUserSchema,
};
