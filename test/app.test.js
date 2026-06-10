import assert from "node:assert/strict";
import { describe, it } from "node:test";

import request from "supertest";

import { createApp } from "../src/app.js";

const example = {
  id: "507f1f77bcf86cd799439011",
  recipientId: "camper-1",
  eventId: "event-1",
  type: "EVENT_REMINDER",
  title: "Event reminder",
  message: "Your event starts soon.",
  read: false,
  readAt: null,
  createdAt: "2026-06-10T10:00:00.000",
  updatedAt: "2026-06-10T10:00:00.000",
  actionUrl: "/events/event-1"
};

function fakeService(overrides = {}) {
  return {
    findNotifications: async () => [example],
    getNotification: async () => example,
    createNotification: async (value) => ({ ...example, ...value }),
    updateNotification: async (_id, value) => ({ ...example, ...value }),
    deleteNotification: async () => {},
    markAsRead: async () => ({ ...example, read: true }),
    markAllAsRead: async () => 2,
    getUnreadCount: async () => 3,
    ...overrides
  };
}

function app(service = fakeService()) {
  return createApp({ notificationService: service });
}

describe("notification API", () => {
  it("creates a notification with the existing API contract", async () => {
    const response = await request(app())
      .post("/notifications")
      .send({
        recipientId: " camper-1 ",
        eventId: "event-1",
        type: "EVENT_REMINDER",
        title: " Event reminder ",
        message: " Your event starts soon. ",
        actionUrl: "/events/event-1"
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.recipientId, "camper-1");
    assert.equal(response.body.type, "EVENT_REMINDER");
    assert.equal(response.body.read, false);
  });

  it("returns structured validation errors", async () => {
    const response = await request(app())
      .post("/notifications")
      .send({
        recipientId: "",
        type: null,
        title: "",
        message: ""
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(response.body.message, "Request validation failed");
    assert.ok(response.body.validationErrors.recipientId);
    assert.ok(response.body.validationErrors.type);
    assert.equal(response.body.path, "/notifications");
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(app())
      .post("/notifications")
      .set("Content-Type", "application/json")
      .send("{");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Malformed JSON request body");
  });

  it("rejects invalid filter values", async () => {
    const response = await request(app())
      .get("/notifications?read=perhaps");

    assert.equal(response.status, 400);
    assert.equal(response.body.validationErrors.read, "perhaps");
  });

  it("supports unread counts and bulk read updates", async () => {
    const unread = await request(app())
      .get("/notifications/recipient/camper-1/unread-count");
    const updated = await request(app())
      .patch("/notifications/recipient/camper-1/read-all");

    assert.deepEqual(unread.body, { unreadCount: 3 });
    assert.deepEqual(updated.body, { updatedCount: 2 });
  });

  it("exposes Spring-compatible health and OpenAPI endpoints", async () => {
    const health = await request(app()).get("/actuator/health");
    const openapi = await request(app()).get("/v3/api-docs");

    assert.equal(health.status, 200);
    assert.equal(health.body.status, "UP");
    assert.equal(openapi.status, 200);
    assert.equal(openapi.body.info.title, "CampConnect Notification Service");
    assert.ok(openapi.body.paths["/notifications"]);
  });

  it("returns 204 when deleting a notification", async () => {
    const response = await request(app())
      .delete("/notifications/507f1f77bcf86cd799439011");

    assert.equal(response.status, 204);
    assert.equal(response.text, "");
  });
});
