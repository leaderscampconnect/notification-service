import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createRabbitUrl, resolvePlaceholder } from "../src/config.js";

describe("Config Server property compatibility", () => {
  it("uses an environment override from a Spring placeholder", () => {
    assert.equal(
      resolvePlaceholder("${SERVER_PORT:8082}", { SERVER_PORT: "9090" }),
      "9090"
    );
  });

  it("uses the Spring placeholder default when the variable is absent", () => {
    assert.equal(resolvePlaceholder("${SERVER_PORT:8082}", {}), "8082");
  });

  it("builds one encoded broker URL for every RabbitMQ consumer", () => {
    assert.equal(
      createRabbitUrl({
        host: "rabbitmq",
        port: "5672",
        user: "camp connect",
        password: "p@ss/word"
      }),
      "amqp://camp%20connect:p%40ss%2Fword@rabbitmq:5672"
    );
  });
});
