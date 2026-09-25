import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isOrderUuid,
  mapAccountHome,
  mapTracking,
  mergeOrderTracking,
} from "./map-account-home";

describe("mapAccountHome", () => {
  it("returns an honest empty home without fixture orders", () => {
    const home = mapAccountHome({ entrySlug: "weight-loss" });
    assert.equal(home.currentOrder, null);
    assert.equal(home.pastOrders.length, 0);
    assert.equal(home.pendingEncounter, null);
    assert.equal(home.careTeam.length, 0);
    assert.equal(home.pharmacy, null);
    assert.equal(home.prescriptions.length, 0);
    assert.equal(home.surveyRows.length, 0);
    assert.equal(home.threads.length, 0);
    assert.equal(home.stackName, "Weight Loss");
  });

  it("maps a pending encounter from a bare array envelope", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      encounters: [
        { id: "01a0cd2f-3230-7227-9dba-5cf64cc5c28d", status: "on_hold" },
      ],
      orders: [],
      prescriptions: [],
    });
    assert.equal(home.currentOrder, null);
    assert.equal(home.pendingEncounter?.encounterId, "01a0cd2f-3230-7227-9dba-5cf64cc5c28d");
    assert.equal(home.pendingEncounter?.statusLabel, "On Hold");
  });

  it("maps a pending encounter wrapped in an encounters object", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      encounters: {
        encounters: [
          { id: "enc-1", status: "on_hold", status_label: "On Hold" },
        ],
      },
    });
    assert.equal(home.currentOrder, null);
    assert.deepEqual(home.pendingEncounter, {
      encounterId: "enc-1",
      entrySlug: "weight-loss",
      statusLabel: "On Hold",
      next: "wait",
    });
  });

  it("does not invent molecule names on a live order", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      orders: {
        orders: [
          {
            id: "ord-9",
            status: "preparing",
            package_name: "Physician protocol",
            total: 349,
            created_at: "2026-09-22",
            items: [{ product_name: "Physician protocol", dosage: "As written" }],
          },
        ],
      },
    });
    assert.equal(home.currentOrder?.id, "ord-9");
    assert.equal(home.currentOrder?.stackName, "Physician protocol");
    assert.equal(home.currentOrder?.agents[0]?.name, "Physician protocol");
    const joined = JSON.stringify(home);
    assert.equal(joined.includes("Sermorelin"), false);
    assert.equal(joined.includes("tirzepatide"), false);
  });

  it("maps chart allergies and vitals onto survey rows when dashboard has none", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      allergies: { allergies: [{ name: "Penicillin" }] },
      vitals: [{ type: "Weight", value: "190 lb" }],
    });
    assert.equal(home.surveyRows.some((row) => row.value === "Penicillin"), true);
    assert.equal(home.surveyRows.some((row) => row.value === "190 lb"), true);
  });

  it("maps conversations, preferences, and payment methods when PRX sends them", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      communicationPreferences: {
        global_enabled: true,
        channels: { email: true, sms: false },
      },
      paymentMethods: [{ brand: "Visa", exp_month: "09", exp_year: "27" }],
      conversations: [
        {
          id: "convo-1",
          title: "Visit follow-up",
          last_message: { content: "See you Thursday." },
        },
      ],
    });
    assert.equal(
      home.surveyRows.some((row) => row.label === "Email alerts" && row.value === "On"),
      true,
    );
    assert.equal(
      home.surveyRows.some((row) => row.value.includes("Visa on file")),
      true,
    );
    assert.equal(home.threads[0]?.preview, "See you Thursday.");
  });

  it("keeps a prescribed encounter so home can open protocol", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      encounters: [{ id: "enc-prescribed", status: "prescribed" }],
    });
    assert.deepEqual(home.pendingEncounter, {
      encounterId: "enc-prescribed",
      entrySlug: "weight-loss",
      statusLabel: "Prescribed",
      next: "protocol",
    });
  });

  it("sends visit-gated encounters to the visit step", () => {
    const home = mapAccountHome({
      entrySlug: "testosterone",
      encounters: [{ id: "enc-visit", status: "unassigned" }],
    });
    assert.equal(home.pendingEncounter?.next, "visit");
  });

  it("does not invent pharmacy copy when PRX omits pharmacy", () => {
    const home = mapAccountHome({ entrySlug: "weight-loss", dashboard: {} });
    assert.equal(home.pharmacy, null);
  });

  it("does not merge prescriptions onto an unrelated order", () => {
    const orderId = "019dd4d8-1a2b-7300-89ab-000111222333";
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      orders: {
        orders: [
          {
            id: orderId,
            status: "preparing",
            package_name: "Physician protocol",
            items: [{ product_name: "Physician protocol", dosage: "As written" }],
          },
        ],
      },
      prescriptions: {
        prescriptions: [
          {
            id: "rx-other",
            name: "Unrelated compound",
            dosage: "1 mg",
            order_id: "019dd4d8-1a2b-7300-89ab-999999999999",
          },
        ],
      },
    });
    assert.equal(home.currentOrder?.agents.length, 1);
    assert.equal(home.currentOrder?.agents[0]?.name, "Physician protocol");
    assert.equal(home.prescriptions.length, 1);
    assert.equal(home.prescriptions[0]?.name, "Unrelated compound");
    assert.equal(home.prescriptions[0]?.orderId, "019dd4d8-1a2b-7300-89ab-999999999999");
  });

  it("attaches a prescription only when order_id matches the order UUID", () => {
    const orderId = "019dd4d8-1a2b-7300-89ab-000111222333";
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      orders: {
        orders: [{ id: orderId, status: "preparing", package_name: "Protocol" }],
      },
      prescriptions: {
        prescriptions: [
          {
            id: "rx-1",
            name: "Named agent from Rx",
            dosage: "2 mg",
            order_id: orderId,
          },
        ],
      },
    });
    assert.equal(home.currentOrder?.agents[0]?.name, "Named agent from Rx");
    assert.equal(home.prescriptions[0]?.orderId, orderId);
  });

  it("prefers a UUID order id over order_number for tracking fetches", () => {
    const uuid = "019dd4d8-1a2b-7300-89ab-000111222333";
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      orders: {
        orders: [
          {
            id: uuid,
            order_number: "ORD-9",
            status: "preparing",
            package_name: "Protocol",
          },
        ],
      },
    });
    assert.equal(home.currentOrder?.id, uuid);
    assert.equal(isOrderUuid(home.currentOrder?.id ?? ""), true);
  });
});

describe("mapTracking", () => {
  it("returns undefined instead of invented carrier copy", () => {
    assert.equal(mapTracking({}), undefined);
    assert.equal(mapTracking(null), undefined);
  });

  it("merges tracking onto an order only when payload has real fields", () => {
    const home = mapAccountHome({
      entrySlug: "weight-loss",
      orders: {
        orders: [
          {
            id: "019dd4d8-1a2b-7300-89ab-000111222333",
            status: "preparing",
            package_name: "Protocol",
          },
        ],
      },
    });
    const order = home.currentOrder;
    assert.ok(order);
    const empty = mergeOrderTracking(order, {});
    assert.equal(empty.tracking, undefined);
    const merged = mergeOrderTracking(order, {
      carrier: "UPS",
      tracking_number: "1Z999",
      events: [{ status: "Shipped", occurred_at: "2026-09-22" }],
    });
    assert.equal(merged.tracking?.carrier, "UPS");
    assert.equal(merged.tracking?.number, "1Z999");
    assert.equal(merged.tracking?.events[0]?.label, "Shipped");
  });
});
