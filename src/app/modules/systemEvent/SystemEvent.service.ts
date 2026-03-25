import { type Prisma, prisma } from '../../../utils/db';

export const SystemEventServices = {
  async createOrUpdateSystemEvent(
    payload: Prisma.SystemEventCreateArgs['data'],
  ) {
    const events = await prisma.systemEvent.upsert({
      where: {
        source_source_id: {
          source: payload.source,
          source_id: payload.source_id,
        },
      },
      create: payload,
      update: payload,
    });

    return events;
  },
};
