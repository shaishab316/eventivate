import type { TOfferRequestSend } from './OfferRequest.interface';
import { prisma } from '../../../utils/db';

/**
 * OfferRequest services
 */
export const OfferRequestServices = {
  /**
   * Send a new offer request
   */
  async send(data: TOfferRequestSend) {
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
};
