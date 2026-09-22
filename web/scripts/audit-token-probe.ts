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
  const token = process.env.PRESCRIBERX_API_TOKEN!;
  const h = { Accept: "application/json", Authorization: `Bearer ${token}` };

  for (const path of ["/auth/me", "/patients?per_page=1", "/encounters?per_page=1"]) {
    const r = await fetch(`${base}${path}`, { headers: h });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch {
      body = await r.text();
    }
    const brief =
      body && typeof body === "object"
        ? JSON.stringify(body).slice(0, 200)
        : String(body).slice(0, 200);
    console.log(path, r.status, brief);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
