import client from "prom-client";

export const metricsRegistry = new client.Registry();

metricsRegistry.setDefaultLabels({
  application: "notification-service"
});

client.collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "campconnect_notification_"
});

const httpRequests = new client.Counter({
  name: "campconnect_notification_http_requests_total",
  help: "Total HTTP requests handled by Notification Service",
  labelNames: ["method", "status_code"],
  registers: [metricsRegistry]
});

const httpRequestDuration = new client.Histogram({
  name: "campconnect_notification_http_request_duration_seconds",
  help: "Notification Service HTTP request duration in seconds",
  labelNames: ["method", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry]
});

export function metricsMiddleware(request, response, next) {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const labels = {
      method: request.method,
      status_code: String(response.statusCode)
    };
    const elapsedSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;

    httpRequests.inc(labels);
    httpRequestDuration.observe(labels, elapsedSeconds);
  });

  next();
}
