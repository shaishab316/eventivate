import type { z } from "zod";
import type { ArtistAgentRlsValidations } from "./ArtistAgentRls.validation";
import { ArtistAgentRlsReq } from "@/db";
import { TPagination } from "@/middlewares/serveResponse";

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
) => Promise<ArtistAgentRlsReq>;

/**
 * Get pending requests query interface
 */
export type CGetPendingRequests = z.infer<
  typeof ArtistAgentRlsValidations.getPendingRequestsSchema
>;
export type SGetPendingRequests = (
  query: CGetPendingRequests["query"] & { user_id: string },
) => Promise<{
  pagination: TPagination;
  requests: ArtistAgentRlsReq[];
}>;
