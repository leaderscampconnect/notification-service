const { startBookingConsumer } = require('./bookingConsumer');
const { startTicketConsumer } = require('./ticketConsumer');

/**
 * Starts all RabbitMQ consumers.
 * Called once during service bootstrap (and again after reconnect).
 */
const startConsumers = async () => {
  await startBookingConsumer();
  await startTicketConsumer();
  console.log('✅ All consumers started');
};

module.exports = { startConsumers };
