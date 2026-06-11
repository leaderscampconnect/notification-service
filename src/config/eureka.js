const Eureka = require('eureka-js-client').Eureka;

/**
 * Registers api-notification with the Spring Cloud Eureka server.
 * Enables the api-gateway to discover and route to this service.
 */
const registerWithEureka = () => {
  const PORT = parseInt(process.env.PORT, 10) || 3001;
  const HOST = process.env.HOSTNAME || 'api-notification';
  const EUREKA_HOST = process.env.EUREKA_HOST || 'eureka';
  const EUREKA_PORT = parseInt(process.env.EUREKA_PORT, 10) || 8761;

  const client = new Eureka({
    instance: {
      app: 'api-notification',
      hostName: HOST,
      ipAddr: HOST,
      port: {
        $: PORT,
        '@enabled': true,
      },
      vipAddress: 'api-notification',
      dataCenterInfo: {
        '@class':
          'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
      healthCheckUrl: `http://${HOST}:${PORT}/health`,
      statusPageUrl: `http://${HOST}:${PORT}/health`,
      homePageUrl: `http://${HOST}:${PORT}/`,
    },
    eureka: {
      host: EUREKA_HOST,
      port: EUREKA_PORT,
      servicePath: '/eureka/apps/',
      maxRetries: 15,
      requestRetryDelay: 5000,
    },
  });

  client.start((error) => {
    if (error) {
      console.error('❌ Eureka registration failed:', error);
    } else {
      console.log(`✅ Registered with Eureka at ${EUREKA_HOST}:${EUREKA_PORT}`);
    }
  });

  // Graceful deregister on shutdown
  process.on('SIGINT', () => {
    client.stop(() => {
      console.log('🔌 Deregistered from Eureka');
      process.exit(0);
    });
  });

  return client;
};

module.exports = { registerWithEureka };
