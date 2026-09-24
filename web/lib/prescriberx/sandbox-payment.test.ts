import { describe, expect, it } from "vitest";
import {
  parseProtocolPriceAmount,
  sandboxGatewayTransactionId,
} from "./sandbox-payment";

describe("sandbox-payment", () => {
  it("parses dollar amounts from protocol labels", () => {
    expect(parseProtocolPriceAmount("$349")).toBe(349);
    expect(parseProtocolPriceAmount("Starting at $197 if prescribed")).toBe(197);
  });

  it("builds stable-ish sandbox transaction ids", () => {
    const id = sandboxGatewayTransactionId("01a0-test");
    expect(id.startsWith("tidl-sandbox-")).toBe(true);
    expect(id.includes("01a0-test")).toBe(true);
  });
});
