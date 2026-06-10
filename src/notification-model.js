import mongoose from "mongoose";

import { NOTIFICATION_TYPES } from "./validation.js";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    eventId: { type: String, default: null, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    actionUrl: { type: String, default: null },
    sourceEventId: { type: String, unique: true, sparse: true }
  },
  {
    collection: "notifications",
    versionKey: false
  }
);

notificationSchema.index({ recipientId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification
  || mongoose.model("Notification", notificationSchema);
