import amqp from "amqplib";
import { CampingNotificationService } from "./camping-notification-service.js";
const ROUTING_KEYS = ["booking.confirmed", "booking.owner_alert"];
const QUEUE_NAME = "notification.v2.camping.events";
let connection = null;
let channel = null;
let stopping = false;
const campingService = new CampingNotificationService();
export async function startCampingRabbitMQConsumer(config) {
  if (stopping) return;
  try {
    connection = await amqp.connect(config.rabbitmqUrl);
    connection.on("error", (error) => {
      console.error(`RabbitMQ camping v2 connection error: ${error.message}`);
    });
    connection.on("close", () => {
      if (!stopping) {
        console.error("RabbitMQ camping v2 connection closed. Reconnecting in 5s...");
        setTimeout(() => startCampingRabbitMQConsumer(config), 5000);
      }
    });
    channel = await connection.createChannel();
    await channel.assertExchange(config.rabbitmqExchange, "topic", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    for (const rk of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, config.rabbitmqExchange, rk);
    }
    await channel.prefetch(1);
    console.log(`⛺ Camping V2 Consumer ready -> queue: "${QUEUE_NAME}"`);
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch {
        console.error("Invalid JSON in camping message - discarding");
        channel.nack(msg, false, false);
        return;
      }
      console.log(`⛺ [${payload.eventType}] received for UI notification | bookingId: ${payload.bookingId}`);
      try {
        // Map RabbitMQ event payload to CampingNotification model
        let title = "Camping Update";
        let message = "You have a new camping notification.";
        const type = payload.eventType || "SYSTEM_ALERT";
        
        if (type === "booking.confirmed") {
          title = "Booking Confirmed!";
          message = `Your booking for ${payload.campingName} has been confirmed. Check-in: ${payload.checkInDate}`;
        } else if (type === "booking.owner_alert") {
          title = "New Booking Alert!";
          message = `New booking from ${payload.recipientName} at ${payload.campingName} for ${payload.guests || 1} guests.`;
        }
        // recipientId comes from userId in the payload. Note: The payload sends userId, we need to save it as recipientId.
        const recipientId = payload.userId;
        
        if (recipientId) {
          await campingService.createNotification({
            recipientId,
            type: "BOOKING_CONFIRMED", // Mapping to validated CAMPING_NOTIFICATION_TYPES
            title,
            message,
            actionUrl: `/owner/dashboard`
          });
        }
        channel.ack(msg);
      } catch (err) {
        console.error("Camping UI notification processing failed:", err.message);
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error(`Failed to start RabbitMQ camping v2 consumer: ${error.message}. Retrying in 5s...`);
    setTimeout(() => startCampingRabbitMQConsumer(config), 5000);
  }
}
export async function stopCampingRabbitMQConsumer() {
  stopping = true;
  if (channel) {
    await channel.close().catch(() => {});
  }
  if (connection) {
    await connection.close().catch(() => {});
  }
}