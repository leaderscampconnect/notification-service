import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createUserEventHandler } from "../src/user-event-handler.js";

function event(eventType, overrides = {}) {
  return {
    eventType,
    userId: 42,
    firstName: "Amina",
    lastName: "Camper",
    email: "amina@campconnect.test",
    role: "CAMPER",
    eventTime: "2026-06-10T20:00:00",
    ...overrides
  };
}

function fakeService() {
  return {
    created: [],
    deleted: [],
    async createFromUserEvent(userEvent, notification) {
      this.created.push({ userEvent, notification });
      return { id: "notification-1", ...notification };
    },
    async deleteByRecipientId(recipientId) {
      this.deleted.push(recipientId);
      return 2;
    }
  };
}

const quietLogger = {
  info() {},
  error() {}
};

describe("teammate user RabbitMQ events", () => {
  it("creates a welcome notification for USER_CREATED", async () => {
    const service = fakeService();
    const handler = createUserEventHandler(service, quietLogger);

    const result = await handler.handle(event("USER_CREATED"));

    assert.equal(result.action, "CREATED");
    assert.equal(service.created[0].notification.type, "USER_WELCOME");
    assert.match(service.created[0].notification.message, /Amina/);
  });

  it("accepts Spring LocalDateTime's array representation", async () => {
    const service = fakeService();
    const handler = createUserEventHandler(service, quietLogger);

    await handler.handle(event("USER_CREATED", {
      eventTime: [2026, 6, 10, 21, 29, 33, 969295886]
    }));

    assert.equal(
      service.created[0].userEvent.eventTime,
      "2026-06-10T21:29:33.969Z"
    );
  });

  it("creates a profile notification for USER_UPDATED", async () => {
    const service = fakeService();
    const handler = createUserEventHandler(service, quietLogger);

    await handler.handle(event("USER_UPDATED"));

    assert.equal(service.created[0].notification.type, "USER_PROFILE_UPDATED");
  });

  it("removes persisted notifications for USER_DELETED", async () => {
    const service = fakeService();
    const handler = createUserEventHandler(service, quietLogger);

    const result = await handler.handle(event("USER_DELETED"));

    assert.equal(result.action, "DELETED");
    assert.deepEqual(service.deleted, ["42"]);
    assert.equal(result.deletedCount, 2);
  });

  it("rejects unsupported events so RabbitMQ can dead-letter them", async () => {
    const service = fakeService();
    const handler = createUserEventHandler(service, quietLogger);

    await assert.rejects(
      handler.handle(event("UNKNOWN")),
      /Unsupported user event type/
    );
  });
});
