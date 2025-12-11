import { Router } from 'express';
import { AgentControllers } from './Agent.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { AgentValidations } from './Agent.validation';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { OfferRoutes } from '../offer/Offer.route';

const free = Router();
{
  /**
   * Get agent list
   */
  free.get(
    '/',
    purifyRequest(QueryValidations.list),
    AgentControllers.getAgentList,
  );
}

const agent = injectRoutes(Router(), {
  '/offers': [OfferRoutes.agent],
});

{
  /**
   * Get agent overview
   */
  agent.get('/overview', AgentControllers.getAgentOverview);

  /**
   * Get my artist list
   */
  agent.get(
    '/artists',
    purifyRequest(QueryValidations.list),
    AgentControllers.getMyArtistList,
  );

  /**
   * Get artist request list
   */
  agent.get(
    '/artist-requests',
    purifyRequest(QueryValidations.list),
    AgentControllers.getArtistRequestList,
  );

  /**
   * Invite an artist for an agent
   */
  agent.post(
    '/invite-artist',
    purifyRequest(AgentValidations.inviteArtist),
    AgentControllers.inviteArtist,
  );

  /**
   * approve an artist request
   */
  agent.post(
    '/approve-artist',
    purifyRequest(AgentValidations.processAgentRequest),
    AgentControllers.processAgentRequest(true),
  );

  /**
   * reject an artist request
   */
  agent.post(
    '/reject-artist',
    purifyRequest(AgentValidations.processAgentRequest),
    AgentControllers.processAgentRequest(false),
  );

  /**
   * delete an artist
   */
  agent.delete(
    '/delete-artist',
    purifyRequest(AgentValidations.deleteArtist),
    AgentControllers.deleteArtist,
  );

  /**
   * create an offer
   */
  agent.post(
    '/create-offer',
    purifyRequest(AgentValidations.createOffer),
    AgentControllers.createOffer,
  );

  /**
   * get my offers
   */
  agent.get(
    '/my-offers',
    purifyRequest(QueryValidations.list, AgentValidations.getMyOffers),
    AgentControllers.getMyOffers,
  );

  /**
   * cancel an offer
   */
  agent.post(
    '/cancel-offer',
    purifyRequest(AgentValidations.cancelOffer),
    AgentControllers.cancelOffer,
  );
}

export const AgentRoutes = {
  /**
   * Everyone can access
   *
   * @url : (base_url)/agents/
   */
  free,

  /**
   * Only agents can access
   *
   * @url : (base_url)/agent/
   */
  agent,
};
