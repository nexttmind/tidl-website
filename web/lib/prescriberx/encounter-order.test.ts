import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isEncounterOrderPaid,
  unwrapEncounterOrder,
} from "./encounter-order";

describe("encounter-order", () => {
  it("unwraps order from encounter status payload", () => {
    const ref = unwrapEncounterOrder({
      status: "prescribed",
      order: {
        order_id: "ord-1",
        order_number: "ORD-001",
        payment_status: "awaiting_payment",
      },
    });
    assert.equal(ref?.orderId, "ord-1");
    assert.equal(ref?.orderNumber, "ORD-001");
  });

  it("detects captured payment status", () => {
    assert.equal(isEncounterOrderPaid("captured"), true);
    assert.equal(isEncounterOrderPaid("awaiting_payment"), false);
  });
});
