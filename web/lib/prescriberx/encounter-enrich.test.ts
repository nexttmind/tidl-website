import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeEncounterReads } from "./encounter-enrich";

describe("mergeEncounterReads", () => {
  it("keeps live status and fills number / schedule from encounter detail", () => {
    const merged = mergeEncounterReads(
      { data: { id: "enc-1", status: "unassigned", status_label: "Unassigned" } },
      {
        data: {
          id: "enc-1",
          encounter_number: "ENC-9255127960",
          scheduled_at: "2026-09-25 13:00:00",
          status: "on_hold",
        },
      },
    );
    assert.equal(merged.status, "unassigned");
    assert.equal(merged.encounter_number, "ENC-9255127960");
    assert.equal(merged.scheduled_at, "2026-09-25 13:00:00");
  });
});
