import amqp from "amqplib";
import { processEmailEvent } from "../email/email-processor.js";

const ROUTING_KEYS = ["booking.confirmed", "booking.owner_alert"];
const QUEUE_NAME = "notification.booking.events";

let connection = null;
let channel = null;

export async function startRabbitMQConsumer(config) {
  try {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();

    // Ensure exchange exists
    await channel.assertExchange(config.rabbitmqExchange, "topic", { durable: true });

    // Durable queue survives broker restarts
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Bind queue to all required routing keys
    for (const rk of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, config.rabbitmqExchange, rk);
    }

    // Process one message at a time
    await channel.prefetch(1);

    console.log(`dY? Consumer ready +' queue: "${QUEUE_NAME}" on exchange: "${config.rabbitmqExchange}"`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch {
        console.error("?O Invalid JSON in message ?' discarding");
        channel.nack(msg, false, false);
        return;
      }

      console.log(`dY"c [${payload.eventType}] received | bookingId: ${payload.bookingId}`);

      try {
        await processEmailEvent(payload.eventType || "booking.confirmed", payload, config);
        channel.ack(msg);
      } catch (err) {
        console.error("?O Processing failed, message discarded (no requeue):", err.message);
        // nack without requeue to prevent infinite retry loops
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error("Failed to start RabbitMQ consumer:", error.message);
    // Let the application retry or crash depending on requirements
  }
}

export async function stopRabbitMQConsumer() {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
}
