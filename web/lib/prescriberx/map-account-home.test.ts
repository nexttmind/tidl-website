import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapAccountHome } from "./map-account-home";

describe("mapAccountHome", () => {
  it("returns an honest empty home without fixture orders", () => {
    const home = mapAccountHome({ entrySlug: "weight-loss" });
    assert.equal(home.currentOrder, null);
    assert.equal(home.pastOrders.length, 0);
    assert.equal(home.pendingEncounter, null);
    assert.equal(home.careTeam.length, 0);
    assert.equal(home.stackName, "Weight Loss");
  });

  it("maps a pending encounter to waiting, not a fake protocol", () => {
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
});
