import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clientIpFromRequest,
  consumeRateLimit,
  resetAuthRateLimitForTests,
} from "./auth-rate-limit";

describe("consumeRateLimit", () => {
  it("allows five intake calls then blocks with retryAfterSec", () => {
    resetAuthRateLimitForTests();
    for (let i = 0; i < 5; i++) {
      const result = consumeRateLimit("intake:test", 5, 60_000);
      assert.equal(result.allowed, true);
      assert.ok(result.retryAfterSec >= 1);
    }
    const blocked = consumeRateLimit("intake:test", 5, 60_000);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec >= 1);
  });

  it("uses independent buckets per key", () => {
    resetAuthRateLimitForTests();
    for (let i = 0; i < 5; i++) {
      assert.equal(consumeRateLimit("intake:a", 5, 60_000).allowed, true);
    }
    assert.equal(consumeRateLimit("intake:a", 5, 60_000).allowed, false);
    assert.equal(consumeRateLimit("intake:b", 5, 60_000).allowed, true);
  });

  it("allows twenty status calls then blocks", () => {
    resetAuthRateLimitForTests();
    for (let i = 0; i < 20; i++) {
      assert.equal(consumeRateLimit("status:ip", 20, 60_000).allowed, true);
    }
    assert.equal(consumeRateLimit("status:ip", 20, 60_000).allowed, false);
  });
});

describe("clientIpFromRequest", () => {
  it("prefers x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: {
        "x-real-ip": "203.0.113.1",
        "x-vercel-forwarded-for": "198.51.100.2",
        "x-forwarded-for": "192.0.2.3",
      },
    });
    assert.equal(clientIpFromRequest(req), "203.0.113.1");
  });

  it("falls back to x-vercel-forwarded-for", () => {
    const req = new Request("http://localhost/", {
      headers: {
        "x-vercel-forwarded-for": "198.51.100.2, 10.0.0.1",
        "x-forwarded-for": "192.0.2.3",
      },
    });
    assert.equal(clientIpFromRequest(req), "198.51.100.2");
  });

  it("falls back to first x-forwarded-for hop", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "192.0.2.3, 10.0.0.1" },
    });
    assert.equal(clientIpFromRequest(req), "192.0.2.3");
  });

  it("returns unknown when no headers", () => {
    assert.equal(clientIpFromRequest(new Request("http://localhost/")), "unknown");
  });
});
