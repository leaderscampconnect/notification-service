const { createTransporter } = require('../config/mailer');

const FROM = process.env.EMAIL_FROM || 'CampConnect <noreply@campconnect.com>';

/**
 * Sends an email via the configured Nodemailer transporter.
 *
 * @param {object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - Rendered HTML body
 * @param {string} [options.text]  - Optional plain-text fallback
 */
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(attachments ? { attachments } : {}),
  });

  console.log(`📧 Email sent → ${to} | MessageId: ${info.messageId}`);
  return info;
};

module.exports = { sendEmail };
