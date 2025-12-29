import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { EEventStatus, Event as TEvent } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';

/**
 * Validation for event
 */
export const EventValidations = {
  /**
   * Validation schema for create event
   */
  createEvent: z.object({
    body: z.object({
      status: z.enum(EEventStatus).optional(),
      title: z.string({ error: 'Title is required' }).nonempty({
        message: 'Title is required',
      }),
      images: z.array(z.string()).optional(),
      description: z.string({ error: 'Description is required' }).nonempty({
        message: 'Description is required',
      }),
      start_date: z.iso
        .datetime({ error: 'Start date is required' })
        .refine(date => new Date(date) > new Date(), {
          message: 'Start date must be in the future',
        }),
      end_date: z.iso
        .datetime()
        .refine(date => new Date(date) > new Date(), {
          message: 'End date must be in the future',
        })
        .optional(),
      location: z.string({ error: 'Location is required' }).nonempty({
        message: 'Location is required',
      }),
      ticket_price: z.coerce.number({ error: 'Ticket price is required' }),
      capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
      artist_names: z
        .array(z.string())
        .nonempty('At least one artist is required'),
      published_at: z.iso.datetime().optional(),
    } satisfies TModelZod<TEvent>),
  }),

  /**
   * Validation schema for update event
   */
  updateEvent: z.object({
    body: z.object({
      event_id: z.string().refine(exists('event'), {
        error: ({ input }) => `Event not found with id: ${input}`,
        path: ['event_id'],
      }),
      status: z.enum(EEventStatus).optional(),
      title: z.string().optional(),
      images: z.array(z.string()).optional().nullable(),
      description: z.string().optional(),
      start_date: z.iso
        .datetime()
        .refine(date => date && new Date(date) > new Date(), {
          message: 'Start date must be in the future',
        })
        .optional(),
      end_date: z.iso
        .datetime()
        .refine(date => date && new Date(date) > new Date(), {
          message: 'End date must be in the future',
        })
        .optional(),
      location: z.string().optional(),
      ticket_price: z.coerce.number().optional(),
      capacity: z.coerce.number().optional(),
      artist_names: z.array(z.string()).optional(),
      published_at: z.iso.datetime().optional(),
    } satisfies TModelZod<TEvent, 'event_id'>),
  }),

  /**
   * Validation schema for get organizer events
   */
  getOrganizerEvent: z.object({
    query: z.object({
      status: z.enum(['running', 'completed']).default('running'),
    }),
  }),

  completeEvent: z.object({
    body: z.object({
      event_id: z.string().refine(exists('event'), {
        error: ({ input }) => `Event not found with id: ${input}`,
      }),
    }),
  }),
};
