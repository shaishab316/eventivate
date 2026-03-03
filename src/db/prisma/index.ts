import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/../prisma/client/client";
export * from "@/../prisma/client/client";
import config from "@/config";

const adapter = new PrismaBetterSqlite3({ url: config.database_url });
export const prisma = new PrismaClient({ adapter });
