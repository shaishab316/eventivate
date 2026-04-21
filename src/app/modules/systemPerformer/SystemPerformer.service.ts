import { haversine } from '../../../helpers/haversine';
import { Prisma, prisma, SystemPerformer } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { TSearchSystemPerformersPayload } from './SystemPerformer.interface';

export const SystemPerformerServices = {
  async createOrUpdateSystemPerformer({
    event_id,
    ...payload
  }: Prisma.SystemPerformerCreateArgs['data'] & { event_id?: string }) {
    const performer = await prisma.systemPerformer.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      create: payload,
      update: payload,
    });

    if (event_id) {
      await prisma.systemEventPerformer.upsert({
        where: {
          event_id_performer_id: {
            event_id,
            performer_id: performer.id,
          },
        },
        create: {
          event_id,
          performer_id: performer.id,
        },
        update: {},
      });
    }

    return performer;
  },

  async createOrUpdateSystemGenre(
    payload: Prisma.SystemGenreCreateArgs['data'],
  ) {
    const performerGenre = await prisma.systemGenre.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      create: payload,
      update: payload,
    });

    return performerGenre;
  },

  async createOrGetSystemPerformerGenre(
    payload: Prisma.SystemPerformerGenreCreateArgs['data'],
  ) {
    const performerGenre = await prisma.systemPerformerGenre.findFirst({
      where: {
        performer_id: payload.performer_id,
        genre_id: payload.genre_id,
      },
    });

    if (performerGenre) {
      return performerGenre;
    }

    return await prisma.systemPerformerGenre.create({
      data: payload,
    });
  },

  async getAllGenres() {
    const genres = await prisma.systemGenre.findMany();

    return genres.map(g => g.slug);
  },

  async searchPerformers({
    page,
    limit,
    search,
    genres,
    location_lat,
    location_lng,
    radius_mi,
    date_start,
    date_end,
  }: TSearchSystemPerformersPayload) {
    const offset = (page - 1) * limit;
    const hasLocation = location_lat != null && location_lng != null;
    const hasGenres = genres && genres.length > 0;

    const conditions: Prisma.Sql[] = [];

    if (search) {
      conditions.push(Prisma.sql`sp.name ILIKE ${'%' + search + '%'}`);
    }

    if (hasGenres) {
      conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1 FROM system_performer_genres spg
        JOIN system_genres sg ON sg.id = spg.genre_id
        WHERE spg.performer_id = sp.id
          AND sg.slug = ANY(${genres}::text[])
      )
    `);
    }

    if (hasLocation) {
      const latDelta = radius_mi / 69;
      const lngDelta =
        radius_mi / (69 * Math.cos(location_lat * (Math.PI / 180)));

      conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1 FROM system_event_performers sep
        JOIN system_events se ON se.id = sep.event_id
        WHERE sep.performer_id = sp.id
          AND se.lat BETWEEN ${location_lat - latDelta} AND ${location_lat + latDelta}
          AND se.lng BETWEEN ${location_lng - lngDelta} AND ${location_lng + lngDelta}
          AND ${haversine(location_lat, location_lng, 'se.lat', 'se.lng')} <= ${radius_mi}
      )
    `);
    }

    if (date_start || date_end) {
      const dateConds: Prisma.Sql[] = [];
      if (date_start) dateConds.push(Prisma.sql`se2.date >= ${date_start}`);
      if (date_end) dateConds.push(Prisma.sql`se2.date <= ${date_end}`);
      conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1 FROM system_event_performers sep2
        JOIN system_events se2 ON se2.id = sep2.event_id
        WHERE sep2.performer_id = sp.id
          AND ${Prisma.join(dateConds, ' AND ')}
      )
    `);
    }

    const where = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.sql``;

    const orderBy = Prisma.sql`ORDER BY sp.created_at DESC`;

    const [performers, [{ total }]] = await Promise.all([
      prisma.$queryRaw<SystemPerformer[]>`
      SELECT sp.*
      FROM system_performers sp
      ${where}
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `,
      prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*) AS total
      FROM system_performers sp
      ${where}
    `,
    ]);

    const performerIds = performers.map(p => p.id);

    const [bookedDatesMap, genresMap] = await Promise.all<
      [
        Record<string, Record<string, string>>,
        Record<
          string,
          { id: string; name: string; slug: string; image: string | null }[]
        >,
      ]
    >([
      performerIds.length
        ? this.getPerformerBookedDatesBatch(performerIds, date_start, date_end)
        : ({} as any),
      performerIds.length
        ? this.getPerformerGenresBatch(performerIds)
        : ({} as any),
    ]);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        } satisfies TPagination,
      },
      performers: performers.map(p => ({
        ...p,
        genres: genresMap[p.id]?.map(g => g.slug) ?? [],
        booked_dates: bookedDatesMap[p.id] ?? {},
      })),
    };
  },

  async getPerformerBookedDatesBatch(
    performerIds: string[],
    from?: Date,
    to?: Date,
  ): Promise<Record<string, Record<string, string>>> {
    if (!performerIds.length) return {};

    const now = new Date();
    const resolvedFrom =
      from ?? new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const resolvedTo =
      to ?? new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);

    const events = await prisma.$queryRaw<
      { performer_id: string; date: string; name: string }[]
    >`
    SELECT
      sep.performer_id,
      TO_CHAR(se.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
      se.name
    FROM system_event_performers sep
    JOIN system_events se ON se.id = sep.event_id
    WHERE sep.performer_id = ANY(${performerIds}::text[])
      AND se.date >= ${resolvedFrom}
      AND se.date <= ${resolvedTo}
      AND se.date IS NOT NULL
    ORDER BY se.date ASC
  `;

    return events.reduce<Record<string, Record<string, string>>>((acc, e) => {
      acc[e.performer_id] ??= {};
      acc[e.performer_id][e.date] = e.name;
      return acc;
    }, {});
  },

  async getPerformerGenresBatch(
    performerIds: string[],
  ): Promise<
    Record<
      string,
      { id: string; name: string; slug: string; image: string | null }[]
    >
  > {
    if (!performerIds.length) return {};

    const rows = await prisma.$queryRaw<
      {
        performer_id: string;
        id: string;
        name: string;
        slug: string;
        image: string | null;
      }[]
    >`
    SELECT
      spg.performer_id,
      sg.id,
      sg.name,
      sg.slug,
      sg.image
    FROM system_performer_genres spg
    JOIN system_genres sg ON sg.id = spg.genre_id
    WHERE spg.performer_id = ANY(${performerIds}::text[])
    ORDER BY sg.name ASC
  `;

    return rows.reduce<Record<string, typeof rows>>((acc, r) => {
      acc[r.performer_id] ??= [];
      acc[r.performer_id].push(r);
      return acc;
    }, {});
  },

  async getPerformerById(performerId: string) {
    const performer = await prisma.systemPerformer.findUnique({
      where: { id: performerId },
    });

    if (!performer) {
      throw new Error('Performer not found');
    }

    const [bookedDatesMap, genres] = await Promise.all([
      this.getPerformerBookedDatesBatch([performerId]),
      this.getPerformerGenresBatch([performerId]),
    ]);

    return {
      ...performer,
      genres: genres[performerId]?.map(g => g.slug) ?? [],
      booked_dates: bookedDatesMap[performerId] ?? {},
    };
  },
};
