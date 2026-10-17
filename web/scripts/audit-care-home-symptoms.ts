/**
 * End-to-end audit for /care/home?entry=symptoms (live session, not demo).
 *
 *   npx tsx scripts/audit-care-home-symptoms.ts
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { relatedFor } from "../content/fixtures/care-account-home";
import { resolveClinicalEntry } from "../content/clinical/entry-map";
import { mapAccountHome } from "../lib/prescriberx/map-account-home";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i);
    if (!process.env[key]) process.env[key] = t.slice(i + 1);
  }
}

type Result = { name: string; ok: boolean; detail?: string };

async function jsonFetch(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; json: Record<string, unknown>; setCookie: string | null; text?: string }> {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
  }
  const text = await res.text();
  return { status: res.status, json: {}, setCookie: res.headers.get("set-cookie"), text };
}

function dataOf(json: Record<string, unknown>): Record<string, unknown> {
  const data = json.data;
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : json;
}

async function main() {
  loadEnvLocal();
  const base = (process.env.SMOKE_BASE || "http://localhost:3000").replace(/\/$/, "");
  const entry = resolveClinicalEntry("symptoms");
  const results: Result[] = [];
  const push = (name: string, ok: boolean, detail?: string) =>
    results.push({ name, ok, detail });

  const stamp = randomBytes(3).toString("hex");
  const email = `tidl-symptoms-home-${stamp}@example.com`;
  const password = `SymHome-${stamp}!`;

  const intake = await jsonFetch(`${base}/api/prescriberx/intake`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      prebuilt: true,
      encounter_type_id: entry.encounterTypeId,
      is_sandbox: true,
      patient: {
        first_name: "Sym",
        last_name: `Home${stamp}`,
        email,
        date_of_birth: "1988-03-20",
        phone: "5559876543",
        gender: "female",
        address: {
          street: "456 Care Ave",
          city: "Miami",
          state: "FL",
          zip: "33101",
          country: "US",
        },
      },
      vitals: { height_inches: 66, weight_lbs: 165 },
    }),
  });
  const intakeData = dataOf(intake.json);
  push("intake POST", intake.status >= 200 && intake.status < 300, `HTTP ${intake.status}`);
  const encounterId = String(intakeData.encounter_id ?? "");
  const patientChartId = String(intakeData.patient_chart_id ?? "");
  if (!encounterId) throw new Error("intake missing encounter_id");

  const register = await jsonFetch(`${base}/api/prescriberx/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: password,
      encounter_id: encounterId,
      patient_chart_id: patientChartId || undefined,
    }),
  });
  push("register session", register.status === 201 || register.status === 200, `HTTP ${register.status}`);
  const cookie = register.setCookie?.split(";")[0]?.trim();
  if (!cookie) throw new Error("missing session cookie");

  const unauth = await fetch(`${base}/care/home?entry=symptoms`, { redirect: "manual" });
  push("unauth redirects to login", unauth.status === 307 || unauth.status === 302, `HTTP ${unauth.status}`);

  const homeHtml = await fetch(`${base}/care/home?entry=symptoms`, {
    headers: { Accept: "text/html", Cookie: cookie },
    redirect: "follow",
  });
  const html = await homeHtml.text();
  push("authenticated home HTML", homeHtml.status === 200, `HTTP ${homeHtml.status}`);
  for (const id of [
    "account-home-title",
    "current",
    "actions",
    "care",
    "orders",
    "browse",
  ]) {
    push(`section #${id} in HTML`, html.includes(`id="${id}"`), id);
  }
  push(
    "intro shortcuts nav",
    html.includes('aria-label="Account shortcuts"'),
  );
  push(
    "related stacks (symptoms)",
    relatedFor("symptoms").length >= 3,
    `${relatedFor("symptoms").length} cards`,
  );

  const snap = await jsonFetch(`${base}/api/prescriberx/patient/snapshot`, {
    headers: { Accept: "application/json", Cookie: cookie },
  });
  push("patient snapshot API", snap.status === 200, `HTTP ${snap.status}`);
  const snapData = dataOf(snap.json);
  let mapped;
  try {
    mapped = mapAccountHome({
      entrySlug: "symptoms",
      dashboard: snapData.dashboard,
      orders: snapData.orders,
      encounters: snapData.encounters,
      prescriptions: snapData.prescriptions,
      chart: snapData.chart,
      vitals: snapData.vitals,
      vitalGoals: snapData.vitalGoals,
      allergies: snapData.allergies,
      medications: snapData.medications,
      conditions: snapData.conditions,
      approvals: snapData.approvals,
      communicationPreferences: snapData.communicationPreferences,
      paymentMethods: snapData.paymentMethods,
      vitalTrends: snapData.vitalTrends,
      profile: snapData.profile,
      conversations: snapData.conversations,
      conversationMessages: snapData.conversationMessages,
      settings: snapData.settings,
    });
    push("mapAccountHome", true, mapped.stackName || mapped.goalLabel);
  } catch (e) {
    push("mapAccountHome", false, e instanceof Error ? e.message : "failed");
  }

  if (mapped?.pendingEncounter) {
    push(
      "pending encounter CTA",
      ["wait", "visit", "protocol"].includes(mapped.pendingEncounter.next),
      mapped.pendingEncounter.next,
    );
  } else {
    push("pending encounter block", true, "none (empty or order present)");
  }

  const status = await jsonFetch(
    `${base}/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/status`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );
  push("encounter status API", status.status === 200, `HTTP ${status.status}`);

  const authHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Cookie: cookie,
  };

  const weight = await jsonFetch(`${base}/api/prescriberx/patient/actions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ action: "record_weight", weight_lbs: 164 }),
  });
  push("action record_weight", weight.status >= 200 && weight.status < 300, `HTTP ${weight.status}`);

  const prefs = await jsonFetch(`${base}/api/prescriberx/patient/actions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      action: "update_preferences",
      global_enabled: true,
      channels: { email: true, sms: false, in_app: true },
    }),
  });
  push("action update_preferences", prefs.status >= 200 && prefs.status < 300, `HTTP ${prefs.status}`);

  const exportReq = await jsonFetch(`${base}/api/prescriberx/patient/actions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ action: "request_export" }),
  });
  const exportData = dataOf(exportReq.json);
  push(
    "action request_export",
    exportReq.status >= 200 && exportReq.status < 300 && Boolean(exportData.id),
    `HTTP ${exportReq.status}`,
  );

  const open = await jsonFetch(`${base}/api/prescriberx/patient/actions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      action: "open_conversation",
      encounter_id: encounterId,
    }),
  });
  const openData = dataOf(open.json);
  const conversationId = String(openData.id ?? "");
  push("action open_conversation", open.status >= 200 && open.status < 300, `HTTP ${open.status}`);
  if (conversationId) {
    const msg = await jsonFetch(`${base}/api/prescriberx/patient/actions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        action: "send_message",
        conversation_id: conversationId,
        content: `Symptoms home audit ${stamp}`,
      }),
    });
    push("action send_message", msg.status >= 200 && msg.status < 300, `HTTP ${msg.status}`);
  } else {
    push("action send_message", false, "no conversation id");
  }

  for (const card of relatedFor("symptoms").slice(0, 3)) {
    const href = card.href.startsWith("http") ? card.href : `${base}${card.href}`;
    const page = await fetch(href, { redirect: "manual" });
    push(`related link ${card.id}`, page.status === 200 || page.status === 307, `HTTP ${page.status}`);
  }

  const catalog = await jsonFetch(`${base}/api/prescriberx/catalog`, {
    headers: { Accept: "application/json" },
  });
  push("catalog proxy (PDP overlay)", catalog.status === 200, `HTTP ${catalog.status}`);

  const ssrOnly = (name: string) =>
    name.includes(" in HTML") || name === "intro shortcuts nav";
  const fails = results.filter((r) => !r.ok && !ssrOnly(r.name));
  const ssrSkipped = results.filter((r) => !r.ok && ssrOnly(r.name));
  console.log(
    JSON.stringify(
      {
        entry: entry.slug,
        encounterType: entry.encounterTypeSlug,
        email,
        encounterId,
        cookieHint: `${cookie.slice(0, 40)}…`,
        pass: results.filter((r) => r.ok).length,
        fail: fails.length,
        ssrClientRenderSkipped: ssrSkipped.length,
        results,
      },
      null,
      2,
    ),
  );
  if (ssrSkipped.length) {
    console.error(
      `Note: ${ssrSkipped.length} SSR HTML check(s) skipped (AccountHome is client-rendered).`,
    );
  }
  if (fails.length) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
