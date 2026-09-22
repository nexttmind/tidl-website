import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  for (const line of fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)) {
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
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };
  const encRes = await fetch(`${base}/encounters?per_page=20`, { headers: h });
  const encJson = (await encRes.json()) as {
    data?: { data?: Array<Record<string, unknown>> };
  };
  const rows = encJson.data?.data ?? [];
  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id : "";
    const chart =
      typeof row.patient_chart_id === "string" ? row.patient_chart_id : "";
    if (!id || !chart) continue;
    const pr = await fetch(`${base}/patients/${encodeURIComponent(chart)}`, {
      headers: h,
    });
    if (!pr.ok) continue;
    const pj = (await pr.json()) as { data?: { email?: string } };
    const email = pj.data?.email?.trim().toLowerCase();
    if (!email) continue;
    const stamp = randomBytes(3).toString("hex");
    console.log(
      JSON.stringify({
        email,
        password: `AuditPass-${stamp}9`,
        encounterId: id,
        patientChartId: chart,
        entrySlug: "weight-loss",
      }),
    );
    return;
  }
  throw new Error("no pair");
}

main();
