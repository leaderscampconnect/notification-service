import mongoose from "mongoose";

import { ApiError } from "../errors.js";
import { CampingNotification } from "./camping-notification-model.js";

function localDateTime(value) {
  return value ? new Date(value).toISOString().replace(/Z$/, "") : null;
}

function toResponse(notification) {
  const value = notification.toObject ? notification.toObject() : notification;
  return {
    id: String(value._id || value.id),
    recipientId: value.recipientId,
    campId: value.campId ?? null,
    type: value.type,
    title: value.title,
    message: value.message,
    read: Boolean(value.read),
    readAt: localDateTime(value.readAt),
    createdAt: localDateTime(value.createdAt),
    updatedAt: localDateTime(value.updatedAt),
    actionUrl: value.actionUrl ?? null
  };
}

function ensureValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, `Notification not found with id: ${id}`);
  }
}

export class CampingNotificationService {
  constructor(model = CampingNotification) {
    this.model = model;
  }

  async findNotifications(filters) {
    const notifications = await this.model
      .find(filters)
      .sort({ createdAt: -1 })
      .lean();
    return notifications.map(toResponse);
  }

  async getNotification(id) {
    ensureValidId(id);
    const notification = await this.model.findById(id).lean();
    if (!notification) {
      throw new ApiError(404, `Notification not found with id: ${id}`);
    }
    return toResponse(notification);
  }

  async createNotification(request) {
    const now = new Date();
    const notification = await this.model.create({
      ...request,
      read: false,
      readAt: null,
      createdAt: now,
      updatedAt: now
    });
    return toResponse(notification);
  }

  async updateNotification(id, request) {
    ensureValidId(id);
    const notification = await this.model.findByIdAndUpdate(
      id,
      { ...request, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    if (!notification) {
      throw new ApiError(404, `Notification not found with id: ${id}`);
    }
    return toResponse(notification);
  }

  async deleteNotification(id) {
    ensureValidId(id);
    const notification = await this.model.findByIdAndDelete(id);
    if (!notification) {
      throw new ApiError(404, `Notification not found with id: ${id}`);
    }
  }

  async markAsRead(id) {
    ensureValidId(id);
    const existing = await this.model.findById(id);
    if (!existing) {
      throw new ApiError(404, `Notification not found with id: ${id}`);
    }
    if (!existing.read) {
      const now = new Date();
      existing.read = true;
      existing.readAt = now;
      existing.updatedAt = now;
      await existing.save();
    }
    return toResponse(existing);
  }

  async markAllAsRead(recipientId) {
    const now = new Date();
    const result = await this.model.updateMany(
      { recipientId, read: false },
      { $set: { read: true, readAt: now, updatedAt: now } }
    );
    return result.modifiedCount;
  }

  async getUnreadCount(recipientId) {
    return this.model.countDocuments({ recipientId, read: false });
  }

  async deleteByRecipientId(recipientId) {
    const result = await this.model.deleteMany({ recipientId });
    return result.deletedCount;
  }
}
