import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractConversationIds } from "./patient-snapshot";

describe("extractConversationIds", () => {
  it("reads ids from a bare array or wrapped list", () => {
    assert.deepEqual(
      extractConversationIds([{ id: "a" }, { conversation_id: "b" }]),
      ["a", "b"],
    );
    assert.deepEqual(
      extractConversationIds({ conversations: [{ uuid: "c" }, { id: "c" }] }),
      ["c"],
    );
  });
});
