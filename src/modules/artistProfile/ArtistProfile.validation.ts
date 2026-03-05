import { EArtistType, EMediaType, ERiderType, ESocialPlatform } from "@/db";
import z from "zod";

/**
 * Shared validators for ArtistProfile module
 */
const validator = {
  artist_profile_id: z
    .string("Artist profile ID must be a string")
    .startsWith("ap_", "Invalid artist profile ID format"),

  member_id: z.coerce
    .number("Member ID must be a number")
    .int()
    .positive("Member ID must be a positive integer"),

  resource_id: z.coerce
    .number("ID must be a number")
    .int()
    .positive("ID must be a positive integer"),

  url: z.string("URL must be a string"),

  display_order: z
    .number("Display order must be a number")
    .int()
    .min(0)
    .default(0),
};

/**
 * Reusable params schema for routes that only need artist_profile_id
 */
const baseProfileParams = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
  }),
});

/*************************************/
/******** Profile Core Schemas *******/
/*************************************/

/**
 * Schema for fetching an artist profile by ID
 */
const getProfileSchema = baseProfileParams;

/**
 * Schema for updating an artist profile's core information
 */
const updateProfileSchema = baseProfileParams.extend({
  body: z
    .object({
      stage_name: z.string().min(1).max(100).optional(),
      real_name: z.string().min(1).max(100).optional(),
      profile_photo: validator.url.optional(),
      cover_photo: validator.url.optional(),
      bio: z.string().max(2000).optional(),
      genre: z.array(z.string().min(1)).max(10).optional(),
      sub_genre: z.array(z.string().min(1)).max(20).optional(),
      artist_type: z.enum(EArtistType).optional(),
      years_active: z.number().int().min(0).max(200).optional(),
      press_kit: validator.url.optional(),
      booking_fee_min: z.number().int().min(0).optional(),
      booking_fee_max: z.number().int().min(0).optional(),
      booking_fee_currency: z.string().length(3).toUpperCase().optional(),
    })
    .refine(
      (data) => {
        if (
          data.booking_fee_min !== undefined &&
          data.booking_fee_max !== undefined
        ) {
          return data.booking_fee_min <= data.booking_fee_max;
        }
        return true;
      },
      {
        message:
          "booking_fee_min must be less than or equal to booking_fee_max",
        path: ["booking_fee_min"],
      },
    ),
});

/*************************************/
/*********** Member Schemas **********/
/*************************************/

/**
 * Schema for adding a member to an artist profile
 */
const addMemberSchema = baseProfileParams.extend({
  body: z.object({
    name: z.string("Name must be a string").min(1).max(100),
    role: z.string("Role must be a string").min(1).max(100),
    photo: validator.url.optional(),
  }),
});

/**
 * Schema for updating a specific member in an artist profile
 */
const updateMemberSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    member_id: validator.member_id,
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    role: z.string().min(1).max(100).optional(),
    photo: validator.url.optional(),
  }),
});

/**
 * Schema for deleting a specific member from an artist profile
 */
const deleteMemberSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    member_id: validator.member_id,
  }),
});

/*************************************/
/******** Social Link Schemas ********/
/*************************************/

/**
 * Schema for adding or updating a social link on an artist profile.
 * Upserts by platform — one link per platform per profile.
 */
const upsertSocialLinkSchema = baseProfileParams.extend({
  body: z.object({
    platform: z.enum(ESocialPlatform),
    url: validator.url,
  }),
});

/**
 * Schema for deleting a specific social link from an artist profile
 */
const deleteSocialLinkSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
});

/*************************************/
/*********** Rider Schemas ***********/
/*************************************/

/**
 * Schema for adding a rider item to an artist profile
 */
const addRiderSchema = baseProfileParams.extend({
  body: z.object({
    rider_type: z.enum(ERiderType),
    item: z.string("Item must be a string").min(1).max(200),
    notes: z.string().max(500).optional(),
  }),
});

/**
 * Schema for updating a specific rider item in an artist profile
 */
const updateRiderSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
  body: z.object({
    rider_type: z.enum(ERiderType).optional(),
    item: z.string().min(1).max(200).optional(),
    notes: z.string().max(500).optional(),
  }),
});

/**
 * Schema for deleting a specific rider item from an artist profile
 */
const deleteRiderSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
});

/*************************************/
/*********** Media Schemas ***********/
/*************************************/

/**
 * Schema for adding a media item (photo/video) to an artist profile
 */
const addMediaSchema = baseProfileParams.extend({
  body: z.object({
    media_type: z.enum(EMediaType),
    url: validator.url,
    thumbnail: validator.url.optional(),
    caption: z.string().max(300).optional(),
    display_order: validator.display_order,
  }),
});

/**
 * Schema for updating metadata of a specific media item in an artist profile
 */
const updateMediaSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
  body: z.object({
    caption: z.string().max(300).optional(),
    thumbnail: validator.url.optional(),
    display_order: z.number().int().min(0).optional(),
  }),
});

/**
 * Schema for deleting a specific media item from an artist profile
 */
const deleteMediaSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
});

/*************************************/
/*********** Track Schemas ***********/
/*************************************/

/**
 * Schema for adding a track to an artist profile
 */
const addTrackSchema = baseProfileParams.extend({
  body: z.object({
    title: z.string("Title must be a string").min(1).max(200),
    url: validator.url,
    platform: z.string().max(50).optional(),
    display_order: validator.display_order,
  }),
});

/**
 * Schema for updating a specific track in an artist profile
 */
const updateTrackSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    url: validator.url.optional(),
    platform: z.string().max(50).optional(),
    display_order: z.number().int().min(0).optional(),
  }),
});

/**
 * Schema for deleting a specific track from an artist profile
 */
const deleteTrackSchema = z.object({
  params: z.object({
    artist_profile_id: validator.artist_profile_id,
    id: validator.resource_id,
  }),
});

export const ArtistProfileValidations = {
  // Profile core
  getProfileSchema,
  updateProfileSchema,
  // Members
  addMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
  // Social links
  upsertSocialLinkSchema,
  deleteSocialLinkSchema,
  // Riders
  addRiderSchema,
  updateRiderSchema,
  deleteRiderSchema,
  // Media
  addMediaSchema,
  updateMediaSchema,
  deleteMediaSchema,
  // Tracks
  addTrackSchema,
  updateTrackSchema,
  deleteTrackSchema,
};
