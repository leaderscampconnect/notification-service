package com.awd2026.notificationservice.service;

import com.awd2026.notificationservice.dto.NotificationRequest;
import com.awd2026.notificationservice.entity.Notification;
import com.awd2026.notificationservice.entity.NotificationType;
import com.awd2026.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    void createsUnreadNotificationWithTimestamps() {
        NotificationRequest request = request("camper-1");
        when(notificationRepository.save(org.mockito.ArgumentMatchers.any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Notification notification = notificationService.createNotification(request);

        assertEquals("camper-1", notification.getRecipientId());
        assertEquals(NotificationType.EVENT_REMINDER, notification.getType());
        assertFalse(notification.isRead());
        assertNotNull(notification.getCreatedAt());
        assertNotNull(notification.getUpdatedAt());
    }

    @Test
    void filtersNotificationsByEventReadStateAndType() {
        Notification matching = notification("camper-1", "event-1", false);
        Notification other = notification("camper-1", "event-2", true);
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc("camper-1"))
                .thenReturn(List.of(matching, other));

        List<Notification> result = notificationService.findNotifications(
                "camper-1",
                "event-1",
                false,
                NotificationType.EVENT_REMINDER
        );

        assertEquals(List.of(matching), result);
    }

    @Test
    void marksNotificationAsRead() {
        Notification notification = notification("camper-1", "event-1", false);
        notification.setId("notification-1");
        when(notificationRepository.findById("notification-1"))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        Notification updated = notificationService.markAsRead("notification-1");

        assertTrue(updated.isRead());
        assertNotNull(updated.getReadAt());
        verify(notificationRepository).save(notification);
    }

    @Test
    void marksAllUnreadNotificationsForRecipient() {
        Notification unread = notification("camper-1", "event-1", false);
        Notification alreadyRead = notification("camper-1", "event-2", true);
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc("camper-1"))
                .thenReturn(List.of(unread, alreadyRead));

        long updatedCount = notificationService.markAllAsRead("camper-1");

        assertEquals(1, updatedCount);
        assertTrue(unread.isRead());
        verify(notificationRepository).saveAll(List.of(unread));
    }

    private NotificationRequest request(String recipientId) {
        return new NotificationRequest(
                recipientId,
                "event-1",
                NotificationType.EVENT_REMINDER,
                "Event reminder",
                "Your event starts soon.",
                "/events/event-1"
        );
    }

    private Notification notification(String recipientId, String eventId, boolean read) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setEventId(eventId);
        notification.setType(NotificationType.EVENT_REMINDER);
        notification.setTitle("Event reminder");
        notification.setMessage("Your event starts soon.");
        notification.setRead(read);
        return notification;
    }
}

