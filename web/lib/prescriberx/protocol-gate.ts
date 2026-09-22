/**
 * Fail-closed gate for protocol / confirmation.
 * Pending, On Hold, missing, or failed status never opens payment.
 */

import { redirect } from "next/navigation";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import { prescribeRxFetch } from "./client";
import {
  evaluateProtocolAccess,
  unwrapEncounterStatus,
  type ProtocolAccess,
} from "./encounter-status";

export function isSandboxDemoQuery(demo?: string | null): boolean {
  if (demo !== "1") return false;
  return (process.env.PRESCRIBERX_SANDBOX ?? "true").toLowerCase() !== "false";
}

export function carePathQuery(
  entrySlug: string,
  encounterId?: string,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (entrySlug) params.set("entry", entrySlug);
  if (encounterId) params.set("encounter", encounterId);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  return params.toString();
}

function waitingHref(entrySlug: string, encounterId?: string): string {
  const qs = carePathQuery(entrySlug, encounterId);
  return qs ? `/care/waiting?${qs}` : "/care/waiting";
}

function visitHref(entrySlug: string, encounterId?: string): string {
  const qs = carePathQuery(entrySlug, encounterId);
  return qs ? `/care/visit?${qs}` : "/care/visit";
}

async function resolveAccess(input: {
  encounterId?: string;
  entrySlug: string;
}): Promise<{ access: ProtocolAccess; entrySlug: string; encounterId?: string }> {
  const entry = resolveClinicalEntry(input.entrySlug);
  const encounterId = input.encounterId?.trim() || undefined;
  if (!encounterId) {
    return { access: "wait", entrySlug: entry.slug };
  }
  try {
    const raw = await prescribeRxFetch(
      `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
    );
    const data = unwrapEncounterStatus(raw);
    return {
      access: evaluateProtocolAccess(data?.status, entry.visitGateDefault),
      entrySlug: entry.slug,
      encounterId,
    };
  } catch {
    return { access: "wait", entrySlug: entry.slug, encounterId };
  }
}

/** Protocol and confirmation: prescribed-like only. Fail closed. */
export async function assertEncounterReadyForProtocol(input: {
  encounterId?: string;
  entrySlug: string;
  demo?: string | null;
}): Promise<void> {
  if (isSandboxDemoQuery(input.demo)) return;
  const resolved = await resolveAccess(input);
  if (resolved.access === "allow") return;
  if (resolved.access === "visit") {
    redirect(visitHref(resolved.entrySlug, resolved.encounterId));
  }
  redirect(waitingHref(resolved.entrySlug, resolved.encounterId));
}

/** Visit screen: only when the care path requires a visit after approval. */
export async function assertEncounterReadyForVisit(input: {
  encounterId?: string;
  entrySlug: string;
  demo?: string | null;
}): Promise<void> {
  if (isSandboxDemoQuery(input.demo)) return;
  const resolved = await resolveAccess(input);
  if (resolved.access === "visit") return;
  if (resolved.access === "allow") {
    const qs = carePathQuery(resolved.entrySlug, resolved.encounterId);
    redirect(qs ? `/care/protocol?${qs}` : "/care/protocol");
  }
  redirect(waitingHref(resolved.entrySlug, resolved.encounterId));
}

