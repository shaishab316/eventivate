import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { ArtistControllers } from './Artist.controller';
import { ArtistValidations } from './Artist.validation';
import auth from '../../middlewares/auth';

const free = Router();
{
  /**
   * Get artist list
   */
  free.get(
    '/',
    purifyRequest(QueryValidations.list),
    ArtistControllers.getArtistList,
  );

  /**
   * Get new artists list
   */
  free.get(
    '/new-artists',
    auth.agent,
    purifyRequest(QueryValidations.list),
    ArtistControllers.getNewArtists,
  );
}

const artist = Router();
{
  /**
   * Get artist overview
   */
  artist.get('/overview', ArtistControllers.getArtistOverview);

  /**
   * Get my agent list
   */
  artist.get(
    '/agents',
    purifyRequest(QueryValidations.list),
    ArtistControllers.getMyAgentList,
  );

  /**
   * Get agent request list
   */
  artist.get(
    '/agent-requests',
    purifyRequest(QueryValidations.list),
    ArtistControllers.getAgentRequestList,
  );

  /**
   * Invite an agent for an artist
   */
  artist.post(
    '/invite-agent',
    purifyRequest(ArtistValidations.inviteAgent),
    ArtistControllers.inviteAgent,
  );

  /**
   * approve an agent request
   */
  artist.post(
    '/approve-agent',
    purifyRequest(ArtistValidations.processArtistRequest),
    ArtistControllers.processArtistRequest(true),
  );

  /**
   * reject an agent request
   */
  artist.post(
    '/reject-agent',
    purifyRequest(ArtistValidations.processArtistRequest),
    ArtistControllers.processArtistRequest(false),
  );

  /**
   * Delete agent from artist list
   */
  artist.delete(
    '/delete-agent',
    purifyRequest(ArtistValidations.deleteAgent),
    ArtistControllers.deleteAgent,
  );
}

/**
 * All artist related routes
 */
export const ArtistRoutes = {
  /**
   * Everyone can access
   *
   * @url : (base_url)/artists/
   */
  free,

  /**
   * Only artists can access
   *
   * @url : (base_url)/artist/agents/
   */
  artist,
};
