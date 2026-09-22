import fs from "node:fs";
import path from "node:path";

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
  const id = "019ce396-46a1-73ab-87d6-c40310555401";
  const r = await fetch(`${base}/telehealth/encounter-types/${id}/schema`, {
    headers: h,
  });
  const j = (await r.json()) as {
    data?: {
      steps?: Array<{
        title?: string;
        fields?: Array<{
          slug?: string;
          label?: string;
          field_type?: number;
          maps_to?: string;
          is_required?: boolean;
        }>;
      }>;
    };
  };
  const hits: unknown[] = [];
  for (const step of j.data?.steps ?? []) {
    for (const f of step.fields ?? []) {
      if (
        String(f.slug).includes("address") ||
        String(f.maps_to).includes("address") ||
        f.field_type === 44
      ) {
        hits.push({ step: step.title, ...f });
      }
    }
  }
  console.log(JSON.stringify(hits, null, 2));
}

main();
