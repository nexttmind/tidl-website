/**
 * Server-only sandbox designer flag for ?demo=1.
 * Never import from client components.
 */

export function isSandboxDemoQuery(demo?: string | null): boolean {
  if (demo !== "1") return false;
  if (process.env.NODE_ENV === "production") return false;
  return (process.env.PRESCRIBERX_SANDBOX ?? "true").toLowerCase() !== "false";
}
