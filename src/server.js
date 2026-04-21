import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.port, () => {
  logger.info("Server started", { port: env.port });
});

function shutdown(signal) {
  logger.info("Shutdown signal received", { signal });

  server.close((error) => {
    if (error) {
      logger.error("Graceful shutdown failed", { message: error.message });
      process.exit(1);
    }

    logger.info("Server stopped");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
