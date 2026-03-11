import { type Prisma, prisma } from '../../../utils/db';

export const SystemPerformerServices = {
  async createOrUpdateSystemPerformer(
    payload: Prisma.SystemPerformerCreateArgs['data'],
  ) {
    const performer = await prisma.systemPerformer.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      create: payload,
      update: payload,
    });

    return performer;
  },

  async createOrUpdateSystemGenre(
    payload: Prisma.SystemGenreCreateArgs['data'],
  ) {
    const performerGenre = await prisma.systemGenre.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      create: payload,
      update: payload,
    });

    return performerGenre;
  },

  async createOrGetSystemPerformerGenre(
    payload: Prisma.SystemPerformerGenreCreateArgs['data'],
  ) {
    const performerGenre = await prisma.systemPerformerGenre.findFirst({
      where: {
        performer_id: payload.performer_id,
        genre_id: payload.genre_id,
      },
    });

    if (performerGenre) {
      return performerGenre;
    }

    return await prisma.systemPerformerGenre.create({
      data: payload,
    });
  },
};
