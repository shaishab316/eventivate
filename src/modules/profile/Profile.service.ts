import { prisma } from "@/db";
import { MSafeUser } from "../user/User.interface";
import { profileIncludes } from "./Profile.constant";
import { artistProfileIncludes } from "../artistProfile/ArtistProfile.constant";
import { ArtistProfileServices } from "../artistProfile/ArtistProfile.service";

/**
 * Service to create or update a profile based on user information
 */
const createProfile = async (user: MSafeUser) => {
  /**
   * Step 1: Upsert profile based on user role
   * - If profile for the user already exists, update the profile_type to match the user's role (in case it changed)
   * - If profile does not exist, create a new profile with profile_type based on user's role
   *
   * Note: We use `upsert` here for simplicity and to ensure idempotency. In a real-world scenario, you might want to handle this logic more granularly (e.g. separate create and update flows) depending on your application's needs.
   */
  const profile = await prisma.profile.upsert({
    where: {
      user_id: user.user_id,
    },
    include: profileIncludes,
    update: {
      profile_type: user.role,
    },
    create: {
      profile_id: `p_${user.user_sl}`,
      user_id: user.user_id,
      profile_type: user.role,
    },
  });

  switch (user.role) {
    case "ARTIST": {
      /**
       * Step 2: Upsert artist profile
       * - If artist profile for the user already exists, do nothing (or update if there are artist-specific fields that need to be updated)
       * - If artist profile does not exist, create a new artist profile linked to the profile created/updated in Step 1
       *
       * Note: Similar to the profile upsert, we use upsert here for simplicity. Adjust as needed based on your application's requirements.
       */
      const artistProfile = await ArtistProfileServices.createProfile({
        user,
        profile,
      });

      profile.artist_profile = artistProfile;

      break;
    }
  }

  return profile;
};

export const ProfileServices = {
  createProfile,
};
