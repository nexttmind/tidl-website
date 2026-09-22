/**
 * Map PrescribeRx patient portal payloads onto AccountHome chrome.
 * Never invent molecule names. Empty / pending states stay honest.
 */

import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import {
  relatedFor,
  type AccountHomeData,
  type AccountOrder,
  type PendingEncounter,
  type TrackingEvent,
} from "@/content/fixtures/care-account-home";
import type { CareTeamMember } from "@/content/fixtures/care-protocol";
import { catalogVialSrc } from "@/content/fixtures/catalog";
import { evaluateProtocolAccess } from "./encounter-status";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of ["data", "items", "results"]) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pickString(
  rec: Record<string, unknown> | null,
  keys: readonly string[],
): string {
  if (!rec) return "";
  for (const key of keys) {
    const hit = str(rec[key]);
    if (hit) return hit;
  }
  return "";
}

function money(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }
  const raw = str(value);
  if (!raw) return "";
  return raw.startsWith("$") ? raw : `$${raw}`;
}

function formatDate(value: unknown): string {
  const raw = str(value);
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function orderStatus(raw: string): AccountOrder["status"] {
  const s = raw.toLowerCase();
  if (s.includes("deliver")) return "delivered";
  if (s.includes("transit") || s.includes("ship") || s.includes("fulfill")) {
    return "in_transit";
  }
  return "preparing";
}

function isActiveOrder(status: string): boolean {
  const s = status.toLowerCase();
  if (!s) return true;
  if (s.includes("cancel") || s.includes("refund") || s.includes("void")) {
    return false;
  }
  if (s.includes("deliver") || s.includes("complete")) return false;
  return true;
}

function lookArray(
  sources: readonly unknown[],
  keys: readonly string[],
): unknown[] {
  for (const source of sources) {
    const rec = asRecord(source);
    if (!rec) continue;
    for (const key of keys) {
      const rows = asArray(rec[key]);
      if (rows.length) return rows;
    }
  }
  return [];
}

function encounterIdOf(row: Record<string, unknown>): string {
  return pickString(row, ["id", "encounter_id", "uuid"]);
}

function mapTracking(raw: unknown): AccountOrder["tracking"] | undefined {
  const rec = asRecord(raw);
  if (!rec) return undefined;
  const eventsRaw = asArray(rec.events ?? rec.timeline ?? rec.updates);
  const events: TrackingEvent[] = eventsRaw.map((item, index) => {
    const ev = asRecord(item) ?? {};
    const label =
      pickString(ev, ["label", "status", "status_label", "description"]) ||
      "Update";
    return {
      label,
      at: formatDate(ev.at ?? ev.occurred_at ?? ev.created_at ?? ev.timestamp),
      detail: pickString(ev, ["detail", "notes", "description"]) || undefined,
      done: ev.done === true || index < eventsRaw.length - 1,
      current: ev.current === true || index === eventsRaw.length - 1,
    };
  });
  const carrier = pickString(rec, ["carrier", "carrier_name"]);
  const number = pickString(rec, ["number", "tracking_number", "tracking"]);
  const shipTo = pickString(rec, ["ship_to", "shipTo", "destination", "address"]);
  if (!carrier && !number && events.length === 0) return undefined;
  return {
    carrier: carrier || "Carrier assigned after fill",
    number: number || "—",
    shipTo: shipTo || "On file",
    events,
  };
}

function mapAgents(
  row: Record<string, unknown>,
  vialSrc: string,
): AccountOrder["agents"] {
  const lines = lookArray(
    [row],
    ["items", "line_items", "products", "prescriptions", "agents"],
  );
  const agents: { name: string; dosage: string; vialSrc: string }[] = [];
  for (const item of lines) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = pickString(rec, [
      "product_name",
      "name",
      "title",
      "display_name",
    ]);
    if (!name) continue;
    agents.push({
      name,
      dosage: pickString(rec, ["dosage", "dose", "strength", "quantity"]) || "—",
      vialSrc,
    });
  }
  return agents;
}

function mapOrder(
  raw: unknown,
  entrySlug: string,
  fallbackName: string,
): AccountOrder | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickString(rec, ["id", "order_id", "order_number", "number"]);
  if (!id) return null;
  const statusRaw = pickString(rec, ["status", "status_label", "state"]);
  const stackName =
    pickString(rec, [
      "package_name",
      "product_name",
      "name",
      "title",
      "display_name",
    ]) || fallbackName;
  const vialSrc = catalogVialSrc("transformation");
  return {
    id,
    entrySlug,
    stackName,
    image: vialSrc,
    imageAlt: stackName,
    placedOn:
      formatDate(rec.placed_at ?? rec.created_at ?? rec.ordered_at) || "—",
    total: money(rec.total ?? rec.amount ?? rec.grand_total) || "—",
    purchaseType:
      str(rec.purchase_type).includes("sub") || rec.subscription === true
        ? "subscription"
        : "single",
    status: orderStatus(statusRaw),
    statusLabel: statusRaw
      ? statusRaw
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Preparing",
    eta: pickString(rec, ["eta", "estimated_delivery"]) || undefined,
    tracking: mapTracking(rec.tracking ?? rec.fulfillment),
    vialSrc,
    agents: mapAgents(rec, vialSrc),
  };
}

function mapPending(
  rows: unknown[],
  entrySlug: string,
  visitGateDefault: boolean,
): PendingEncounter | null {
  for (const row of rows) {
    const rec = asRecord(row);
    if (!rec) continue;
    const id = encounterIdOf(rec);
    if (!id) continue;
    const status = pickString(rec, ["status", "status_label"]);
    if (evaluateProtocolAccess(status, visitGateDefault) !== "wait") continue;
    if (status.toLowerCase() === "cancelled" || status.toLowerCase() === "canceled") {
      continue;
    }
    return {
      encounterId: id,
      entrySlug,
      statusLabel: status
        ? status
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "In review",
    };
  }
  return null;
}

export function mapAccountHome(input: {
  entrySlug: string;
  dashboard?: unknown;
  orders?: unknown;
  encounters?: unknown;
  prescriptions?: unknown;
}): AccountHomeData {
  const entry = resolveClinicalEntry(input.entrySlug);
  const dash = asRecord(input.dashboard);
  const orderRows = lookArray(
    [input.orders, dash],
    ["orders", "recent_orders", "latest_orders"],
  );
  const encounterRows = lookArray(
    [input.encounters, dash],
    ["encounters", "recent_encounters", "latest_encounters"],
  );

  const mapped = orderRows
    .map((row) => mapOrder(row, entry.slug, entry.label))
    .filter((row): row is AccountOrder => Boolean(row));

  const currentOrder =
    mapped.find((order) => isActiveOrder(order.statusLabel)) ??
    mapped.find((order) => order.status !== "delivered") ??
    null;
  const pastOrders = mapped.filter((order) => order.id !== currentOrder?.id);

  const goals = lookArray([dash], ["goals", "care_goals"])
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return pickString(asRecord(item), ["label", "name", "title", "goal"]);
    })
    .filter(Boolean);

  const careTeam: CareTeamMember[] = lookArray(
    [dash],
    ["care_team", "providers", "clinicians"],
  )
    .map((item, index) => {
      const rec = asRecord(item);
      const name = pickString(rec, ["name", "full_name", "display_name"]);
      if (!name) return null;
      return {
        id: pickString(rec, ["id"]) || `clinician-${index}`,
        name,
        role: pickString(rec, ["role", "title", "specialty"]) || "Clinician",
        status: pickString(rec, ["status"]) || "On your care team",
      } satisfies CareTeamMember;
    })
    .filter((row): row is CareTeamMember => Boolean(row));

  const pharmacyRec = asRecord(
    dash?.pharmacy ?? lookArray([dash], ["pharmacies"])[0],
  );
  const pharmacyName = pickString(pharmacyRec, ["name", "display_name"]);

  return {
    entrySlug: entry.slug,
    goalLabel: entry.label,
    stackName: currentOrder?.stackName || entry.label,
    goals,
    careTeam,
    pharmacy: {
      name: pharmacyName || "Pharmacy assigned after review",
      detail: pickString(pharmacyRec, ["detail", "location", "city"]) || "",
      status: pickString(pharmacyRec, ["status"]) || "Standing by",
    },
    surveyTitle: "From your clinical survey",
    surveyLede:
      "Answers your physician used in review. Message your care team if anything has changed.",
    surveyRows: [],
    currentOrder,
    pastOrders,
    pendingEncounter: mapPending(encounterRows, entry.slug, entry.visitGateDefault),
    related: relatedFor(entry.slug),
  };
}
