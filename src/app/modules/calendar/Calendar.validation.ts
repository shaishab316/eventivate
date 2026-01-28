import z from 'zod';

export const CalendarValidations = {
  /**
   * OAuth2 Callback Validation
   */
  oAuth2Callback: z.object({
    query: z.object({
      code: z
        .string('Authorization code is required')
        .trim()
        .min(1, 'Authorization code cannot be empty')
        .max(500, 'Authorization code is too long'),

      state: z
        .string('State is required')
        .trim()
        .min(1, 'State cannot be empty')
        .max(500, 'State is too long'),
    }),
  }),
};
