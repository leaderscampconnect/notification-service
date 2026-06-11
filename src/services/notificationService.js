const Notification = require('../models/Notification');
const { getAndRenderTemplate } = require('./templateService');
const { sendEmail } = require('./emailService');

/**
 * Core orchestration:
 * 1. Create a PENDING notification record in MongoDB
 * 2. Fetch and render the template for the given eventType
 * 3. Send the email
 * 4. Update the record to SENT or FAILED
 *
 * @param {string} eventType - RabbitMQ routing key
 * @param {object} payload   - Raw message payload from the consumer
 */
const processNotification = async (eventType, payload) => {
  const {
    userId,
    recipientEmail,
    recipientName,
    bookingId,
    ticketId,
    ...templateData
  } = payload;

  console.log(`Payload keys: ${Object.keys(payload).join(', ')}`);
  if (payload.ticketPdfBase64) {
    console.log(`Has ticketPdfBase64: yes, length: ${payload.ticketPdfBase64.length}`);
  } else {
    console.log(`Has ticketPdfBase64: no`);
  }

  // 1 — persist a PENDING record immediately (full audit trail)
  const notification = await Notification.create({
    userId,
    recipientEmail,
    eventType,
    referenceId: bookingId || ticketId,
    status: 'PENDING',
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
        filename: payload.ticketPdfName || 'Ticket.pdf',
        content: Buffer.from(payload.ticketPdfBase64, 'base64'),
        contentType: 'application/pdf'
      }];
    }

    await sendEmail({ to: recipientEmail, subject, html, text, attachments });

    // 4 — mark as SENT
    notification.templateId = templateId;
    notification.subject = subject;
    notification.renderedBody = html;
    notification.status = 'SENT';
    notification.sentAt = new Date();
    await notification.save();

    console.log(`✅ [${eventType}] notification sent → ${recipientEmail}`);
    return notification;
  } catch (err) {
    // 4 (error path) — mark as FAILED but do NOT throw so consumer can nack
    notification.status = 'FAILED';
    notification.errorMessage = err.message;
    await notification.save();

    console.error(
      `❌ [${eventType}] notification FAILED for ${recipientEmail}: ${err.message}`
    );
    throw err;
  }
};

module.exports = { processNotification };
