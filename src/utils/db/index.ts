import { PrismaClient } from '../../../prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from '../../config';
export * from '../../../prisma/client/client';

/**
 * Prisma Client instance
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new pg.Pool({
      connectionString: config.url.database,
    }),
  ),
});

/** Connect to the database */
export async function connectDB() {
  await prisma.$connect();

  return () => prisma.$disconnect();
}
