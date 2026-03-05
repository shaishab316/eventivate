import { Router } from "express";
import { purifyRequest } from "@/middlewares/purifyRequest";
import { ArtistProfileValidations } from "./ArtistProfile.validation";
import { ArtistProfileControllers } from "./ArtistProfile.controller";
import { auth } from "@/middlewares/auth";
import capture from "@/middlewares/capture";

const router = Router();

/*************************************/
/*********** Profile Core ************/
/*************************************/

/**
 * GET /:artist_profile_id
 * Fetch a full artist profile with all related sub-resources
 */
router.get(
  "/:artist_profile_id",
  purifyRequest(ArtistProfileValidations.getProfileSchema),
  ArtistProfileControllers.getProfile,
);

/**
 * All artist profile routes require authentication.
 * The `authenticate` middleware verifies the access token and attaches the
 * authenticated user to `req.user` for downstream use.
 */
router.use(
  auth({
    token_type: "access",
    should_verified: true,
    allowed_roles: ["ARTIST"],
  }),
);

/**
 * PATCH /:artist_profile_id
 * Update core profile fields (bio, genre, booking fees, etc.)
 */
router.patch(
  "/:artist_profile_id",
  capture({
    profile_photo: { fileType: "images", maxSizeMB: 10 },
    cover_photo: { fileType: "images", maxSizeMB: 30 },
    press_kit: { fileType: "documents", maxSizeMB: 20 },
  }),
  purifyRequest(ArtistProfileValidations.updateProfileSchema),
  ArtistProfileControllers.updateProfile,
);

/*************************************/
/************* Members ***************/
/*************************************/

/**
 * POST /:artist_profile_id/members
 * Add a new member to the artist profile
 */
router.post(
  "/:artist_profile_id/members",
  purifyRequest(ArtistProfileValidations.addMemberSchema),
  ArtistProfileControllers.addMember,
);

/**
 * PATCH /:artist_profile_id/members/:member_id
 * Update a specific member's details
 */
router.patch(
  "/:artist_profile_id/members/:member_id",
  purifyRequest(ArtistProfileValidations.updateMemberSchema),
  ArtistProfileControllers.updateMember,
);

/**
 * DELETE /:artist_profile_id/members/:member_id
 * Remove a member from the artist profile
 */
router.delete(
  "/:artist_profile_id/members/:member_id",
  purifyRequest(ArtistProfileValidations.deleteMemberSchema),
  ArtistProfileControllers.deleteMember,
);

/*************************************/
/*********** Social Links ************/
/*************************************/

/**
 * POST /:artist_profile_id/social-links
 * Add or update a social link (upserts by platform — one URL per platform)
 */
router.post(
  "/:artist_profile_id/social-links",
  purifyRequest(ArtistProfileValidations.upsertSocialLinkSchema),
  ArtistProfileControllers.upsertSocialLink,
);

/**
 * DELETE /:artist_profile_id/social-links/:id
 * Remove a social link from the artist profile
 */
router.delete(
  "/:artist_profile_id/social-links/:id",
  purifyRequest(ArtistProfileValidations.deleteSocialLinkSchema),
  ArtistProfileControllers.deleteSocialLink,
);

/*************************************/
/************** Riders ***************/
/*************************************/

/**
 * POST /:artist_profile_id/riders
 * Add a rider item (technical or hospitality requirement)
 */
router.post(
  "/:artist_profile_id/riders",
  purifyRequest(ArtistProfileValidations.addRiderSchema),
  ArtistProfileControllers.addRider,
);

/**
 * PATCH /:artist_profile_id/riders/:id
 * Update a specific rider item
 */
router.patch(
  "/:artist_profile_id/riders/:id",
  purifyRequest(ArtistProfileValidations.updateRiderSchema),
  ArtistProfileControllers.updateRider,
);

/**
 * DELETE /:artist_profile_id/riders/:id
 * Remove a rider item from the artist profile
 */
router.delete(
  "/:artist_profile_id/riders/:id",
  purifyRequest(ArtistProfileValidations.deleteRiderSchema),
  ArtistProfileControllers.deleteRider,
);

/*************************************/
/*************** Media ***************/
/*************************************/

/**
 * POST /:artist_profile_id/media
 * Add a media item (photo or video) to the artist profile
 */
router.post(
  "/:artist_profile_id/media",
  purifyRequest(ArtistProfileValidations.addMediaSchema),
  ArtistProfileControllers.addMedia,
);

/**
 * PATCH /:artist_profile_id/media/:id
 * Update media metadata (caption, thumbnail, display order)
 */
router.patch(
  "/:artist_profile_id/media/:id",
  purifyRequest(ArtistProfileValidations.updateMediaSchema),
  ArtistProfileControllers.updateMedia,
);

/**
 * DELETE /:artist_profile_id/media/:id
 * Remove a media item from the artist profile
 */
router.delete(
  "/:artist_profile_id/media/:id",
  purifyRequest(ArtistProfileValidations.deleteMediaSchema),
  ArtistProfileControllers.deleteMedia,
);

/*************************************/
/************** Tracks ***************/
/*************************************/

/**
 * POST /:artist_profile_id/tracks
 * Add a track to the artist profile
 */
router.post(
  "/:artist_profile_id/tracks",
  purifyRequest(ArtistProfileValidations.addTrackSchema),
  ArtistProfileControllers.addTrack,
);

/**
 * PATCH /:artist_profile_id/tracks/:id
 * Update a track's details (title, URL, platform, display order)
 */
router.patch(
  "/:artist_profile_id/tracks/:id",
  purifyRequest(ArtistProfileValidations.updateTrackSchema),
  ArtistProfileControllers.updateTrack,
);

/**
 * DELETE /:artist_profile_id/tracks/:id
 * Remove a track from the artist profile
 */
router.delete(
  "/:artist_profile_id/tracks/:id",
  purifyRequest(ArtistProfileValidations.deleteTrackSchema),
  ArtistProfileControllers.deleteTrack,
);

export const ArtistProfileRoutes = router;
