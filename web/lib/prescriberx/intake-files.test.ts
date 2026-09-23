import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_INTAKE_ENCODED_BYTES,
  validateIntakeFiles,
} from "./intake-files";

describe("validateIntakeFiles", () => {
  it("accepts valid files", () => {
    const result = validateIntakeFiles([
      {
        slug: "id_photo",
        filename: "id.jpg",
        mime_type: "image/jpeg",
        base64: "abc",
      },
    ]);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.files.length, 1);
  });

  it("rejects missing slug or base64", () => {
    assert.equal(validateIntakeFiles([{ slug: "x" }]).ok, false);
    assert.equal(validateIntakeFiles([{ base64: "x" }]).ok, false);
  });

  it("rejects oversized encoded payload", () => {
    const result = validateIntakeFiles([
      {
        slug: "id_photo",
        filename: "big.jpg",
        mime_type: "image/jpeg",
        base64: "A".repeat(MAX_INTAKE_ENCODED_BYTES + 1),
      },
    ]);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /too large/i);
    }
  });
});
