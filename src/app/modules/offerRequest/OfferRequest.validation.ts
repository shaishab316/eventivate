import { z } from 'zod';
import { OfferRequestConstants } from './OfferRequest.constant';

const order_by_fields = OfferRequestConstants.order_by_fields;

const _ = {
  kind: z.enum(['VENUE', 'ARTIST'], {
    error: 'Kind must be either VENUE or ARTIST',
  }),

  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters long'),

  email: z.email('Email is invalid').optional(),

  phone: z
    .string({ error: 'Phone must be a string' })
    .trim()
    .min(1, 'Phone is required'),

  date: z.iso.date({ error: 'Date must be a valid ISO 8601 date' }),

  time: z.iso.time({ error: 'Time must be a valid ISO 8601 time' }).optional(),

  budget: z
    .string({ error: 'Budget must be a string' })
    .trim()
    .min(1, 'Budget is required'),

  additional_info: z
    .string({ error: 'Additional info must be a string' })
    .trim()
    .max(1000, 'Additional info must be at most 1000 characters long'),

  artist_name: z
    .string({ error: 'Artist name must be a string' })
    .trim()
    .min(1, 'Artist name is required')
    .max(200, 'Artist name must be at most 200 characters long'),

  venue_name: z
    .string({ error: 'Venue name must be a string' })
    .trim()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be at most 200 characters long'),

  system_performer_id: z.uuidv4({
    error: 'System performer ID must be a valid UUID',
  }),

  system_venue_id: z.uuidv4({ error: 'System venue ID must be a valid UUID' }),

  page: z.coerce
    .number('Page must be a number')
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1'),

  limit: z.coerce
    .number('Limit must be a number')
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100'),

  search: z
    .string('Search must be a string')
    .trim()
    .max(100, 'Search must be at most 100 characters long'),

  order_by: z.enum(
    order_by_fields.map(field => [`+${field}`, `-${field}`]).flat() as Array<
      | `+${(typeof order_by_fields)[number]}`
      | `-${(typeof order_by_fields)[number]}`
    >,
  ),
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
      artist_name: _.artist_name.optional(),
      venue_name: _.venue_name.optional(),
      system_performer_id: _.system_performer_id.optional(),
      system_venue_id: _.system_venue_id.optional(),
    }),
  }),

  getAllRequests: z.object({
    query: z.object({
      kind: _.kind.default('ARTIST'),

      page: _.page.default(1),

      limit: _.limit.default(20),

      search: _.search.optional(),

      order_by: _.order_by.default('-created_at'),
    }),
  }),
};
