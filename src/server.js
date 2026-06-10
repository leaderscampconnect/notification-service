import mongoose from "mongoose";

import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createEurekaClient } from "./eureka-client.js";
import { Notification } from "./notification-model.js";
import { NotificationService } from "./notification-service.js";

const config = await loadConfig();

await mongoose.connect(config.mongoUri, {
  serverSelectionTimeoutMS: 10_000
});
await Notification.syncIndexes();

const notificationService = new NotificationService();
const app = createApp({
  notificationService,
  swaggerPath: config.swaggerPath,
  apiDocsPath: config.apiDocsPath,
  healthCheck: async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected");
    }
    await mongoose.connection.db.admin().ping();
    return { mongo: "UP" };
  }
});

const server = app.listen(config.port, "0.0.0.0", async () => {
  console.info(
    `${config.serviceName} listening on port ${config.port} `
    + `(Config Server: ${config.configServer.loaded ? "loaded" : "optional/unavailable"})`
  );
});

const eurekaClient = await createEurekaClient(config);
await eurekaClient.start();

async function shutdown(signal) {
  console.info(`Received ${signal}; shutting down`);
  await eurekaClient.stop();
  await mongoose.disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
