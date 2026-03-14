import { haversine } from '../../../helpers/haversine';
import { fetchVenueImage } from '../../../lib/google-places';
import { Prisma, prisma, SystemVenue } from '../../../utils/db';
import { errorLogger } from '../../../utils/logger';
import { TPagination } from '../../../utils/server/serveResponse';
import { downloadFile } from '../../middlewares/capture';
import { TSearchSystemVenuesPayload } from './SystemVenue.interface';

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

    if (!venue.image_url) {
      // fire-and-forget
      fetchVenueImage(venue.name, venue.latitude, venue.longitude)
        .then(async url => {
          const filePath = await downloadFile({ url, fileType: 'system' });

          if (!filePath) return;

          await prisma.systemVenue.update({
            where: { id: venue.id },
            data: { image_url: filePath },
          });
        })
        .catch(err => {
          errorLogger.error(
            `[fetchVenueImage] failed for venue ${venue.id}: %O`,
            err,
          );
        });
    }

    return venue;
  },

  async searchSystemVenues({
    page,
    limit,
    search,
    location_lat,
    location_lng,
    radius_mi,
  }: TSearchSystemVenuesPayload) {
    const offset = (page - 1) * limit;
    const hasLocation = location_lat != undefined && location_lng != undefined;

    // ─── build conditions dynamically — add new filters here only ───────────────
    const conditions: Prisma.Sql[] = [];

    if (search) {
      conditions.push(Prisma.sql`name ILIKE ${'%' + search + '%'}`);
    }

    if (hasLocation) {
      const latDelta = radius_mi / 69;
      const lngDelta =
        radius_mi / (69 * Math.cos(location_lat * (Math.PI / 180)));

      conditions.push(
        Prisma.sql`lat BETWEEN ${location_lat - latDelta} AND ${location_lat + latDelta}`,
      );
      conditions.push(
        Prisma.sql`lng BETWEEN ${location_lng - lngDelta} AND ${location_lng + lngDelta}`,
      );
      conditions.push(
        Prisma.sql`${haversine(location_lat, location_lng)} <= ${radius_mi}`,
      );
    }

    const where = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.sql``;
    const select = hasLocation
      ? Prisma.sql`*, ${haversine(location_lat, location_lng)} AS distance_mi`
      : Prisma.sql`*`;
    const orderBy = hasLocation
      ? Prisma.sql`ORDER BY distance_mi ASC`
      : Prisma.sql`ORDER BY created_at DESC`;

    const [venues, [{ total }]] = await Promise.all([
      prisma.$queryRaw<
        SystemVenue[]
      >`SELECT ${select} FROM system_venues ${where} ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
      prisma.$queryRaw<
        [{ total: bigint }]
      >`SELECT COUNT(*) AS total FROM system_venues ${where}`,
    ]);

    const venueIds = venues.map(v => v.id);
    const bookedDatesMap = venueIds.length
      ? await this.getVenueBookedDatesBatch(venueIds)
      : {};

    return {
      meta: {
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        } satisfies TPagination,
      },
      venues: await Promise.all(
        venues.map(async v => ({
          ...v,
          booked_dates: bookedDatesMap[v.id] ?? {},
        })),
      ),
    };
  },

  async getVenueBookedDatesBatch(
    venueIds: string[],
  ): Promise<Record<string, Record<string, string>>> {
    if (!venueIds.length) return {};

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      0,
      23,
      59,
      59,
      999,
    );

    const events = await prisma.$queryRaw<
      { venue_id: string; date: string; name: string }[]
    >`
    SELECT
      venue_id,
      TO_CHAR(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
      name
    FROM system_events
    WHERE venue_id = ANY(${venueIds}::text[])
      AND date     >= ${from}
      AND date     <= ${to}
      AND date     IS NOT NULL
    ORDER BY date ASC
  `;

    return events.reduce<Record<string, Record<string, string>>>((acc, e) => {
      acc[e.venue_id] ??= {};
      acc[e.venue_id][e.date] = e.name;
      return acc;
    }, {});
  },
};
