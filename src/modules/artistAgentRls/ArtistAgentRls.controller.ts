import catchAsync from "@/middlewares/catchAsync";
import { CSendRequestToArtistAgent } from "./ArtistAgentRls.interface";
import { ArtistAgentRlsServices } from "./ArtistAgentRls.service";

/**
 * Controller for sending a request to connect with an artist agent. It validates the request payload, checks if the user is trying to send a request to themselves, verifies the existence of the target user, and checks for any existing requests between the two users. If all validations pass, it creates a new connection request in the database and returns a success message along with the created request data. If any validation fails, it throws an appropriate error with a descriptive message.
 */
const sendRequestToArtistAgent = catchAsync<CSendRequestToArtistAgent>(
  async ({ body: payload, user }) => {
    const data = await ArtistAgentRlsServices.sendRequestToArtistAgent({
      ...payload,
      from_user_id: user.user_id,
    });

    return {
      message: "Request sent successfully",
      data,
    };
  },
);

/**
 * Exporting the controllers for the ArtistAgentRls module, which currently includes the sendRequestToArtistAgent controller. This allows other parts of the application to import and use these controllers to handle incoming requests related to artist-agent relationships.
 */
export const ArtistAgentRlsControllers = {
  sendRequestToArtistAgent,
};
