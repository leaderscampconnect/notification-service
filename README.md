# Notification Service

Spring Boot microservice for notifications in the Camp Connect project.

## Features

- Exposes notifications through a REST endpoint
- Registers with Eureka for service discovery
- Can be called by other services through the service name

## Requirements

- Java 17
- Maven
- Eureka server running on port `8761`

## Run

```bash
mvn spring-boot:run
```

The service starts on `http://localhost:8082`.

The notifications endpoint is available at:

```text
GET http://localhost:8082/notifications
```

