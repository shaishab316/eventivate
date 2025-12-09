import { EUserRole, Prisma, prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { userOmit } from '../user/User.constant';
import {
  TCreateOfferArgs,
  TGetAllOffersArgs,
  TOfferDetailsArgs,
} from './Offer.interface';

export const OfferServices = {
  async createOffer({ user, document, ...payload }: TCreateOfferArgs) {
    return prisma.offer.create({
      data: {
        ...payload,
        [`${user.role.toLowerCase()}_id`]: user.id,
        [`${user.role.toLowerCase()}_document_url`]: document,
        [`is_${user.role.toLowerCase()}_accepted`]: true,
        [`${user.role.toLowerCase()}_document_uploaded_at`]: new Date(),
      },
    });
  },

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
};
