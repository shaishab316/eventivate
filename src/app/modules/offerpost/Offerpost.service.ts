import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import {
  type Prisma,
  prisma,
  EOfferpostGigRequestStatus,
} from '../../../utils/db';
import type {
  TCreateGigPayload,
  TDeleteGigPayload,
  TGetMyGigsPayload,
  TGigWithDistance,
  TRequestGigPayload,
  TSearchOtherGigsPayload,
  TUpdateGigPayload,
} from './Offerpost.interface';
import { offerpostSearchableFields } from './Offerpost.constant';
import type { TPagination } from '../../../utils/server/serveResponse';

export const OfferpostServices = {
  async createGig(payload: TCreateGigPayload) {
    const newGig = await prisma.offerpostGig.create({
      data: payload,
    });

    return newGig;
  },

  async updateGig({ gig_id, user_id, ...payload }: TUpdateGigPayload) {
    const gig = await prisma.offerpostGig.findUnique({
      where: { id: gig_id },
    });

    if (!gig) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `Gig with ID "${gig_id}" not found`,
      );
    }

    if (gig.owner_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You do not have permission to update this gig`,
      );
    }

    const updatedGig = await prisma.offerpostGig.update({
      where: { id: gig_id },
      data: payload,
    });

    return updatedGig;
  },

  async deleteGig({ gig_id, user_id }: TDeleteGigPayload) {
    const gig = await prisma.offerpostGig.findUnique({
      where: { id: gig_id },
    });

    if (!gig) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `Gig with ID "${gig_id}" not found`,
      );
    }

    if (gig.owner_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You do not have permission to delete this gig`,
      );
    }

    const deletedGig = await prisma.offerpostGig.delete({
      where: { id: gig_id },
    });

    return deletedGig;
  },

  async getMyGigs({ user_id, limit, page, search }: TGetMyGigsPayload) {
    const whereGig: Prisma.OfferpostGigWhereInput = {
      owner_id: user_id,
    };

    if (search) {
      whereGig.OR = offerpostSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const gigs = await prisma.offerpostGig.findMany({
      where: whereGig,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    const total = await prisma.offerpostGig.count({
      where: whereGig,
    });

    return {
      gigs,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  async searchOtherGigs({
    limit,
    page,
    search,
    role,
    genres,
    keywords,
    location_lat,
    location_lng,
    budget_max,
    budget_min,
    radius_km = 50,
  }: TSearchOtherGigsPayload) {
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Role filter (if provided)
    if (role) {
      conditions.push(`owner_role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Search condition
    if (search) {
      const searchConditions = offerpostSearchableFields
        .map(field => `LOWER(${field}) LIKE $${paramIndex}`)
        .join(' OR ');
      conditions.push(`(${searchConditions})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Genre filter
    if (genres && genres.length > 0) {
      conditions.push(`genre = ANY($${paramIndex})`);
      params.push(genres);
      paramIndex++;
    }

    // Keywords filter
    if (keywords && keywords.length > 0) {
      conditions.push(`keywords && $${paramIndex}`);
      params.push(keywords);
      paramIndex++;
    }

    // Budget filters
    if (budget_min !== undefined && budget_min !== null) {
      conditions.push(`budget_max >= $${paramIndex}`);
      params.push(budget_min);
      paramIndex++;
    }

    if (budget_max !== undefined && budget_max !== null) {
      conditions.push(`budget_min <= $${paramIndex}`);
      params.push(budget_max);
      paramIndex++;
    }

    // Location-based search using PostGIS
    let distanceSelect = '';
    let distanceWhere = '';
    let orderBy = 'created_at DESC';

    if (location_lat !== undefined && location_lng !== undefined) {
      const radiusInMeters = radius_km * 1000;

      distanceSelect = `, 
      ROUND(
        CAST(
          ST_Distance(
            location_point,
            ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography
          ) / 1000 AS numeric
        ), 2
      ) as distance_km`;

      distanceWhere = `
      AND location_point IS NOT NULL
      AND ST_DWithin(
        location_point,
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        $${paramIndex + 2}
      )`;

      params.push(location_lng, location_lat, radiusInMeters);
      paramIndex += 3;

      orderBy = 'distance_km ASC, created_at DESC';
    }

    // Build WHERE clause (handle empty conditions)
    const whereClause =
      conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    // Main query to get gigs
    const gigsQuery = `
    SELECT 
      id,
      created_at,
      updated_at,
      owner_id,
      owner_role,
      genre,
      title,
      description,
      banner_url,
      keywords,
      location,
      location_lat,
      location_lng,
      budget_min,
      budget_max,
      target_for_agents,
      target_for_artists,
      target_for_venues,
      target_for_organizers,
      target_for_managers,
      is_active
      ${distanceSelect}
    FROM offerpost_gigs
    WHERE ${whereClause}
    ${distanceWhere}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex}
    OFFSET $${paramIndex + 1}
  `;

    params.push(limit, offset);

    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    FROM offerpost_gigs
    WHERE ${whereClause}
    ${distanceWhere}
  `;

    const countParams = params.slice(0, -2); // Remove limit and offset

    const [gigs, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<TGigWithDistance[]>(gigsQuery, ...params),
      prisma.$queryRawUnsafe<[{ total: bigint }]>(countQuery, ...countParams),
    ]);

    const total = Number(countResult[0].total);

    return {
      gigs: gigs.map(gig => ({
        ...gig,
        keywords: gig.keywords || [],
        distance_km: gig.distance_km || undefined,
      })),
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  /**
   * Request to join a gig. This creates an OfferpostGigRequest with status PENDING.
   *
   * If the user has already requested this gig and the request is still pending, it will throw a 400 error to prevent duplicate requests.
   */
  async requestGig({ user_id, ...payload }: TRequestGigPayload) {
    //? Check if this gig request already exists and is pending
    const existingRequest = await prisma.offerpostGigRequest.findFirst({
      where: {
        gig_id: payload.gig_id,
        requester_id: user_id,
      },
    });

    if (existingRequest?.status === EOfferpostGigRequestStatus.PENDING) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `You have already requested this gig and it is pending review.`,
      );
    }

    //? If the request references another offerpost, verify that the user has permission to reference it
    if (payload.referenced_offerpost_id) {
      const offerpost = await prisma.offerpost.findUnique({
        where: { id: payload.referenced_offerpost_id },
        select: {
          admins: {
            select: { id: true },
          },
        },
      });

      if (!offerpost || !offerpost?.admins.some(({ id }) => id === user_id)) {
        throw new ServerError(
          StatusCodes.FORBIDDEN,
          'You do not have permission to reference this offerpost in your gig request.',
        );
      }
    }

    const newRequest = await prisma.offerpostGigRequest.create({
      data: {
        ...payload,
        requester_id: user_id,
      },
    });

    return newRequest;
  },
};
