import { ApiError } from "../errors.js";

export const CAMPING_NOTIFICATION_TYPES = [
  "BOOKING_CONFIRMED",
  "BOOKING_RECEIVED"
];

export function validateCampingFilters(query) {
  const filters = {};
  if (query.recipientId) filters.recipientId = query.recipientId;
  if (query.campId) filters.campId = query.campId;
  if (query.type) {
    if (!CAMPING_NOTIFICATION_TYPES.includes(query.type)) {
      throw new ApiError(400, `Invalid type: ${query.type}`);
    }
    filters.type = query.type;
  }
  if (query.read !== undefined) filters.read = query.read === "true";
  return filters;
}

export function validateCampingNotificationRequest(body) {
  const type = body.type || body.eventType;
  const title = body.title || body.subject;

  if (!body.recipientId) throw new ApiError(400, "recipientId is required");
  if (!type) throw new ApiError(400, "type is required");
  if (!CAMPING_NOTIFICATION_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid type: ${type}`);
  }
  if (!title) throw new ApiError(400, "title is required");
  if (!body.message) throw new ApiError(400, "message is required");

  return {
    recipientId: body.recipientId,
    campId: body.campId || null,
    type: type,
    title: title,
    message: body.message,
    actionUrl: body.actionUrl || null
  };
}
