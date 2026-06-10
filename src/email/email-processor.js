import { EmailNotification } from "./email-model.js";
import { getAndRenderTemplate } from "./template-service.js";
import { sendEmail } from "./email-service.js";

/**
 * Core orchestration for processing an incoming RabbitMQ email event.
 * 
 * @param {string} eventType - RabbitMQ routing key
 * @param {object} payload   - Raw message payload from the consumer
 * @param {object} config    - App configuration for the email service
 */
export async function processEmailEvent(eventType, payload, config) {
  const {
    userId,
    recipientEmail,
    recipientName,
    bookingId,
    ticketId,
    ...templateData
  } = payload;

  console.log(`Payload keys: ${Object.keys(payload).join(", ")}`);

  // 1 — persist a PENDING record immediately (full audit trail)
  const emailNotification = await EmailNotification.create({
    userId,
    recipientEmail,
    eventType,
    referenceId: bookingId || ticketId,
    status: "PENDING",
    metadata: payload,
  });

  try {
    // 2 — fetch template from DB and render via Handlebars
    const { templateId, subject, html, text } = await getAndRenderTemplate(
      eventType,
      { recipientName, bookingId, ticketId, ...templateData }
    );

    // 3 — prepare attachments and send email
    let attachments = undefined;
    if (payload.ticketPdfBase64) {
      attachments = [{
        filename: payload.ticketPdfName || "Ticket.pdf",
        content: Buffer.from(payload.ticketPdfBase64, "base64"),
        contentType: "application/pdf"
      }];
    }

    await sendEmail({ to: recipientEmail, subject, html, text, attachments }, config);

    // 4 — mark as SENT
    emailNotification.templateId = templateId;
    emailNotification.subject = subject;
    emailNotification.renderedBody = html;
    emailNotification.status = "SENT";
    emailNotification.sentAt = new Date();
    await emailNotification.save();

    console.log(`✅ [${eventType}] email sent → ${recipientEmail}`);
    return emailNotification;
  } catch (err) {
    // 4 (error path) — mark as FAILED but do NOT throw so consumer can nack
    emailNotification.status = "FAILED";
    emailNotification.errorMessage = err.message;
    await emailNotification.save();

    console.error(
      `❌ [${eventType}] email FAILED for ${recipientEmail}: ${err.message}`
    );
    throw err;
  }
}
