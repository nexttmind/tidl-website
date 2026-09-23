/**
 * Map PrescribeRx patient portal payloads onto AccountHome chrome.
 * Never invent molecule names. Empty / pending states stay honest.
 */

import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import {
  relatedFor,
  type AccountHomeData,
  type AccountOrder,
  type AccountPrescription,
  type PendingEncounter,
  type TrackingEvent,
} from "@/content/fixtures/care-account-home";
import type {
  CareTeamMember,
  ClinicalSummaryRow,
} from "@/content/fixtures/care-protocol";
import { catalogVialSrc } from "@/content/fixtures/catalog";
import { evaluateProtocolAccess } from "./encounter-status";

const ORDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOrderUuid(value: string): boolean {
  return ORDER_UUID.test(value.trim());
}

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

function coerceRows(
  value: unknown,
  keys: readonly string[],
): unknown[] {
  if (Array.isArray(value)) return value;
  return lookArray([value], keys);
}

function encounterIdOf(row: Record<string, unknown>): string {
  return pickString(row, ["id", "encounter_id", "uuid"]);
}

export function mapTracking(raw: unknown): AccountOrder["tracking"] | undefined {
  const rec = asRecord(raw);
  if (!rec) return undefined;
  const nested = rec.tracking ?? rec.fulfillment;
  const body = asRecord(nested) ?? rec;
  const eventsRaw = asArray(body.events ?? body.timeline ?? body.updates);
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
  const carrier = pickString(body, ["carrier", "carrier_name"]);
  const number = pickString(body, ["number", "tracking_number", "tracking"]);
  const shipTo = pickString(body, [
    "ship_to",
    "shipTo",
    "destination",
    "address",
  ]);
  if (!carrier && !number && events.length === 0) return undefined;
  return {
    carrier,
    number,
    shipTo,
    events,
  };
}

export function mergeOrderTracking(
  order: AccountOrder,
  raw: unknown,
): AccountOrder {
  const tracking = mapTracking(raw);
  if (!tracking) return order;
  return { ...order, tracking };
}

function mapAgents(
  row: Record<string, unknown>,
  vialSrc: string,
): AccountOrder["agents"] {
  const lines = lookArray(
    [row],
    ["items", "line_items", "products", "agents"],
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
  const uuidCandidate = pickString(rec, ["id", "order_id", "uuid"]);
  const displayFallback = pickString(rec, ["order_number", "number"]);
  const id = isOrderUuid(uuidCandidate)
    ? uuidCandidate
    : uuidCandidate || displayFallback;
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
    if (
      status.toLowerCase() === "cancelled" ||
      status.toLowerCase() === "canceled"
    ) {
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

function mapPrescription(raw: unknown): AccountPrescription | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const lines = lookArray([rec], ["items", "line_items", "products"]);
  const firstLine = asRecord(lines[0]);
  const name =
    pickString(rec, ["product_name", "name", "title", "display_name"]) ||
    pickString(firstLine, ["product_name", "name", "title", "display_name"]);
  if (!name) return null;
  const id =
    pickString(rec, ["id", "prescription_id", "uuid"]) || `rx-${name}`;
  const orderRaw = pickString(rec, ["order_id", "order"]);
  const orderId = isOrderUuid(orderRaw) ? orderRaw : undefined;
  const dosage =
    pickString(rec, ["dosage", "dose", "strength", "quantity"]) ||
    pickString(firstLine, ["dosage", "dose", "strength", "quantity"]);
  return { id, name, dosage, orderId };
}

function attachMatchingPrescriptions(
  order: AccountOrder,
  prescriptions: readonly AccountPrescription[],
): AccountOrder {
  if (!isOrderUuid(order.id)) return order;
  const vialSrc = order.vialSrc;
  const existing = new Set(order.agents.map((agent) => agent.name.toLowerCase()));
  const extra: AccountOrder["agents"][number][] = [];
  for (const rx of prescriptions) {
    if (rx.orderId !== order.id) continue;
    if (existing.has(rx.name.toLowerCase())) continue;
    extra.push({
      name: rx.name,
      dosage: rx.dosage || "—",
      vialSrc,
    });
    existing.add(rx.name.toLowerCase());
  }
  if (!extra.length) return order;
  return { ...order, agents: [...order.agents, ...extra] };
}

function mapSurveyRows(dashboard: Record<string, unknown> | null): ClinicalSummaryRow[] {
  const rows = lookArray(
    [dashboard],
    ["clinical_summary", "survey_rows", "survey", "answers"],
  );
  const out: ClinicalSummaryRow[] = [];
  for (const item of rows) {
    const rec = asRecord(item);
    if (!rec) continue;
    const label = pickString(rec, ["label", "question", "name", "title"]);
    const value = pickString(rec, ["value", "answer", "response"]);
    if (!label || !value) continue;
    out.push({ label, value });
  }
  return out;
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
  const orderRows = [
    ...coerceRows(input.orders, ["orders", "recent_orders", "latest_orders"]),
    ...lookArray([dash], ["orders", "recent_orders", "latest_orders"]),
  ];
  const encounterRows = [
    ...coerceRows(input.encounters, [
      "encounters",
      "recent_encounters",
      "latest_encounters",
    ]),
    ...lookArray([dash], [
      "encounters",
      "recent_encounters",
      "latest_encounters",
    ]),
  ];
  const prescriptionRows = [
    ...coerceRows(input.prescriptions, [
      "prescriptions",
      "recent_prescriptions",
    ]),
    ...lookArray([dash], ["prescriptions", "recent_prescriptions"]),
  ];

  const prescriptions = prescriptionRows
    .map(mapPrescription)
    .filter((row): row is AccountPrescription => Boolean(row));

  const mapped = orderRows
    .map((row) => mapOrder(row, entry.slug, entry.label))
    .filter((row): row is AccountOrder => Boolean(row))
    .map((order) => attachMatchingPrescriptions(order, prescriptions));

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
  const pharmacy = pharmacyName
    ? {
        name: pharmacyName,
        detail: pickString(pharmacyRec, ["detail", "location", "city"]),
        status: pickString(pharmacyRec, ["status"]),
      }
    : null;

  return {
    entrySlug: entry.slug,
    goalLabel: entry.label,
    stackName: currentOrder?.stackName || entry.label,
    goals,
    careTeam,
    pharmacy,
    surveyTitle: "From your clinical survey",
    surveyLede:
      "Answers your physician used in review. Message your care team if anything has changed.",
    surveyRows: mapSurveyRows(dash),
    currentOrder,
    pastOrders,
    prescriptions,
    pendingEncounter: mapPending(
      encounterRows,
      entry.slug,
      entry.visitGateDefault,
    ),
    related: relatedFor(entry.slug),
  };
}
