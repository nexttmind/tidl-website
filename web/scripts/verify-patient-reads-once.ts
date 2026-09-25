/**
 * Live check: after intake + register, hit snapshot + enriched status
 * and report which PrescribeRx GET keys actually returned.
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PATIENT_SNAPSHOT_PATHS } from "../lib/prescriberx/patient-snapshot";

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

function present(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

async function jsonFetch(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; json: Record<string, unknown>; setCookie: string | null }> {
  const res = await fetch(url, init);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
}

function dataOf(json: Record<string, unknown>): Record<string, unknown> {
  const data = json.data;
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : json;
}

async function main() {
  loadEnvLocal();
  const smoke = (process.env.SMOKE_BASE || "http://localhost:3000").replace(/\/$/, "");
  const stamp = randomBytes(3).toString("hex");
  const email = `tidl-reads-${stamp}@example.com`;
  const password = `ReadPass-${stamp}!`;
  const typeId =
    process.env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID ||
    "019ce396-46a1-73ab-87d6-c40310555401";

  const intake = await jsonFetch(`${smoke}/api/prescriberx/intake`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      prebuilt: true,
      encounter_type_id: typeId,
      is_sandbox: true,
      patient: {
        first_name: "Tidl",
        last_name: `Reads${stamp}`,
        email,
        date_of_birth: "1990-06-15",
        phone: "5551234567",
        gender: "male",
        address: {
          street: "123 Main St",
          city: "Miami",
          state: "FL",
          zip: "33101",
          country: "US",
        },
      },
      vitals: { height_inches: 70, weight_lbs: 190 },
    }),
  });
  const intakeData = dataOf(intake.json);
  if (!String(intake.status).startsWith("2")) {
    throw new Error(`intake HTTP ${intake.status}`);
  }
  const encounterId = String(intakeData.encounter_id ?? "");
  const patientChartId = String(intakeData.patient_chart_id ?? "");
  if (!encounterId) throw new Error("intake missing encounter_id");

  const register = await jsonFetch(`${smoke}/api/prescriberx/auth/register`, {
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
  if (register.status !== 201 && register.status !== 200) {
    throw new Error(`register HTTP ${register.status}`);
  }
  const cookie = register.setCookie?.split(";")[0]?.trim();
  if (!cookie) throw new Error("missing session cookie");

  const snap = await jsonFetch(`${smoke}/api/prescriberx/patient/snapshot`, {
    headers: { Accept: "application/json", Cookie: cookie },
  });
  const snapData = dataOf(snap.json);
  const snapshotKeys = [
    ...Object.keys(PATIENT_SNAPSHOT_PATHS),
    "conversationMessages",
  ];
  const snapshotPresent = snapshotKeys.filter((key) => present(snapData[key]));
  const snapshotEmpty = snapshotKeys.filter((key) => !present(snapData[key]));

  const status = await jsonFetch(
    `${smoke}/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/status`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );
  const statusData = dataOf(status.json);
  const statusPresent = [
    "status",
    "encounter_number",
    "scheduled_at",
    "hold_requirements",
    "video_room",
    "messages",
    "labs",
    "lab_requirements",
  ].filter((key) => present(statusData[key]));

  const home = await fetch(`${smoke}/care/home?entry=weight-loss`, {
    headers: { Accept: "text/html", Cookie: cookie },
    redirect: "manual",
  });

  console.log(
    JSON.stringify(
      {
        intake: intake.status,
        register: register.status,
        snapshot: snap.status,
        status: status.status,
        home: home.status,
        encounterId,
        snapshotPresent,
        snapshotEmpty,
        statusPresent,
        statusToken: statusData.status ?? null,
        encounterNumber: statusData.encounter_number ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
