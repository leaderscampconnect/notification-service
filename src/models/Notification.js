const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    /**
     * Keycloak user ID (sub claim) of the recipient.
     */
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    recipientEmail: {
      type: String,
      required: [true, 'recipientEmail is required'],
    },
    channel: {
      type: String,
      enum: ['EMAIL'],
      default: 'EMAIL',
    },
    /**
     * RabbitMQ routing key that triggered this notification.
     * e.g. "booking.confirmed" | "ticket.issued"
     */
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    /**
     * ID of the domain entity that triggered the notification
     * (bookingId or ticketId).
     */
    referenceId: {
      type: String,
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      default: null,
    },
    subject: {
      type: String,
      default: null,
    },
    /**
     * The fully rendered HTML body that was sent.
     */
    renderedBody: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    /**
     * Raw RabbitMQ payload — stored for full audit trail.
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
