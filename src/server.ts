import app from "@/app";
import config from "@/config";
import { logger } from "./utils/logger";

const server = app.listen(config.port, () => {
  logger.info(`API running on http://localhost:${config.port}`);
});

process.on("uncaughtException", (err) => {
  logger.error("uncaughtException happend: %o", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (err) => {
  logger.error("unhandledRejection happend: %o", err);
  server.close(() => process.exit(1));
});
