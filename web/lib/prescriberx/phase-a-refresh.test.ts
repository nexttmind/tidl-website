/**
 * Concurrent refresh mutex behavior (mocked fetch).
 */

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  SESSION_COOKIE_NAME,
  sealSession,
} from "../auth/session";
import {
  ensureFreshPatientSession,
  resetPatientRefreshMutexForTests,
} from "./patient-client";
import { POST as logoutPost } from "../../app/api/prescriberx/auth/logout/route";

const SECRET = "phase-a-test-secret-key-32chars!!";

before(() => {
  process.env.TIDL_SESSION_SECRET = SECRET;
  process.env.PRESCRIBERX_API_BASE = "https://example.test/api/v1";
  process.env.PRESCRIBERX_API_TOKEN = "org-token-not-used-in-patient-path";
});

after(() => {
  resetPatientRefreshMutexForTests();
});

function nearSession(token: string, email: string) {
  return {
    token,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    email,
    patientChartId: "chart-1",
    abilities: ["patient:read"],
  };
}

describe("ensureFreshPatientSession concurrency", () => {
  it("five concurrent requests for one token share one refresh", async () => {
    resetPatientRefreshMutexForTests();

    const sealed = await sealSession(
      nearSession("1|old-patient-token-value", "p@example.com"),
    );
    assert.ok(sealed);
    const cookiePair = `${SESSION_COOKIE_NAME}=${sealed}`;

    let refreshCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        const auth = new Headers(init?.headers).get("authorization") ?? "";
        assert.match(auth, /old-patient-token-value/);
        await new Promise((r) => setTimeout(r, 40));
        return new Response(
          JSON.stringify({
            data: {
              token: "1|new-patient-token-value",
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              abilities: ["patient:read"],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("{}", { status: 500 });
    }) as typeof fetch;

    try {
      const results = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          ensureFreshPatientSession(
            new Request(`http://localhost/${i}`, {
              headers: { cookie: cookiePair },
            }),
          ),
        ),
      );
      for (const result of results) {
        assert.ok(result);
        assert.equal(result.session.token, "1|new-patient-token-value");
      }
      assert.equal(refreshCalls, 1);
    } finally {
      globalThis.fetch = originalFetch;
      resetPatientRefreshMutexForTests();
    }
  });

  it("different tokens do not share a refresh", async () => {
    resetPatientRefreshMutexForTests();
    const sealedA = await sealSession(
      nearSession("1|token-patient-aaaa", "a@example.com"),
    );
    const sealedB = await sealSession(
      nearSession("1|token-patient-bbbb", "b@example.com"),
    );
    assert.ok(sealedA && sealedB);

    let refreshCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        const auth = new Headers(init?.headers).get("authorization") ?? "";
        const next = auth.includes("token-patient-aaaa")
          ? "1|new-token-aaaa"
          : "1|new-token-bbbb";
        await new Promise((r) => setTimeout(r, 30));
        return new Response(
          JSON.stringify({
            data: {
              token: next,
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              abilities: ["patient:read"],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("{}", { status: 500 });
    }) as typeof fetch;

    try {
      const [a, b] = await Promise.all([
        ensureFreshPatientSession(
          new Request("http://localhost/a", {
            headers: { cookie: `${SESSION_COOKIE_NAME}=${sealedA}` },
          }),
        ),
        ensureFreshPatientSession(
          new Request("http://localhost/b", {
            headers: { cookie: `${SESSION_COOKIE_NAME}=${sealedB}` },
          }),
        ),
      ]);
      assert.equal(a?.session.token, "1|new-token-aaaa");
      assert.equal(b?.session.token, "1|new-token-bbbb");
      assert.equal(a?.session.email, "a@example.com");
      assert.equal(b?.session.email, "b@example.com");
      assert.equal(refreshCalls, 2);
    } finally {
      globalThis.fetch = originalFetch;
      resetPatientRefreshMutexForTests();
    }
  });

  it("shared refresh 401 unauthenticates every waiter", async () => {
    resetPatientRefreshMutexForTests();
    const sealed = await sealSession(
      nearSession("1|old-patient-token-value", "p@example.com"),
    );
    assert.ok(sealed);
    const cookiePair = `${SESSION_COOKIE_NAME}=${sealed}`;
    let refreshCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      if (String(input).includes("/auth/refresh")) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 20));
        return new Response(JSON.stringify({ message: "Unauthenticated." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("{}", { status: 500 });
    }) as typeof fetch;

    try {
      const results = await Promise.all(
        [0, 1, 2, 3, 4].map((i) =>
          ensureFreshPatientSession(
            new Request(`http://localhost/f${i}`, {
              headers: { cookie: cookiePair },
            }),
          ),
        ),
      );
      assert.deepEqual(results, [null, null, null, null, null]);
      assert.equal(refreshCalls, 1);
    } finally {
      globalThis.fetch = originalFetch;
      resetPatientRefreshMutexForTests();
    }
  });
});

describe("logout after upstream 401", () => {
  it("clears the cookie when PrescribeRx already revoked the token", async () => {
    const sealed = await sealSession(
      nearSession("1|already-revoked-token", "p@example.com"),
    );
    assert.ok(sealed);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: "Unauthenticated." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;
    try {
      const res = await logoutPost(
        new Request("http://localhost/api/prescriberx/auth/logout", {
          method: "POST",
          headers: { cookie: `${SESSION_COOKIE_NAME}=${sealed}` },
        }),
      );
      assert.equal(res.status, 200);
      const setCookie = res.headers.get("set-cookie") ?? "";
      assert.match(setCookie, /Max-Age=0/i);
      const body = (await res.json()) as { data?: { authenticated?: boolean } };
      assert.equal(body.data?.authenticated, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
