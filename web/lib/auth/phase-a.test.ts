/**
 * Unit tests for Phase A auth foundation.
 * Run from web/: npm test
 */

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  assertValidSessionPayload,
  isSessionExpired,
  sealSession,
  sessionNeedsRefresh,
  unsealSession,
  readCookieValue,
  SESSION_COOKIE_NAME,
} from "../auth/session";
import { extractAuthToken, TokenParseError } from "../prescriberx/token-parse";
import { evaluateOwnershipMatch } from "../prescriberx/auth-ownership";
import {
  consumeAuthRateLimit,
  resetAuthRateLimitForTests,
} from "../prescriberx/auth-rate-limit";
import {
  extractAbilitiesFromMe,
  orgTokenCanIssuePatientToken,
} from "../prescriberx/abilities";
import { mapAuthError, mapLoginError } from "../prescriberx/auth-errors";
import { PrescribeRxError } from "../prescriberx/client";

const SECRET = "phase-a-test-secret-key-32chars!!";

before(() => {
  process.env.TIDL_SESSION_SECRET = SECRET;
});

after(() => {
  resetAuthRateLimitForTests();
});

describe("session seal/unseal", () => {
  it("round-trips a valid payload", async () => {
    const payload = {
      token: "1|abcPatientTokenValueHere",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      email: "a@example.com",
      patientChartId: "019d0000-0000-7000-8000-000000000001",
      abilities: ["patient:read"],
    };
    const sealed = await sealSession(payload);
    assert.ok(sealed);
    const back = await unsealSession(sealed);
    assert.deepEqual(back, payload);
  });

  it("rejects tampered cookie", async () => {
    const sealed = await sealSession({
      token: "1|abcPatientTokenValueHere",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    assert.ok(sealed);
    const tampered = sealed.slice(0, -4) + "xxxx";
    assert.equal(await unsealSession(tampered), null);
  });

  it("rejects malformed sealed string", async () => {
    assert.equal(await unsealSession("not-a-seal"), null);
    assert.equal(await unsealSession(""), null);
    assert.equal(await unsealSession(null), null);
  });

  it("rejects invalid payload shape on seal", async () => {
    const bad = await sealSession({
      token: "short",
      expiresAt: "x",
    } as never);
    // token too short fails isSessionPayload
    assert.equal(bad, null);
  });

  it("detects expiry and refresh window", () => {
    const expired = {
      token: "1|abcPatientTokenValueHere",
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    assert.equal(isSessionExpired(expired), true);
    assert.equal(sessionNeedsRefresh(expired), true);

    const fresh = {
      token: "1|abcPatientTokenValueHere",
      expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    };
    assert.equal(isSessionExpired(fresh), false);
    assert.equal(sessionNeedsRefresh(fresh), false);

    const near = {
      token: "1|abcPatientTokenValueHere",
      expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    };
    assert.equal(sessionNeedsRefresh(near), true);
  });

  it("validates session payload helper", () => {
    assert.equal(
      assertValidSessionPayload({
        token: "1|longenough",
        expiresAt: "2026-01-01T00:00:00Z",
      }),
      true,
    );
    assert.equal(assertValidSessionPayload({ token: "x" }), false);
  });

  it("reads cookie value from header", () => {
    const header = `a=1; ${SESSION_COOKIE_NAME}=sealedvalue; b=2`;
    assert.equal(readCookieValue(header), "sealedvalue");
    assert.equal(readCookieValue("a=1"), null);
  });
});

describe("token-parse", () => {
  it("parses LoginResponse shape", () => {
    const parsed = extractAuthToken({
      success: true,
      data: {
        token: "1|login-token-value",
        expires_at: "2026-04-04T12:00:00+00:00",
        abilities: ["patient:read"],
        user: {
          email: "p@example.com",
          patient_chart_id: "chart-1",
        },
      },
    });
    assert.equal(parsed.token, "1|login-token-value");
    assert.equal(parsed.userEmail, "p@example.com");
    assert.equal(parsed.patientChartId, "chart-1");
  });

  it("parses RefreshResponse shape", () => {
    const parsed = extractAuthToken({
      data: {
        token: "1|refresh-token-value",
        expires_at: "2026-04-04T12:30:00+00:00",
        abilities: [],
      },
    });
    assert.equal(parsed.token, "1|refresh-token-value");
  });

  it("parses issue-token SuccessEnvelope with data.token", () => {
    const parsed = extractAuthToken({
      success: true,
      data: {
        token: "1|issued-patient-token",
        expires_at: "2026-04-04T12:00:00+00:00",
      },
    });
    assert.equal(parsed.token, "1|issued-patient-token");
  });

  it("throws when token missing", () => {
    assert.throws(
      () => extractAuthToken({ success: true, data: { abilities: [] } }),
      TokenParseError,
    );
  });
});

describe("ownership evaluateOwnershipMatch", () => {
  it("ok when chart and optional email match", () => {
    assert.equal(
      evaluateOwnershipMatch({
        email: "A@Example.com",
        patientChartId: "chart-1",
        lookupCanonicalId: "chart-1",
        encounterChartId: "chart-1",
        encounterEmail: "a@example.com",
      }),
      "ok",
    );
  });

  it("fail when lookup chart differs", () => {
    assert.equal(
      evaluateOwnershipMatch({
        email: "a@example.com",
        patientChartId: "chart-1",
        lookupCanonicalId: "other",
        encounterChartId: "chart-1",
        encounterEmail: null,
      }),
      "fail",
    );
  });

  it("fail when encounter belongs to another chart", () => {
    assert.equal(
      evaluateOwnershipMatch({
        email: "a@example.com",
        patientChartId: "chart-1",
        lookupCanonicalId: "chart-1",
        encounterChartId: "chart-2",
        encounterEmail: null,
      }),
      "fail",
    );
  });

  it("fail when encounter email mismatches", () => {
    assert.equal(
      evaluateOwnershipMatch({
        email: "a@example.com",
        patientChartId: "chart-1",
        lookupCanonicalId: "chart-1",
        encounterChartId: "chart-1",
        encounterEmail: "other@example.com",
      }),
      "fail",
    );
  });
});

describe("auth rate limit", () => {
  it("allows then blocks", () => {
    resetAuthRateLimitForTests();
    for (let i = 0; i < 10; i++) {
      assert.equal(consumeAuthRateLimit("t:ip", 10, 60_000), true);
    }
    assert.equal(consumeAuthRateLimit("t:ip", 10, 60_000), false);
  });
});

describe("orgTokenCanIssuePatientToken", () => {
  it("allows wildcard or patient:issue-token", () => {
    assert.equal(orgTokenCanIssuePatientToken(["*"]), true);
    assert.equal(orgTokenCanIssuePatientToken(["patient:issue-token"]), true);
    assert.equal(orgTokenCanIssuePatientToken(["patient:read"]), false);
  });

  it("reads abilities from /auth/me envelopes", () => {
    assert.deepEqual(
      extractAbilitiesFromMe({ data: { abilities: ["patient:issue-token"] } }),
      ["patient:issue-token"],
    );
    assert.deepEqual(
      extractAbilitiesFromMe({
        data: { user: { abilities: ["catalog:read"] } },
      }),
      ["catalog:read"],
    );
  });
});

describe("mapAuthError", () => {
  it("maps 401/403/422 without upstream body", async () => {
    for (const status of [401, 403, 422]) {
      const res = mapAuthError(
        new PrescribeRxError("fail", status, { secret: "nope" }),
      );
      assert.equal(res.status, status);
      const json = (await res.json()) as { message: string; upstream?: unknown };
      assert.equal(json.upstream, undefined);
      assert.ok(json.message);
    }
  });

  it("maps TokenParseError to 502", async () => {
    const res = mapAuthError(new TokenParseError("missing"));
    assert.equal(res.status, 502);
  });

  it("keeps non-login 404 as 404 so order misses are not logout", async () => {
    const res = mapAuthError(new PrescribeRxError("missing", 404, {}));
    assert.equal(res.status, 404);
  });
});

describe("mapLoginError", () => {
  it("maps PRX 404 to TIDL 401 with generic auth copy", async () => {
    const res = mapLoginError(
      new PrescribeRxError("User not found", 404, { email: "hidden@x.com" }),
    );
    assert.equal(res.status, 401);
    const json = (await res.json()) as {
      message: string;
      code?: string;
      email?: unknown;
    };
    assert.equal(json.code, "unauthorized");
    assert.equal(
      json.message,
      "Unable to complete authentication. Check your details and try again.",
    );
    assert.equal(json.email, undefined);
  });

  it("keeps 401 generic", async () => {
    const res = mapLoginError(new PrescribeRxError("bad password", 401, {}));
    assert.equal(res.status, 401);
  });
});
