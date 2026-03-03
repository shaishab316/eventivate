import purifyRequest from "@/middlewares/purifyRequest";
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

export const AuthRoutes = router;
