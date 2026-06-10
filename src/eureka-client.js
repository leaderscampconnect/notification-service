import dns from "node:dns/promises";

const APPLICATION_NAME = "NOTIFICATION-SERVICE";

function endpoint(baseUrl, suffix) {
  return new URL(suffix, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    },
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`Eureka returned HTTP ${response.status}`);
  }
}

export async function createEurekaClient(config, logger = console) {
  if (!config.eurekaEnabled) {
    return { start: async () => {}, stop: async () => {} };
  }

  let ipAddress = config.eurekaIpAddress;
  if (!ipAddress) {
    try {
      ipAddress = (await dns.lookup(config.eurekaHostName)).address;
    } catch {
      ipAddress = "127.0.0.1";
    }
  }

  const instanceId = `${config.eurekaHostName}:${config.serviceName}:${config.port}`;
  const applicationUrl = endpoint(config.eurekaUrl, `apps/${APPLICATION_NAME}`);
  const instanceUrl = endpoint(
    config.eurekaUrl,
    `apps/${APPLICATION_NAME}/${encodeURIComponent(instanceId)}`
  );
  const serviceBaseUrl = `http://${config.eurekaHostName}:${config.port}`;
  let heartbeat;
  let retry;
  let stopped = false;

  const payload = {
    instance: {
      instanceId,
      app: APPLICATION_NAME,
      appGroupName: "CAMP_CONNECT",
      ipAddr: ipAddress,
      sid: "na",
      homePageUrl: `${serviceBaseUrl}/`,
      statusPageUrl: `${serviceBaseUrl}/actuator/info`,
      healthCheckUrl: `${serviceBaseUrl}/actuator/health`,
      secureHealthCheckUrl: null,
      vipAddress: config.serviceName,
      secureVipAddress: config.serviceName,
      countryId: 1,
      dataCenterInfo: {
        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
        name: "MyOwn"
      },
      hostName: config.eurekaHostName,
      status: "UP",
      overriddenStatus: "UNKNOWN",
      leaseInfo: {
        renewalIntervalInSecs: 30,
        durationInSecs: 90,
        registrationTimestamp: 0,
        lastRenewalTimestamp: 0,
        evictionTimestamp: 0,
        serviceUpTimestamp: Date.now()
      },
      port: { "$": config.port, "@enabled": "true" },
      securePort: { "$": 443, "@enabled": "false" },
      metadata: {
        "management.port": String(config.port)
      },
      isCoordinatingDiscoveryServer: "false",
      lastUpdatedTimestamp: Date.now(),
      lastDirtyTimestamp: Date.now(),
      actionType: "ADDED"
    }
  };

  async function register() {
    await request(applicationUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    logger.info(`Registered ${config.serviceName} with Eureka`);

    clearInterval(heartbeat);
    heartbeat = setInterval(async () => {
      try {
        await request(instanceUrl, { method: "PUT" });
      } catch (error) {
        logger.error(`Eureka heartbeat failed: ${error.message}`);
      }
    }, 30_000);
    heartbeat.unref();
  }

  async function start() {
    try {
      await register();
    } catch (error) {
      if (config.eurekaFailFast) {
        throw error;
      }
      logger.error(`Eureka registration failed: ${error.message}. Retrying.`);
      retry = setInterval(async () => {
        if (stopped) {
          return;
        }
        try {
          await register();
          clearInterval(retry);
        } catch (retryError) {
          logger.error(`Eureka registration retry failed: ${retryError.message}`);
        }
      }, 10_000);
      retry.unref();
    }
  }

  async function stop() {
    stopped = true;
    clearInterval(heartbeat);
    clearInterval(retry);
    try {
      await request(instanceUrl, { method: "DELETE" });
    } catch (error) {
      logger.error(`Eureka deregistration failed: ${error.message}`);
    }
  }

  return { start, stop };
}
