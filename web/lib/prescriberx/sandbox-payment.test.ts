import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseProtocolPriceAmount,
  sandboxGatewayTransactionId,
} from "./sandbox-payment";

describe("sandbox-payment", () => {
  it("parses dollar amounts from protocol labels", () => {
    assert.equal(parseProtocolPriceAmount("$349"), 349);
    assert.equal(parseProtocolPriceAmount("Starting at $197 if prescribed"), 197);
  });

  it("builds stable-ish sandbox transaction ids", () => {
    const id = sandboxGatewayTransactionId("01a0-test");
    assert.ok(id.startsWith("tidl-sandbox-"));
    assert.ok(id.includes("01a0-test"));
  });
});
