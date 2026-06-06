package com.awd2026.notificationservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @GetMapping
    public List<String> getNotifications() {
        return List.of(
                "Event created",
                "Reminder sent to participants"
        );
    }
}

