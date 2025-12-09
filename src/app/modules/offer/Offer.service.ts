import { EUserRole, prisma } from '../../../utils/db';
import { userOmit } from '../user/User.constant';
import { TCreateOfferArgs, TOfferDetailsArgs } from './Offer.interface';

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
      where: {
        id: offer_id,
      },
      include: {
        agent: user.role !== EUserRole.AGENT && {
          omit: userOmit.AGENT,
        },
        artist: user.role !== EUserRole.ARTIST && {
          omit: userOmit.ARTIST,
        },
        organizer: user.role !== EUserRole.ORGANIZER && {
          omit: userOmit.ORGANIZER,
        },
        venue: user.role !== EUserRole.VENUE && {
          omit: userOmit.VENUE,
        },
      },
    });
  },
};
