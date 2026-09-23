import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isSandboxDemoQuery } from "./sandbox-demo";

const envKeys = ["NODE_ENV", "PRESCRIBERX_SANDBOX"] as const;

/** Test-only: Node types mark NODE_ENV read-only; runtime env is mutable. */
function mutableEnv(): Record<string, string | undefined> {
  return process.env as Record<string, string | undefined>;
}

function snapshotEnv() {
  return Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]]),
  ) as Record<(typeof envKeys)[number], string | undefined>;
}

function restoreEnv(snap: Record<(typeof envKeys)[number], string | undefined>) {
  const env = mutableEnv();
  for (const key of envKeys) {
    const value = snap[key];
    if (value === undefined) Reflect.deleteProperty(env, key);
    else env[key] = value;
  }
}

describe("isSandboxDemoQuery", () => {
  const prior = snapshotEnv();

  afterEach(() => {
    restoreEnv(prior);
  });

  it("allows demo=1 in development with sandbox default", () => {
    mutableEnv().NODE_ENV = "development";
    delete process.env.PRESCRIBERX_SANDBOX;
    assert.equal(isSandboxDemoQuery("1"), true);
  });

  it("allows demo=1 in test with sandbox true", () => {
    mutableEnv().NODE_ENV = "test";
    process.env.PRESCRIBERX_SANDBOX = "true";
    assert.equal(isSandboxDemoQuery("1"), true);
  });

  it("blocks demo=1 when PRESCRIBERX_SANDBOX=false", () => {
    mutableEnv().NODE_ENV = "development";
    process.env.PRESCRIBERX_SANDBOX = "false";
    assert.equal(isSandboxDemoQuery("1"), false);
  });

  it("blocks demo=1 in production even with sandbox true", () => {
    mutableEnv().NODE_ENV = "production";
    process.env.PRESCRIBERX_SANDBOX = "true";
    assert.equal(isSandboxDemoQuery("1"), false);
  });

  it("returns false when demo is missing or not 1", () => {
    mutableEnv().NODE_ENV = "development";
    process.env.PRESCRIBERX_SANDBOX = "true";
    assert.equal(isSandboxDemoQuery(undefined), false);
    assert.equal(isSandboxDemoQuery(null), false);
    assert.equal(isSandboxDemoQuery("0"), false);
    assert.equal(isSandboxDemoQuery("true"), false);
  });
});
