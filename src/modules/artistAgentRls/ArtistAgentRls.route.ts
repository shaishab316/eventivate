import purifyRequest from "@/middlewares/purifyRequest";
import { Router } from "express";
import { ArtistAgentRlsControllers } from "./ArtistAgentRls.controller";
import { ArtistAgentRlsValidations } from "./ArtistAgentRls.validation";
import { auth } from "@/middlewares/auth";

const router = Router();

/**
 * Send a request to an artist agent. This can be used by labels to send requests to artist agents on behalf of artists, or by artists to send requests to artist agents on their own behalf.
 */
router.post(
  "/send-request",
  auth({
    token_type: "access",
    should_verified: true,
    // allowed_roles: ["ARTIST"], //Todo: decide if we want to allow labels to send requests to artist agents as well
  }),
  purifyRequest(ArtistAgentRlsValidations.sendRequestToArtistAgentSchema),
  ArtistAgentRlsControllers.sendRequestToArtistAgent,
);

export const ArtistAgentRlsRoutes = router;
