package com.awd2026.notificationservice.dto;

import com.awd2026.notificationservice.entity.Notification;
import com.awd2026.notificationservice.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        String id,
        String recipientId,
        String eventId,
        NotificationType type,
        String title,
        String message,
        boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String actionUrl
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientId(),
                notification.getEventId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt(),
                notification.getUpdatedAt(),
                notification.getActionUrl()
        );
    }
}
