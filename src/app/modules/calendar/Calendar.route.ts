import { Router } from 'express';
import { CalendarControllers } from './Calendar.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { CalendarValidations } from './Calendar.validation';

const router = Router();

/**
 * Get My Events
 */
router.get(
  '/my-events',
  purifyRequest(CalendarValidations.getMyEvents),
  CalendarControllers.getMyEvents,
);

/**
 * Generate Google OAuth2 Authorization URL
 */
router.get('/generate-auth-url', CalendarControllers.generateAuthUrl);

/**
 * Handle Google OAuth2 Callback
 */
router.get(
  '/google-auth-callback',
  purifyRequest(CalendarValidations.oAuth2Callback),
  CalendarControllers.oAuth2Callback,
);

export const CalendarRoutes = router;
