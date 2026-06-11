const Handlebars = require('handlebars');
const Template = require('../models/Template');

/**
 * Fetches the active template for the given eventType from MongoDB,
 * compiles it with Handlebars, and renders it with the provided data.
 *
 * @param {string} eventType - RabbitMQ routing key, e.g. "booking.confirmed"
 * @param {object} data      - Template variables (from the event payload)
 * @returns {{ templateId, subject, html, text }}
 */
const getAndRenderTemplate = async (eventType, data) => {
  const template = await Template.findOne({ eventType, isActive: true });

  if (!template) {
    throw new Error(
      `No active template found for eventType: "${eventType}". Run the seed script.`
    );
  }

  const renderSubject = Handlebars.compile(template.subject);
  const renderHtml = Handlebars.compile(template.htmlBody);
  const renderText = template.textBody
    ? Handlebars.compile(template.textBody)
    : null;

  return {
    templateId: template._id,
    subject: renderSubject(data),
    html: renderHtml(data),
    text: renderText ? renderText(data) : undefined,
  };
};

module.exports = { getAndRenderTemplate };
