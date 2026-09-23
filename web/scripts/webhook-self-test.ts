/**
 * HMAC POST against the local webhook receiver. No PrescribeRx round-trip.
 *
 *   PRESCRIBERX_WEBHOOK_SECRET=dev-secret npx tsx scripts/webhook-self-test.ts
 *
 * SMOKE_BASE defaults to http://localhost:3000
 */
const SECRET = process.env.PRESCRIBERX_WEBHOOK_SECRET;
const BASE = (process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function hmac(raw: string, secret: string) {
  const { createHmac } = await import("node:crypto");
  return `sha256=${createHmac("sha256", secret).update(raw, "utf8").digest("hex")}`;
}

async function main() {
  if (!SECRET) {
    throw new Error("PRESCRIBERX_WEBHOOK_SECRET is required for the self-test");
  }

  const webhookId = crypto.randomUUID();
  const raw = JSON.stringify({
    event: "encounter.prescribed",
    timestamp: new Date().toISOString(),
    webhook_id: webhookId,
    data: {
      encounter_id: crypto.randomUUID(),
      encounter_number: "ENC-SELFTEST",
      prescribed_at: new Date().toISOString(),
    },
  });
  const signature = await hmac(raw, SECRET);

  const missing = await fetch(`${BASE}/api/webhooks/prescriberx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw,
  });
  if (missing.status !== 401 && missing.status !== 503) {
    throw new Error(`unsigned expected 401 or 503, got ${missing.status}`);
  }

  const signed = await fetch(`${BASE}/api/webhooks/prescriberx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PrescribeRx-Signature": signature,
      "X-Webhook-ID": webhookId,
    },
    body: raw,
  });
  if (!signed.ok) {
    throw new Error(`signed POST failed ${signed.status}`);
  }
  const json = (await signed.json()) as { success?: boolean; duplicate?: boolean };
  if (json.success !== true) {
    throw new Error("signed POST did not return success");
  }

  const replay = await fetch(`${BASE}/api/webhooks/prescriberx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PrescribeRx-Signature": signature,
      "X-Webhook-ID": webhookId,
    },
    body: raw,
  });
  if (!replay.ok) {
    throw new Error(`replay POST failed ${replay.status}`);
  }
  const replayJson = (await replay.json()) as { duplicate?: boolean };
  if (replayJson.duplicate !== true) {
    throw new Error("replay POST did not report duplicate");
  }

  console.log("webhook-self-test OK");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
