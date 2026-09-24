import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of [".env.local", ".env"]) {
    try {
      const text = readFileSync(resolve(process.cwd(), name), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i < 1) continue;
        const key = t.slice(0, i);
        let val = t.slice(i + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!out[key]) out[key] = val;
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const base = env.PRESCRIBERX_API_BASE?.replace(/\/$/, "");
  const token = env.PRESCRIBERX_API_TOKEN;
  if (!base || !token) {
    console.error("Missing PRESCRIBERX_API_BASE or PRESCRIBERX_API_TOKEN");
    process.exit(1);
  }

  const paths = [
    "/payment-gateway/config",
    "/gateway/config",
    "/payments/config",
    "/merchant-accounts/tokenization",
    "/checkout/config",
    "/telehealth/checkout/config",
  ];

  for (const p of paths) {
    const res = await fetch(`${base}${p}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const text = await res.text();
    console.log(`${p} → ${res.status}`);
    console.log(text.slice(0, 400));
    console.log("---");
  }
}

void main();
