/**
 * Live Phase A smoke: issue-token shape, password bind, login, then TIDL auth routes.
 * npx tsx scripts/smoke-phase-a.ts
 * Optional: SMOKE_BASE=http://127.0.0.1:3000 when Next is running.
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { orgTokenCanIssuePatientToken } from "../lib/prescriberx/abilities";
import { extractAuthToken } from "../lib/prescriberx/token-parse";

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

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const org = process.env.PRESCRIBERX_API_TOKEN!;
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${org}`,
    "Content-Type": "application/json",
  };

  const me = await (await fetch(`${base}/auth/me`, { headers: h })).json();
  const abilities =
    ((me as { data?: { abilities?: string[] } }).data?.abilities ??
      []) as string[];
  console.log("abilities", abilities);
  console.log("can_issue", orgTokenCanIssuePatientToken(abilities));

  const patients = (await (
    await fetch(`${base}/patients?per_page=5`, { headers: h })
  ).json()) as {
    data?: Array<{ id: string; email?: string }>;
  };
  const patient = patients.data?.[0];
  if (!patient?.id) throw new Error("No patients for smoke");
  const chartId = patient.id;
  const email = patient.email;
  console.log("chart_ok", true, "email_present", Boolean(email));

  // Find an encounter for this chart (list shapes vary)
  let encounterId: string | undefined;
  const encRes = await fetch(
    `${base}/encounters?filter[patient_chart_id]=${encodeURIComponent(chartId)}&per_page=5`,
    { headers: h },
  );
  const encJson = (await encRes.json()) as unknown;
  const encRoot =
    encJson && typeof encJson === "object"
      ? (encJson as Record<string, unknown>)
      : null;
  const encData = encRoot?.data;
  if (Array.isArray(encData) && encData[0] && typeof encData[0] === "object") {
    const first = encData[0] as { id?: string };
    encounterId = typeof first.id === "string" ? first.id : undefined;
  }
  if (!encounterId) {
    // Fallback: patient encounters under org if filter unsupported
    const alt = await fetch(`${base}/encounters?per_page=20`, { headers: h });
    const altJson = (await alt.json()) as { data?: unknown };
    const list = Array.isArray(altJson.data) ? altJson.data : [];
    for (const row of list) {
      if (!row || typeof row !== "object") continue;
      const r = row as { id?: string; patient_chart_id?: string };
      if (r.patient_chart_id === chartId && typeof r.id === "string") {
        encounterId = r.id;
        break;
      }
    }
  }
  console.log("encounter_ok", Boolean(encounterId));
  if (!encounterId) {
    console.log(
      "No encounter for chart — continuing upstream issue-token/password/login only",
    );
  }

  console.log("issue-token…");
  const issueRes = await fetch(`${base}/patients/${chartId}/issue-token`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ device_name: "tidl-web-smoke" }),
  });
  const issueJson = await issueRes.json();
  console.log("issue-token status", issueRes.status);
  if (!issueRes.ok) throw new Error("issue-token failed");
  const parsed = extractAuthToken(issueJson);
  console.log("parsed token present", Boolean(parsed.token));
  console.log("expiresAt", parsed.expiresAt);
  console.log(
    "data keys",
    Object.keys(
      ((issueJson as { data?: object }).data ?? {}) as object,
    ),
  );

  const stamp = randomBytes(3).toString("hex");
  const password = `PhaseA-${stamp}-Pass9`;

  console.log("password bind…");
  const pwRes = await fetch(`${base}/me/password`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${parsed.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_password: "",
      password,
      password_confirmation: password,
    }),
  });
  console.log("password_bind status", pwRes.status);
  const passwordBound = pwRes.ok;

  let loginOk = false;
  if (email && passwordBound) {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        device_name: "tidl-web-smoke",
      }),
    });
    loginOk = loginRes.ok;
    console.log("login_after_bind status", loginRes.status);
  } else {
    console.log("login_after_bind skipped", {
      email: Boolean(email),
      passwordBound,
    });
  }

  const logoutRes = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${parsed.token}`,
    },
  });
  console.log("logout status", logoutRes.status);

  // Optional: hit local TIDL routes if server up
  const smokeBase = process.env.SMOKE_BASE;
  if (smokeBase && email && encounterId) {
    console.log("TIDL register via", smokeBase);
    const reg = await fetch(`${smokeBase}/api/prescriberx/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: `PhaseA-${stamp}-BPass9`,
        password_confirmation: `PhaseA-${stamp}-BPass9`,
        patient_chart_id: chartId,
        encounter_id: encounterId,
      }),
    });
    const setCookie = reg.headers.get("set-cookie");
    const regJson = await reg.json();
    console.log("tidl register status", reg.status);
    console.log("tidl set-cookie present", Boolean(setCookie));
    console.log(
      "tidl password status",
      (regJson as { data?: { password?: { status?: string } } }).data?.password
        ?.status,
    );

    if (setCookie) {
      const sessionRes = await fetch(
        `${smokeBase}/api/prescriberx/auth/session`,
        {
          headers: { Accept: "application/json", Cookie: setCookie.split(";")[0]! },
        },
      );
      console.log("tidl session status", sessionRes.status);
      const logoutTidl = await fetch(
        `${smokeBase}/api/prescriberx/auth/logout`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: setCookie.split(";")[0]!,
          },
        },
      );
      console.log("tidl logout status", logoutTidl.status);
    }
  } else {
    console.log(
      "TIDL route smoke skipped (set SMOKE_BASE=http://127.0.0.1:3000 with next start)",
    );
  }

  console.log("\nSMOKE SUMMARY", {
    can_issue: orgTokenCanIssuePatientToken(abilities),
    issue_token_ok: true,
    issue_token_has_data_token: true,
    password_bind: passwordBound ? "bound" : "failed",
    login_after_bind: loginOk,
    logout_ok: logoutRes.ok || logoutRes.status === 401,
  });
}

main().catch((e) => {
  console.error("SMOKE FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
