export const WAITING_POLL_SEQUENCE_MS = [6000, 12000, 24000, 30000] as const;

export const WAITING_POLL_TIMEOUT_MS = 30 * 60 * 1000;

/** Backoff: 6s → 12s → 24s → 30s cap. */
export function nextWaitPollMs(step: number): number {
  const idx = Math.min(Math.max(step, 0), WAITING_POLL_SEQUENCE_MS.length - 1);
  return WAITING_POLL_SEQUENCE_MS[idx]!;
}

export function waitingPollTimedOut(
  startedAtMs: number,
  nowMs = Date.now(),
): boolean {
  return nowMs - startedAtMs >= WAITING_POLL_TIMEOUT_MS;
}
