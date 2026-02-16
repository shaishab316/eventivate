import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import {
  EAgentOfferStatus,
  EUserRole,
  Prisma,
  prisma,
} from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import type { TList } from '../query/Query.interface';
import { artistSearchableFields } from './Artist.constant';
import type {
  TDeleteAgent,
  TGetAgentList,
  TInviteAgent,
  TProcessArtistRequest,
  TSearchArtistsPayload,
} from './Artist.interface';
import { userOmit } from '../user/User.constant';
import { agentSearchableFields } from '../agent/Agent.constant';
import { months } from '../../../constants/month';
import { omit } from '../../../utils/db/omit';

/**
 * All artist related services
 */
export const ArtistServices = {
  /**
   * Retrieve all artist list
   *
   * @param {TList} { limit, page, search }
   */
  async getArtistList({
    limit,
    page,
    search,
    notIn,
  }: TList & { notIn?: string[] }) {
    const where: Prisma.UserWhereInput = {
      role: EUserRole.ARTIST,
    };

    /**
     * Exclude artists in notIn list
     */
    if (notIn && notIn.length > 0) {
      where.id = { notIn };
    }

    //? Search artist using searchable fields
    if (search) {
      where.OR = artistSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const artists = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      //? exclude unnecessary fields
      omit: userOmit.ARTIST,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      artists,
    };
  },

  /**
   * Invite an agent for an artist
   *
   * @param {TInviteAgent} { agent_id, artist }
   */
  async inviteAgent({ agent_id, artist }: TInviteAgent) {
    //? ensure that the agent does not exist
    if (artist.artist_agents.includes(agent_id)) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You already have this agent',
      );
    }

    //? if agent is already in artist pending list then approve request
    if (artist.artist_pending_agents.includes(agent_id)) {
      return this.processArtistRequest({
        is_approved: true,
        agent_id,
        artist,
      });
    }

    const agent = await prisma.user.findUnique({
      where: { id: agent_id, role: EUserRole.AGENT },
      //? skip unnecessary fields
      select: {
        agent_pending_artists: true,
      },
    });

    if (!agent) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Agent not found');
    }

    //? ensure that the agent had not sent request to this artist before
    if (agent.agent_pending_artists.includes(artist.id)) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You have already sent request to this artist',
      );
    }

    await prisma.user.update({
      where: { id: agent_id },
      data: {
        //? append artist to agent pending list
        agent_pending_artists: { push: artist.id },
      },
      select: { id: true }, //? skip body
    });
  },

  /**
   * Approve or reject artist request from agent
   *
   * @param {TProcessArtistRequest} { agent_id, is_approved, artist }
   */
  async processArtistRequest({
    agent_id,
    is_approved,
    artist,
  }: TProcessArtistRequest) {
    const artistData: Prisma.UserUpdateInput = {
      artist_pending_agents: {
        //? Pop agent from pending list
        set: artist.artist_pending_agents.filter(id => id !== agent_id),
      },
    };

    //? use transaction to update both artist and agent at the same time
    await prisma.$transaction(async tx => {
      if (is_approved) {
        //? append agent to artist list
        artistData.artist_agents = { push: agent_id };

        //? update into agent
        await tx.user.update({
          where: { id: agent_id },
          data: {
            //? append artist to agent list
            agent_artists: { push: artist.id },
          },
          select: { id: true }, //? skip body
        });
      }

      //? update into artist
      await tx.user.update({
        where: { id: artist.id },
        data: artistData,
        select: { id: true }, //? skip body
      });
    });
  },

  /**
   * Retrieve all agent list for a specific artist
   *
   * @param {TGetAgentList} { limit, page, search }
   */
  async getAgentList({ limit, page, search, agent_ids }: TGetAgentList) {
    const agentWhere: Prisma.UserWhereInput = {
      id: { in: agent_ids },
      role: EUserRole.AGENT,
    };

    //? Search agent using searchable fields
    if (search) {
      agentWhere.OR = agentSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const agents = await prisma.user.findMany({
      where: agentWhere,
      skip: (page - 1) * limit,
      take: limit,
      //? exclude unnecessary fields
      omit: userOmit.AGENT,
    });

    const total = await prisma.user.count({ where: agentWhere });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      agents,
    };
  },

  /**
   * Delete agent from artist list
   *
   * @param {TDeleteAgent} { agent_id, artist }
   */
  async deleteAgent({ agent_id, artist }: TDeleteAgent) {
    //? use transaction to update both artist and agent at the same time
    await prisma.$transaction(async tx => {
      //? update into artist
      await tx.user.update({
        where: { id: artist.id },
        data: {
          artist_agents: {
            //? remove agent from artist list
            set: artist.artist_agents.filter(id => id !== agent_id),
          },
        },
        select: { id: true }, //? skip body
      });

      const agent = await tx.user.findUnique({
        where: { id: agent_id },
        //? skip unnecessary fields
        select: {
          agent_artists: true,
        },
      });

      //? update into agent
      await tx.user.update({
        where: { id: agent_id },
        data: {
          agent_artists: {
            //? remove artist from agent list
            set: agent!.agent_artists.filter(id => id !== artist.id),
          },
        },
        select: { id: true }, //? skip body
      });
    });
  },

  /**
   * Retrieve artist overview
   */
  async getArtistOverview(artist_id: string) {
    const currentYear = new Date().getFullYear();
    const yearStartDate = new Date(`${currentYear}-01-01`);
    const yearEndDate = new Date(`${currentYear}-12-31T23:59:59`);

    const ARTIST_COMMISSION = 0.8; // 80%

    // Parallel execution for better performance
    const [agentOfferSummary, bookingCountsByMonth, monthlyRevenueCounts] =
      await Promise.all([
        // Revenue and booking aggregation
        prisma.agentOffer.aggregate({
          where: {
            artist_id,
            status: EAgentOfferStatus.APPROVED,
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        }),

        // Monthly booking counts using raw query (most efficient)
        prisma.$queryRaw<Array<{ month: number; count: bigint }>>`
        SELECT 
          EXTRACT(MONTH FROM approved_at)::int as month,
          COUNT(*)::bigint as count
        FROM agent_offers
        WHERE artist_id = ${artist_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,

        // Monthly revenue from approved bookings (with artist commission)
        prisma.$queryRaw<Array<{ month: number; revenue: number }>>`
        SELECT 
          EXTRACT(MONTH FROM approved_at)::int as month,
          COALESCE(SUM(amount * ${ARTIST_COMMISSION}), 0)::float as revenue
        FROM agent_offers
        WHERE artist_id = ${artist_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,
      ]);

    const totalAmount = agentOfferSummary._sum.amount || 0;
    const totalRevenue = totalAmount * ARTIST_COMMISSION; // Artist gets 80%
    const totalBookings = agentOfferSummary._count.id || 0;

    // Create maps for O(1) lookups
    const monthToBookingCountMap = new Map(
      bookingCountsByMonth.map(({ month, count }) => [month, Number(count)]),
    );

    const monthToRevenueMap = new Map(
      monthlyRevenueCounts.map(({ month, revenue }) => [
        month,
        Number(revenue),
      ]),
    );

    // Generate all 12 months with booking counts
    const monthlyBookingStatistics = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      return {
        month: months[index],
        bookingCount: monthToBookingCountMap.get(monthNumber) || 0,
      };
    });

    // Generate all 12 months with revenue
    const monthlyRevenueStatistics = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      return {
        month: months[index],
        revenue: monthToRevenueMap.get(monthNumber) || 0,
      };
    });

    return {
      totalRevenue,
      totalBookings,
      monthlyBookingStatistics,
      monthlyRevenueStatistics,
    };
  },

  /**
   * Search artists
   */
  async searchArtists({
    limit,
    page,
    search,
    genres,
    location_lat,
    location_lng,
    start_date,
    end_date,
  }: TSearchArtistsPayload) {
    const conditions: string[] = [
      `role = '${EUserRole.ARTIST}'`,
      `is_active = true`,
      `is_verified = true`,
    ];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = artistSearchableFields
        .map(field => `LOWER(${field}) LIKE LOWER($${paramIndex})`)
        .join(' OR ');
      conditions.push(`(${searchConditions})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (genres?.length) {
      const genreConditions = genres
        .map((_, idx) => `LOWER(genre) LIKE LOWER($${paramIndex + idx})`)
        .join(' OR ');

      conditions.push(`(${genreConditions})`);

      genres.forEach(g => {
        params.push(`%${g}%`);
        paramIndex++;
      });
    }

    if (start_date && end_date) {
      conditions.push(`
      EXISTS (
        SELECT 1 FROM unnest(availability) AS avail_date
        WHERE avail_date >= $${paramIndex}::timestamp 
        AND avail_date <= $${paramIndex + 1}::timestamp
      )
    `);
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    if (location_lat !== undefined && location_lng !== undefined) {
      const RADIUS_KM = 50;
      const LAT_DEGREE_PER_KM = 1 / 111;
      const LNG_DEGREE_PER_KM =
        1 / (111 * Math.cos(location_lat * (Math.PI / 180)));

      conditions.push(
        `location_lat BETWEEN $${paramIndex} AND $${paramIndex + 1}`,
      );
      conditions.push(
        `location_lng BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`,
      );
      params.push(
        location_lat - RADIUS_KM * LAT_DEGREE_PER_KM,
        location_lat + RADIUS_KM * LAT_DEGREE_PER_KM,
        location_lng - RADIUS_KM * LNG_DEGREE_PER_KM,
        location_lng + RADIUS_KM * LNG_DEGREE_PER_KM,
      );
      paramIndex += 4;
    }

    const whereClause = conditions.join(' AND ');

    params.push(limit, (page - 1) * limit);

    const artists: any[] = await prisma.$queryRawUnsafe(
      `
    SELECT * FROM users
    WHERE ${whereClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `,
      ...params,
    );

    const [{ count }] = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `
    SELECT COUNT(*) as count FROM users
    WHERE ${whereClause}
  `,
      ...params.slice(0, -2),
    );

    const total = Number(count);

    const totalGenres = await prisma.user.findMany({
      where: {
        role: EUserRole.ARTIST,
      },
      distinct: ['genre'],
      select: {
        genre: true,
      },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        total_genres: Array.from(
          new Set(
            totalGenres.flatMap(
              ({ genre }) =>
                genre
                  ?.toLowerCase()
                  .split(',')
                  .map(g => g.trim()) || [],
            ),
          ),
        ).filter(Boolean),
      },
      artists: artists?.map(artist => omit(artist, userOmit.ARTIST)),
    };
  },
};
