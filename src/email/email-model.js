import mongoose from "mongoose";

const emailNotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false, index: true },
    recipientEmail: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    referenceId: { type: String, required: false },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
    metadata: { type: mongoose.Schema.Types.Mixed },
    templateId: { type: String, required: false },
    subject: { type: String, required: false },
    renderedBody: { type: String, required: false },
    errorMessage: { type: String, required: false },
    sentAt: { type: Date, required: false }
  },
  {
    timestamps: true,
    collection: "email_notifications",
    versionKey: false
  }
);

emailNotificationSchema.index({ createdAt: -1 });

export const EmailNotification =
  mongoose.models.EmailNotification
  || mongoose.model("EmailNotification", emailNotificationSchema);
