const { getChannel, EXCHANGE_NAME } = require('../config/rabbitmq');
const { processNotification } = require('../services/notificationService');

const ROUTING_KEYS = ['booking.confirmed', 'booking.owner_alert'];
const QUEUE_NAME = 'notification.booking.events';

/**
 * Subscribes to the "booking.confirmed" routing key on the camping.events exchange.
 *
 * Expected payload from api-camping:
 * {
 *   eventType: "booking.confirmed",
 *   bookingId: string,
 *   userId: string,
 *   recipientEmail: string,
 *   recipientName: string,
 *   campingName: string,
 *   checkInDate: ISO8601,
 *   checkOutDate: ISO8601,
 *   totalAmount: number,
 *   currency: string,
 *   bookingReference: string,
 *   timestamp: ISO8601
 * }
 */
const startBookingConsumer = async () => {
  const channel = getChannel();

  // Durable queue survives broker restarts
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  for (const rk of ROUTING_KEYS) {
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, rk);
  }

  // Process one message at a time
  await channel.prefetch(1);

  console.log(`🐇 Consumer ready → queue: "${QUEUE_NAME}"`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    let payload;
    try {
      payload = JSON.parse(msg.content.toString());
    } catch {
      console.error('❌ Invalid JSON in booking.confirmed message — discarding');
      channel.nack(msg, false, false);
      return;
    }

    console.log(
      `📩 [${payload.eventType}] received | bookingId: ${payload.bookingId}`
    );

    try {
      await processNotification(payload.eventType || 'booking.confirmed', payload);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Processing failed, message discarded (no requeue):', err.message);
      // nack without requeue — prevents infinite retry loops
      // Consider a Dead Letter Exchange (DLX) for production retry strategy
      channel.nack(msg, false, false);
    }
  });
};

module.exports = { startBookingConsumer };
