import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { AdminControllers } from './Admin.controller';
import { BlogRoutes } from '../blog/Blog.route';
import { SubscriptionRoutes } from '../subscription/Subscription.route';
import { MailRoutes } from '../mail/Mail.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';

const admin = injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/blogs': [BlogRoutes.admin],
  '/subscriptions': [SubscriptionRoutes.admin],
  '/mails': [MailRoutes.admin],
  '/context-pages': [ContextPageRoutes.admin],
});

admin.get('/overview', AdminControllers.getAdminOverview);

export const AdminRoutes = {
  /**
   * Only admin can access
   *
   * @url : (base_url)/admin/
   */
  admin,
};
