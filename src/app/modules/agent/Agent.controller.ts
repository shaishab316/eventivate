import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import { AgentServices } from './Agent.service';
import { TCancelAgentOfferArgs } from './Agent.interface';
import { EUserRole } from '../../../utils/db';

/**
 * All agent related controllers
 */
export const AgentControllers = {
  /**
   * Retrieve all agent list
   */
  getAgentList: catchAsync(async ({ query }) => {
    const { meta, agents } = await AgentServices.getAgentList(query);

    return {
      message: 'Agents retrieved successfully!',
      meta,
      data: agents,
    };
  }),

  /**
   * Retrieve new agents list
   */
  getNewAgents: catchAsync(async ({ query, user: artist }) => {
    const { meta, agents } = await AgentServices.getAgentList({
      ...query,
      notIn: artist.artist_agents,
    });

    return {
      message: 'Agents retrieved successfully!',
      meta,
      data: agents.map(agent => ({
        ...agent,
        /**
         * Check if the artist has already requested this agent
         */
        is_requested: agent.agent_pending_artists.includes(artist.id),
      })),
    };
  }),

  /**
   * Invite an artist for an agent
   */
  inviteArtist: catchAsync(async ({ body, user: agent }) => {
    await AgentServices.inviteArtist({
      artist_id: body.artist_id,
      agent,
    });

    return {
      message: 'Artist invited successfully!',
    };
  }),

  /**
   * Approve or reject artist request from agent
   */
  processAgentRequest: (is_approved: boolean) =>
    catchAsync(async ({ body, user: agent }) => {
      if (!agent.agent_pending_artists.includes(body.artist_id)) {
        throw new ServerError(
          StatusCodes.NOT_FOUND,
          'Artist not found in pending list',
        );
      }

      await AgentServices.processAgentRequest({
        agent,
        is_approved,
        artist_id: body.artist_id,
      });

      return {
        message: `${is_approved ? 'Approved' : 'Rejected'} successfully!`,
      };
    }),

  /**
   * Retrieve all artist list for a specific agent
   */
  getMyArtistList: catchAsync(async ({ query, user: agent }) => {
    const { meta, artists } = await AgentServices.getAgentArtistList({
      ...query,
      artist_ids: agent.agent_artists,
    });

    return {
      message: 'Artists retrieved successfully!',
      meta,
      data: artists,
    };
  }),

  /**
   * Retrieve all artist request list for a specific agent
   */
  getArtistRequestList: catchAsync(async ({ query, user: agent }) => {
    const { meta, artists } = await AgentServices.getAgentArtistList({
      ...query,
      artist_ids: agent.agent_pending_artists,
    });

    return {
      message: 'Artists request retrieved successfully!',
      meta,
      data: artists,
    };
  }),

  /**
   * Delete artist from agent list
   */
  deleteArtist: catchAsync(async ({ body, user: agent }) => {
    //? ensure that the artist exists
    if (!agent.agent_artists.includes(body.artist_id)) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Artist not found');
    }

    await AgentServices.deleteArtist({
      agent: agent,
      artist_id: body.artist_id,
    });

    return {
      message: 'Artist deleted successfully!',
    };
  }),

  /**
   * Create new agent offer
   */
  createOffer: catchAsync(async ({ body, user: agent }) => {
    const offer = await AgentServices.createOffer({
      ...body,
      agent_id: agent.id,
      agent,
    });

    return {
      statusCode: StatusCodes.CREATED,
      message: 'Offer created successfully!',
      data: offer,
    };
  }),

  /**
   * Retrieve all offers for a specific agent
   */
  getMyOffers: catchAsync(async ({ query, user: agent }) => {
    const { meta, offers } = await AgentServices.getMyOffers({
      ...query,
      agent_id: agent.id,
    });

    return {
      message: 'Offers retrieved successfully!',
      meta,
      data: offers,
    };
  }),

  /**
   * cancelOffer
   */
  cancelOffer: catchAsync(async ({ body, user }) => {
    const payload: TCancelAgentOfferArgs = { offer_id: body.offer_id };

    if (user.role === EUserRole.AGENT) {
      payload.agent_id = user.id;
    } else if (user.role === EUserRole.ORGANIZER) {
      payload.organizer_id = user.id;
    }

    await AgentServices.cancelOffer(payload);

    return {
      message: 'Offer cancelled successfully!',
    };
  }),

  /**
   * Retrieve agent overview
   */
  getAgentOverview: catchAsync(async ({ user: agent }) => {
    const agentOverview = await AgentServices.getAgentOverview(agent.id);

    return {
      message: 'Agent overview retrieved successfully!',
      data: {
        total_artists: agent.agent_artists.length,
        artist_requests: agent.agent_pending_artists.length,
        ...agentOverview,
      },
    };
  }),
};
