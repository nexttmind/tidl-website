/**
 * Soft in-memory rate limit (per Node process).
 * On Vercel/similar, trust x-real-ip / x-vercel-forwarded-for from the platform edge.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function firstForwardedIp(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

export function clientIpFromRequest(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const vercel = firstForwardedIp(
    request.headers.get("x-vercel-forwarded-for"),
  );
  if (vercel) return vercel;

  const forwarded = firstForwardedIp(request.headers.get("x-forwarded-for"));
  if (forwarded) return forwarded;

  return "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

/**
 * Returns whether the request is allowed and seconds until the bucket resets.
 */
export function consumeRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  const retryAfterSec = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  );

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSec };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSec };
}

/**
 * Returns true if the request is allowed; false if over limit.
 * Default: 10 / minute / key (aligned with PrescribeRx Auth limit).
 */
export function consumeAuthRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  return consumeRateLimit(key, limit, windowMs).allowed;
}

/** Test helper */
export function resetAuthRateLimitForTests() {
  buckets.clear();
}
