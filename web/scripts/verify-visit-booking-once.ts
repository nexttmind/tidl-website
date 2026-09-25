/**
 * Live TRT visit-booking proof against local TIDL + PrescribeRx sandbox.
 * Usage (dev server up): npx tsx scripts/verify-visit-booking-once.ts
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

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

/** Sandbox visit type available to the playground token (male-trt / female-hrt are not). */
const VISIT_TYPE = "019f11f4-69a6-72d7-8e63-2c1f0fee3c4a";

async function jsonFetch(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; json: Record<string, unknown>; setCookie: string | null }> {
  const res = await fetch(url, init);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
}

function cookiePart(setCookie: string | null): string {
  if (!setCookie) throw new Error("missing session cookie");
  const part = setCookie.split(";")[0]?.trim();
  if (!part) throw new Error("invalid Set-Cookie");
  return part;
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
  const prx = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const orgHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  const health = await jsonFetch(`${smoke}/api/prescriberx/health`);
  const healthData = dataOf(health.json);
  if (healthData.healthy !== true) {
    throw new Error(`health not green (HTTP ${health.status})`);
  }

  const stamp = randomBytes(3).toString("hex");
  const email = `tidl-visit-${stamp}@example.com`;
  const password = `VisitPass-${stamp}!`;

  const productsRes = await fetch(
    `${prx}/telehealth/products?encounter_type_id=${encodeURIComponent(VISIT_TYPE)}`,
    { headers: orgHeaders },
  );
  const productsJson = (await productsRes.json()) as {
    data?: Array<{ product_id?: string }>;
  };
  const productId = productsJson.data?.[0]?.product_id;

  const intakeBody: Record<string, unknown> = {
    prebuilt: true,
    encounter_type_id: VISIT_TYPE,
    is_sandbox: true,
    patient: {
      first_name: "Tidl",
      last_name: `Visit${stamp}`,
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
  };
  if (productId) {
    intakeBody.products = [{ product_id: productId, quantity: 1 }];
  }

  const intake = await jsonFetch(`${smoke}/api/prescriberx/intake`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(intakeBody),
  });
  const intakeData = dataOf(intake.json);
  if (!intake.status.toString().startsWith("2")) {
    throw new Error(
      `intake HTTP ${intake.status}: ${JSON.stringify(intake.json).slice(0, 600)}`,
    );
  }
  const encounterId = String(intakeData.encounter_id ?? "");
  const encounterNumber = String(intakeData.encounter_number ?? "");
  const patientChartId = String(intakeData.patient_chart_id ?? "");
  if (!encounterId) throw new Error("intake missing encounter_id");

  const encounter = await jsonFetch(`${prx}/encounters/${encodeURIComponent(encounterId)}`, {
    headers: orgHeaders,
  });
  const enc = dataOf(encounter.json);
  const salesOrg =
    (enc.sales_organization_id as string | undefined) ??
    ((enc.sales_organization as { id?: string } | undefined)?.id ?? null);

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
    throw new Error(
      `register HTTP ${register.status}: ${JSON.stringify(register.json).slice(0, 500)}`,
    );
  }
  const cookie = cookiePart(register.setCookie);

  const visitBefore = await fetch(
    `${smoke}/care/visit?entry=testosterone&encounter=${encodeURIComponent(encounterId)}`,
    { headers: { Accept: "text/html", Cookie: cookie }, redirect: "manual" },
  );

  const slotsBefore = await jsonFetch(
    `${smoke}/api/prescriberx/scheduling/slots?encounter_id=${encodeURIComponent(encounterId)}&entry=testosterone`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );

  const statusPut = await jsonFetch(
    `${prx}/encounters/${encodeURIComponent(encounterId)}/status`,
    {
      method: "PUT",
      headers: orgHeaders,
      body: JSON.stringify({
        status: "unassigned",
        notes: "TIDL live visit-booking verification (video types cannot jump to prescribed)",
      }),
    },
  );

  const statusAfter = await jsonFetch(
    `${prx}/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
    { headers: orgHeaders },
  );
  const statusToken = String(dataOf(statusAfter.json).status ?? "");

  const visitAfter = await fetch(
    `${smoke}/care/visit?entry=testosterone&encounter=${encodeURIComponent(encounterId)}`,
    { headers: { Accept: "text/html", Cookie: cookie }, redirect: "manual" },
  );
  const visitHtml = await visitAfter.text();

  const slotsAfter = await jsonFetch(
    `${smoke}/api/prescriberx/scheduling/slots?encounter_id=${encodeURIComponent(encounterId)}&entry=testosterone`,
    { headers: { Accept: "application/json", Cookie: cookie } },
  );
  const slotList = (dataOf(slotsAfter.json).slots as Array<{ start?: string }> | undefined) ?? [];
  const firstSlot = slotList[0];

  let book: { status: number; json: Record<string, unknown> } | null = null;
  if (firstSlot?.start) {
    book = await jsonFetch(
      `${smoke}/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/schedule`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          entry: "testosterone",
          scheduled_start: firstSlot.start,
          patient_timezone: "America/New_York",
        }),
      },
    );
  }

  const appointments = await jsonFetch(
    `${prx}/scheduling/appointments?filter[encounter_id]=${encodeURIComponent(encounterId)}&per_page=10`,
    { headers: orgHeaders },
  );
  const apptData = appointments.json.data;
  const apptRows = Array.isArray(apptData)
    ? apptData
    : Array.isArray((apptData as { data?: unknown[] } | undefined)?.data)
      ? ((apptData as { data: unknown[] }).data)
      : [];

  const encounterAfter = await jsonFetch(
    `${prx}/encounters/${encodeURIComponent(encounterId)}`,
    { headers: orgHeaders },
  );
  const encAfter = dataOf(encounterAfter.json);

  console.log(
    JSON.stringify(
      {
        email,
        encounterId,
        encounterNumber,
        patientChartId,
        salesOrgId: salesOrg,
        visitBeforeStatus: visitBefore.status,
        visitBeforeLocation: visitBefore.headers.get("location"),
        slotsBeforeStatus: slotsBefore.status,
        slotsBeforeCode: slotsBefore.json.code ?? null,
        statusPut: { http: statusPut.status, ok: statusPut.json.success === true },
        statusAfter: statusToken,
        visitAfterStatus: visitAfter.status,
        visitPageShowsBooking: visitHtml.includes("Book your video visit"),
        visitPageShowsScheduled: visitHtml.includes("Your visit is scheduled"),
        slotsAfterStatus: slotsAfter.status,
        slotsAfterMessage: slotsAfter.json.message ?? null,
        slotsAfterCode: slotsAfter.json.code ?? null,
        slotCount: slotList.length,
        booked: book
          ? {
              http: book.status,
              ok: book.json.success === true,
              message: book.json.message ?? null,
            }
          : { skipped: true, reason: "no_slots" },
        appointmentsHttp: appointments.status,
        appointmentCount: apptRows.length,
        scheduledAt: encAfter.scheduled_at ?? null,
        encounterStatus: encAfter.status ?? statusToken,
        adminEncounter: `https://demo.prescribe-rx.com/admin/encounter/${encounterId}`,
        adminAppointments: "https://demo.prescribe-rx.com/admin/encounter/appointments",
        tidlVisit: `${smoke}/care/visit?entry=testosterone&encounter=${encounterId}`,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
