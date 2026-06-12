import express from "express";
import swaggerUi from "swagger-ui-express";

import { errorHandler, notFoundHandler } from "./errors.js";
import { metricsMiddleware, metricsRegistry } from "./metrics.js";
import { openapiDocument } from "./openapi.js";

import templateRoutes from "./routes/templateRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { createNotificationRouter } from "./notification-routes.js";

import { CampingNotificationService } from "./camping/camping-notification-service.js";
import { createCampingNotificationRouter } from "./camping/camping-notification-routes.js";

export function createApp({
  notificationService,
  healthCheck = async () => ({ mongo: "UP" }),
  swaggerPath = "/swagger-ui.html",
  apiDocsPath = "/v3/api-docs"
}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(metricsMiddleware);

  app.get("/actuator/health", async (_request, response) => {
    try {
      const details = await healthCheck();
      const components = Object.fromEntries(
        Object.entries(details).map(([name, status]) => [
          name,
          { status: status || "UP" }
        ])
      );
      response.json({
        status: "UP",
        components
      });
    } catch {
      response.status(503).json({
        status: "DOWN",
        components: { mongo: { status: "DOWN" } }
      });
    }
  });

  app.get("/actuator/info", (_request, response) => {
    response.json({
      app: {
        name: "notification-service",
        technology: "Node.js, Express, MongoDB"
      }
    });
  });

  app.get("/actuator/prometheus", async (_request, response, next) => {
    try {
      response.set("Content-Type", metricsRegistry.contentType);
      response.send(await metricsRegistry.metrics());
    } catch (error) {
      next(error);
    }
  });

  app.get(apiDocsPath, (_request, response) => response.json(openapiDocument));
  app.use(
    swaggerPath,
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, { explorer: true })
  );
  

  const campingService = new CampingNotificationService();

  app.use("/notifications/v2/camping", createCampingNotificationRouter(campingService));
  
  app.use("/notifications/v2", createNotificationRouter(notificationService));
  
  // Mount Iheb's CommonJS routes to retain his original endpoints
  app.use("/api/templates", templateRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
