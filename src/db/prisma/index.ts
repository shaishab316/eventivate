import { PrismaNeon } from "@prisma/adapter-neon";
import config from "@/config";
import { PrismaClient } from "@/../prisma/client/client";
export * from "@/../prisma/client/client";

const adapter = new PrismaNeon({
  connectionString: config.database.database_url,
});

export const prisma = new PrismaClient({ adapter });
