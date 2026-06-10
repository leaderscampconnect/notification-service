import handlebars from "handlebars";
import { EmailTemplate } from "./template-model.js";

/**
 * Compiles a Handlebars string and renders it with the given data.
 */
function compileAndRender(templateString, data) {
  if (!templateString) return "";
  const compiled = handlebars.compile(templateString);
  return compiled(data);
}

/**
 * Fetches the template from MongoDB and renders both subject and body.
 *
 * @param {string} templateName - The name/event type to look up.
 * @param {object} templateData - The dynamic variables for Handlebars.
 * @returns {Promise<{templateId: string, subject: string, html: string, text: string}>}
 */
export async function getAndRenderTemplate(templateName, templateData) {
  const templateRecord = await EmailTemplate.findOne({ name: templateName });

  if (!templateRecord) {
    throw new Error(`Email template not found for event: ${templateName}`);
  }

  const subject = compileAndRender(templateRecord.subject, templateData);
  const html = compileAndRender(templateRecord.htmlContent, templateData);
  const text = compileAndRender(templateRecord.textContent, templateData);

  return {
    templateId: templateRecord._id.toString(),
    subject,
    html,
    text
  };
}
