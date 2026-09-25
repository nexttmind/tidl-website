import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEMO_PRESCRIBERX_HOST,
  evaluatePrescribeRxEnvGuard,
  getPrescribeRxEnv,
  getSessionSecret,
  isDemoPrescribeRxBase,
  isProductionPrescribeRxBase,
  sandboxHostConsistent,
  type PrescribeRxEnv,
} from "./env";

function env(overrides: Partial<PrescribeRxEnv>): PrescribeRxEnv {
  return {
    baseUrl: "https://demo.prescribe-rx.com/api/v1",
    token: "1|test",
    sandbox: true,
    clientId: null,
    salesOrgId: null,
    defaultEncounterTypeId: null,
    webhookSecret: null,
    ...overrides,
  };
}

describe("isDemoPrescribeRxBase", () => {
  it("recognizes the sandbox host", () => {
    assert.equal(
      isDemoPrescribeRxBase("https://demo.prescribe-rx.com/api/v1"),
      true,
    );
    assert.equal(
      isDemoPrescribeRxBase("https://prescribe-rx.com/api/v1"),
      false,
    );
  });
});

describe("isProductionPrescribeRxBase", () => {
  it("recognizes production host but not demo", () => {
    assert.equal(
      isProductionPrescribeRxBase("https://prescribe-rx.com/api/v1"),
      true,
    );
    assert.equal(
      isProductionPrescribeRxBase("https://demo.prescribe-rx.com/api/v1"),
      false,
    );
  });
});

describe("evaluatePrescribeRxEnvGuard", () => {
  it("blocks demo host with SANDBOX=false", () => {
    const guard = evaluatePrescribeRxEnvGuard(
      env({
        baseUrl: `https://${DEMO_PRESCRIBERX_HOST}/api/v1`,
        sandbox: false,
      }),
    );
    assert.equal(guard.ok, false);
    if (!guard.ok) {
      assert.equal(guard.code, "sandbox_host_mismatch");
    }
  });

  it("allows demo host with sandbox true", () => {
    const guard = evaluatePrescribeRxEnvGuard(
      env({ baseUrl: `https://${DEMO_PRESCRIBERX_HOST}/api/v1`, sandbox: true }),
    );
    assert.equal(guard.ok, true);
    if (guard.ok) assert.equal(guard.warnings.length, 0);
  });

  it("warns on production host with sandbox still true", () => {
    const guard = evaluatePrescribeRxEnvGuard(
      env({
        baseUrl: "https://prescribe-rx.com/api/v1",
        sandbox: true,
      }),
    );
    assert.equal(guard.ok, true);
    if (guard.ok) assert.equal(guard.warnings.length, 1);
  });

  it("allows production host with sandbox false", () => {
    const guard = evaluatePrescribeRxEnvGuard(
      env({
        baseUrl: "https://prescribe-rx.com/api/v1",
        sandbox: false,
      }),
    );
    assert.equal(guard.ok, true);
    if (guard.ok) assert.equal(guard.warnings.length, 0);
  });

  it("warns when both sales org and client id are set", () => {
    const guard = evaluatePrescribeRxEnvGuard(
      env({
        salesOrgId: "019f3d35-afc4-72f8-b055-6c86c27ac1b3",
        clientId: "019c94dd-8292-7112-9e5b-c458125e8d33",
      }),
    );
    assert.equal(guard.ok, true);
    if (guard.ok) {
      assert.equal(guard.warnings.length, 1);
      assert.match(guard.warnings[0]!, /PRESCRIBERX_CLIENT_ID/);
    }
  });
});

describe("sandboxHostConsistent", () => {
  it("is false only for demo + SANDBOX=false", () => {
    assert.equal(
      sandboxHostConsistent(
        env({ baseUrl: `https://${DEMO_PRESCRIBERX_HOST}/api/v1`, sandbox: false }),
      ),
      false,
    );
    assert.equal(
      sandboxHostConsistent(
        env({ baseUrl: "https://prescribe-rx.com/api/v1", sandbox: true }),
      ),
      true,
    );
  });
});

describe("getPrescribeRxEnv", () => {
  it("reads PRESCRIBERX_SALES_ORG_ID into salesOrgId", () => {
    const prior = {
      base: process.env.PRESCRIBERX_API_BASE,
      token: process.env.PRESCRIBERX_API_TOKEN,
      salesOrg: process.env.PRESCRIBERX_SALES_ORG_ID,
    };
    process.env.PRESCRIBERX_API_BASE = "https://demo.prescribe-rx.com/api/v1";
    process.env.PRESCRIBERX_API_TOKEN = "1|test";
    process.env.PRESCRIBERX_SALES_ORG_ID =
      "019f3d35-afc4-72f8-b055-6c86c27ac1b3";
    const loaded = getPrescribeRxEnv();
    assert.ok(loaded);
    assert.equal(loaded!.salesOrgId, "019f3d35-afc4-72f8-b055-6c86c27ac1b3");
    if (prior.base === undefined) delete process.env.PRESCRIBERX_API_BASE;
    else process.env.PRESCRIBERX_API_BASE = prior.base;
    if (prior.token === undefined) delete process.env.PRESCRIBERX_API_TOKEN;
    else process.env.PRESCRIBERX_API_TOKEN = prior.token;
    if (prior.salesOrg === undefined) delete process.env.PRESCRIBERX_SALES_ORG_ID;
    else process.env.PRESCRIBERX_SALES_ORG_ID = prior.salesOrg;
  });
});

describe("getSessionSecret", () => {
  it("requires at least 32 characters", () => {
    const prior = process.env.TIDL_SESSION_SECRET;
    process.env.TIDL_SESSION_SECRET = "short";
    assert.equal(getSessionSecret(), null);
    process.env.TIDL_SESSION_SECRET = "a".repeat(32);
    assert.equal(getSessionSecret(), "a".repeat(32));
    process.env.TIDL_SESSION_SECRET = prior;
  });
});
