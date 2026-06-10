import express from "express";
import swaggerUi from "swagger-ui-express";

import { errorHandler, notFoundHandler } from "./errors.js";
import { createNotificationRouter } from "./notification-routes.js";
import { openapiDocument } from "./openapi.js";

export function createApp({
  notificationService,
  healthCheck = async () => ({ mongo: "UP" }),
  swaggerPath = "/swagger-ui.html",
  apiDocsPath = "/v3/api-docs"
}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

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

  app.get(apiDocsPath, (_request, response) => response.json(openapiDocument));
  app.use(
    swaggerPath,
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, { explorer: true })
  );
  app.use("/notifications", createNotificationRouter(notificationService));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
