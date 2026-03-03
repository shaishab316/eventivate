import z from "zod";

const validate = {
  email: z.email().transform((email) => email.toLowerCase()),
  password: z
    .string("Password must be between 6 and 32 characters")
    .min(6, "Password must be between 6 and 32 characters")
    .max(32, "Password must be between 6 and 32 characters"),
};

const registerUserSchema = z.object({
  body: z.object({
    email: validate.email,
    password: validate.password,
  }),
});

export const AuthValidations = {
  registerUserSchema,
};
