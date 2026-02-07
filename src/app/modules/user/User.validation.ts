import { z } from 'zod';
import { EGender, EUserRole, type User as TUser } from '../../../utils/db';
import type { TModelZod } from '../../../types/zod';

//? shared validation utils
const _ = {
  name: z
    .string('Name is required')
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters long'),

  email: z.email('Email is invalid').transform(email => email.toLowerCase()),

  password: z
    .string('Password is missing')
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(30, 'Password must be at most 30 characters long'),

  avatar: z.string('Avatar is required').trim(),

  gender: z.enum(EGender),

  location: z
    .string('Location is required')
    .trim()
    .min(1, 'Location is required'),

  location_lat: z.coerce
    .number('Location latitude is required')
    .min(-90, 'Location latitude must be at least -90')
    .max(90, 'Location latitude must be at most 90'),

  location_lng: z.coerce
    .number('Location longitude is required')
    .min(-180, 'Location longitude must be at least -180')
    .max(180, 'Location longitude must be at most 180'),

  role: z.enum(EUserRole),

  is_active: z.boolean('is_active is required'),

  is_verified: z.boolean('is_verified is required'),

  is_admin: z.boolean('is_admin is required'),

  experience: z
    .string('Experience is required')
    .trim()
    .min(1, 'Experience is required'),

  price: z.coerce
    .string('Price is required')
    .trim()
    .min(1, 'Price is required'),

  capacity: z.coerce
    .number('Venue capacity is required')
    .min(1, 'Venue capacity is required'),

  venue_type: z
    .string('Venue type is required')
    .trim()
    .min(1, 'Venue type is required'),

  genre: z
    .string('Looking for genre is required')
    .trim()
    .min(1, 'Looking for genre is required'),

  availability: z.array(
    z.iso.datetime(),
    'Availability should be an array of dates',
  ),
};

export const UserValidations = {
  userRegister: z.object({
    body: z.object({
      role: _.role.default(EUserRole.USER),
      name: _.name,
      email: _.email,
      password: _.password,
    } satisfies TModelZod<TUser>),
  }),

  editProfile: z.object({
    body: z.object({
      role: _.role.optional(),
      name: _.name.optional(),
      avatar: _.avatar.optional(),
      gender: _.gender.optional(),
      location: _.location.optional(),
    } satisfies TModelZod<TUser>),
  }),

  superEditProfile: z.object({
    body: z.object({
      role: _.role.optional(),
      is_active: _.is_active.optional(),
      is_verified: _.is_verified.optional(),
      is_admin: _.is_admin.optional(),
    } satisfies TModelZod<TUser>),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: _.password,
      newPassword: _.password,
    }),
  }),

  getAllUser: z.object({
    query: z.object({
      role: _.role.optional(),
    }),
  }),

  // Done
  agentRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.AGENT).default(EUserRole.AGENT),
      name: _.name,
      email: _.email,
      password: _.password,
      experience: _.experience,
      location: _.location,
      price: _.price,
    } satisfies TModelZod<TUser>),
  }),

  venueRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.VENUE).default(EUserRole.VENUE),
      name: _.name,
      email: _.email,
      password: _.password,
      capacity: _.capacity,
      venue_type: _.venue_type,
      location: _.location,

      /**
       * location_lat and location_lng are included to support geolocation features,
       * enabling functionalities like nearby searches and location-based services.
       */
      location_lat: _.location_lat,
      location_lng: _.location_lng,
    } satisfies TModelZod<TUser>),
  }),

  // Done
  artistRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.ARTIST).default(EUserRole.ARTIST),
      name: _.name,
      email: _.email,
      password: _.password,
      genre: _.genre,
      price: _.price,
      location: _.location,

      /**
       * location_lat and location_lng are included to support geolocation features,
       * enabling functionalities like nearby searches and location-based services.
       */
      location_lat: _.location_lat,
      location_lng: _.location_lng,
    } satisfies TModelZod<TUser>),
  }),

  // Issue
  organizerRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.ORGANIZER).default(EUserRole.ORGANIZER),
      name: _.name,
      email: _.email,
      password: _.password,
      genre: _.genre,
      location: _.location,
    } satisfies TModelZod<TUser>),
  }),

  updateAvailability: z.object({
    body: z.object({
      availability: _.availability,
    }),
  }),

  tourManagerRegister: z.object({
    body: z.object({
      role: z.literal(EUserRole.TOUR_MANAGER).default(EUserRole.TOUR_MANAGER),
      name: _.name,
      email: _.email,
      password: _.password,
    } satisfies TModelZod<TUser>),
  }),
};

export const userSharedValidation = _;
