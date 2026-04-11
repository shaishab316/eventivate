import { z } from 'zod';

const _ = {
  kind: z.enum(['VENUE', 'ARTIST'], {
    error: 'Kind must be either VENUE or ARTIST',
  }),

  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters long')
    .optional(),

  email: z.email('Email is invalid').optional(),

  phone: z
    .string({ error: 'Phone must be a string' })
    .trim()
    .min(1, 'Phone is required')
    .optional(),

  date: z.iso
    .datetime({ error: 'Date must be a valid ISO 8601 datetime' })
    .optional(),

  time: z.iso.time({ error: 'Time must be a valid ISO 8601 time' }).optional(),

  budget: z
    .string({ error: 'Budget must be a string' })
    .trim()
    .min(1, 'Budget is required')
    .optional(),

  additional_info: z
    .string({ error: 'Additional info must be a string' })
    .trim()
    .max(1000, 'Additional info must be at most 1000 characters long')
    .optional(),

  artist_name: z
    .string({ error: 'Artist name must be a string' })
    .trim()
    .min(1, 'Artist name is required')
    .max(200, 'Artist name must be at most 200 characters long')
    .optional(),

  venue_name: z
    .string({ error: 'Venue name must be a string' })
    .trim()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be at most 200 characters long')
    .optional(),

  system_performer_id: z
    .uuidv4({ error: 'System performer ID must be a valid UUID' })
    .optional(),

  system_venue_id: z
    .uuidv4({ error: 'System venue ID must be a valid UUID' })
    .optional(),
};

export const OfferRequestValidations = {
  send: z.object({
    body: z.object({
      kind: _.kind,
      name: _.name,
      email: _.email,
      phone: _.phone,
      date: _.date,
      time: _.time,
      budget: _.budget,
      additional_info: _.additional_info,
      artist_name: _.artist_name,
      venue_name: _.venue_name,
      system_performer_id: _.system_performer_id,
      system_venue_id: _.system_venue_id,
    }),
  }),
};
