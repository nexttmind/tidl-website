import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyWaitingBranch,
  evaluateProtocolAccess,
} from "./encounter-status";

describe("evaluateProtocolAccess", () => {
  it("allows prescribed-like statuses when no visit is required", () => {
    for (const status of [
      "prescribed",
      "provider_signed",
      "completed",
      "order_placed",
      "order_paid",
    ]) {
      assert.equal(evaluateProtocolAccess(status, false), "allow");
    }
  });

  it("sends visit-gated entries to visit, not payment", () => {
    assert.equal(evaluateProtocolAccess("prescribed", true), "visit");
    assert.equal(evaluateProtocolAccess("unassigned", true), "visit");
    assert.equal(classifyWaitingBranch("scheduled", true), "visit");
    assert.equal(evaluateProtocolAccess("on_hold", true), "wait");
    assert.equal(evaluateProtocolAccess("provider_signed", true), "allow");
  });

  it("keeps pending and hold on waiting", () => {
    for (const status of [
      "on_hold",
      "pending_provider_review",
      "unassigned",
      "pending_intake",
      "provider_in_progress",
      "",
      null,
      undefined,
    ]) {
      assert.equal(evaluateProtocolAccess(status, false), "wait");
      assert.equal(classifyWaitingBranch(status, false), "wait");
    }
  });

  it("does not open payment after cancel", () => {
    assert.equal(evaluateProtocolAccess("cancelled", false), "wait");
    assert.equal(evaluateProtocolAccess("canceled", false), "wait");
  });
});
