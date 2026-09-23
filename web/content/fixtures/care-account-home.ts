/**
 * Logged-in account home. Demo sample data, not live PHI.
 * Named agents allowed: portal boundary after physician review.
 */

import type { ThemeId } from "@/content/brand/peptide-identity";
import { catalogItemById } from "@/content/fixtures/catalog";
import {
  resolveCareProtocol,
  type CareProtocolOrder,
  type CareTeamMember,
  type ClinicalSummaryRow,
  type PharmacyInfo,
} from "@/content/fixtures/care-protocol";
import type { ValueFieldCard } from "@/content/fixtures/value-fields";

export type TrackingEvent = {
  label: string;
  at: string;
  detail?: string;
  done: boolean;
  current?: boolean;
};

export type AccountOrder = {
  id: string;
  entrySlug: string;
  stackName: string;
  image: string;
  imageAlt: string;
  placedOn: string;
  total: string;
  purchaseType: "single" | "subscription";
  status: "preparing" | "in_transit" | "delivered";
  statusLabel: string;
  eta?: string;
  cadence?: string;
  nextShip?: string;
  tracking?: {
    carrier: string;
    number: string;
    shipTo: string;
    events: readonly TrackingEvent[];
  };
  vialSrc: string;
  agents: readonly { name: string; dosage: string; vialSrc: string }[];
};

export type AccountPrescription = {
  id: string;
  name: string;
  dosage: string;
  /** UUID of a related order, when PRX sends one. */
  orderId?: string;
};

export type PendingEncounter = {
  encounterId: string;
  entrySlug: string;
  statusLabel: string;
};

export type AccountHomeData = {
  entrySlug: string;
  goalLabel: string;
  stackName: string;
  goals: readonly string[];
  careTeam: readonly CareTeamMember[];
  pharmacy: PharmacyInfo | null;
  surveyTitle: string;
  surveyLede: string;
  surveyRows: readonly ClinicalSummaryRow[];
  currentOrder: AccountOrder | null;
  pastOrders: readonly AccountOrder[];
  prescriptions: readonly AccountPrescription[];
  pendingEncounter: PendingEncounter | null;
  related: readonly ValueFieldCard[];
};

const RELATED_BY_ENTRY: Record<string, readonly ThemeId[]> = {
  "weight-loss": ["transformation", "recovery-performance", "mens-health"],
  transformation: ["weight-loss", "athlete", "recovery-performance"],
  executives: ["athlete", "mens-health", "recovery-performance"],
  athletes: ["recovery-performance", "mens-health", "transformation"],
  creators: ["recovery-performance", "skin-hair", "executive"],
  healthspan: ["mens-health", "recovery-performance", "skin-hair"],
  parents: ["recovery-performance", "weight-loss", "womens-balance"],
  travelers: ["recovery-performance", "skin-hair", "sexual-health"],
  testosterone: ["mens-health", "sexual-health", "athlete"],
  "recovery-performance": ["athlete", "mens-health", "transformation"],
  "womens-balance": ["skin-hair", "weight-loss", "recovery-performance"],
  "sexual-health": ["mens-health", "womens-balance", "skin-hair"],
  "skin-hair": ["womens-balance", "recovery-performance", "transformation"],
  symptoms: ["weight-loss", "recovery-performance", "mens-health"],
};

const DEFAULT_RELATED: readonly ThemeId[] = [
  "transformation",
  "recovery-performance",
  "athlete",
];

function vialOf(protocol: CareProtocolOrder) {
  return protocol.fulfillmentCollage.round.src;
}

function agentsOf(protocol: CareProtocolOrder) {
  const vialSrc = vialOf(protocol);
  return protocol.agents.map((agent) => ({
    name: agent.name,
    dosage: agent.dosage,
    vialSrc,
  }));
}

function deliveredOrder(
  id: string,
  slug: string,
  placedOn: string,
  total: string,
): AccountOrder {
  const protocol = resolveCareProtocol(slug);
  return {
    id,
    entrySlug: slug,
    stackName: protocol.stackName,
    image: protocol.gallery[0]?.src ?? protocol.hero.image,
    imageAlt: protocol.gallery[0]?.alt ?? protocol.hero.alt,
    vialSrc: vialOf(protocol),
    placedOn,
    total,
    purchaseType: "single",
    status: "delivered",
    statusLabel: "Delivered",
    tracking: {
      carrier: "UPS",
      number: `1Z ${id.slice(-6)} 03 0000 0001`,
      shipTo: "90405 · Santa Monica, CA",
      events: [
        {
          label: "Order confirmed",
          at: placedOn,
          done: true,
        },
        {
          label: "Pharmacy released",
          at: placedOn,
          done: true,
        },
        {
          label: "Shipped",
          at: placedOn,
          done: true,
        },
        {
          label: "Delivered",
          at: placedOn,
          detail: "Left at the door. Signature not required.",
          done: true,
          current: true,
        },
      ],
    },
    agents: agentsOf(protocol),
  };
}

function currentOrderFrom(protocol: CareProtocolOrder): AccountOrder {
  return {
    id: "TIDL-2841",
    entrySlug: protocol.entrySlug,
    stackName: protocol.stackName,
    image: protocol.gallery[0]?.src ?? protocol.hero.image,
    imageAlt: protocol.gallery[0]?.alt ?? protocol.hero.alt,
    vialSrc: vialOf(protocol),
    placedOn: "19 Aug 2026",
    total: protocol.price,
    purchaseType: "single",
    status: "in_transit",
    statusLabel: "Out for delivery",
    eta: "Today, by 8 pm",
    tracking: {
      carrier: "UPS",
      number: "1Z 884 103 03 2391 4412",
      shipTo: "Ocean Ave · Santa Monica, CA 90405",
      events: [
        {
          label: "Order confirmed",
          at: "19 Aug, 9:12 am",
          detail: "Payment captured. Prescription with your care team.",
          done: true,
        },
        {
          label: "Pharmacy compounded",
          at: "19 Aug, 11:40 am",
          detail: `${protocol.pharmacy.name} released the pen.`,
          done: true,
        },
        {
          label: "Shipped",
          at: "19 Aug, 4:06 pm",
          detail: "Handed to UPS. Discreet packaging.",
          done: true,
        },
        {
          label: "Out for delivery",
          at: "20 Aug, 7:22 am",
          detail: "On the truck for 90405.",
          done: true,
          current: true,
        },
        {
          label: "Delivered",
          at: "Expected today by 8 pm",
          done: false,
        },
      ],
    },
    agents: agentsOf(protocol),
  };
}

export function relatedFor(entrySlug: string): readonly ValueFieldCard[] {
  const ids = RELATED_BY_ENTRY[entrySlug] ?? DEFAULT_RELATED;
  return ids
    .map((id) => catalogItemById(id))
    .filter((item): item is ValueFieldCard => Boolean(item));
}

export function resolveAccountHome(
  entrySlug: string | null | undefined,
): AccountHomeData {
  const protocol = resolveCareProtocol(entrySlug);
  const careTeam = protocol.careTeam.map((member) =>
    member.id === "physician"
      ? { ...member, status: "Following this protocol" }
      : member,
  );

  return {
    entrySlug: protocol.entrySlug,
    goalLabel: protocol.stackName.replace(/ stack$/i, ""),
    stackName: protocol.stackName,
    goals: protocol.goals,
    careTeam,
    pharmacy: {
      ...protocol.pharmacy,
      status: "Filled this order",
    },
    surveyTitle: "From your clinical survey",
    surveyLede:
      "Answers your physician used in review. Message your care team if anything has changed.",
    surveyRows: protocol.clinicalSummary.rows,
    currentOrder: currentOrderFrom(protocol),
    pastOrders: [
      deliveredOrder("TIDL-1904", "recovery-performance", "3 Aug 2026", "$197"),
      deliveredOrder("TIDL-1766", "athletes", "12 Jun 2026", "$395"),
    ],
    prescriptions: [],
    pendingEncounter: null,
    related: relatedFor(protocol.entrySlug),
  };
}
