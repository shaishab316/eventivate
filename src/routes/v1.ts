import { AuthRoutes } from "@/modules/auth/Auth.route";
import { Router } from "express";

const router = Router();

router.use("/auth", AuthRoutes);

export const v1Routes = router;
