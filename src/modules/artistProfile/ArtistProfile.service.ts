import { prisma } from "@/db";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";
import { artistProfileIncludes } from "./ArtistProfile.constant";
import type {
  SCreateArtistProfile,
  SGetProfile,
  SUpdateProfile,
  SAddMember,
  SUpdateMember,
  SDeleteMember,
  SUpsertSocialLink,
  SDeleteSocialLink,
  SAddRider,
  SUpdateRider,
  SDeleteRider,
  SAddMedia,
  SUpdateMedia,
  SDeleteMedia,
  SAddTrack,
  SUpdateTrack,
  SDeleteTrack,
} from "./ArtistProfile.interface";

/**
 * Asserts that an artist profile exists. Used as a guard in sub-resource operations
 * to provide a clear NOT_FOUND error before attempting to create nested records.
 */
const assertProfileExists = async (artist_profile_id: string) => {
  const exists = await prisma.artistProfile.findUnique({
    where: { artist_profile_id },
    include: {
      profile: {
        select: {
          user_id: true,
        },
      },
    },
  });

  if (!exists) {
    throw new ServerError(statusCodes.NOT_FOUND, "Artist profile not found");
  }

  return exists;
};

/*************************************/
/*********** Profile Core ************/
/*************************************/

/**
 * Creates or updates an artist profile linked to the given user and profile.
 * Uses upsert to be idempotent — safe to call multiple times without duplicating data.
 */
const createProfile: SCreateArtistProfile = async ({ user, profile }) => {
  return await prisma.artistProfile.upsert({
    where: {
      profile_id: profile.profile_id,
    },
    update: {
      artist_profile_id: `ap_${user.user_sl}`,
    },
    create: {
      artist_profile_id: `ap_${user.user_sl}`,
      profile_id: profile.profile_id,
    },
    include: artistProfileIncludes,
  });
};

/**
 * Retrieves a full artist profile by ID, including all related sub-resources
 * (members, social links, riders, media, tracks). Throws NOT_FOUND if no profile exists.
 */
const getProfile: SGetProfile = async (artist_profile_id) => {
  const profile = await prisma.artistProfile.findUnique({
    where: { artist_profile_id },
    include: artistProfileIncludes,
  });

  if (!profile) {
    throw new ServerError(statusCodes.NOT_FOUND, "Artist profile not found");
  }

  return profile;
};

/**
 * Updates the core fields of an artist profile (bio, genres, booking fees, etc.).
 * Returns the full updated profile with all relations included.
 * Throws NOT_FOUND if the profile does not exist.
 */
const updateProfile: SUpdateProfile = async (artist_profile_id, data, user) => {
  const { profile } = await assertProfileExists(artist_profile_id);

  if (profile.user_id !== user.user_id) {
    throw new ServerError(
      statusCodes.FORBIDDEN,
      "You do not have permission to update this artist profile",
    );
  }

  return await prisma.artistProfile.update({
    where: { artist_profile_id },
    data,
    include: artistProfileIncludes,
  });
};

/*************************************/
/************* Members ***************/
/*************************************/

/**
 * Adds a new band/group member to an artist profile.
 * Verifies the parent profile exists before creating the member record.
 */
const addMember: SAddMember = async (artist_profile_id, data) => {
  await assertProfileExists(artist_profile_id);

  return await prisma.artistProfileMember.create({
    data: {
      ...data,
      artist_profile_id,
    },
  });
};

/**
 * Updates an existing member's details (name, role, or photo).
 * Validates ownership by checking the member belongs to the given artist profile,
 * preventing cross-profile data mutations.
 */
const updateMember: SUpdateMember = async (
  member_id,
  artist_profile_id,
  data,
) => {
  const member = await prisma.artistProfileMember.findFirst({
    where: { member_id, artist_profile_id },
  });

  if (!member) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Member not found in this artist profile",
    );
  }

  return await prisma.artistProfileMember.update({
    where: { member_id },
    data,
  });
};

/**
 * Deletes a member from an artist profile.
 * Validates ownership to ensure the member belongs to the specified profile
 * before deletion, preventing accidental cross-profile deletes.
 */
const deleteMember: SDeleteMember = async (member_id, artist_profile_id) => {
  const member = await prisma.artistProfileMember.findFirst({
    where: { member_id, artist_profile_id },
  });

  if (!member) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Member not found in this artist profile",
    );
  }

  await prisma.artistProfileMember.delete({
    where: { member_id },
  });
};

/*************************************/
/*********** Social Links ************/
/*************************************/

/**
 * Upserts a social link for an artist profile by platform.
 * Since each platform should have only one URL per profile, this finds an
 * existing record for the same platform and updates it, or creates a new one.
 * This enforces a logical unique constraint at the service layer.
 */
const upsertSocialLink: SUpsertSocialLink = async (
  artist_profile_id,
  { platform, url },
) => {
  await assertProfileExists(artist_profile_id);

  const existing = await prisma.artistSocialLink.findFirst({
    where: { artist_profile_id, platform },
  });

  if (existing) {
    return await prisma.artistSocialLink.update({
      where: { id: existing.id },
      data: { url },
    });
  }

  return await prisma.artistSocialLink.create({
    data: { artist_profile_id, platform, url },
  });
};

/**
 * Deletes a social link from an artist profile by ID.
 * Validates ownership to ensure the link belongs to the specified profile.
 */
const deleteSocialLink: SDeleteSocialLink = async (id, artist_profile_id) => {
  const link = await prisma.artistSocialLink.findFirst({
    where: { id, artist_profile_id },
  });

  if (!link) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Social link not found in this artist profile",
    );
  }

  await prisma.artistSocialLink.delete({ where: { id } });
};

/*************************************/
/************** Riders ***************/
/*************************************/

/**
 * Adds a rider item (technical or hospitality) to an artist profile.
 * Verifies the parent profile exists before creating the rider record.
 */
const addRider: SAddRider = async (artist_profile_id, data) => {
  await assertProfileExists(artist_profile_id);

  return await prisma.artistRider.create({
    data: { ...data, artist_profile_id },
  });
};

/**
 * Updates an existing rider item's details.
 * Validates ownership by checking the rider belongs to the given artist profile.
 */
const updateRider: SUpdateRider = async (id, artist_profile_id, data) => {
  const rider = await prisma.artistRider.findFirst({
    where: { id, artist_profile_id },
  });

  if (!rider) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Rider not found in this artist profile",
    );
  }

  return await prisma.artistRider.update({ where: { id }, data });
};

/**
 * Deletes a rider item from an artist profile.
 * Validates ownership before deletion to prevent cross-profile mutations.
 */
const deleteRider: SDeleteRider = async (id, artist_profile_id) => {
  const rider = await prisma.artistRider.findFirst({
    where: { id, artist_profile_id },
  });

  if (!rider) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Rider not found in this artist profile",
    );
  }

  await prisma.artistRider.delete({ where: { id } });
};

/*************************************/
/*************** Media ***************/
/*************************************/

/**
 * Adds a media item (photo or video) to an artist profile.
 * The display_order field controls the sort order in the gallery.
 */
const addMedia: SAddMedia = async (artist_profile_id, data) => {
  await assertProfileExists(artist_profile_id);

  return await prisma.artistMedia.create({
    data: { ...data, artist_profile_id },
  });
};

/**
 * Updates metadata for a media item (caption, thumbnail, display_order).
 * URL and media_type are intentionally immutable after creation.
 * Validates ownership before updating.
 */
const updateMedia: SUpdateMedia = async (id, artist_profile_id, data) => {
  const media = await prisma.artistMedia.findFirst({
    where: { id, artist_profile_id },
  });

  if (!media) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Media not found in this artist profile",
    );
  }

  return await prisma.artistMedia.update({ where: { id }, data });
};

/**
 * Deletes a media item from an artist profile.
 * Validates ownership before deletion.
 */
const deleteMedia: SDeleteMedia = async (id, artist_profile_id) => {
  const media = await prisma.artistMedia.findFirst({
    where: { id, artist_profile_id },
  });

  if (!media) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Media not found in this artist profile",
    );
  }

  await prisma.artistMedia.delete({ where: { id } });
};

/*************************************/
/************** Tracks ***************/
/*************************************/

/**
 * Adds a track to an artist profile.
 * The display_order field controls the sort order in the track list.
 */
const addTrack: SAddTrack = async (artist_profile_id, data) => {
  await assertProfileExists(artist_profile_id);

  return await prisma.artistTrack.create({
    data: { ...data, artist_profile_id },
  });
};

/**
 * Updates a track's details (title, url, platform, display_order).
 * Validates ownership before updating.
 */
const updateTrack: SUpdateTrack = async (id, artist_profile_id, data) => {
  const track = await prisma.artistTrack.findFirst({
    where: { id, artist_profile_id },
  });

  if (!track) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Track not found in this artist profile",
    );
  }

  return await prisma.artistTrack.update({ where: { id }, data });
};

/**
 * Deletes a track from an artist profile.
 * Validates ownership before deletion.
 */
const deleteTrack: SDeleteTrack = async (id, artist_profile_id) => {
  const track = await prisma.artistTrack.findFirst({
    where: { id, artist_profile_id },
  });

  if (!track) {
    throw new ServerError(
      statusCodes.NOT_FOUND,
      "Track not found in this artist profile",
    );
  }

  await prisma.artistTrack.delete({ where: { id } });
};

export const ArtistProfileServices = {
  // Profile core
  createProfile,
  getProfile,
  updateProfile,
  // Members
  addMember,
  updateMember,
  deleteMember,
  // Social links
  upsertSocialLink,
  deleteSocialLink,
  // Riders
  addRider,
  updateRider,
  deleteRider,
  // Media
  addMedia,
  updateMedia,
  deleteMedia,
  // Tracks
  addTrack,
  updateTrack,
  deleteTrack,
};
