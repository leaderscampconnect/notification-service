import amqp from "amqplib";

import { createUserEventHandler } from "./user-event-handler.js";

const USER_EXCHANGE = "campconnect.user.exchange";
const NOTIFICATION_DLX = "campconnect.notification.user.dlx";
const NOTIFICATION_DLQ = "campconnect.notification.user.dlq";

const QUEUE_BINDINGS = [
  {
    queue: "campconnect.notification.user.created.queue",
    routingKey: "user.created"
  },
  {
    queue: "campconnect.notification.user.updated.queue",
    routingKey: "user.updated"
  },
  {
    queue: "campconnect.notification.user.deleted.queue",
    routingKey: "user.deleted"
  },
  {
    queue: "campconnect.notification.user.password-reset.queue",
    routingKey: "user.password.reset"
  }
];

export function createRabbitUserConsumer({
  config,
  notificationService,
  logger = console,
  amqpClient = amqp
}) {
  const userEventHandler = createUserEventHandler(notificationService, logger);
  let connection;
  let channel;
  let connected = false;
  let stopping = false;
  let retryTimer;

  function scheduleReconnect() {
    if (stopping || retryTimer) {
      return;
    }
    retryTimer = setTimeout(async () => {
      retryTimer = undefined;
      try {
        await connect();
      } catch (error) {
        logger.error(`RabbitMQ reconnect failed: ${error.message}`);
        scheduleReconnect();
      }
    }, 5000);
    retryTimer.unref();
  }

  async function consumeMessage(message) {
    if (!message) {
      return;
    }
    try {
      const userEvent = JSON.parse(message.content.toString("utf8"));
      await userEventHandler.handle(userEvent);
      channel.ack(message);
    } catch (error) {
      logger.error(`RabbitMQ user event failed: ${error.message}`);
      channel.nack(message, false, false);
    }
  }

  async function connect() {
    connection = await amqpClient.connect(config.rabbitUrl);
    connection.on("error", (error) => {
      logger.error(`RabbitMQ connection error: ${error.message}`);
    });
    connection.on("close", () => {
      connected = false;
      channel = undefined;
      connection = undefined;
      if (!stopping) {
        logger.error("RabbitMQ connection closed. Reconnecting.");
        scheduleReconnect();
      }
    });

    channel = await connection.createChannel();
    await channel.assertExchange(USER_EXCHANGE, "topic", { durable: true });
    await channel.assertExchange(NOTIFICATION_DLX, "direct", { durable: true });
    await channel.assertQueue(NOTIFICATION_DLQ, { durable: true });
    await channel.bindQueue(NOTIFICATION_DLQ, NOTIFICATION_DLX, "dead");
    await channel.prefetch(10);

    for (const binding of QUEUE_BINDINGS) {
      await channel.assertQueue(binding.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": NOTIFICATION_DLX,
          "x-dead-letter-routing-key": "dead"
        }
      });
      await channel.bindQueue(binding.queue, USER_EXCHANGE, binding.routingKey);
      await channel.consume(binding.queue, consumeMessage, { noAck: false });
    }

    connected = true;
    logger.info(
      `RabbitMQ consumer connected with ${QUEUE_BINDINGS.length} user event queues`
    );
  }

  return {
    async start() {
      if (!config.rabbitEnabled) {
        return;
      }
      try {
        await connect();
      } catch (error) {
        if (config.rabbitFailFast) {
          throw error;
        }
        logger.error(`RabbitMQ startup failed: ${error.message}. Retrying.`);
        scheduleReconnect();
      }
    },
    async stop() {
      stopping = true;
      clearTimeout(retryTimer);
      connected = false;
      if (channel) {
        await channel.close().catch(() => {});
      }
      if (connection) {
        await connection.close().catch(() => {});
      }
    },
    isConnected() {
      return !config.rabbitEnabled || connected;
    }
  };
}
