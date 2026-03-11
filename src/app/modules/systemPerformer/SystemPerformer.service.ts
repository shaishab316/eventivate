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
};
