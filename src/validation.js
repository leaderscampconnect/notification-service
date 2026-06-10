import { ApiError } from "./errors.js";

export const NOTIFICATION_TYPES = [
  "EVENT_CREATED",
  "REGISTRATION_CONFIRMED",
  "WAITLIST_JOINED",
  "WAITLIST_PROMOTED",
  "REGISTRATION_CANCELLED",
  "EVENT_POSTPONED",
  "EVENT_CANCELLED",
  "EVENT_STARTED",
  "EVENT_COMPLETED",
  "EVENT_REMINDER",
  "GENERAL"
];

function normalizedString(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function validateNotificationRequest(body = {}) {
  const validationErrors = {};
  const recipientId = normalizedString(body.recipientId);
  const eventId = normalizedString(body.eventId);
  const title = normalizedString(body.title);
  const message = normalizedString(body.message);
  const actionUrl = normalizedString(body.actionUrl);

  if (!recipientId) {
    validationErrors.recipientId = "must not be blank";
  } else if (recipientId.length > 120) {
    validationErrors.recipientId = "size must be between 0 and 120";
  }

  if (eventId && eventId.length > 120) {
    validationErrors.eventId = "size must be between 0 and 120";
  }

  if (!body.type) {
    validationErrors.type = "must not be null";
  } else if (!NOTIFICATION_TYPES.includes(body.type)) {
    validationErrors.type = `must be one of: ${NOTIFICATION_TYPES.join(", ")}`;
  }

  if (!title) {
    validationErrors.title = "must not be blank";
  } else if (title.length > 160) {
    validationErrors.title = "size must be between 0 and 160";
  }

  if (!message) {
    validationErrors.message = "must not be blank";
  } else if (message.length > 2000) {
    validationErrors.message = "size must be between 0 and 2000";
  }

  if (actionUrl && actionUrl.length > 500) {
    validationErrors.actionUrl = "size must be between 0 and 500";
  }

  if (Object.keys(validationErrors).length > 0) {
    throw new ApiError(400, "Request validation failed", validationErrors);
  }

  return {
    recipientId,
    eventId: eventId || null,
    type: body.type,
    title,
    message,
    actionUrl: actionUrl || null
  };
}

export function validateFilters(query) {
  const filters = {};

  if (query.recipientId?.trim()) {
    filters.recipientId = query.recipientId.trim();
  }
  if (query.eventId?.trim()) {
    filters.eventId = query.eventId.trim();
  }
  if (query.read !== undefined) {
    if (query.read !== "true" && query.read !== "false") {
      throw new ApiError(
        400,
        "Invalid value for parameter: read",
        { read: String(query.read) }
      );
    }
    filters.read = query.read === "true";
  }
  if (query.type !== undefined) {
    if (!NOTIFICATION_TYPES.includes(query.type)) {
      throw new ApiError(
        400,
        "Invalid value for parameter: type",
        { type: String(query.type) }
      );
    }
    filters.type = query.type;
  }

  return filters;
}
