import type { z } from "zod";
import type { ArtistAgentRlsValidations } from "./ArtistAgentRls.validation";

/************************************/
/******* Validation Interface *******/
/************************************/

/**
 * Agent artist relation request payload interface
 */
export type CSendRequestToArtistAgent = z.infer<
  typeof ArtistAgentRlsValidations.sendRequestToArtistAgentSchema
>;
export type SSendRequestToArtistAgent = (
  payload: CSendRequestToArtistAgent["body"] & { from_user_id: string },
) => Promise<any>;
