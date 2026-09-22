/**
 * Probe org token abilities + issue-token (no secrets printed).
 * npx tsx scripts/probe-issue-token.ts
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

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };

  const me = await (await fetch(`${base}/auth/me`, { headers: h })).json();
  const data = (me as { data?: Record<string, unknown> }).data ?? me;
  const abilities = (data as { abilities?: string[] }).abilities ?? [];
  console.log("abilities", abilities);
  console.log("has patient:issue-token", abilities.includes("patient:issue-token"));

  const ps = await fetch(`${base}/patients?per_page=1`, { headers: h });
  console.log("patients status", ps.status);
  const pj = (await ps.json()) as { data?: Array<Record<string, unknown>> };
  const first = pj.data?.[0];
  const chartId =
    (first && (first.id as string)) ||
    (first && (first.patient_chart_id as string));
  console.log("chart present", Boolean(chartId));
  if (!chartId) return;

  const ir = await fetch(`${base}/patients/${chartId}/issue-token`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ device_name: "tidl-web-smoke" }),
  });
  const ij = (await ir.json()) as { data?: Record<string, unknown>; message?: string };
  console.log("issue-token status", ir.status);
  console.log("issue-token data keys", ij.data ? Object.keys(ij.data) : null);
  console.log("issue-token message", ij.message ?? null);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
