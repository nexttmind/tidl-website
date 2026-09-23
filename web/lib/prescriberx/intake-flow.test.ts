import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  INTAKE_HANDOFF_KEY,
  readIntakeHandoff,
  writeIntakeHandoff,
  type IntakeHandoff,
} from "./intake-flow";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const sample: IntakeHandoff = {
  encounterId: "enc-1",
  entrySlug: "symptoms",
  email: "patient@example.com",
};

describe("intake handoff storage", () => {
  let session: MemoryStorage;
  let local: MemoryStorage;

  beforeEach(() => {
    session = new MemoryStorage();
    local = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: {
        sessionStorage: session,
        localStorage: local,
      },
    });
  });

  afterEach(() => {
    delete (globalThis as { window?: Window }).window;
  });

  it("writes only to sessionStorage", () => {
    writeIntakeHandoff(sample);
    assert.ok(session.getItem(INTAKE_HANDOFF_KEY));
    assert.equal(local.getItem(INTAKE_HANDOFF_KEY), null);
  });

  it("reads sessionStorage and removes legacy localStorage key", () => {
    local.setItem(INTAKE_HANDOFF_KEY, JSON.stringify(sample));
    session.setItem(INTAKE_HANDOFF_KEY, JSON.stringify(sample));
    const data = readIntakeHandoff();
    assert.deepEqual(data, sample);
    assert.equal(local.getItem(INTAKE_HANDOFF_KEY), null);
  });
});
