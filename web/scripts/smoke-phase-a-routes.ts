/**
 * Find a chart that already has an encounter, then exercise TIDL auth routes.
 * npx tsx scripts/smoke-phase-a-routes.ts
 * SMOKE_BASE defaults to http://127.0.0.1:3010
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = v;
  }
}

function cookiePair(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const first = setCookie.split(",")[0] ?? setCookie;
  return first.split(";")[0]?.trim() || null;
}

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const smokeBase = process.env.SMOKE_BASE || "http://127.0.0.1:3010";
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };

  const encRes = await fetch(`${base}/encounters?per_page=20`, { headers: h });
  const encJson = (await encRes.json()) as Record<string, unknown>;
  const data = encJson.data;
  console.log("encounters status", encRes.status, "data type", Array.isArray(data) ? "array" : typeof data);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    console.log("data keys", Object.keys(data as object));
  }

  const inner =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { data?: unknown }).data
      : data;
  const rows: Array<Record<string, unknown>> = Array.isArray(inner)
    ? (inner as Array<Record<string, unknown>>)
    : [];
  console.log("encounter rows", rows.length);
  if (rows[0]) console.log("row keys", Object.keys(rows[0]));

  let chartId = "";
  let encounterId = "";
  let email = "";

  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id : "";
    const chart =
      typeof row.patient_chart_id === "string" ? row.patient_chart_id : "";
    if (!id || !chart) continue;
    const patientRes = await fetch(
      `${base}/patients/${encodeURIComponent(chart)}`,
      { headers: h },
    );
    if (!patientRes.ok) continue;
    const patientJson = (await patientRes.json()) as {
      data?: { email?: string; id?: string };
    };
    const patientEmail = patientJson.data?.email;
    if (patientEmail && chart) {
      chartId = chart;
      encounterId = id;
      email = patientEmail.trim().toLowerCase();
      break;
    }
  }

  console.log("pair_found", Boolean(chartId && encounterId && email));
  if (!chartId || !encounterId || !email) {
    throw new Error("No encounter+email pair for TIDL register smoke");
  }

  const stamp = randomBytes(3).toString("hex");
  const password = `PhaseA-${stamp}-BPass9`;

  console.log("POST register…");
  const reg = await fetch(`${smokeBase}/api/prescriberx/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: password,
      patient_chart_id: chartId,
      encounter_id: encounterId,
    }),
  });
  const regJson = (await reg.json()) as {
    success?: boolean;
    code?: string;
    data?: { password?: { status?: string; reason?: string }; authenticated?: boolean };
  };
  const setCookie = reg.headers.get("set-cookie");
  const cookie = cookiePair(setCookie);
  console.log("register status", reg.status, "code", regJson.code ?? null);
  console.log("password status", regJson.data?.password?.status ?? null);
  console.log("set-cookie present", Boolean(cookie));
  console.log(
    "cookie has httponly",
    Boolean(setCookie && /httponly/i.test(setCookie)),
  );
  console.log(
    "body contains token field",
    JSON.stringify(regJson).includes('"token"'),
  );

  if (!cookie) {
    console.log("register did not set cookie — stop route chain");
    return;
  }

  console.log("GET session…");
  const sessionRes = await fetch(`${smokeBase}/api/prescriberx/auth/session`, {
    headers: { Accept: "application/json", Cookie: cookie },
  });
  const sessionJson = (await sessionRes.json()) as {
    authenticated?: boolean;
    token?: string;
  };
  console.log("session status", sessionRes.status);
  console.log("session authenticated", sessionJson.authenticated ?? null);
  console.log("session leaks token", Boolean(sessionJson.token));

  console.log("POST refresh…");
  const refreshRes = await fetch(`${smokeBase}/api/prescriberx/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", Cookie: cookie },
  });
  const refreshCookie = cookiePair(refreshRes.headers.get("set-cookie"));
  const refreshJson = (await refreshRes.json()) as { token?: string };
  console.log("refresh status", refreshRes.status);
  console.log("refresh set-cookie", Boolean(refreshCookie));
  console.log("refresh leaks token", Boolean(refreshJson.token));

  console.log("POST logout…");
  const logoutRes = await fetch(`${smokeBase}/api/prescriberx/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: refreshCookie || cookie,
    },
  });
  console.log("logout status", logoutRes.status);
  const cleared = logoutRes.headers.get("set-cookie") || "";
  console.log("logout clears cookie", /max-age=0/i.test(cleared));

  console.log("GET session after logout…");
  const after = await fetch(`${smokeBase}/api/prescriberx/auth/session`, {
    headers: { Accept: "application/json", Cookie: cookie },
  });
  console.log("session after logout status", after.status);

  console.log("POST login (expect fail if password not bound)…");
  const loginRes = await fetch(`${smokeBase}/api/prescriberx/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = (await loginRes.json()) as { code?: string; success?: boolean };
  console.log("login status", loginRes.status, "code", loginJson.code ?? null);

  console.log("POST forgot…");
  const forgot = await fetch(`${smokeBase}/api/prescriberx/auth/forgot`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  console.log("forgot status", forgot.status);

  console.log("GET /care/home without cookie…");
  const home = await fetch(`${smokeBase}/care/home`, { redirect: "manual" });
  console.log("home status", home.status, "location", home.headers.get("location"));

  console.log("\nROUTE SMOKE DONE");
}

main().catch((e) => {
  console.error("ROUTE SMOKE FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
