package com.awd2026.notificationservice.controller;

import com.awd2026.notificationservice.dto.NotificationRequest;
import com.awd2026.notificationservice.dto.NotificationResponse;
import com.awd2026.notificationservice.entity.NotificationType;
import com.awd2026.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "Persisted notification CRUD and read state")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List and filter notifications")
    public List<NotificationResponse> getNotifications(
            @RequestParam(required = false) String recipientId,
            @RequestParam(required = false) String eventId,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) NotificationType type
    ) {
        return notificationService.findNotifications(recipientId, eventId, read, type);
    }

    @GetMapping("/{id}")
    public NotificationResponse getNotification(@PathVariable String id) {
        return notificationService.getNotification(id);
    }

    @PostMapping
    @Operation(summary = "Create a persisted notification")
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update notification content")
    public NotificationResponse updateNotification(
            @PathVariable String id,
            @Valid @RequestBody NotificationRequest request
    ) {
        return notificationService.updateNotification(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark one notification as read")
    public NotificationResponse markAsRead(@PathVariable String id) {
        return notificationService.markAsRead(id);
    }

    @PatchMapping("/recipient/{recipientId}/read-all")
    @Operation(summary = "Mark all notifications for a recipient as read")
    public Map<String, Long> markAllAsRead(@PathVariable String recipientId) {
        return Map.of("updatedCount", notificationService.markAllAsRead(recipientId));
    }

    @GetMapping("/recipient/{recipientId}/unread-count")
    public Map<String, Long> getUnreadCount(@PathVariable String recipientId) {
        return Map.of("unreadCount", notificationService.getUnreadCount(recipientId));
    }
}

