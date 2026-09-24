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
  if (!base || !token) process.exit(1);

  const fakeOrder = "00000000-0000-4000-8000-000000000001";
  const paths = [
    ["POST", `/orders/${fakeOrder}/pay`],
    ["POST", `/orders/${fakeOrder}/charge`],
    ["POST", `/orders/${fakeOrder}/capture`],
    ["POST", `/orders/${fakeOrder}/checkout`],
    ["POST", `/telehealth/encounters/${fakeOrder}/pay`],
    ["POST", `/telehealth/encounters/${fakeOrder}/checkout`],
    ["POST", `/transactions`],
  ] as const;

  for (const [method, p] of paths) {
    const res = await fetch(`${base}${p}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 1 }),
    });
    const text = await res.text();
    const msg = text.includes("could not be found") ? "404 route" : text.slice(0, 120);
    console.log(`${method} ${p} → ${res.status} ${msg}`);
  }
}

void main();
