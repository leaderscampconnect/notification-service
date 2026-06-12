import mongoose from "mongoose";

import { CAMPING_NOTIFICATION_TYPES } from "./camping-validation.js";

const campingNotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    campId: { type: String, default: null, index: true },
    type: { type: String, enum: CAMPING_NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    actionUrl: { type: String, default: null }
  },
  {
    collection: "camping_notifications",
    versionKey: false
  }
);

campingNotificationSchema.index({ recipientId: 1, read: 1 });
campingNotificationSchema.index({ createdAt: -1 });

export const CampingNotification =
  mongoose.models.CampingNotification
  || mongoose.model("CampingNotification", campingNotificationSchema);
