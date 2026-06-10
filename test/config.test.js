import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolvePlaceholder } from "../src/config.js";

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
});
