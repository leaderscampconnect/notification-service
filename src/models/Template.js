const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      unique: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required'],
      unique: true,
      enum: ['booking.confirmed', 'ticket.issued'],
    },
    /**
     * Email subject line — supports Handlebars interpolation.
     * Example: "Booking Confirmed - {{campingName}} | Ref: {{bookingReference}}"
     */
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
    },
    /**
     * HTML body of the email — supports Handlebars interpolation.
     */
    htmlBody: {
      type: String,
      required: [true, 'HTML body is required'],
    },
    /**
     * Plain-text fallback for email clients that don't render HTML.
     */
    textBody: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /**
     * Incremented on each update for audit purposes.
     */
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
