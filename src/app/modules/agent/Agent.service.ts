import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import {
  EAgentOfferStatus,
  EUserRole,
  Prisma,
  prisma,
} from '../../../utils/db';
import type { TPagination } from '../../../utils/server/serveResponse';
import type { TList } from '../query/Query.interface';
import { userOmit } from '../user/User.constant';
import {
  agentOfferSearchableFields,
  agentSearchableFields,
} from './Agent.constant';
import type {
  TCancelAgentOfferArgs,
  TCreateAgentOfferArgs,
  TDeleteArtist,
  TGetAgentArtistList,
  TGetAgentOffersArgs,
  TInviteArtist,
  TProcessAgentRequest,
} from './Agent.interface';
import { artistSearchableFields } from '../artist/Artist.constant';
import { months } from '../../../constants/month';

/**
 * All agent related services
 */
export const AgentServices = {
  /**
   * Retrieve all agent list
   */
  async getAgentList({
    limit,
    page,
    search,
    notIn,
  }: TList & { notIn?: string[] }) {
    const where: Prisma.UserWhereInput = {
      role: EUserRole.AGENT,
    };

    /**
     * Exclude agents in notIn list
     */
    if (notIn && notIn.length > 0) {
      where.id = { notIn };
    }

    //? Search agent using searchable fields
    if (search) {
      where.OR = agentSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const agents = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      //? exclude unnecessary fields
      omit: userOmit.AGENT,
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
      agents,
    };
  },

  /**
   * Invite artist for agent
   *
   * @param {TInviteArtist} { artist_id, agent }
   */
  async inviteArtist({ artist_id, agent }: TInviteArtist) {
    //? ensure that the artist does not exist
    if (agent.agent_artists.includes(artist_id)) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You already have this artist',
      );
    }

    //? if artist is already in agent pending list then approve request
    if (agent.agent_pending_artists.includes(artist_id)) {
      return this.processAgentRequest({
        is_approved: true,
        artist_id,
        agent,
      });
    }

    const artist = await prisma.user.findUnique({
      where: { id: artist_id, role: EUserRole.ARTIST },
      //? skip unnecessary fields
      select: {
        artist_pending_agents: true,
      },
    });

    if (!artist) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Artist not found');
    }

    //? ensure that the agent had not sent request to this artist
    if (artist.artist_pending_agents.includes(agent.id)) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You have already sent request to this artist',
      );
    }

    return prisma.user.update({
      where: { id: artist_id },
      data: {
        //? add agent to artist pending list
        artist_pending_agents: { push: agent.id },
      },
      select: { id: true }, //? skip body
    });
  },

  /**
   * Approve or reject artist request from agent
   *
   * @param {TProcessAgentRequest} { artist_id, is_approved, agent }
   */
  async processAgentRequest({
    artist_id,
    is_approved,
    agent,
  }: TProcessAgentRequest) {
    const agentData: Prisma.UserUpdateInput = {
      agent_pending_artists: {
        //? Pop artist from pending list
        set: agent.agent_pending_artists.filter(id => id !== artist_id),
      },
    };

    //? use transaction to update both artist and agent at the same time
    await prisma.$transaction(async tx => {
      //? append artist to agent list
      if (is_approved) {
        agentData.agent_artists = { push: artist_id };
      }

      //? update into artist
      await tx.user.update({
        where: { id: artist_id },
        data: {
          //? append agent to artist list
          artist_agents: { push: agent.id },
        },
        select: { id: true }, //? skip body
      });

      //? update into agent
      return tx.user.update({
        where: { id: agent.id },
        data: agentData,
        select: { id: true }, //? skip body
      });
    });
  },

  /**
   * Retrieve all artist list for a specific agent
   *
   * @param {TGetAgentArtistList} { limit, page, search, artist_ids }
   */
  async getAgentArtistList({
    limit,
    page,
    search,
    artist_ids,
  }: TGetAgentArtistList) {
    const artistWhere: Prisma.UserWhereInput = {
      id: { in: artist_ids },
      role: EUserRole.ARTIST,
    };

    /**
     * Search artist using searchable fields
     */
    if (search) {
      artistWhere.OR = artistSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const artists = await prisma.user.findMany({
      where: artistWhere,
      skip: (page - 1) * limit,
      take: limit,
      //? exclude unnecessary fields
      omit: userOmit.ARTIST,
    });

    const total = await prisma.user.count({ where: artistWhere });

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
   * Delete artist from agent list
   *
   * @param {TDeleteArtist} { agent, artist_id }
   */
  async deleteArtist({ agent, artist_id }: TDeleteArtist) {
    await prisma.$transaction(async tx => {
      //? update into agent
      await tx.user.update({
        where: { id: agent.id },
        data: {
          //? remove artist from agent list
          agent_artists: {
            set: agent.agent_artists.filter(id => id !== artist_id),
          },
        },
        select: { id: true }, //? skip body
      });

      const artist = await tx.user.findUnique({
        where: { id: artist_id },
        //? skip unnecessary fields
        select: {
          artist_agents: true,
        },
      });

      //? update into artist
      await tx.user.update({
        where: { id: artist_id },
        data: {
          //? remove agent from artist list
          artist_agents: {
            set: artist!.artist_agents.filter(id => id !== agent.id),
          },
        },
        select: { id: true }, //? skip body
      });
    });
  },

  /**
   * Create new agent offer
   */
  async createOffer({ agent, ...payload }: TCreateAgentOfferArgs) {
    //? ensure that the artist exists in agent list
    if (!agent.agent_artists.includes(payload.artist_id)) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You do not have permission to create offer for this artist',
      );
    }

    //? ensure that start date is before end date
    if (!payload.end_date) {
      payload.end_date = payload.start_date;
    }

    return prisma.agentOffer.create({
      data: payload,
    });
  },

  /**
   * Retrieve all offers for a specific agent
   */
  async getMyOffers({
    agent_id,
    limit,
    page,
    status,
    search,
  }: TGetAgentOffersArgs) {
    const where: Prisma.AgentOfferWhereInput = {
      agent_id,
      status,
    };

    //? Search agent using searchable fields
    if (search) {
      where.OR = agentOfferSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const offers = await prisma.agentOffer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    const total = await prisma.agentOffer.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      offers,
    };
  },

  /**
   * Cancel agent offer
   */
  async cancelOffer({
    offer_id,
    agent_id,
    organizer_id,
  }: TCancelAgentOfferArgs) {
    const offer = await prisma.agentOffer.findFirst({
      where: { id: offer_id, agent_id, organizer_id },
    });

    if (!offer) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You do not have permission to cancel this offer',
      );
    }

    if (offer.status === EAgentOfferStatus.CANCELLED) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'This offer is already cancelled',
      );
    }

    return prisma.agentOffer.update({
      where: { id: offer_id },
      data: { status: EAgentOfferStatus.CANCELLED, cancelled_at: new Date() },
    });
  },

  /**
   * Get agent overview
   */
  async getAgentOverview(agent_id: string) {
    const currentYear = new Date().getFullYear();
    const yearStartDate = new Date(`${currentYear}-01-01`);
    const yearEndDate = new Date(`${currentYear}-12-31T23:59:59`);

    const AGENT_COMMISSION = 0.2; // 20%

    // Parallel execution for better performance
    const [agentOfferSummary, bookingCountsByMonth, monthlyRevenueCounts] =
      await Promise.all([
        // Revenue and booking aggregation
        prisma.agentOffer.aggregate({
          where: {
            agent_id: agent_id,
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
        WHERE agent_id = ${agent_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,

        // Monthly revenue from approved bookings (with agent commission)
        prisma.$queryRaw<Array<{ month: number; revenue: number }>>`
        SELECT 
          EXTRACT(MONTH FROM approved_at)::int as month,
          COALESCE(SUM(amount * ${AGENT_COMMISSION}), 0)::float as revenue
        FROM agent_offers
        WHERE agent_id = ${agent_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,
      ]);

    const totalAmount = agentOfferSummary._sum.amount || 0;
    const totalRevenue = totalAmount * AGENT_COMMISSION; // Agent gets 20%
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
};
