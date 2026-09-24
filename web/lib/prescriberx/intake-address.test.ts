import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeIntakeAddress,
  normalizeUsPostalCode,
} from "./build-intake-payload";

describe("normalizeUsPostalCode", () => {
  it("keeps 5-digit ZIP", () => {
    assert.equal(normalizeUsPostalCode("11201"), "11201");
  });

  it("keeps valid ZIP+4 within 10 chars", () => {
    assert.equal(normalizeUsPostalCode("11201-1234"), "11201-1234");
  });

  it("truncates invalid long hyphenated input like a range", () => {
    assert.equal(normalizeUsPostalCode("11201-11256"), "11201");
  });
});

describe("normalizeIntakeAddress", () => {
  it("normalizes zip on address object", () => {
    const addr = normalizeIntakeAddress({
      street: "123 Main",
      city: "Brooklyn",
      state: "NY",
      zip: "11201-11256",
    });
    assert.ok(addr);
    assert.equal(addr!.zip, "11201");
    assert.equal(addr!.state, "NY");
  });
});
