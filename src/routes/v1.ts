import { Router } from "express";
import { AuthRoutes } from "@/modules/auth/Auth.route";
import { ArtistAgentRlsRoutes } from "@/modules/artistAgentRls/ArtistAgentRls.route";
import { ArtistProfileRoutes } from "@/modules/artistProfile/ArtistProfile.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/artist-agent", ArtistAgentRlsRoutes);
router.use("/artist-profiles", ArtistProfileRoutes);

export const v1Routes = router;
