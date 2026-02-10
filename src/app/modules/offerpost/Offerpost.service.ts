import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import {
  TCreateGigPayload,
  TDeleteGigPayload,
  TUpdateGigPayload,
} from './Offerpost.interface';

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
};
