package com.awd2026.notificationservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI notificationServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Camp Connect Notification Service API")
                .description("""
                        Persisted notification CRUD, filtering, unread counts,
                        and read-state management.
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Camp Connect Team")
                        .url("https://github.com/leaderscampconnect")));
    }
}

