import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parsePasswordNeedsReset,
  serializePasswordNeedsReset,
} from "./password-reset-hint";

describe("password needs reset hint", () => {
  it("round-trips a lowercased email", () => {
    const raw = serializePasswordNeedsReset("  Jordan@Example.COM ");
    assert.deepEqual(parsePasswordNeedsReset(raw), {
      email: "jordan@example.com",
    });
  });

  it("rejects junk", () => {
    assert.equal(parsePasswordNeedsReset(null), null);
    assert.equal(parsePasswordNeedsReset("{"), null);
    assert.equal(parsePasswordNeedsReset(JSON.stringify({ email: "nope" })), null);
  });
});
