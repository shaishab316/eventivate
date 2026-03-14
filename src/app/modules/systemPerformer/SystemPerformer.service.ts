import { type Prisma, prisma } from '../../../utils/db';

export const SystemPerformerServices = {
  async createOrUpdateSystemPerformer({
    event_id,
    ...payload
  }: Prisma.SystemPerformerCreateArgs['data'] & { event_id?: string }) {
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

    if (event_id) {
      await prisma.systemEventPerformer.upsert({
        where: {
          event_id_performer_id: {
            event_id,
            performer_id: performer.id,
          },
        },
        create: {
          event_id,
          performer_id: performer.id,
        },
        update: {},
      });
    }

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

  async getAllGenres() {
    const genres = await prisma.systemGenre.findMany();

    return genres.map(g => g.slug);
  },
};
