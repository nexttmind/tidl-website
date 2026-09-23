import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WAITING_POLL_TIMEOUT_MS,
  nextWaitPollMs,
  waitingPollTimedOut,
} from "./waiting-poll";

describe("nextWaitPollMs", () => {
  it("steps through 6s, 12s, 24s, then caps at 30s", () => {
    assert.equal(nextWaitPollMs(0), 6000);
    assert.equal(nextWaitPollMs(1), 12000);
    assert.equal(nextWaitPollMs(2), 24000);
    assert.equal(nextWaitPollMs(3), 30000);
    assert.equal(nextWaitPollMs(99), 30000);
  });
});

describe("waitingPollTimedOut", () => {
  it("is false before thirty minutes and true at the limit", () => {
    const start = 1_000_000;
    assert.equal(
      waitingPollTimedOut(start, start + WAITING_POLL_TIMEOUT_MS - 1),
      false,
    );
    assert.equal(
      waitingPollTimedOut(start, start + WAITING_POLL_TIMEOUT_MS),
      true,
    );
  });
});
