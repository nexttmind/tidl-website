import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { PrescribeRxEnv } from "./env";
import { buildHealthConfigFlags } from "./health-config";

/** Test-only: Node types mark NODE_ENV read-only; runtime env is mutable. */
function mutableEnv(): Record<string, string | undefined> {
  return process.env as Record<string, string | undefined>;
}

function env(overrides: Partial<PrescribeRxEnv> = {}): PrescribeRxEnv {
  return {
    baseUrl: "https://demo.prescribe-rx.com/api/v1",
    token: "1|test",
    sandbox: true,
    clientId: null,
    salesOrgId: null,
    defaultEncounterTypeId: "enc-type-uuid",
    webhookSecret: "secret",
    ...overrides,
  };
}

describe("buildHealthConfigFlags", () => {
  const prior = process.env["NODE_ENV"];

  afterEach(() => {
    const env = mutableEnv();
    if (prior === undefined) {
      Reflect.deleteProperty(env, "NODE_ENV");
    } else {
      env.NODE_ENV = prior;
    }
  });

  it("includes baseUrl and defaultEncounterTypeId outside production", () => {
    mutableEnv().NODE_ENV = "development";
    const flags = buildHealthConfigFlags(
      env({ salesOrgId: "019f3d35-afc4-72f8-b055-6c86c27ac1b3" }),
    ) as Record<string, unknown>;
    assert.equal(flags.baseUrl, "https://demo.prescribe-rx.com/api/v1");
    assert.equal(flags.defaultEncounterTypeId, "enc-type-uuid");
    assert.equal(flags.salesOrgId, "019f3d35-afc4-72f8-b055-6c86c27ac1b3");
    assert.equal(flags.sandbox, true);
  });

  it("omits baseUrl and defaultEncounterTypeId in production", () => {
    mutableEnv().NODE_ENV = "production";
    const flags = buildHealthConfigFlags(env()) as Record<string, unknown>;
    assert.equal("baseUrl" in flags, false);
    assert.equal("defaultEncounterTypeId" in flags, false);
    assert.equal("salesOrgId" in flags, false);
    assert.equal(flags.sandbox, true);
    assert.equal(flags.webhookSecretConfigured, true);
  });
});
