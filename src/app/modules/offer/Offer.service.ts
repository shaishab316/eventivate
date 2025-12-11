import { EUserRole, Prisma, prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { userOmit } from '../user/User.constant';
import {
  TAcceptOfferArgs,
  TAssignOfferArgs,
  TCreateOfferArgs,
  TGetAllOffersArgs,
  TOfferDetailsArgs,
} from './Offer.interface';

/**
 * Service methods for managing offers, including creation, retrieval, and acceptance.
 */
export const OfferServices = {
  /**
   * Create a new offer with the provided payload and user information.
   */
  async createOffer({ user, document, ...payload }: TCreateOfferArgs) {
    const role = user.role.toLowerCase();

    return prisma.offer.create({
      data: {
        ...payload,
        [`${role}_id`]: user.id,
        [`${role}_document_url`]: document,
        [`is_${role}_accepted`]: true,
        [`${role}_document_uploaded_at`]: new Date(),
      },
    });
  },

  /**
   * Get offer details by offer ID, including related user data based on roles.
   */
  async getOfferDetails({ offer_id, user }: TOfferDetailsArgs) {
    return prisma.offer.findFirst({
      where: { id: offer_id },
      include: Object.fromEntries(
        Object.values(EUserRole)
          //? remove current user and "user" role from the included relations
          .filter(role => role !== user.role && role !== EUserRole.USER)
          .map(role => [role.toLowerCase(), { omit: userOmit[role] }]),
      ),
    });
  },

  /**
   * Get all offers related to the user with pagination and optional filtering by acceptance status.
   */
  async getAllOffers({
    limit,
    page,
    user,
    is_fully_accepted,
  }: TGetAllOffersArgs) {
    const where: Prisma.OfferWhereInput = {
      [`${user.role.toLowerCase()}_id`]: user.id,
    };

    if (is_fully_accepted !== undefined) {
      where.is_fully_accepted = is_fully_accepted;
    }

    const offers = await prisma.offer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updated_at: 'desc' },
      include: Object.fromEntries(
        Object.values(EUserRole)
          //? remove current user and "user" role from the included relations
          .filter(role => role !== user.role && role !== EUserRole.USER)
          .map(role => [role.toLowerCase(), { omit: userOmit[role] }]),
      ),
    });

    const total = await prisma.offer.count({ where });

    return {
      meta: {
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      offers,
    };
  },

  /**
   * Accept an offer by updating the relevant fields based on the user's role.
   */
  async acceptOffer({ document, offer_id, user }: TAcceptOfferArgs) {
    const role = user.role.toLowerCase();

    return prisma.offer.update({
      where: { id: offer_id },
      data: {
        [`is_${role}_accepted`]: true,
        [`${role}_document_url`]: document,
        [`${role}_document_uploaded_at`]: new Date(),
      },
    });
  },

  /**
   * Assign an offer to an artist, venue, or organization.
   */
  async assignOffer({ offer_id, ...payload }: TAssignOfferArgs) {
    return prisma.offer.update({
      where: { id: offer_id },
      data: payload,
    });
  },
};
