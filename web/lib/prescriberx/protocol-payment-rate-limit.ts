import {
  consumeRateLimit,
  type RateLimitResult,
} from "./auth-rate-limit";

/** Matches POST /api/prescriberx/protocol/payment (Phase M backstop). */
export const PROTOCOL_PAYMENT_RATE = {
  perMinute: 20,
  windowMs: 60_000,
} as const;

export function consumeProtocolPaymentRateLimit(
  ip: string,
): RateLimitResult {
  return consumeRateLimit(
    `protocol-pay:${ip}`,
    PROTOCOL_PAYMENT_RATE.perMinute,
    PROTOCOL_PAYMENT_RATE.windowMs,
  );
}
