const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter.
 *
 * Dev  → MailHog (SMTP trap, no real emails sent)
 * Prod → Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS env vars
 *         for any provider: SendGrid, AWS SES, your own SMTP, etc.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailhog',
    port: parseInt(process.env.SMTP_PORT, 10) || 1025,
    secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER
      ? {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : {}),
  });

module.exports = { createTransporter };
