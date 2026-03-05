import type {
  Prisma,
  Profile,
  ArtistProfileMember,
  ArtistSocialLink,
  ArtistRider,
  ArtistMedia,
  ArtistTrack,
} from "@/db";
import type { MSafeUser } from "../user/User.interface";
import type { artistProfileIncludes } from "./ArtistProfile.constant";
import type { z } from "zod";
import type { ArtistProfileValidations } from "./ArtistProfile.validation";

/****************************************/
/******* Controller Types (C prefix) ****/
/****************************************/

export type CGetProfile = z.infer<
  typeof ArtistProfileValidations.getProfileSchema
>;
export type CUpdateProfile = z.infer<
  typeof ArtistProfileValidations.updateProfileSchema
>;

export type CAddMember = z.infer<
  typeof ArtistProfileValidations.addMemberSchema
>;
export type CUpdateMember = z.infer<
  typeof ArtistProfileValidations.updateMemberSchema
>;
export type CDeleteMember = z.infer<
  typeof ArtistProfileValidations.deleteMemberSchema
>;

export type CUpsertSocialLink = z.infer<
  typeof ArtistProfileValidations.upsertSocialLinkSchema
>;
export type CDeleteSocialLink = z.infer<
  typeof ArtistProfileValidations.deleteSocialLinkSchema
>;

export type CAddRider = z.infer<typeof ArtistProfileValidations.addRiderSchema>;
export type CUpdateRider = z.infer<
  typeof ArtistProfileValidations.updateRiderSchema
>;
export type CDeleteRider = z.infer<
  typeof ArtistProfileValidations.deleteRiderSchema
>;

export type CAddMedia = z.infer<typeof ArtistProfileValidations.addMediaSchema>;
export type CUpdateMedia = z.infer<
  typeof ArtistProfileValidations.updateMediaSchema
>;
export type CDeleteMedia = z.infer<
  typeof ArtistProfileValidations.deleteMediaSchema
>;

export type CAddTrack = z.infer<typeof ArtistProfileValidations.addTrackSchema>;
export type CUpdateTrack = z.infer<
  typeof ArtistProfileValidations.updateTrackSchema
>;
export type CDeleteTrack = z.infer<
  typeof ArtistProfileValidations.deleteTrackSchema
>;

/****************************************/
/********* Model Types (M prefix) ********/
/****************************************/

/**
 * Full ArtistProfile with all its relations included
 */
export type MArtistProfile = Prisma.ArtistProfileGetPayload<{
  include: typeof artistProfileIncludes;
}>;

/****************************************/
/******* Service Types (S prefix) ********/
/****************************************/

// --- Profile Core ---

export type SCreateArtistProfilePayload = {
  user: MSafeUser;
  profile: Profile;
};

export type SCreateArtistProfile = (
  payload: SCreateArtistProfilePayload,
) => Promise<MArtistProfile>;

/** @deprecated Use MArtistProfile directly */
export type SCreateArtistProfileResponse = MArtistProfile;

export type SGetProfile = (
  artist_profile_id: string,
) => Promise<MArtistProfile>;

export type SUpdateProfilePayload = CUpdateProfile["body"];
export type SUpdateProfile = (
  artist_profile_id: string,
  data: SUpdateProfilePayload,
  user: MSafeUser,
) => Promise<MArtistProfile>;

// --- Members ---

export type SAddMemberPayload = CAddMember["body"];
export type SAddMember = (
  artist_profile_id: string,
  data: SAddMemberPayload,
) => Promise<ArtistProfileMember>;

export type SUpdateMemberPayload = CUpdateMember["body"];
export type SUpdateMember = (
  member_id: number,
  artist_profile_id: string,
  data: SUpdateMemberPayload,
) => Promise<ArtistProfileMember>;

export type SDeleteMember = (
  member_id: number,
  artist_profile_id: string,
) => Promise<void>;

// --- Social Links ---

export type SUpsertSocialLinkPayload = CUpsertSocialLink["body"];
export type SUpsertSocialLink = (
  artist_profile_id: string,
  data: SUpsertSocialLinkPayload,
) => Promise<ArtistSocialLink>;

export type SDeleteSocialLink = (
  id: number,
  artist_profile_id: string,
) => Promise<void>;

// --- Riders ---

export type SAddRiderPayload = CAddRider["body"];
export type SAddRider = (
  artist_profile_id: string,
  data: SAddRiderPayload,
) => Promise<ArtistRider>;

export type SUpdateRiderPayload = CUpdateRider["body"];
export type SUpdateRider = (
  id: number,
  artist_profile_id: string,
  data: SUpdateRiderPayload,
) => Promise<ArtistRider>;

export type SDeleteRider = (
  id: number,
  artist_profile_id: string,
) => Promise<void>;

// --- Media ---

export type SAddMediaPayload = CAddMedia["body"];
export type SAddMedia = (
  artist_profile_id: string,
  data: SAddMediaPayload,
) => Promise<ArtistMedia>;

export type SUpdateMediaPayload = CUpdateMedia["body"];
export type SUpdateMedia = (
  id: number,
  artist_profile_id: string,
  data: SUpdateMediaPayload,
) => Promise<ArtistMedia>;

export type SDeleteMedia = (
  id: number,
  artist_profile_id: string,
) => Promise<void>;

// --- Tracks ---

export type SAddTrackPayload = CAddTrack["body"];
export type SAddTrack = (
  artist_profile_id: string,
  data: SAddTrackPayload,
) => Promise<ArtistTrack>;

export type SUpdateTrackPayload = CUpdateTrack["body"];
export type SUpdateTrack = (
  id: number,
  artist_profile_id: string,
  data: SUpdateTrackPayload,
) => Promise<ArtistTrack>;

export type SDeleteTrack = (
  id: number,
  artist_profile_id: string,
) => Promise<void>;
