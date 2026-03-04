import { ServerError } from "@/errors";
import type {
  SGetPendingRequests,
  SSendRequestToArtistAgent,
} from "./ArtistAgentRls.interface";
import { statusCodes } from "@/lib/status_codes";
import { Prisma, prisma } from "@/db";
import { debuglog as debug } from "node:util";

const debugLog = debug("app:modules:artist_agent_rls:service");

/**
 * Send a request to connect with an artist agent
 */
const sendRequestToArtistAgent: SSendRequestToArtistAgent = async ({
  from_user_id,
  to_user_id,
  request_message,
}) => {
  /**
   * Users should not be able to send a request to themselves, so we need to check if the from_user_id and to_user_id are the same before allowing the user to create a new request. If they are the same, we should throw an error and not allow the user to create a new request.
   */
  if (from_user_id === to_user_id) {
    throw new ServerError(
      statusCodes.BAD_REQUEST,
      "You cannot send a request to yourself",
    );
  }

  const to_user = await prisma.user.findUnique({
    where: { user_id: to_user_id },
  });

  if (!to_user) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "The user you are trying to connect with does not exist",
    );
  }

  const existingRequest = await prisma.artistAgentRlsReq.findUnique({
    where: {
      from_to: {
        from_user_id,
        to_user_id,
      },
    },
  });

  debugLog(
    "Existing request between user %d and user %d: %o",
    from_user_id,
    to_user_id,
    existingRequest,
  );

  /**
   * If there is an existing request, we need to check its status before allowing the user to create a new request. If the existing request is pending or blocked, we should not allow the user to create a new request. If the existing request is rejected, we can allow the user to create a new request by deleting the existing rejected request.
   */
  if (existingRequest) {
    switch (existingRequest.status) {
      case "PENDING": {
        throw new ServerError(
          statusCodes.BAD_REQUEST,
          "A pending request already exists between you and this user",
        );
      }
      case "BLOCKED": {
        throw new ServerError(
          statusCodes.BAD_REQUEST,
          "You cannot send a request to this user",
        );
      }

      case "REJECTED": {
        // If the existing request was rejected, we can delete it and allow the user to create a new request
        await prisma.artistAgentRlsReq.delete({
          where: {
            id: existingRequest.id,
          },
        });

        break;
      }
    }
  }

  const existingRelation = await prisma.artistAgentRls.findUnique({
    where: {
      artist_agent: {
        artist_id: from_user_id,
        agent_id: to_user_id,
      },
    },
  });

  debugLog(
    "Existing relation between user %d and user %d: %o",
    from_user_id,
    to_user_id,
    existingRelation,
  );

  /**
   * If there is an existing relation, we should not allow the user to create a new request. This is because the users are already connected, and there is no need for a new request to be created. We should throw an error and not allow the user to create a new request if there is an existing relation between the users.
   */
  if (existingRelation) {
    throw new ServerError(
      statusCodes.BAD_REQUEST,
      "You are already connected with this user",
    );
  }

  const newRequest = await prisma.artistAgentRlsReq.create({
    data: {
      from_user_id,
      to_user_id,
      request_message,
    },
  });

  debugLog("New request created: %o", newRequest);

  return newRequest;
};

/**
 * Get pending requests for a user
 */
const getPendingRequests: SGetPendingRequests = async ({
  limit,
  page,
  user_id,
  sort_order,
  search,
}) => {
  const offset = (page - 1) * limit;

  const whereClause: Prisma.ArtistAgentRlsReqWhereInput = {
    to_user_id: user_id,
    status: "PENDING",
  };

  if (search) {
    /**
     * Todo: We need to implement a search functionality that allows users to search for pending requests by the name of the artist or agent. This will require us to join the artistAgentRlsReq table with the user table to get the names of the artists and agents, and then filter the results based on the search query. We should also consider implementing pagination for the search results to improve performance and user experience.
     */
  }

  debugLog("Fetching pending requests with where clause: %o", whereClause);

  const pendingRequests = await prisma.artistAgentRlsReq.findMany({
    where: whereClause,
    include: {
      from_user: {
        select: {
          profile: {
            include: {
              artist_profile: true

              //? Todo: include all profile types
            }
          }
        }
      }
    },
    orderBy: {
      requested_at: sort_order,
    },
    skip: offset,
    take: limit,
  });

  const totalCount = await prisma.artistAgentRlsReq.count({
    where: whereClause,
  });

  debugLog(
    "Fetched %d pending requests out of total %d for user %s",
    pendingRequests.length,
    totalCount,
    user_id,
  );

  return {
    pagination: {
      page,
      limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    },
    requests: pendingRequests,
  };
};

/**
 * Exporting the services for the ArtistAgentRls module, which currently includes the sendRequestToArtistAgent service. This allows other parts of the application to import and use these services to handle business logic related to artist-agent relationships.
 */
export const ArtistAgentRlsServices = {
  sendRequestToArtistAgent,
  getPendingRequests,
};
