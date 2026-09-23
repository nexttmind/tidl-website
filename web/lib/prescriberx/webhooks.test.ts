import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  getProjectedEncounterStatus,
  handlePrescribeRxWebhook,
  projectEncounterFromWebhook,
  resetWebhookStateForTests,
  signPrescribeRxBody,
  verifyPrescribeRxSignature,
} from "./webhooks";

const SECRET = "webhook-test-secret";
const ENCOUNTER = "019dd4d8-1a2b-7300-89ab-000111222333";

function bodyFor(event: string, extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    event,
    timestamp: "2026-04-30T20:34:12+00:00",
    webhook_id: extra.webhook_id ?? "019ddf8a-7c3d-7234-ab01-c9d8e7f6a5b4",
    data: {
      encounter_id: ENCOUNTER,
      encounter_number: "ENC-7658107290",
      ...(extra.data ?? {}),
    },
  });
}

describe("verifyPrescribeRxSignature", () => {
  it("accepts a matching HMAC", () => {
    const raw = bodyFor("encounter.prescribed");
    const header = signPrescribeRxBody(raw, SECRET);
    assert.equal(verifyPrescribeRxSignature(raw, header, SECRET), true);
  });

  it("rejects a bad HMAC", () => {
    const raw = bodyFor("encounter.prescribed");
    assert.equal(
      verifyPrescribeRxSignature(raw, "sha256=deadbeef", SECRET),
      false,
    );
  });

  it("accepts uppercase hex after the sha256= prefix", () => {
    const raw = bodyFor("encounter.prescribed");
    const header = signPrescribeRxBody(raw, SECRET).toUpperCase();
    assert.equal(verifyPrescribeRxSignature(raw, header, SECRET), true);
  });
});

describe("projectEncounterFromWebhook", () => {
  it("maps prescribed with no status field", () => {
    const row = projectEncounterFromWebhook({
      event: "encounter.prescribed",
      data: { encounter_id: ENCOUNTER },
    });
    assert.equal(row?.status, "prescribed");
    assert.equal(row?.encounterId, ENCOUNTER);
  });

  it("maps status_changed from new_status", () => {
    const row = projectEncounterFromWebhook({
      event: "encounter.status_changed",
      data: { encounter_id: ENCOUNTER, new_status: "pending_provider_review" },
    });
    assert.equal(row?.status, "pending_provider_review");
  });

  it("maps completed and cancelled", () => {
    assert.equal(
      projectEncounterFromWebhook({
        event: "encounter.completed",
        data: { encounter_id: ENCOUNTER },
      })?.status,
      "completed",
    );
    const cancelled = projectEncounterFromWebhook({
      event: "encounter.cancelled",
      data: { encounter_id: ENCOUNTER, reason: "patient request" },
    });
    assert.equal(cancelled?.status, "cancelled");
    assert.equal(JSON.stringify(cancelled).includes("patient request"), false);
  });

  it("does not invent status for assigned or non-encounter events", () => {
    assert.equal(
      projectEncounterFromWebhook({
        event: "encounter.assigned",
        data: { encounter_id: ENCOUNTER },
      }),
      null,
    );
    assert.equal(
      projectEncounterFromWebhook({
        event: "order.placed",
        data: { encounter_id: ENCOUNTER, order_id: ENCOUNTER },
      }),
      null,
    );
    assert.equal(
      projectEncounterFromWebhook({
        event: "webhook.test",
        data: { encounter_id: ENCOUNTER },
      }),
      null,
    );
  });
});

describe("handlePrescribeRxWebhook", () => {
  beforeEach(() => resetWebhookStateForTests());

  it("returns 503 when the secret is missing", () => {
    const raw = bodyFor("encounter.prescribed");
    const result = handlePrescribeRxWebhook({
      rawBody: raw,
      signatureHeader: signPrescribeRxBody(raw, SECRET),
      webhookIdHeader: null,
      secret: null,
    });
    assert.equal(result.status, 503);
    assert.equal(result.body.code, "webhook_not_configured");
  });

  it("returns 401 for an invalid signature", () => {
    const raw = bodyFor("encounter.prescribed");
    const result = handlePrescribeRxWebhook({
      rawBody: raw,
      signatureHeader: "sha256=nope",
      webhookIdHeader: null,
      secret: SECRET,
    });
    assert.equal(result.status, 401);
  });

  it("projects prescribed and ignores duplicate webhook_id", () => {
    const raw = bodyFor("encounter.prescribed");
    const header = signPrescribeRxBody(raw, SECRET);
    const first = handlePrescribeRxWebhook({
      rawBody: raw,
      signatureHeader: header,
      webhookIdHeader: null,
      secret: SECRET,
    });
    assert.equal(first.status, 200);
    assert.equal(getProjectedEncounterStatus(ENCOUNTER)?.status, "prescribed");

    const second = handlePrescribeRxWebhook({
      rawBody: raw,
      signatureHeader: header,
      webhookIdHeader: null,
      secret: SECRET,
    });
    assert.equal(second.status, 200);
    assert.equal(second.body.duplicate, true);
    assert.equal(getProjectedEncounterStatus(ENCOUNTER)?.status, "prescribed");
  });

  it("acks unknown events without projecting", () => {
    const raw = bodyFor("webhook.test");
    const result = handlePrescribeRxWebhook({
      rawBody: raw,
      signatureHeader: signPrescribeRxBody(raw, SECRET),
      webhookIdHeader: null,
      secret: SECRET,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.equal(getProjectedEncounterStatus(ENCOUNTER), null);
  });
});
