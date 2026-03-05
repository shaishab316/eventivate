import type { Prisma } from "@/db";

/**
 * Artist profile includes. This is used to specify which related data should be included when fetching an artist profile. For example, when fetching an artist profile, we want to include the media list, members, rider list, social link list, and track list.
 */
export const artistProfileIncludes = {
  media_list: true,
  members: true,
  rider_list: true,
  social_link_list: true,
  track_list: true,
} as const satisfies Prisma.ArtistProfileInclude;
