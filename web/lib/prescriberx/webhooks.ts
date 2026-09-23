import { createHmac, timingSafeEqual } from "crypto";

export type WebhookProjection = {
  encounterId: string;
  status: string;
  updatedAt: string;
  event: string;
};

export type WebhookHandleResult = {
  status: number;
  body: Record<string, unknown>;
};

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const seenWebhookIds = new Map<string, number>();
const encounterStatus = new Map<string, WebhookProjection>();

export function getWebhookSecret(): string | null {
  const secret = process.env.PRESCRIBERX_WEBHOOK_SECRET?.trim();
  return secret ? secret : null;
}

/** Verify X-PrescribeRx-Signature: sha256=<hex> over raw body bytes. */
export function verifyPrescribeRxSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!secret || !signatureHeader) return false;

  const header = signatureHeader.trim();
  const received = (
    /^sha256=/i.test(header) ? header.slice("sha256=".length) : header
  )
    .trim()
    .toLowerCase();
  if (!/^[0-9a-f]+$/.test(received)) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    if (received.length !== expected.length) return false;
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(received, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signPrescribeRxBody(rawBody: string, secret: string): string {
  const hex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return `sha256=${hex}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function projectEncounterFromWebhook(envelope: {
  event: string;
  data: Record<string, unknown> | null;
  timestamp?: string;
}): WebhookProjection | null {
  const event = envelope.event;
  const data = envelope.data;
  const encounterId = str(data?.encounter_id);
  if (!encounterId) return null;

  let status = "";
  if (event === "encounter.status_changed") {
    status = str(data?.new_status);
  } else if (event === "encounter.prescribed") {
    status = "prescribed";
  } else if (event === "encounter.completed") {
    status = "completed";
  } else if (event === "encounter.cancelled") {
    status = "cancelled";
  } else if (event.startsWith("encounter.")) {
    status = str(data?.status);
  } else {
    return null;
  }
  if (!status) return null;

  return {
    encounterId,
    status,
    updatedAt: envelope.timestamp || new Date().toISOString(),
    event,
  };
}

function pruneIdempotency(now: number) {
  for (const [id, seenAt] of seenWebhookIds) {
    if (now - seenAt > IDEMPOTENCY_TTL_MS) seenWebhookIds.delete(id);
  }
}

/** Process-local only. Waiting and protocol-gate must live-fetch PRX. */
export function getProjectedEncounterStatus(
  encounterId: string,
): WebhookProjection | null {
  return encounterStatus.get(encounterId) ?? null;
}

export function resetWebhookStateForTests() {
  seenWebhookIds.clear();
  encounterStatus.clear();
}

/**
 * Fail-closed webhook handler. Missing secret → 503. Bad HMAC → 401.
 * Duplicate webhook_id → 200 without re-project. Waiting still polls live PRX.
 */
export function handlePrescribeRxWebhook(args: {
  rawBody: string;
  signatureHeader: string | null;
  webhookIdHeader: string | null;
  secret: string | null;
}): WebhookHandleResult {
  if (!args.secret) {
    return {
      status: 503,
      body: {
        success: false,
        message: "Webhook is not configured.",
        code: "webhook_not_configured",
      },
    };
  }

  if (
    !verifyPrescribeRxSignature(
      args.rawBody,
      args.signatureHeader,
      args.secret,
    )
  ) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid signature",
        code: "invalid_signature",
      },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(args.rawBody) as unknown;
  } catch {
    return {
      status: 400,
      body: { success: false, message: "Invalid JSON", code: "invalid_json" },
    };
  }

  const rec = asRecord(parsed);
  if (!rec) {
    return {
      status: 400,
      body: { success: false, message: "Invalid JSON", code: "invalid_json" },
    };
  }

  const event = str(rec.event);
  const webhookId =
    str(rec.webhook_id) || str(args.webhookIdHeader) || "";
  const data = asRecord(rec.data);
  const timestamp = str(rec.timestamp);

  const now = Date.now();
  pruneIdempotency(now);
  if (webhookId && seenWebhookIds.has(webhookId)) {
    return {
      status: 200,
      body: { success: true, received: true, duplicate: true },
    };
  }
  if (webhookId) seenWebhookIds.set(webhookId, now);

  const projection = event
    ? projectEncounterFromWebhook({ event, data, timestamp })
    : null;
  if (projection) {
    encounterStatus.set(projection.encounterId, projection);
  }

  console.info("[prescriberx webhook]", {
    event: event || null,
    webhook_id: webhookId || null,
  });

  return {
    status: 200,
    body: { success: true, received: true },
  };
}
