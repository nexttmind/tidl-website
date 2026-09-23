/**
 * Phase F login mapping smoke against a running dev server.
 *
 *   npm run dev
 *   npm run smoke:phase-f
 *
 * Does not create a patient. Unknown-email login must be 401, never 404.
 */
const BASE = (process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function main() {
  const res = await fetch(`${BASE}/api/prescriberx/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `tidl.phasef.unknown.${Date.now()}@example.com`,
      password: "not-a-real-password-123",
    }),
  });
  let json: { success?: boolean; message?: string; code?: string } = {};
  try {
    json = (await res.json()) as typeof json;
  } catch {
    /* ignore */
  }

  if (res.status === 404) {
    throw new Error("login surfaced 404; expected mapped 401");
  }
  if (res.status !== 401) {
    throw new Error(`login expected 401, got ${res.status}`);
  }
  if (json.code && json.code !== "unauthorized") {
    throw new Error(`login code ${json.code}`);
  }
  if (
    json.message &&
    json.message.toLowerCase().includes("not found")
  ) {
    throw new Error("login message leaked not-found copy");
  }

  console.log("smoke-phase-f OK", {
    status: res.status,
    code: json.code ?? null,
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
