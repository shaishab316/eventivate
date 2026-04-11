import type {
  TOfferRequestGetAllService,
  TOfferRequestGetMyRequestsService,
  TOfferRequestSendService,
} from './OfferRequest.interface';
import { Prisma, prisma } from '../../../utils/db';
import { OfferRequestConstants } from './OfferRequest.constant';

/**
 * OfferRequest services
 */
export const OfferRequestServices = {
  /**
   * Send a new offer request
   */
  async send(data: TOfferRequestSendService) {
    const offerRequest = await prisma.offerRequest.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : null,
        time: data.time ? new Date(`1970-01-01T${data.time}`) : null,
      },
      include: {
        system_performer: true,
        system_venue: true,
      },
    });

    return offerRequest;
  },

  /**
   * Get all offer requests for admin with pagination, filtering, and sorting
   */
  getAllRequestsForAdmin({
    page,
    limit,
    kind,
    order_by,
    search,
  }: TOfferRequestGetAllService) {
    const whereClause: Prisma.OfferRequestWhereInput = { kind };

    const orderByField = order_by.substring(1);
    const orderByDirection = order_by.startsWith('-') ? 'desc' : 'asc';

    if (search) {
      whereClause.OR = OfferRequestConstants.searchable_fields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    return Promise.all([
      prisma.offerRequest.findMany({
        where: whereClause,
        orderBy: {
          [orderByField]: orderByDirection,
        },
        include: {
          system_performer: true,
          system_venue: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.offerRequest.count({ where: whereClause }),
    ]);
  },

  /**
   * Get offer requests for a specific user with pagination, filtering, and sorting
   */
  getMyRequests({
    page,
    limit,
    kind,
    order_by,
    search,
    user_id,
  }: TOfferRequestGetMyRequestsService) {
    const whereClause: Prisma.OfferRequestWhereInput = { kind, user_id };

    const orderByField = order_by.substring(1);
    const orderByDirection = order_by.startsWith('-') ? 'desc' : 'asc';

    if (search) {
      whereClause.OR = OfferRequestConstants.searchable_fields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    return Promise.all([
      prisma.offerRequest.findMany({
        where: whereClause,
        orderBy: {
          [orderByField]: orderByDirection,
        },
        include: {
          system_performer: true,
          system_venue: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.offerRequest.count({ where: whereClause }),
    ]);
  },
};
