/**
 * Phase N smoke: waiting status with session + production security headers.
 *
 *   npm run build && npm run start -- -p 3001   (separate terminal)
 *   SMOKE_BASE=http://localhost:3001 npm run smoke:phase-n
 *
 * Waiting poll/backoff is covered by unit tests; this script verifies live
 * status still works and production headers are present.
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

  const status = await fetch(
    `${smokeBase}/api/prescriberx/encounters/${ENCOUNTER}/status`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );
  if (status.status !== 200) {
    throw new Error(`waiting status poll expected 200, got ${status.status}`);
  }

  const home = await fetch(`${smokeBase}/`, { redirect: "manual" });
  const xfo = home.headers.get("x-frame-options");
  const isProd = smokeBase.includes("3001") || process.env.NODE_ENV === "production";
  if (isProd) {
    if (xfo?.toLowerCase() !== "deny") {
      throw new Error(`expected X-Frame-Options DENY on prod, got ${xfo}`);
    }
    const nosniff = home.headers.get("x-content-type-options");
    if (nosniff?.toLowerCase() !== "nosniff") {
      throw new Error(`expected nosniff on prod, got ${nosniff}`);
    }
  }

  const chunk = await fetch(`${smokeBase}/_next/static/chunks/webpack.js`, {
    redirect: "manual",
  }).catch(() => null);
  if (chunk && chunk.status >= 400 && chunk.status !== 404) {
    throw new Error(`_next asset unexpected status ${chunk.status}`);
  }

  console.log("smoke-phase-n OK", { base: smokeBase, xfo: xfo ?? "(dev)" });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
