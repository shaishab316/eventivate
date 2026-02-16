import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import {
  EUserRole,
  EVenueOfferStatus,
  Prisma,
  prisma,
} from '../../../utils/db';
import { userOmit, userSearchableFields } from '../user/User.constant';
import type {
  TCancelVenueOfferArgs,
  TGetVenueOffersArgs,
  TSearchVenuesPayload,
  TUpdateVenueArgs,
  TVenueCreateOfferArgs,
} from './Venue.interface';
import { TPagination } from '../../../utils/server/serveResponse';
import { months } from '../../../constants/month';
import { TList } from '../query/Query.interface';
import { omit } from '../../../utils/db/omit';
import { venueSearchableFields } from './Venue.constant';

/**
 * All venue related services
 */
export const VenueServices = {
  /**
   * Update venue information
   */
  async updateVenue({ venue_id, ...payload }: TUpdateVenueArgs) {
    return prisma.user.update({
      where: { id: venue_id },
      data: payload,
      //? skip unnecessary fields
      omit: userOmit.VENUE,
    });
  },

  /**
   * Create new agent offer
   */
  async createOffer(payload: TVenueCreateOfferArgs) {
    //? ensure that start date is before end date
    if (!payload.end_date) {
      payload.end_date = payload.start_date;
    }

    return prisma.venueOffer.create({
      data: payload,
    });
  },

  /**
   * Cancel agent offer
   */
  async cancelOffer({
    offer_id,
    venue_id,
    organizer_id,
  }: TCancelVenueOfferArgs) {
    const offer = await prisma.venueOffer.findFirst({
      where: { id: offer_id, venue_id, organizer_id },
    });

    if (!offer) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You do not have permission to cancel this offer',
      );
    }

    if (offer.status === EVenueOfferStatus.CANCELLED) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'This offer is already cancelled',
      );
    }

    return prisma.venueOffer.update({
      where: { id: offer_id },
      data: { status: EVenueOfferStatus.CANCELLED, cancelled_at: new Date() },
    });
  },

  /**
   * Get all agent offers
   */
  async getMyOffers({
    limit,
    page,
    status,
    venue_id,
    search,
  }: TGetVenueOffersArgs) {
    const where: Prisma.VenueOfferWhereInput = {
      venue_id,
      status,
    };

    //? Search agent using searchable fields
    if (search) {
      where.organizer = Object.fromEntries(
        userSearchableFields.map(field => [
          field,
          {
            contains: search,
            mode: 'insensitive',
          },
        ]),
      );
    }

    const offers = await prisma.venueOffer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        organizer: {
          //? exclude unnecessary fields
          omit: userOmit.ORGANIZER,
        },
      },
      omit: {
        venue_id: true,
        organizer_id: true,
      },
    });

    const total = await prisma.venueOffer.count({ where });

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
   * Get venue overview
   */
  async getVenueOverview(venue_id: string) {
    const currentYear = new Date().getFullYear();
    const yearStartDate = new Date(`${currentYear}-01-01`);
    const yearEndDate = new Date(`${currentYear}-12-31T23:59:59`);

    // Parallel execution for better performance
    const [venueOfferSummary, bookingCountsByMonth, monthlyRevenueCounts] =
      await Promise.all([
        // Revenue and booking aggregation
        prisma.venueOffer.aggregate({
          where: {
            venue_id: venue_id,
            status: EVenueOfferStatus.APPROVED,
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
        FROM venue_offers
        WHERE venue_id = ${venue_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,

        // Monthly revenue from approved bookings
        prisma.$queryRaw<Array<{ month: number; revenue: number }>>`
        SELECT 
          EXTRACT(MONTH FROM approved_at)::int as month,
          COALESCE(SUM(amount), 0)::float as revenue
        FROM venue_offers
        WHERE venue_id = ${venue_id}
          AND status = 'APPROVED'
          AND approved_at >= ${yearStartDate}
          AND approved_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM approved_at)
        ORDER BY month
      `,
      ]);

    const totalRevenue = venueOfferSummary._sum.amount || 0;
    const totalBookings = venueOfferSummary._count.id || 0;

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
   * Get all venues with pagination and search
   */
  async getAllVenues({ limit, page, search }: TList) {
    const where: Prisma.UserWhereInput = {
      role: EUserRole.VENUE,
    };

    //? Search venue using searchable fields
    if (search) {
      where.OR = userSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const venues = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      omit: userOmit.VENUE,
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
      venues,
    };
  },

  /**
   * Search venues with advanced filters
   */
  async searchVenues({
    limit,
    page,
    search,
    venue_types,
    location_lat,
    location_lng,
    min_capacity,
    max_capacity,
    start_date,
    end_date,
  }: TSearchVenuesPayload) {
    const conditions: string[] = [
      `role = '${EUserRole.VENUE}'`,
      `is_active = true`,
      `is_verified = true`,
    ];
    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      const searchConditions = venueSearchableFields
        .map(field => `LOWER(${field}) LIKE LOWER($${paramIndex})`)
        .join(' OR ');
      conditions.push(`(${searchConditions})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Venue types filter
    if (venue_types?.length) {
      conditions.push(`venue_type = ANY($${paramIndex})`);
      params.push(venue_types);
      paramIndex++;
    }

    // Capacity filter
    if (min_capacity !== undefined || max_capacity !== undefined) {
      if (min_capacity !== undefined && max_capacity !== undefined) {
        conditions.push(
          `capacity BETWEEN $${paramIndex} AND $${paramIndex + 1}`,
        );
        params.push(min_capacity, max_capacity);
        paramIndex += 2;
      } else if (min_capacity !== undefined) {
        conditions.push(`capacity >= $${paramIndex}`);
        params.push(min_capacity);
        paramIndex++;
      } else if (max_capacity !== undefined) {
        conditions.push(`capacity <= $${paramIndex}`);
        params.push(max_capacity);
        paramIndex++;
      }
    }

    // Availability date filter
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

    // Location filter (within ~50km radius)
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

    const venues: any[] = await prisma.$queryRawUnsafe(
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
      ...params.slice(0, -2), // Exclude LIMIT and OFFSET params
    );

    const total = Number(count);

    const totalVenueTypes = await prisma.user.findMany({
      where: {
        role: EUserRole.VENUE,
      },
      distinct: ['venue_type'],
      select: {
        venue_type: true,
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
        total_venue_types: Array.from(
          new Set(
            totalVenueTypes.map(({ venue_type }) => venue_type?.toLowerCase()),
          ),
        ).filter(Boolean),
      },
      venues: venues?.map(venue => omit(venue, userOmit.VENUE)),
    };
  },
};
