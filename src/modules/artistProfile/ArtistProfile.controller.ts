import catchAsync from "@/middlewares/catchAsync";
import type {
  CGetProfile,
  CUpdateProfile,
  CAddMember,
  CUpdateMember,
  CDeleteMember,
  CUpsertSocialLink,
  CDeleteSocialLink,
  CAddRider,
  CUpdateRider,
  CDeleteRider,
  CAddMedia,
  CUpdateMedia,
  CDeleteMedia,
  CAddTrack,
  CUpdateTrack,
  CDeleteTrack,
} from "./ArtistProfile.interface";
import { ArtistProfileServices } from "./ArtistProfile.service";

/*************************************/
/*********** Profile Core ************/
/*************************************/

/**
 * Controller for fetching a full artist profile by ID, including all
 * related sub-resources (members, social links, riders, media, tracks).
 */
const getProfile = catchAsync<CGetProfile>(async ({ params }) => {
  const data = await ArtistProfileServices.getProfile(params.artist_profile_id);

  return {
    message: "Artist profile fetched successfully",
    data,
  };
});

/**
 * Controller for updating the core fields of an artist profile such as
 * stage name, bio, genres, booking fees, and other profile metadata.
 */
const updateProfile = catchAsync<CUpdateProfile>(async ({ params, body }) => {
  const data = await ArtistProfileServices.updateProfile(
    params.artist_profile_id,
    body,
  );

  return {
    message: "Artist profile updated successfully",
    data,
  };
});

/*************************************/
/************* Members ***************/
/*************************************/

/**
 * Controller for adding a new member to an artist profile.
 * Useful for bands, duos, or any multi-member act.
 */
const addMember = catchAsync<CAddMember>(async ({ params, body }) => {
  const data = await ArtistProfileServices.addMember(
    params.artist_profile_id,
    body,
  );

  return {
    message: "Member added successfully",
    data,
  };
});

/**
 * Controller for updating an existing member's details (name, role, photo)
 * within an artist profile.
 */
const updateMember = catchAsync<CUpdateMember>(async ({ params, body }) => {
  const data = await ArtistProfileServices.updateMember(
    params.member_id,
    params.artist_profile_id,
    body,
  );

  return {
    message: "Member updated successfully",
    data,
  };
});

/**
 * Controller for removing a member from an artist profile.
 */
const deleteMember = catchAsync<CDeleteMember>(async ({ params }) => {
  await ArtistProfileServices.deleteMember(
    params.member_id,
    params.artist_profile_id,
  );

  return {
    message: "Member removed successfully",
  };
});

/*************************************/
/*********** Social Links ************/
/*************************************/

/**
 * Controller for adding or updating a social media link on an artist profile.
 * Each platform can only have one URL — this upserts by platform.
 */
const upsertSocialLink = catchAsync<CUpsertSocialLink>(
  async ({ params, body }) => {
    const data = await ArtistProfileServices.upsertSocialLink(
      params.artist_profile_id,
      body,
    );

    return {
      message: "Social link saved successfully",
      data,
    };
  },
);

/**
 * Controller for removing a social media link from an artist profile.
 */
const deleteSocialLink = catchAsync<CDeleteSocialLink>(async ({ params }) => {
  await ArtistProfileServices.deleteSocialLink(
    params.id,
    params.artist_profile_id,
  );

  return {
    message: "Social link removed successfully",
  };
});

/*************************************/
/************** Riders ***************/
/*************************************/

/**
 * Controller for adding a rider item (technical or hospitality requirement)
 * to an artist profile.
 */
const addRider = catchAsync<CAddRider>(async ({ params, body }) => {
  const data = await ArtistProfileServices.addRider(
    params.artist_profile_id,
    body,
  );

  return {
    message: "Rider item added successfully",
    data,
  };
});

/**
 * Controller for updating an existing rider item's details.
 */
const updateRider = catchAsync<CUpdateRider>(async ({ params, body }) => {
  const data = await ArtistProfileServices.updateRider(
    params.id,
    params.artist_profile_id,
    body,
  );

  return {
    message: "Rider item updated successfully",
    data,
  };
});

/**
 * Controller for removing a rider item from an artist profile.
 */
const deleteRider = catchAsync<CDeleteRider>(async ({ params }) => {
  await ArtistProfileServices.deleteRider(params.id, params.artist_profile_id);

  return {
    message: "Rider item removed successfully",
  };
});

/*************************************/
/*************** Media ***************/
/*************************************/

/**
 * Controller for uploading a media item (photo or video) to an artist profile.
 */
const addMedia = catchAsync<CAddMedia>(async ({ params, body }) => {
  const data = await ArtistProfileServices.addMedia(
    params.artist_profile_id,
    body,
  );

  return {
    message: "Media item added successfully",
    data,
  };
});

/**
 * Controller for updating a media item's metadata (caption, thumbnail, display order).
 * The URL and media type cannot be changed after creation.
 */
const updateMedia = catchAsync<CUpdateMedia>(async ({ params, body }) => {
  const data = await ArtistProfileServices.updateMedia(
    params.id,
    params.artist_profile_id,
    body,
  );

  return {
    message: "Media item updated successfully",
    data,
  };
});

/**
 * Controller for removing a media item from an artist profile.
 */
const deleteMedia = catchAsync<CDeleteMedia>(async ({ params }) => {
  await ArtistProfileServices.deleteMedia(params.id, params.artist_profile_id);

  return {
    message: "Media item removed successfully",
  };
});

/*************************************/
/************** Tracks ***************/
/*************************************/

/**
 * Controller for adding a track to an artist profile.
 */
const addTrack = catchAsync<CAddTrack>(async ({ params, body }) => {
  const data = await ArtistProfileServices.addTrack(
    params.artist_profile_id,
    body,
  );

  return {
    message: "Track added successfully",
    data,
  };
});

/**
 * Controller for updating a track's details (title, URL, platform, display order).
 */
const updateTrack = catchAsync<CUpdateTrack>(async ({ params, body }) => {
  const data = await ArtistProfileServices.updateTrack(
    params.id,
    params.artist_profile_id,
    body,
  );

  return {
    message: "Track updated successfully",
    data,
  };
});

/**
 * Controller for removing a track from an artist profile.
 */
const deleteTrack = catchAsync<CDeleteTrack>(async ({ params }) => {
  await ArtistProfileServices.deleteTrack(params.id, params.artist_profile_id);

  return {
    message: "Track removed successfully",
  };
});

/**
 * Export all ArtistProfile controllers
 */
export const ArtistProfileControllers = {
  // Profile core
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
