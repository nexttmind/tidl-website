/**
 * Playground tokens on demo.prescribe-rx.com rotate (~12h). When local
 * PRESCRIBERX_API_TOKEN goes stale, sandbox server routes can refresh once
 * from the public docs endpoint (system_admin only, demo host).
 */

let inFlight: Promise<string | null> | null = null;

export async function refreshSandboxPlaygroundToken(): Promise<string | null> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await fetch("https://demo.prescribe-rx.com/api/docs/tokens", {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { tokens?: { system_admin?: string } };
      const token = json.tokens?.system_admin;
      if (typeof token !== "string" || !token.trim()) return null;
      process.env.PRESCRIBERX_API_TOKEN = token.trim();
      return token.trim();
    } catch (err) {
      console.warn("[prescriberx] sandbox token refresh failed", err);
      return null;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
