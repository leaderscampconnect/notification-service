package com.awd2026.notificationservice.dto;

import com.awd2026.notificationservice.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationRequest(
        @NotBlank @Size(max = 120) String recipientId,
        @Size(max = 120) String eventId,
        @NotNull NotificationType type,
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 2000) String message,
        @Size(max = 500) String actionUrl
) {
}

