import { type Prisma, prisma } from '../../../utils/db';

export const SystemVenueServices = {
  /**
   * Create or update a system venue based on the source and source_id. If a venue with the same source and source_id exists, it will be updated with the new payload. If it does not exist, a new venue will be created.
   */
  async createORUpdateSystemVenue(
    payload: Prisma.SystemVenueCreateArgs['data'],
  ) {
    const venue = await prisma.systemVenue.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      update: payload,
      create: payload,
    });

    return venue;
  },
};
