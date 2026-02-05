import { Router } from 'express';
import { CalendarControllers } from './Calendar.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { CalendarValidations } from './Calendar.validation';
import auth from '../../middlewares/auth';

const router = Router();

/**
 * Get My Events
 */
router.get(
  '/events',
  auth.all,
  purifyRequest(CalendarValidations.getEvents),
  CalendarControllers.getEvents,
);

/**
 * Generate Google OAuth2 Authorization URL
 */
router.post('/generate-auth-url', auth.all, CalendarControllers.generateAuthUrl);

/**
 * Handle Google OAuth2 Callback
 */
router.get(
  '/google-auth-callback',
  purifyRequest(CalendarValidations.oAuth2Callback),
  CalendarControllers.oAuth2Callback,
);

export const CalendarRoutes = router;
