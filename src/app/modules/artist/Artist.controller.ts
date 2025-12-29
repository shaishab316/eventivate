import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import { ArtistServices } from './Artist.service';

/**
 * All artist related controllers
 */
export const ArtistControllers = {
  /**
   * Retrieve all artist list
   */
  getArtistList: catchAsync(async ({ query }) => {
    const { meta, artists } = await ArtistServices.getArtistList(query);

    return {
      message: 'Artists retrieved successfully!',
      meta,
      data: artists,
    };
  }),

  /**
   * Retrieve new artists list
   */
  getNewArtists: catchAsync(async ({ query, user: agent }) => {
    const { meta, artists } = await ArtistServices.getArtistList({
      ...query,
      notIn: agent.agent_artists,
    });

    return {
      message: 'Artists retrieved successfully!',
      meta,
      data: artists.map(artist => ({
        ...artist,
        /**
         * Check if the agent has already requested this artist
         */
        is_requested: artist.artist_pending_agents.includes(agent.id),
      })),
    };
  }),

  /**
   * Invite an agent for an artist
   */
  inviteAgent: catchAsync(async ({ body, user: artist }) => {
    await ArtistServices.inviteAgent({
      agent_id: body.agent_id,
      artist,
    });

    return {
      message: 'Agent invited successfully!',
    };
  }),

  /**
   * Approve or reject artist request from agent
   */
  processArtistRequest: (is_approved: boolean) =>
    catchAsync(async ({ body, user: artist }) => {
      //? Agent should be in pending list of artist else throw error
      if (!artist.artist_pending_agents.includes(body.agent_id)) {
        throw new ServerError(
          StatusCodes.NOT_FOUND,
          'Agent not found in pending list',
        );
      }

      await ArtistServices.processArtistRequest({
        artist,
        is_approved,
        agent_id: body.agent_id,
      });

      return {
        message: `${is_approved ? 'Approved' : 'Rejected'} successfully!`,
      };
    }),

  /**
   * Retrieve all artist list for a specific artist
   */
  getMyAgentList: catchAsync(async ({ user: artist, query }) => {
    const { meta, agents } = await ArtistServices.getAgentList({
      ...query,
      agent_ids: artist.artist_agents,
    });

    return {
      message: 'Agents retrieved successfully!',
      meta,
      data: agents,
    };
  }),

  /**
   * Retrieve all artist request list for a specific artist
   */
  getAgentRequestList: catchAsync(async ({ user: artist, query }) => {
    const { meta, agents } = await ArtistServices.getAgentList({
      ...query,
      agent_ids: artist.artist_pending_agents,
    });

    return {
      message: 'Agents request retrieved successfully!',
      meta,
      data: agents,
    };
  }),

  /**
   * Delete agent from artist list
   */
  deleteAgent: catchAsync(async ({ body, user: artist }) => {
    //? ensure that the agent exists
    if (!artist.artist_agents.includes(body.agent_id)) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Agent not found');
    }

    await ArtistServices.deleteAgent({
      agent_id: body.agent_id,
      artist,
    });

    return {
      message: 'Agent deleted successfully!',
    };
  }),

  /**
   * Retrieve artist overview
   */
  getArtistOverview: catchAsync(async ({ user: artist }) => {
    const overview = await ArtistServices.getArtistOverview(artist.id);

    return {
      message: 'Artist overview retrieved successfully!',
      data: {
        total_agents: artist.artist_agents.length,
        agent_requests: artist.artist_pending_agents.length,
        ...overview,
      },
    };
  }),
};
