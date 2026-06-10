const SUPPORTED_EVENTS = new Set([
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
  "PASSWORD_RESET"
]);

function normalizeEventTime(value) {
  if (Array.isArray(value) && value.length >= 6) {
    const [year, month, day, hour, minute, second, nanoseconds = 0] = value;
    const timestamp = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nanoseconds / 1_000_000)
    );
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  throw new Error("User event has an invalid eventTime");
}

function normalizeUserEvent(userEvent) {
  if (!userEvent || !SUPPORTED_EVENTS.has(userEvent.eventType)) {
    throw new Error(`Unsupported user event type: ${userEvent?.eventType}`);
  }
  if (userEvent.userId === null || userEvent.userId === undefined) {
    throw new Error("User event is missing userId");
  }
  if (!userEvent.eventTime) {
    throw new Error("User event is missing eventTime");
  }
  return {
    ...userEvent,
    eventTime: normalizeEventTime(userEvent.eventTime)
  };
}

export function createUserEventHandler(notificationService, logger = console) {
  return {
    async handle(userEvent) {
      const normalizedEvent = normalizeUserEvent(userEvent);
      const recipientId = String(normalizedEvent.userId);

      switch (normalizedEvent.eventType) {
        case "USER_CREATED": {
          const firstName = normalizedEvent.firstName?.trim() || "Camper";
          const notification = await notificationService.createFromUserEvent(
            normalizedEvent,
            {
              type: "USER_WELCOME",
              title: "Welcome to CampConnect",
              message: `Welcome ${firstName}. Your CampConnect account is ready.`,
              actionUrl: "/profile"
            }
          );
          logger.info(`Created welcome notification for user ${recipientId}`);
          return { action: "CREATED", notification };
        }
        case "USER_UPDATED": {
          const notification = await notificationService.createFromUserEvent(
            normalizedEvent,
            {
              type: "USER_PROFILE_UPDATED",
              title: "Profile updated",
              message: "Your CampConnect profile information was updated.",
              actionUrl: "/profile"
            }
          );
          logger.info(`Created profile update notification for user ${recipientId}`);
          return { action: "CREATED", notification };
        }
        case "PASSWORD_RESET": {
          const notification = await notificationService.createFromUserEvent(
            normalizedEvent,
            {
              type: "USER_PASSWORD_RESET",
              title: "Password reset requested",
              message: "A password reset was requested for your CampConnect account.",
              actionUrl: "/reset-password"
            }
          );
          logger.info(`Created password reset notification for user ${recipientId}`);
          return { action: "CREATED", notification };
        }
        case "USER_DELETED": {
          const deletedCount =
            await notificationService.deleteByRecipientId(recipientId);
          logger.info(
            `Deleted ${deletedCount} notifications for removed user ${recipientId}`
          );
          return { action: "DELETED", deletedCount };
        }
        default:
          throw new Error(
            `Unsupported user event type: ${normalizedEvent.eventType}`
          );
      }
    }
  };
}
