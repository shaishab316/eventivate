import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import {
  type Prisma,
  prisma,
  EOfferpostGigRequestStatus,
} from '../../../utils/db';
import type {
  TAcceptGigRequestPayload,
  TCancelGigRequestPayload,
  TCreateGigPayload,
  TCreateOfferpostPayload,
  TDeleteGigPayload,
  TGetMyGigsPayload,
  TGetReceivedGigRequestsPayload,
  TGetSendGigRequestsPayload,
  TRequestGigPayload,
  TSearchOtherGigsPayload,
  TUpdateGigPayload,
} from './Offerpost.interface';
import { offerpostGigSearchableFields } from './Offerpost.constant';
import type { TPagination } from '../../../utils/server/serveResponse';
import { omit } from '../../../utils/db/omit';
import { userOmit } from '../user/User.constant';

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
      whereGig.OR = offerpostGigSearchableFields.map(field => ({
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
    user_id,
  }: TSearchOtherGigsPayload) {
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`og.owner_role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (search) {
      const searchConditions = offerpostGigSearchableFields
        .map(field => `LOWER(og.${field}) LIKE $${paramIndex}`)
        .join(' OR ');
      conditions.push(`(${searchConditions})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (genres && genres.length > 0) {
      conditions.push(`og.genre = ANY($${paramIndex})`);
      params.push(genres);
      paramIndex++;
    }

    if (keywords && keywords.length > 0) {
      conditions.push(`og.keywords && $${paramIndex}`);
      params.push(keywords);
      paramIndex++;
    }

    if (budget_min !== undefined && budget_min !== null) {
      conditions.push(`og.budget_max >= $${paramIndex}`);
      params.push(budget_min);
      paramIndex++;
    }

    if (budget_max !== undefined && budget_max !== null) {
      conditions.push(`og.budget_min <= $${paramIndex}`);
      params.push(budget_max);
      paramIndex++;
    }

    let distanceSelect = '';
    let distanceWhere = '';
    let orderBy = 'og.created_at DESC';

    if (location_lat !== undefined && location_lng !== undefined) {
      const radiusInMeters = radius_km * 1000;
      distanceSelect = `, ROUND(
      CAST(
        ST_Distance(
          og.location_point,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography
        ) / 1000 AS numeric
      ), 2
    ) as distance_km`;

      distanceWhere = ` AND og.location_point IS NOT NULL
      AND ST_DWithin(
        og.location_point,
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        $${paramIndex + 2}
      )`;

      params.push(location_lng, location_lat, radiusInMeters);
      paramIndex += 3;
      orderBy = 'distance_km ASC, og.created_at DESC';
    }

    const isRequestedSelect = user_id
      ? `, EXISTS (
        SELECT 1 FROM offerpost_gig_requests ogr
        WHERE ogr.gig_id = og.id
          AND ogr.requester_id = $${paramIndex}
      ) as is_requested`
      : `, FALSE as is_requested`;

    if (user_id) {
      params.push(user_id);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    const gigsQuery = `
    SELECT
      og.id,
      og.created_at,
      og.updated_at,
      og.owner_id,
      og.owner_role,
      og.genre,
      og.title,
      og.description,
      og.banner_url,
      og.keywords,
      og.location,
      og.location_lat,
      og.location_lng,
      og.budget_min,
      og.budget_max,
      og.target_for_agents,
      og.target_for_artists,
      og.target_for_venues,
      og.target_for_organizers,
      og.target_for_managers,
      og.is_active
      ${distanceSelect}
      ${isRequestedSelect}
    FROM offerpost_gigs og
    WHERE ${whereClause}
    ${distanceWhere}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    params.push(limit, offset);

    const countQuery = `
    SELECT COUNT(*) as total
    FROM offerpost_gigs og
    WHERE ${whereClause}
    ${distanceWhere}
  `;

    const countParams = params.slice(0, -(user_id ? 3 : 2)); // Remove limit, offset (+ user_id already pushed before)

    const [gigs, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(gigsQuery, ...params),
      prisma.$queryRawUnsafe<[{ total: bigint }]>(countQuery, ...countParams),
    ]);

    const total = Number(countResult[0].total);

    return {
      gigs: gigs.map(gig => ({
        ...gig,
        keywords: gig.keywords || [],
        distance_km: gig.distance_km ?? undefined,
        is_requested: gig.is_requested ?? false,
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

  /**
   * Get the authenticated user's gig requests, with optional filtering by status (default: PENDING).
   */
  async getSendGigRequests({
    user_id,
    limit,
    page,
    status,
    search,
  }: TGetSendGigRequestsPayload) {
    const whereRequest: Prisma.OfferpostGigRequestWhereInput = {
      requester_id: user_id,
      status,
    };

    if (search) {
      whereRequest.gig = {
        OR: offerpostGigSearchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      };
    }

    const requests = await prisma.offerpostGigRequest.findMany({
      where: whereRequest,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        gig: {
          include: {
            owner: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      omit: {
        gig_id: true,
      },
    });

    const total = await prisma.offerpostGigRequest.count({
      where: whereRequest,
    });

    return {
      requests,
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
   * Get the authenticated user's received gig requests, with optional filtering by status (default: PENDING).
   */
  async getReceivedGigRequests({
    user_id,
    limit,
    page,
    status,
    search,
  }: TGetReceivedGigRequestsPayload) {
    const whereRequest: Prisma.OfferpostGigRequestWhereInput = {
      gig: {
        owner_id: user_id,
      },
    };

    if (status) {
      whereRequest.status = status;
    }

    if (search) {
      whereRequest.gig!.OR = offerpostGigSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const requests = await prisma.offerpostGigRequest.findMany({
      where: whereRequest,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        gig: true,
        requester: true,
      },
      omit: {
        gig_id: true,
      },
    });

    const total = await prisma.offerpostGigRequest.count({
      where: whereRequest,
    });

    return {
      requests: requests.map(({ requester, ...req }) => ({
        ...req,
        requester: omit(requester, userOmit[requester?.role ?? 'USER']),
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
   * Cancel a gig request. This can be done by either the requester or the gig owner. It sets the request status to REJECTED.
   */
  async cancelGigRequest({
    user_id,
    gig_request_id,
    reject_reason,
  }: TCancelGigRequestPayload) {
    const request = await prisma.offerpostGigRequest.findUnique({
      where: { id: gig_request_id },
      select: {
        requester_id: true,
        gig: {
          select: {
            owner_id: true,
          },
        },
      },
    });

    if (!request) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `Gig request with ID "${gig_request_id}" not found`,
      );
    }

    //? Only the requester or the gig owner can cancel a gig request
    if (request.requester_id !== user_id && request.gig.owner_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You do not have permission to cancel this gig request`,
      );
    }

    const canceledRequest = await prisma.offerpostGigRequest.update({
      where: { id: gig_request_id },
      data: {
        status: EOfferpostGigRequestStatus.REJECTED,
        reject_reason,
      },
      include: {
        gig: true,
      },
      omit: {
        gig_id: true,
      },
    });

    return canceledRequest;
  },

  async acceptGigRequest({
    gig_request_id,
    user_id,
  }: TAcceptGigRequestPayload) {
    const request = await prisma.offerpostGigRequest.findUnique({
      where: { id: gig_request_id },
      select: {
        requester_id: true,
        gig: {
          select: {
            owner_id: true,
          },
        },
        referenced_offerpost_id: true,
        status: true,
      },
    });

    if (!request) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        `Gig request with ID "${gig_request_id}" not found`,
      );
    }

    //? Only the gig owner can accept a gig request
    if (request.gig.owner_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You do not have permission to accept this gig request`,
      );
    }

    if (request.status !== EOfferpostGigRequestStatus.PENDING) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Only pending gig requests can be accepted`,
      );
    }

    const acceptedRequest = await prisma.offerpostGigRequest.update({
      where: { id: gig_request_id },
      data: {
        status: EOfferpostGigRequestStatus.ACCEPTED,
      },
      include: {
        gig: true,
      },
      omit: {
        gig_id: true,
      },
    });

    /**
     * TODO: Additional logic can be implemented here, such as:
     */

    /**
     * 1. Adding the requester as a member to the referenced offerpost (if referenced_offerpost_id is present in the request).
     * This would allow the requester to have access to the offerpost and its related features (e.g. chat, updates, etc.) after their gig request is accepted.
     */
    if (request.referenced_offerpost_id) {
      await prisma.offerpost.update({
        where: { id: request.referenced_offerpost_id },
        data: {
          members: {
            connect: {
              id: user_id,
            },
          },
        },
      });
    }

    return acceptedRequest;
  },

  /**
   * Create a new offerpost. This is a separate endpoint from creating a gig, as an offerpost can exist without any gigs, and gigs can be added to the offerpost later. This allows for more flexibility in how users create and manage their offerposts and gigs.
   */
  async createOfferpost({ user_id }: TCreateOfferpostPayload) {
    const newOfferpost = await prisma.offerpost.create({
      data: {
        owner_id: user_id,
      },
    });

    return newOfferpost;
  },
};
