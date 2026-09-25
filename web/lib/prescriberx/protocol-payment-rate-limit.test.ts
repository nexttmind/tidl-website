import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resetAuthRateLimitForTests } from "./auth-rate-limit";
import {
  PROTOCOL_PAYMENT_RATE,
  consumeProtocolPaymentRateLimit,
} from "./protocol-payment-rate-limit";
import { rateLimitedResponse } from "./rate-limit-response";

describe("consumeProtocolPaymentRateLimit", () => {
  it("allows twenty calls per IP then blocks with retryAfterSec", () => {
    resetAuthRateLimitForTests();
    const ip = "203.0.113.9";
    for (let i = 0; i < PROTOCOL_PAYMENT_RATE.perMinute; i++) {
      const ok = consumeProtocolPaymentRateLimit(ip);
      assert.equal(ok.allowed, true);
    }
    const blocked = consumeProtocolPaymentRateLimit(ip);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec >= 1);
  });

  it("uses independent buckets per IP", () => {
    resetAuthRateLimitForTests();
    for (let i = 0; i < PROTOCOL_PAYMENT_RATE.perMinute; i++) {
      assert.equal(consumeProtocolPaymentRateLimit("a").allowed, true);
    }
    assert.equal(consumeProtocolPaymentRateLimit("a").allowed, false);
    assert.equal(consumeProtocolPaymentRateLimit("b").allowed, true);
  });
});

describe("rateLimitedResponse", () => {
  it("returns 429 with Retry-After", async () => {
    const res = rateLimitedResponse(42);
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("Retry-After"), "42");
    const json = (await res.json()) as { code?: string };
    assert.equal(json.code, "rate_limited");
  });
});
