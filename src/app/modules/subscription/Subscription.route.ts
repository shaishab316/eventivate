import { Router } from 'express';
import { SubscriptionControllers } from './Subscription.controller';
import { SubscriptionValidations } from './Subscription.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import auth from '../../middlewares/auth';

const admin = Router();
{
  admin.post(
    '/',
    purifyRequest(SubscriptionValidations.createSubscription),
    SubscriptionControllers.createSubscription,
  );

  admin.patch(
    '/',
    purifyRequest(SubscriptionValidations.editSubscription),
    SubscriptionControllers.editSubscription,
  );

  admin.delete(
    '/',
    purifyRequest(SubscriptionValidations.deleteSubscription),
    SubscriptionControllers.deleteSubscription,
  );
}

const free = Router();
{
  free.get(
    '/',
    purifyRequest(
      QueryValidations.list,
      SubscriptionValidations.getAvailableSubscriptions,
    ),
    SubscriptionControllers.getAvailableSubscriptions,
  );

  free.get(
    '/:subscriptionId',
    purifyRequest(QueryValidations.exists('subscriptionId', 'subscription')),
    SubscriptionControllers.getSubscriptionDetails,
  );

  free.get(
    '/:subscriptionId/subscribe',
    auth.all,
    purifyRequest(QueryValidations.exists('subscriptionId', 'subscription')),
    SubscriptionControllers.subscribePlan,
  );
}

export const SubscriptionRoutes = {
  /**
   * Only admin can access
   *
   * @url : (base_url)/admin/subscriptions/
   */
  admin,

  /**
   * User can access
   *
   * @url : (base_url)/subscriptions/
   */
  free,
};
