export function rateLimitedResponse(retryAfterSec: number): Response {
  return Response.json(
    {
      success: false,
      message: "Too many attempts. Try again shortly.",
      code: "rate_limited",
    },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSec)) },
    },
  );
}
