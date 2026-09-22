/**
 * Status-only probe: encounter detail vs patient chart. No PHI printed.
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
  const list = (await (await fetch(`${base}/encounters?per_page=1`, { headers: h })).json()) as {
    data?: { data?: Array<{ id?: string; patient_chart_id?: string }> };
  };
  const row = list.data?.data?.[0];
  const id = row?.id;
  const chart = row?.patient_chart_id;
  console.log("has_ids", Boolean(id && chart));
  if (!id || !chart) return;

  for (const pathName of [
    `/encounters/${id}`,
    `/encounters/${id}?include=patient`,
    `/patients/${chart}`,
    `/patients/lookup?email=nobody-phasea@example.com`,
  ]) {
    const res = await fetch(`${base}${pathName}`, { headers: h });
    console.log(res.status, pathName.split("?")[0]?.replace(id, ":id").replace(chart, ":chart"));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
