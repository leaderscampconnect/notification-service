import nodemailer from "nodemailer";

let transporterInstance = null;

/**
 * Creates and caches a Nodemailer transporter using the provided config.
 */
function getTransporter(config) {
  if (transporterInstance) {
    return transporterInstance;
  }

  const options = {
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
  };

  if (config.smtpUser) {
    options.auth = {
      user: config.smtpUser,
      pass: config.smtpPass,
    };
  }

  transporterInstance = nodemailer.createTransport(options);
  return transporterInstance;
}

/**
 * Sends an email using Nodemailer.
 *
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} options.text
 * @param {Array}  options.attachments
 * @param {object} config - The application config
 */
export async function sendEmail({ to, subject, html, text, attachments }, config) {
  const transporter = getTransporter(config);

  const mailOptions = {
    from: config.emailFrom,
    to,
    subject,
    html,
    text,
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  return transporter.sendMail(mailOptions);
}
