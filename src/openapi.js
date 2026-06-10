import { NOTIFICATION_TYPES } from "./validation.js";

const notificationSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    recipientId: { type: "string" },
    eventId: { type: "string", nullable: true },
    type: { type: "string", enum: NOTIFICATION_TYPES },
    title: { type: "string" },
    message: { type: "string" },
    read: { type: "boolean" },
    readAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    actionUrl: { type: "string", nullable: true }
  }
};

const requestSchema = {
  type: "object",
  required: ["recipientId", "type", "title", "message"],
  properties: {
    recipientId: { type: "string", maxLength: 120 },
    eventId: { type: "string", maxLength: 120, nullable: true },
    type: { type: "string", enum: NOTIFICATION_TYPES },
    title: { type: "string", maxLength: 160 },
    message: { type: "string", maxLength: 2000 },
    actionUrl: { type: "string", maxLength: 500, nullable: true }
  }
};

const notificationResponse = {
  description: "Notification",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/NotificationResponse" }
    }
  }
};

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "CampConnect Notification Service",
    description: "Persisted notification CRUD and read-state API",
    version: "1.0.0"
  },
  servers: [{ url: "/" }],
  tags: [{ name: "Notifications" }],
  paths: {
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List and filter notifications",
        parameters: [
          { name: "recipientId", in: "query", schema: { type: "string" } },
          { name: "eventId", in: "query", schema: { type: "string" } },
          { name: "read", in: "query", schema: { type: "boolean" } },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: NOTIFICATION_TYPES }
          }
        ],
        responses: {
          200: {
            description: "Notifications",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/NotificationResponse" }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Notifications"],
        summary: "Create a persisted notification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotificationRequest" }
            }
          }
        },
        responses: { 201: notificationResponse }
      }
    },
    "/notifications/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      get: {
        tags: ["Notifications"],
        summary: "Get one notification",
        responses: { 200: notificationResponse }
      },
      put: {
        tags: ["Notifications"],
        summary: "Update notification content",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotificationRequest" }
            }
          }
        },
        responses: { 200: notificationResponse }
      },
      delete: {
        tags: ["Notifications"],
        summary: "Delete a notification",
        responses: { 204: { description: "Deleted" } }
      }
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark one notification as read",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: { 200: notificationResponse }
      }
    },
    "/notifications/recipient/{recipientId}/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all recipient notifications as read",
        parameters: [
          {
            name: "recipientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            description: "Updated count",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { updatedCount: { type: "integer", format: "int64" } }
                }
              }
            }
          }
        }
      }
    },
    "/notifications/recipient/{recipientId}/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Count unread recipient notifications",
        parameters: [
          {
            name: "recipientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            description: "Unread count",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { unreadCount: { type: "integer", format: "int64" } }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      NotificationRequest: requestSchema,
      NotificationResponse: notificationSchema
    }
  }
};
