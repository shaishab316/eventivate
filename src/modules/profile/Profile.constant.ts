import type { Prisma } from "@/db";
import { artistProfileIncludes } from "../artistProfile/ArtistProfile.constant";

/**
 * Profile includes. This is used to specify which related data should be included when fetching a profile. For example, when fetching an artist profile, we want to include the media list, members, rider list, social link list, and track list.
 */
export const profileIncludes = {
  artist_profile: {
    include: artistProfileIncludes,
  },

  /**
   * todo: add other profile types when they are implemented
   */
} as const satisfies Prisma.ProfileInclude;
