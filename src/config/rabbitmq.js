const amqp = require('amqplib');

let connection = null;
let channel = null;

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE || 'camping.events';
const EXCHANGE_TYPE = 'topic';

/**
 * Connect to RabbitMQ with retry logic.
 * @param {number} retries - Number of retry attempts
 * @param {number} delayMs  - Delay between attempts in milliseconds
 */
const connectRabbitMQ = async (retries = 10, delayMs = 5000) => {
  const url =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();

      // Declare the topic exchange (idempotent)
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });

      console.log(`✅ RabbitMQ connected — exchange: ${EXCHANGE_NAME}`);

      // Auto-reconnect on unexpected close
      connection.on('error', (err) => {
        console.error('❌ RabbitMQ error:', err.message);
        scheduleReconnect();
      });

      connection.on('close', () => {
        console.warn('⚠️  RabbitMQ connection closed — reconnecting...');
        scheduleReconnect();
      });

      return channel;
    } catch (err) {
      console.error(
        `❌ RabbitMQ attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt < retries) {
        await sleep(delayMs);
      } else {
        throw new Error(
          'Could not connect to RabbitMQ after maximum retries'
        );
      }
    }
  }
};

const scheduleReconnect = () => {
  channel = null;
  connection = null;
  setTimeout(async () => {
    try {
      await connectRabbitMQ();
      // Re-attach consumers after reconnect
      const { startConsumers } = require('../consumers');
      await startConsumers();
    } catch (err) {
      console.error('❌ Reconnect failed:', err.message);
    }
  }, 5000);
};

/**
 * Returns the active channel. Throws if not yet connected.
 */
const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { connectRabbitMQ, getChannel, EXCHANGE_NAME };
