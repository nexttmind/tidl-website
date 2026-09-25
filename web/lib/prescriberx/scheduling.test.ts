import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenSlotDays } from "./scheduling";

describe("flattenSlotDays", () => {
  it("flattens nested day groups", () => {
    const slots = flattenSlotDays({
      success: true,
      data: {
        slots: [
          {
            date: "2026-08-10",
            slots: [
              {
                start: "2026-08-10T15:30:00Z",
                display_time: "11:30 AM",
              },
            ],
          },
        ],
      },
    });
    assert.equal(slots.length, 1);
    assert.equal(slots[0]!.start, "2026-08-10T15:30:00Z");
    assert.equal(slots[0]!.display_time, "11:30 AM");
  });
});
