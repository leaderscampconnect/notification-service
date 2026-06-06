package com.awd2026.notificationservice.service;

import com.awd2026.notificationservice.dto.NotificationRequest;
import com.awd2026.notificationservice.entity.Notification;
import com.awd2026.notificationservice.entity.NotificationType;
import com.awd2026.notificationservice.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> findNotifications(
            String recipientId,
            String eventId,
            Boolean read,
            NotificationType type
    ) {
        List<Notification> notifications = recipientId == null || recipientId.isBlank()
                ? notificationRepository.findAllByOrderByCreatedAtDesc()
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);

        return notifications.stream()
                .filter(notification -> eventId == null || eventId.isBlank()
                        || eventId.equals(notification.getEventId()))
                .filter(notification -> read == null || read == notification.isRead())
                .filter(notification -> type == null || type == notification.getType())
                .toList();
    }

    public Notification getNotification(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> notFound(id));
    }

    public Notification createNotification(NotificationRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Notification notification = new Notification();
        applyRequest(notification, request);
        notification.setRead(false);
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);
        return notificationRepository.save(notification);
    }

    public Notification updateNotification(String id, NotificationRequest request) {
        Notification notification = getNotification(id);
        applyRequest(notification, request);
        notification.setUpdatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw notFound(id);
        }
        notificationRepository.deleteById(id);
    }

    public Notification markAsRead(String id) {
        Notification notification = getNotification(id);
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setUpdatedAt(notification.getReadAt());
            return notificationRepository.save(notification);
        }
        return notification;
    }

    public long markAllAsRead(String recipientId) {
        List<Notification> notifications =
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        LocalDateTime now = LocalDateTime.now();
        List<Notification> unreadNotifications = notifications.stream()
                .filter(notification -> !notification.isRead())
                .peek(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(now);
                    notification.setUpdatedAt(now);
                })
                .toList();
        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    public long getUnreadCount(String recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    private void applyRequest(Notification notification, NotificationRequest request) {
        notification.setRecipientId(request.recipientId().trim());
        notification.setEventId(blankToNull(request.eventId()));
        notification.setType(request.type());
        notification.setTitle(request.title().trim());
        notification.setMessage(request.message().trim());
        notification.setActionUrl(blankToNull(request.actionUrl()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(String id) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Notification not found with id: " + id
        );
    }
}

