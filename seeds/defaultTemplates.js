/**
 * Seed script — inserts default email templates into MongoDB.
 * Run with: npm run seed
 *
 * Templates use Handlebars syntax: {{variableName}}
 * They are upserted so running this script multiple times is safe.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('../src/models/Template');

const YEAR = new Date().getFullYear();

const BASE_STYLE = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f4f7f6;
  padding: 20px;
`;

const templates = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. BOOKING CONFIRMATION
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'booking_confirmation',
    eventType: 'booking.confirmed',
    subject: '✅ Booking Confirmed — {{campingName}} | Ref: {{bookingReference}}',
    htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE}">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#1b4332,#2d6a4f);border-radius:12px 12px 0 0;">
          <tr>
            <td style="padding:30px;text-align:center;">
              <div style="font-size:36px;">🏕️</div>
              <h1 style="color:#ffffff;margin:8px 0 4px;font-size:26px;letter-spacing:1px;">CampConnect</h1>
              <p style="color:#95d5b2;margin:0;font-size:14px;">Your adventure awaits!</p>
            </td>
          </tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:36px;">
              <h2 style="color:#1b4332;margin:0 0 16px;font-size:22px;">Booking Confirmed! ✅</h2>
              <p style="color:#4a5568;line-height:1.6;margin:0 0 24px;">
                Dear <strong>{{recipientName}}</strong>,
              </p>
              <p style="color:#4a5568;line-height:1.6;margin:0 0 28px;">
                Great news — your camping reservation at <strong>{{campingName}}</strong> is confirmed.
                We've reserved your spot and can't wait to host you!
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="color:#166534;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">
                      📋 Booking Details
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Camping Site</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{campingName}}</td>
                      </tr>
                      <tr style="border-top:1px solid #d1fae5;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Booking Ref</td>
                        <td style="padding:8px 0;">
                          <code style="background:#dcfce7;color:#166534;padding:3px 8px;border-radius:4px;font-size:13px;font-weight:700;">
                            {{bookingReference}}
                          </code>
                        </td>
                      </tr>
                      <tr style="border-top:1px solid #d1fae5;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-in</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{checkInDate}}</td>
                      </tr>
                      <tr style="border-top:1px solid #d1fae5;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-out</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{checkOutDate}}</td>
                      </tr>
                      <tr style="border-top:1px solid #d1fae5;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Total Amount</td>
                        <td style="padding:8px 0;color:#166534;font-weight:700;font-size:18px;">
                          {{totalAmount}} {{currency}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 24px;">
                💡 Please keep your booking reference handy — you'll need it for check-in.
                If you have any questions, contact our support team.
              </p>

              <p style="color:#4a5568;margin:0;">See you at the campsite! 🌲</p>
              <p style="color:#2d6a4f;font-weight:700;margin:8px 0 0;">— The CampConnect Team</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${YEAR} CampConnect. All rights reserved.<br/>
                You received this email because you made a booking on CampConnect.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textBody: `
BOOKING CONFIRMED — CampConnect
================================

Dear {{recipientName}},

Your booking at {{campingName}} is confirmed!

BOOKING DETAILS
---------------
Camping Site    : {{campingName}}
Reference       : {{bookingReference}}
Check-in        : {{checkInDate}}
Check-out       : {{checkOutDate}}
Total Amount    : {{totalAmount}} {{currency}}

Keep your booking reference handy for check-in.

See you at the campsite!
— The CampConnect Team

© ${YEAR} CampConnect
    `.trim(),
    isActive: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. TICKET RECEIPT
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'ticket_receipt',
    eventType: 'ticket.issued',
    subject: '🎟️ Your Ticket — {{campingName}} | Code: {{ticketCode}}',
    htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ticket Issued</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE}">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px 12px 0 0;">
          <tr>
            <td style="padding:30px;text-align:center;">
              <div style="font-size:36px;">🏕️</div>
              <h1 style="color:#ffffff;margin:8px 0 4px;font-size:26px;letter-spacing:1px;">CampConnect</h1>
              <p style="color:#bfdbfe;margin:0;font-size:14px;">Your ticket is ready!</p>
            </td>
          </tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:36px;">
              <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:22px;">🎟️ Ticket Issued!</h2>
              <p style="color:#4a5568;line-height:1.6;margin:0 0 24px;">
                Dear <strong>{{recipientName}}</strong>,
              </p>
              <p style="color:#4a5568;line-height:1.6;margin:0 0 28px;">
                Your ticket for <strong>{{campingName}}</strong> has been issued.
                Present the code below at the entrance.
              </p>

              <!-- Ticket Code Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px dashed #3b82f6;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:28px;text-align:center;">
                    <p style="color:#1e40af;font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-weight:600;">
                      Your Entry Code
                    </p>
                    <div style="font-family:monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#1d4ed8;background:#dbeafe;display:inline-block;padding:12px 24px;border-radius:8px;">
                      {{ticketCode}}
                    </div>
                    <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">
                      Present this code at the campsite entrance
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ticket Details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="color:#1e3a5f;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">
                      📋 Ticket Details
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Camping Site</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{campingName}}</td>
                      </tr>
                      <tr style="border-top:1px solid #e2e8f0;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Valid From</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{validFrom}}</td>
                      </tr>
                      <tr style="border-top:1px solid #e2e8f0;">
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Valid Until</td>
                        <td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px;">{{validUntil}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 24px;">
                ⚠️ This ticket is non-transferable. The code is linked to your booking.
              </p>

              <p style="color:#4a5568;margin:0;">Enjoy your camping experience! 🌲</p>
              <p style="color:#2563eb;font-weight:700;margin:8px 0 0;">— The CampConnect Team</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${YEAR} CampConnect. All rights reserved.<br/>
                You received this email because a ticket was issued for your booking.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textBody: `
TICKET ISSUED — CampConnect
============================

Dear {{recipientName}},

Your ticket for {{campingName}} has been issued!

YOUR ENTRY CODE
---------------
  {{ticketCode}}

TICKET DETAILS
--------------
Camping Site : {{campingName}}
Valid From   : {{validFrom}}
Valid Until  : {{validUntil}}

Present this code at the campsite entrance.

Enjoy your camping experience!
— The CampConnect Team

© ${YEAR} CampConnect
    `.trim(),
    isActive: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. OWNER ALERT
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'owner_alert',
    eventType: 'booking.owner_alert',
    subject: '🏕️ New Booking Confirmed — {{campingName}} | Ref: {{bookingReference}}',
    htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Host Booking Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE7DE;font-family:Arial,sans-serif;color:#1C1C1C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE7DE;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#F7F3ED;border:1px solid #CFC6B8;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background-color:#244735;padding:24px 32px;">
              <h1 style="margin:0;color:#FFFFFF;font-size:28px;">CampConnect</h1>
              <p style="margin:8px 0 0 0;color:#DDE7DF;font-size:14px;">Host booking notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 12px 0;font-size:24px;color:#244735;">New booking confirmed</h2>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#6B6B6B;">
                A new reservation has just been confirmed for your camping site.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#E3DCD2;border-radius:12px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px 0;font-size:13px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.5px;">Reservation summary</p>
                    <p style="margin:0 0 8px 0;font-size:16px;"><strong>Site:</strong> {{campingName}}</p>
                    <p style="margin:0 0 8px 0;font-size:16px;"><strong>Location:</strong> {{location}}</p>
                    <p style="margin:0 0 8px 0;font-size:16px;"><strong>Camper:</strong> {{camperEmail}}</p>
                    <p style="margin:0 0 8px 0;font-size:16px;"><strong>Dates:</strong> {{checkInDate}} → {{checkOutDate}}</p>
                    <p style="margin:0 0 8px 0;font-size:16px;"><strong>Guests:</strong> {{guests}}</p>
                    <p style="margin:0;font-size:16px;"><strong>Booking ID:</strong> {{bookingReference}}</p>
                  </td>
                </tr>
              </table>
              <div style="margin-top:24px;padding:16px 18px;background-color:#F1F7EA;border-left:4px solid #6A8F3B;border-radius:8px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C1C1C;">
                  You may review this booking from your CampConnect dashboard.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#F3EEE6;border-top:1px solid #CFC6B8;">
              <p style="margin:0;font-size:12px;color:#6B6B6B;">
                Automated notification sent by CampConnect.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textBody: `
NEW BOOKING CONFIRMED — CampConnect
====================================

A new reservation has just been confirmed for your camping site.

RESERVATION SUMMARY
-------------------
Site       : {{campingName}}
Location   : {{location}}
Camper     : {{camperEmail}}
Dates      : {{checkInDate}} to {{checkOutDate}}
Guests     : {{guests}}
Booking ID : {{bookingReference}}

You may review this booking from your CampConnect dashboard.

Automated notification sent by CampConnect.
    `.trim(),
    isActive: true,
  },
];

const seed = async () => {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/campconnect_notification';

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    for (const t of templates) {
      const result = await Template.findOneAndUpdate(
        { eventType: t.eventType },
        t,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded template: "${result.name}" (${result.eventType})`);
    }

    console.log('\n🎉 All templates seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
