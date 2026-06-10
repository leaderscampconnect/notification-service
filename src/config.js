const DEFAULT_CONFIG_SERVER_URL = "http://localhost:8099";

function extractConfigServerUrl(environment) {
  if (environment.CONFIG_SERVER_URL) {
    return environment.CONFIG_SERVER_URL;
  }

  const configImport = environment.CONFIG_SERVER_IMPORT;
  if (!configImport) {
    return DEFAULT_CONFIG_SERVER_URL;
  }

  return configImport
    .replace(/^optional:/, "")
    .replace(/^configserver:/, "");
}

function isRequiredConfigImport(environment) {
  if (environment.CONFIG_SERVER_FAIL_FAST === "true") {
    return true;
  }

  const configImport = environment.CONFIG_SERVER_IMPORT;
  return Boolean(configImport && !configImport.startsWith("optional:"));
}

export function resolvePlaceholder(value, environment = process.env) {
  if (typeof value !== "string") {
    return value;
  }

  const match = value.match(/^\$\{([^:}]+)(?::([^}]*))?}$/);
  if (!match) {
    return value;
  }

  const [, variableName, defaultValue = ""] = match;
  return environment[variableName] ?? defaultValue;
}

async function fetchCentralProperties(environment) {
  const baseUrl = extractConfigServerUrl(environment).replace(/\/$/, "");
  const application = environment.SERVICE_NAME || "notification-service";
  const profile = environment.CONFIG_PROFILE || "default";
  const endpoint = `${baseUrl}/${application}/${profile}`;

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error(`Config Server returned HTTP ${response.status}`);
    }

    const document = await response.json();
    const properties = {};
    for (const propertySource of [...(document.propertySources || [])].reverse()) {
      Object.assign(properties, propertySource.source);
    }
    return { properties, endpoint, loaded: true };
  } catch (error) {
    if (isRequiredConfigImport(environment)) {
      throw new Error(`Cannot load required Config Server at ${endpoint}: ${error.message}`);
    }
    return { properties: {}, endpoint, loaded: false };
  }
}

export async function loadConfig(environment = process.env) {
  const central = await fetchCentralProperties(environment);
  const property = (name, fallback) =>
    resolvePlaceholder(central.properties[name] ?? fallback, environment);

  const port = Number(
    environment.SERVER_PORT
      || environment.NOTIFICATION_SERVICE_PORT
      || property("server.port", "8082")
  );

  return {
    serviceName: environment.SERVICE_NAME || "notification-service",
    port,
    mongoUri:
      environment.MONGODB_URI
      || property("spring.data.mongodb.uri", "mongodb://localhost:27018/notification_db"),
    eurekaUrl:
      environment.EUREKA_URL
      || property(
        "eureka.client.service-url.defaultZone",
        "http://localhost:8761/eureka/"
      ),
    eurekaHostName:
      environment.EUREKA_INSTANCE_HOSTNAME
      || environment.HOSTNAME
      || "localhost",
    eurekaIpAddress: environment.EUREKA_INSTANCE_IP,
    eurekaEnabled: environment.EUREKA_ENABLED !== "false",
    eurekaFailFast: environment.EUREKA_FAIL_FAST === "true",
    swaggerPath: property("springdoc.swagger-ui.path", "/swagger-ui.html"),
    apiDocsPath: property("springdoc.api-docs.path", "/v3/api-docs"),
    configServer: central,
    
    // RabbitMQ Config
    rabbitmqUrl: environment.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
    rabbitmqExchange: environment.RABBITMQ_EXCHANGE || "camping.events",
    
    // SMTP Config
    smtpHost: environment.SMTP_HOST || "localhost",
    smtpPort: Number(environment.SMTP_PORT) || 1025,
    smtpUser: environment.SMTP_USER || "",
    smtpPass: environment.SMTP_PASS || "",
    smtpSecure: environment.SMTP_SECURE === "true",
    emailFrom: environment.EMAIL_FROM || "CampConnect <noreply@campconnect.com>"
  };
}
