# Notification Service

Persisted notification center for Camp Connect.

## Features

- MongoDB-backed notification CRUD
- Recipient, event, type, and read-state filtering
- Unread counts
- Mark one or all recipient notifications as read
- Eureka service discovery

## Run

```bash
docker compose up -d mongodb
mvn spring-boot:run
```

The service runs on `http://localhost:8082`. Its MongoDB container is exposed
on local port `27018`, allowing it to run beside the event database on `27017`.

- Swagger UI: `http://localhost:8082/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8082/v3/api-docs`
- Health: `http://localhost:8082/actuator/health`

## Main endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/notifications` | Create a notification |
| `GET` | `/notifications` | List and filter notifications |
| `GET` | `/notifications/{id}` | Get one notification |
| `PUT` | `/notifications/{id}` | Update notification content |
| `DELETE` | `/notifications/{id}` | Delete a notification |
| `PATCH` | `/notifications/{id}/read` | Mark one as read |
| `PATCH` | `/notifications/recipient/{recipientId}/read-all` | Mark all as read |
| `GET` | `/notifications/recipient/{recipientId}/unread-count` | Count unread |

Supported list filters are `recipientId`, `eventId`, `read`, and `type`.

## Configuration

| Environment variable | Default |
| --- | --- |
| `MONGODB_URI` | `mongodb://localhost:27018/notification_db` |
| `EUREKA_URL` | `http://localhost:8761/eureka/` |
| `CONFIG_SERVER_URL` | `http://localhost:8099` |

Validation and business errors use a structured response containing the HTTP
status, request path, message, and field-level validation errors.
