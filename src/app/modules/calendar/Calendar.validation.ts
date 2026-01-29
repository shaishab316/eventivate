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

  getMyEvents: z.object({
    query: z.object({
      start_date_time: z.iso
        .datetime('Start date-time is required and must be in ISO format')
        .optional(),
      end_date_time: z.iso
        .datetime('End date-time is required and must be in ISO format')
        .optional(),
      limit: z.coerce
        .number()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(10),
    }),
  }),
};
