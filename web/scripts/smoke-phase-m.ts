/**
 * Phase M rate-limit + status session smoke against a running dev server.
 *
 *   npm run dev
 *   npm run smoke:phase-m
 */
const smokeBase = (process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);

const ENCOUNTER = "01a0cd2f-3230-7227-9dba-5cf64cc5c28d";
const EMAIL = "tidl.phasej.home@example.com";

function extractCookie(setCookie: string | null): string {
  if (!setCookie) throw new Error("register did not set session cookie");
  const part = setCookie.split(";")[0]?.trim();
  if (!part) throw new Error("invalid Set-Cookie");
  return part;
}

async function main() {
  const noCookie = await fetch(
    `${smokeBase}/api/prescriberx/encounters/${ENCOUNTER}/status`,
    { headers: { Accept: "application/json" } },
  );
  if (noCookie.status !== 401) {
    throw new Error(`status without cookie expected 401, got ${noCookie.status}`);
  }
  const noCookieJson = (await noCookie.json()) as { code?: string };
  if (noCookieJson.code !== "unauthenticated") {
    throw new Error(`status 401 code ${noCookieJson.code}`);
  }

  const reg = await fetch(`${smokeBase}/api/prescriberx/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: EMAIL,
      password: "SandboxPass123!",
      password_confirmation: "SandboxPass123!",
      encounter_id: ENCOUNTER,
    }),
  });
  if (reg.status !== 201) {
    throw new Error(`register status ${reg.status}`);
  }
  const cookie = extractCookie(reg.headers.get("set-cookie"));

  const authed = await fetch(
    `${smokeBase}/api/prescriberx/encounters/${ENCOUNTER}/status`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );
  if (authed.status !== 200) {
    throw new Error(`status with session expected 200, got ${authed.status}`);
  }

  let saw429 = false;
  for (let i = 0; i < 25; i++) {
    const res = await fetch(`${smokeBase}/api/prescriberx/intake`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-real-ip": "smoke-intake-limit",
      },
      body: JSON.stringify({}),
    });
    if (res.status === 429) {
      saw429 = true;
      const retry = res.headers.get("retry-after");
      if (!retry || Number(retry) < 1) {
        throw new Error("intake 429 missing Retry-After");
      }
      break;
    }
  }
  if (!saw429) {
    throw new Error("intake burst did not return 429");
  }

  let status429 = false;
  for (let i = 0; i < 25; i++) {
    const res = await fetch(
      `${smokeBase}/api/prescriberx/encounters/${ENCOUNTER}/status`,
      {
        headers: {
          Accept: "application/json",
          Cookie: cookie,
          "x-real-ip": "smoke-status-limit",
        },
      },
    );
    if (res.status === 429) {
      status429 = true;
      const retry = res.headers.get("retry-after");
      if (!retry || Number(retry) < 1) {
        throw new Error("status 429 missing Retry-After");
      }
      break;
    }
  }
  if (!status429) {
    throw new Error("status burst did not return 429");
  }

  console.log("smoke-phase-m OK", { base: smokeBase });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
