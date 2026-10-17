/**
 * Sandbox backend sign-off runner (see docs/sandbox-backend-signoff.md).
 *
 *   npx tsx scripts/signoff-suite.ts              # static + local live (localhost)
 *   npx tsx scripts/signoff-suite.ts --staging    # static + staging HTTPS smokes
 *   npx tsx scripts/signoff-suite.ts --static-only
 */
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const staticOnly = args.has("--static-only");
const staging = args.has("--staging");
const smokeBase = staging
  ? (process.env.SMOKE_BASE || "https://staging.tidlll.com").replace(/\/$/, "")
  : "http://localhost:3000";

function run(label: string, cmd: string, extraEnv?: Record<string, string>) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(cmd, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    cwd: process.cwd(),
  });
  if (res.status !== 0) {
    console.error(`\nFAILED: ${label}`);
    process.exit(res.status ?? 1);
  }
}

run("typecheck", "npm run typecheck");
run("test", "npm run test");

if (staticOnly) {
  console.log("\nsignoff-suite OK (static only)");
  process.exit(0);
}

const baseEnv = { SMOKE_BASE: smokeBase };

run(`smoke:phase-e (${smokeBase})`, "npm run smoke:phase-e", baseEnv);
run(`smoke:phase-f (${smokeBase})`, "npm run smoke:phase-f", baseEnv);
run(`smoke:phase-l (${smokeBase})`, "npm run smoke:phase-l", baseEnv);
run(`smoke:phase-m (${smokeBase})`, "npm run smoke:phase-m", baseEnv);
run(`smoke:phase-n (${smokeBase})`, "npm run smoke:phase-n", baseEnv);

if (!staging) {
  run("smoke:phase-d (local org token + register)", "npm run smoke:phase-d", baseEnv);
  run("smoke:webhook (local secret)", "npm run smoke:webhook", baseEnv);
} else {
  console.log(
    "\n=== staging skip ===\nphase-d and webhook skipped on --staging (need local dev server / staging webhook secret in env). Run phase-d locally; run smoke:webhook with vault PRESCRIBERX_WEBHOOK_SECRET + SMOKE_BASE=staging URL.",
  );
}

console.log(`\nsignoff-suite OK (${staging ? "staging smokes" : "local"})`);

export {};
