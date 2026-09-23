/**
 * Phase E env guard smoke against a running dev server.
 *
 *   npm run dev
 *   npm run smoke:phase-e
 *
 * SMOKE_BASE defaults to http://localhost:3000
 */
const BASE = (process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);

type HealthData = {
  healthy?: boolean;
  sandbox?: boolean;
  sandboxHostConsistent?: boolean;
  webhookSecretConfigured?: boolean;
  sessionSecretConfigured?: boolean;
  issueToken?: boolean;
  warnings?: string[];
  code?: string;
};

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init);
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { res, json };
}

function data(json: unknown): HealthData | null {
  if (!json || typeof json !== "object") return null;
  const root = json as { data?: HealthData };
  return root.data ?? null;
}

async function main() {
  const health = await fetchJson("/api/prescriberx/health");
  const h = data(health.json);
  if (!health.res.ok || !h) {
    throw new Error(`health failed http=${health.res.status}`);
  }

  const required = [
    ["sandboxHostConsistent", h.sandboxHostConsistent === true],
    ["sessionSecretConfigured", h.sessionSecretConfigured === true],
    ["webhookSecretConfigured", h.webhookSecretConfigured === true],
    ["issueToken", h.issueToken === true],
    ["healthy", h.healthy === true],
    ["sandbox", h.sandbox === true],
  ] as const;

  for (const [name, ok] of required) {
    if (!ok) throw new Error(`health flag ${name} not true`);
  }

  const intake = await fetchJson("/api/prescriberx/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (intake.res.status === 503) {
    const code = data(intake.json as { data?: HealthData })?.code;
    if (code === "sandbox_host_mismatch") {
      throw new Error("intake blocked by sandbox_host_mismatch on good env");
    }
  }

  console.log("smoke-phase-e OK", {
    base: BASE,
    warnings: h.warnings ?? [],
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
