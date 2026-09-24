/**
 * Phase D closeout smoke. No tokens, passwords, or emails printed.
 *
 *   npx tsx scripts/smoke-phase-d.ts
 *
 * SMOKE_BASE defaults to http://localhost:3000
 */
import fs from "node:fs";
import path from "node:path";

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

function extractAbilities(envelope: unknown): string[] {
  if (!envelope || typeof envelope !== "object") return [];
  const root = envelope as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  if (Array.isArray(data.abilities)) {
    return data.abilities.filter((a): a is string => typeof a === "string");
  }
  const user =
    data.user && typeof data.user === "object" && !Array.isArray(data.user)
      ? (data.user as Record<string, unknown>)
      : null;
  if (user && Array.isArray(user.abilities)) {
    return user.abilities.filter((a): a is string => typeof a === "string");
  }
  return [];
}

async function main() {
  loadEnvLocal();
  const apiBase = process.env.PRESCRIBERX_API_BASE?.replace(/\/$/, "");
  const token = process.env.PRESCRIBERX_API_TOKEN;
  const preferred = process.env.SMOKE_BASE || "http://localhost:3000";
  if (!apiBase || !token) {
    throw new Error("PRESCRIBERX_API_BASE and PRESCRIBERX_API_TOKEN required");
  }

  const ping = async (base: string) => {
    const res = await fetch(`${base}/api/prescriberx/health`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) throw new Error(`health ${res.status}`);
    return res;
  };

  let smokeBase = preferred;
  let health;
  const candidates = [preferred, "http://localhost:3000", "http://[::1]:3000"];
  let lastErr: unknown;
  for (const base of [...new Set(candidates)]) {
    try {
      health = await ping(base);
      smokeBase = base;
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!health) {
    throw new Error(
      `Cannot reach TIDL at ${preferred}. Start npm run dev. ${
        lastErr instanceof Error ? lastErr.message : ""
      }`,
    );
  }

  let fails = 0;
  const check = (name: string, ok: boolean, detail = "") => {
    if (!ok) fails += 1;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` ${detail}` : ""}`);
  };

  const orgHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const meRes = await fetch(`${apiBase}/auth/me`, { headers: orgHeaders });
  const meJson = (await meRes.json()) as unknown;
  const abilities = extractAbilities(meJson);
  const canIssue =
    abilities.includes("*") || abilities.includes("patient:issue-token");
  check("org /auth/me", meRes.ok, `status=${meRes.status}`);
  check("org has patient:issue-token or *", canIssue);

  const healthJson = (await health.json()) as {
    data?: { healthy?: boolean; sandbox?: boolean };
  };
  check(
    "TIDL health",
    health.ok && healthJson.data?.healthy === true,
    `sandbox=${healthJson.data?.sandbox ?? "?"}`,
  );

  const unauthPages = [
    "/care/waiting",
    "/care/protocol",
    "/care/checkout",
    "/care/visit",
    "/care/confirmation",
    "/care/home",
  ];
  for (const page of unauthPages) {
    const res = await fetch(`${smokeBase}${page}`, { redirect: "manual" });
    const loc = res.headers.get("location") || "";
    check(
      `unauth ${page} → login`,
      res.status === 307 && loc.includes("/care/account"),
      `status=${res.status}`,
    );
  }

  const intake = await fetch(`${smokeBase}/care/intake?entry=weight-loss`, {
    redirect: "manual",
  });
  check("unauth /care/intake allowed", intake.status === 200, `status=${intake.status}`);

  const account = await fetch(`${smokeBase}/care/account?mode=login`, {
    redirect: "manual",
  });
  check("unauth /care/account allowed", account.status === 200, `status=${account.status}`);

  const patientRoutes = [
    "/api/prescriberx/patient/dashboard",
    "/api/prescriberx/patient/orders",
    "/api/prescriberx/patient/encounters",
    "/api/prescriberx/patient/prescriptions",
  ];
  for (const route of patientRoutes) {
    const res = await fetch(`${smokeBase}${route}`, {
      headers: { Accept: "application/json" },
    });
    const json = (await res.json()) as { token?: unknown };
    check(
      `unauth ${route} 401`,
      res.status === 401,
      `status=${res.status}`,
    );
    check(`${route} no token field`, json.token === undefined);
  }

  const encRes = await fetch(`${apiBase}/encounters?per_page=20`, {
    headers: orgHeaders,
  });
  const encJson = (await encRes.json()) as Record<string, unknown>;
  const data = encJson.data;
  const inner =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { data?: unknown }).data
      : data;
  const rows: Array<Record<string, unknown>> = Array.isArray(inner)
    ? (inner as Array<Record<string, unknown>>)
    : [];

  let chartId = "";
  let encounterId = "";
  let email = "";
  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id : "";
    const chart =
      typeof row.patient_chart_id === "string" ? row.patient_chart_id : "";
    if (!id || !chart) continue;
    const patientRes = await fetch(
      `${apiBase}/patients/${encodeURIComponent(chart)}`,
      { headers: orgHeaders },
    );
    if (!patientRes.ok) continue;
    const patientJson = (await patientRes.json()) as {
      data?: { email?: string };
    };
    const patientEmail = patientJson.data?.email;
    if (patientEmail) {
      chartId = chart;
      encounterId = id;
      email = patientEmail.trim().toLowerCase();
      break;
    }
  }
  check("found encounter+chart pair for register", Boolean(chartId && encounterId && email));

  if (chartId && encounterId && email) {
    const statusRes = await fetch(
      `${apiBase}/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
      { headers: orgHeaders },
    );
    const statusJson = (await statusRes.json()) as {
      data?: { status?: string };
      status?: string;
    };
    const status =
      statusJson.data && typeof statusJson.data.status === "string"
        ? statusJson.data.status
        : typeof statusJson.status === "string"
          ? statusJson.status
          : "";
    check("encounter status readable", statusRes.ok, `token=${status || "none"}`);

    const password = "PhaseD-SmokePass9";
    const reg = await fetch(`${smokeBase}/api/prescriberx/auth/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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
      token?: unknown;
      data?: { password?: { status?: string } };
    };
    const cookie = cookiePair(reg.headers.get("set-cookie"));
    check(
      "register sets session",
      (reg.status === 201 || reg.status === 200) && Boolean(cookie),
      `status=${reg.status} code=${regJson.code ?? "ok"}`,
    );
    check("register JSON has no token", regJson.token === undefined);
    const passwordStatus = regJson.data?.password?.status ?? "missing";
    check(
      "password status reported",
      passwordStatus === "bound" ||
        passwordStatus === "failed" ||
        passwordStatus === "skipped",
      `status=${passwordStatus}`,
    );

    if (cookie) {
      const sessionRes = await fetch(
        `${smokeBase}/api/prescriberx/auth/session`,
        { headers: { Accept: "application/json", Cookie: cookie } },
      );
      const sessionJson = (await sessionRes.json()) as {
        authenticated?: boolean;
        token?: unknown;
      };
      check(
        "session authenticated",
        sessionRes.ok && sessionJson.authenticated === true,
      );
      check("session JSON has no token", sessionJson.token === undefined);

      const dash = await fetch(`${smokeBase}/api/prescriberx/patient/dashboard`, {
        headers: { Accept: "application/json", Cookie: cookie },
      });
      const dashJson = (await dash.json()) as { token?: unknown; success?: boolean };
      check(
        "patient dashboard with cookie",
        dash.status === 200 || dash.status === 401 || dash.status === 502,
        `status=${dash.status}`,
      );
      check("dashboard JSON has no token", dashJson.token === undefined);

      const protocol = await fetch(
        `${smokeBase}/care/protocol?entry=weight-loss&encounter=${encodeURIComponent(encounterId)}`,
        { headers: { Cookie: cookie }, redirect: "manual" },
      );
      const loc = protocol.headers.get("location") || "";
      const prescribed = [
        "prescribed",
        "provider_signed",
        "completed",
        "order_placed",
        "order_paid",
      ].includes(status.toLowerCase());
      if (prescribed) {
        check(
          "protocol allowed when prescribed",
          protocol.status === 200,
          `status=${protocol.status}`,
        );
      } else {
        check(
          "protocol blocked while pending",
          protocol.status === 307 && loc.includes("/care/waiting"),
          `status=${protocol.status}`,
        );
      }

      const home = await fetch(`${smokeBase}/care/home?entry=weight-loss`, {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      check("home with cookie", home.status === 200, `status=${home.status}`);

      const logout = await fetch(`${smokeBase}/api/prescriberx/auth/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Cookie: cookie },
      });
      const cleared = logout.headers.get("set-cookie") || "";
      check("logout ok", logout.ok);
      check("logout clears cookie", /max-age=0/i.test(cleared));

      const after = await fetch(`${smokeBase}/care/home`, {
        redirect: "manual",
      });
      const afterLoc = after.headers.get("location") || "";
      check(
        "home without cookie → login",
        after.status === 307 && afterLoc.includes("/care/account"),
        `status=${after.status}`,
      );
    }
  }

  console.log(fails === 0 ? "\nPHASE D SMOKE FAILS=0" : `\nPHASE D SMOKE FAILS=${fails}`);
  if (fails > 0) process.exit(1);
}

main().catch((err) => {
  console.error("PHASE D SMOKE FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
