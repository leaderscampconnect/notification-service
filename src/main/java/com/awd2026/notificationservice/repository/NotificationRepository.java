package com.awd2026.notificationservice.repository;

import com.awd2026.notificationservice.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    long countByRecipientIdAndReadFalse(String recipientId);
}

