import type { Prisma } from "@/db";

export const artistProfileIncludes = {
  media_list: true,
  members: true,
  rider_list: true,
  social_link_list: true,
  track_list: true,
} as const satisfies Prisma.ArtistProfileInclude;

export const profileIncludes = {
  artist_profile: {
    include: artistProfileIncludes,
  },

  /**
   * todo: add other profile types when they are implemented
   */
} as const satisfies Prisma.ProfileInclude;
