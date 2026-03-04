import { ServerError } from "@/errors";
import type { SSendRequestToArtistAgent } from "./ArtistAgentRls.interface";
import { statusCodes } from "@/lib/status_codes";
import { prisma } from "@/db";

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

  return newRequest;
};

/**
 * Exporting the services for the ArtistAgentRls module, which currently includes the sendRequestToArtistAgent service. This allows other parts of the application to import and use these services to handle business logic related to artist-agent relationships.
 */
export const ArtistAgentRlsServices = {
  sendRequestToArtistAgent,
};
