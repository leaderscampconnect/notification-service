const { getChannel, EXCHANGE_NAME } = require('../config/rabbitmq');
const { processNotification } = require('../services/notificationService');

const ROUTING_KEY = 'ticket.issued';
const QUEUE_NAME = 'notification.ticket.issued';

/**
 * Subscribes to the "ticket.issued" routing key on the camping.events exchange.
 *
 * Expected payload from api-camping:
 * {
 *   eventType: "ticket.issued",
 *   ticketId: string,
 *   bookingId: string,
 *   userId: string,
 *   recipientEmail: string,
 *   recipientName: string,
 *   ticketCode: string,
 *   campingName: string,
 *   validFrom: ISO8601,
 *   validUntil: ISO8601,
 *   timestamp: ISO8601
 * }
 */
const startTicketConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
  await channel.prefetch(1);

  console.log(`🐇 Consumer ready → queue: "${QUEUE_NAME}"`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    let payload;
    try {
      payload = JSON.parse(msg.content.toString());
    } catch {
      console.error('❌ Invalid JSON in ticket.issued message — discarding');
      channel.nack(msg, false, false);
      return;
    }

    console.log(
      `📩 [ticket.issued] received | ticketId: ${payload.ticketId}`
    );

    try {
      await processNotification('ticket.issued', payload);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Processing failed, message discarded:', err.message);
      channel.nack(msg, false, false);
    }
  });
};

module.exports = { startTicketConsumer };
