import { z } from 'zod';
import { EGender, EUserRole, User as TUser } from '../../../utils/db';
import { TModelZod } from '../../../types/zod';

export const UserValidations = {
  userRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.USER).default(EUserRole.USER),
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long'),
      name: z
        .string({ error: 'Name is required' })
        .nonempty('Name is required')
        .max(100, 'Name must be at most 100 characters long'),
    } satisfies TModelZod<TUser>),
  }),

  editProfile: z.object({
    body: z.object({
      role: z.enum(EUserRole).optional(),
      name: z.string().optional(),
      avatar: z
        .string()
        .nullable()
        .transform(val => val ?? undefined),
      gender: z.enum(EGender).optional(),
      location: z.string().optional(),
    } satisfies TModelZod<TUser>),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: z
        .string({
          error: 'Old Password is missing',
        })
        .min(1, 'Old Password is required')
        .min(6, 'Old Password must be at least 6 characters long'),
      newPassword: z
        .string({
          error: 'New Password is missing',
        })
        .min(1, 'New Password is required')
        .min(6, 'New Password must be at least 6 characters long'),
    }),
  }),

  getAllUser: z.object({
    query: z.object({
      role: z.enum(EUserRole).optional(),
    }),
  }),

  // Done
  agentRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.AGENT).default(EUserRole.AGENT),
      name: z
        .string({ error: 'Name is required' })
        .nonempty('Name is required'),
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long')
        .max(30, 'Password must be at most 30 characters long'),
      experience: z
        .string({ error: 'Experience is required' })
        .nonempty('Experience is required'),
      location: z
        .string({ error: 'Location is required' })
        .nonempty('Location is required'),
      price: z.coerce
        .string({ error: 'Price is required' })
        .nonempty('Price is required'),
    } satisfies TModelZod<TUser>),
  }),

  venueRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.VENUE).default(EUserRole.VENUE),
      name: z
        .string({ error: 'Name is required' })
        .nonempty('Name is required'),
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long')
        .max(30, 'Password must be at most 30 characters long'),
      capacity: z.coerce
        .number({ error: 'Venue capacity is required' })
        .min(1, 'Venue capacity is required'),
      venue_type: z
        .string({ error: 'Venue type is required' })
        .nonempty('Venue type is required'),
      location: z
        .string({ error: 'Location is required' })
        .nonempty('Location is required'),
    } satisfies TModelZod<TUser>),
  }),

  // Done
  artistRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.ARTIST).default(EUserRole.ARTIST),
      name: z
        .string({ error: 'Name is required' })
        .nonempty('Name is required'),
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long')
        .max(30, 'Password must be at most 30 characters long'),
      genre: z
        .string({ error: 'Genre is required' })
        .nonempty('Genre is required'),
      price: z.coerce
        .string({ error: 'Price is required' })
        .nonempty('Price is required'),
      location: z
        .string({ error: 'Location is required' })
        .nonempty('Location is required'),
    } satisfies TModelZod<TUser>),
  }),

  // Issue
  organizerRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.ORGANIZER).default(EUserRole.ORGANIZER),
      name: z
        .string({ error: 'Name is required' })
        .nonempty('Name is required'),
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long')
        .max(30, 'Password must be at most 30 characters long'),
      genre: z
        .string({ error: 'Looking for genre is required' })
        .nonempty('Looking for genre is required'),
      location: z
        .string({ error: 'Location is required' })
        .nonempty('Location is required'),
    } satisfies TModelZod<TUser>),
  }),

  updateAvailability: z.object({
    body: z.object({
      availability: z.array(z.iso.datetime(), {
        error: 'Availability is required',
      }),
    }),
  }),
};
