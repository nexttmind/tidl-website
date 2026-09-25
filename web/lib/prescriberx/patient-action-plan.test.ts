import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PatientActionError,
  planPatientAction,
  sanitizeCouponResult,
} from "./patient-action-plan";

const ID = "019f3d35-afc4-72f8-b055-6c86c27ac1b3";

describe("planPatientAction", () => {
  it("builds an approval accept with an idempotency header", () => {
    const plan = planPatientAction({
      action: "accept_approval",
      approval_id: ID,
      acknowledged_total: 125,
      idempotency_key: "key-1",
    });
    assert.equal(plan.method, "POST");
    assert.equal(plan.path, `/me/patient/approvals/${ID}/accept`);
    assert.deepEqual(plan.body, { acknowledged_total: 125 });
    assert.equal(plan.headers?.["Idempotency-Key"], "key-1");
  });

  it("rejects unknown actions and bad ids", () => {
    assert.throws(() => planPatientAction({ action: "delete_patient" }), PatientActionError);
    assert.throws(
      () =>
        planPatientAction({
          action: "decline_approval",
          approval_id: "../admin",
        }),
      PatientActionError,
    );
  });

  it("keeps only safe coupon fields", () => {
    const out = sanitizeCouponResult({
      data: { valid: true, message: "ok", token: "secret", discount_amount: 10 },
    });
    assert.equal(out.valid, true);
    assert.equal(out.discount_amount, 10);
    assert.equal("token" in out, false);
  });
});
