import { Router } from "express";

import { validateFilters, validateNotificationRequest } from "./validation.js";

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function createNotificationRouter(notificationService) {
  const router = Router();

  router.get("/", asyncRoute(async (request, response) => {
    const filters = validateFilters(request.query);
    response.json(await notificationService.findNotifications(filters));
  }));

  router.get(
    "/recipient/:recipientId/unread-count",
    asyncRoute(async (request, response) => {
      const unreadCount = await notificationService.getUnreadCount(
        request.params.recipientId
      );
      response.json({ unreadCount });
    })
  );

  router.patch(
    "/recipient/:recipientId/read-all",
    asyncRoute(async (request, response) => {
      const updatedCount = await notificationService.markAllAsRead(
        request.params.recipientId
      );
      response.json({ updatedCount });
    })
  );

  router.get("/:id", asyncRoute(async (request, response) => {
    response.json(await notificationService.getNotification(request.params.id));
  }));

  router.post("/", asyncRoute(async (request, response) => {
    const notification = validateNotificationRequest(request.body);
    response.status(201).json(
      await notificationService.createNotification(notification)
    );
  }));

  router.put("/:id", asyncRoute(async (request, response) => {
    const notification = validateNotificationRequest(request.body);
    response.json(
      await notificationService.updateNotification(
        request.params.id,
        notification
      )
    );
  }));

  router.delete("/:id", asyncRoute(async (request, response) => {
    await notificationService.deleteNotification(request.params.id);
    response.status(204).send();
  }));

  router.patch("/:id/read", asyncRoute(async (request, response) => {
    response.json(await notificationService.markAsRead(request.params.id));
  }));

  return router;
}
