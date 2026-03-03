import app from "@/app";
import config from "@/config";
import { logger } from "./utils/logger";
import { prisma } from "./db";
import { Server as HttpServer } from "node:http";

let server: HttpServer;

async function main() {
  await prisma.$connect();

  server = app.listen(config.port, () => {
    logger.info(`API running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  logger.error("Error starting server: %o", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("uncaughtException happend: %o", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (err) => {
  logger.error("unhandledRejection happend: %o", err);
  server.close(() => process.exit(1));
});
