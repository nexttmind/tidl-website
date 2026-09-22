import type { PdpFaqItem, PdpPlanOption, PdpPriceLine } from "@/content/pdp/types";

/**
 * Public care pricing. Member price is review and portal care.
 * Prescription price is what the pharmacy ships, if prescribed.
 * Totals match the published first order and supply rates.
 */

export const PDP_LIST_PRICE = "$297";

export const PDP_CARE_TERMS = {
  memberDefined:
    "The member price is clinician review and ongoing care through the portal. The prescription price is the medication and supplies the pharmacy ships, if prescribed.",
  inclusions:
    "If prescribed, this supply includes your plan, syringes or pen supplies as indicated, alcohol pads, shipping, clinician review, and ongoing care through the portal.",
  inclusionsOral:
    "If prescribed, this supply includes your oral plan, shipping, clinician review, and ongoing care through the portal.",
  firstAndOngoing:
    "First month pricing is the amount due today if prescribed. Ongoing pricing is what you pay at each renewal for the supply you chose. A single order has no renewal.",
  renewals:
    "Monthly, quarterly, and six month supplies renew at the end of the period you chose unless you cancel first. You receive a reminder before each renewal. The renewal charge is the ongoing price for that supply, not the first month price.",
  cancellation:
    "Cancel any time in the portal or by writing care. Cancel before the next renewal and you are not charged for the next period. There is no cancellation fee. The current period is not refunded once the pharmacy has released the fill. You can pause instead of cancel if you want the next fill later.",
  notPrescribed:
    "Intake is free. You are charged when you place the order. If a clinician does not prescribe, you are refunded in full, including the member price and the prescription price, and any renewal is cancelled. You keep portal access to the decision.",
  commitmentIntro:
    "There is no annual lock. Your commitment is the current period you selected. After that, you renew only if you have not cancelled.",
} as const;

export const PDP_PLAN_LABEL = "Supply";

export const PDP_PLAN_OPTIONS: readonly PdpPlanOption[] = [
  {
    value: "single",
    label: "Single order",
    price: "$197",
    compareAtPrice: PDP_LIST_PRICE,
    payLine: "Due today if prescribed. Member $39. Prescription $158. No renewal.",
    first: {
      label: "Due today if prescribed",
      member: "$39",
      prescription: "$158",
      total: "$197",
    },
    ongoing: null,
    commitment:
      "$197 if prescribed. No renewal. Order again when you want the next fill.",
    billed: "$197 due today if prescribed.",
  },
  {
    value: "monthly",
    label: "Monthly",
    price: "$197",
    compareAtPrice: PDP_LIST_PRICE,
    cadence: "first month",
    afterPrice: "$177",
    afterCadence: "/mo after",
    payLine:
      "First month $197 if prescribed. Then $177 each month.\nMember and prescription listed below.",
    saveLabel: "$20 off",
    first: {
      label: "First month if prescribed",
      member: "$39",
      prescription: "$158",
      total: "$197",
    },
    ongoing: {
      label: "Then each month",
      member: "$49",
      prescription: "$128",
      total: "$177",
      cadence: "/mo",
    },
    commitment:
      "$197 due today if prescribed, then $177 each month. Month to month after the first charge. Cancel before the next month and you stop.",
    billed: "$197 due today if prescribed. Then $177 each month.",
  },
  {
    value: "quarterly",
    label: "Quarterly",
    price: "$157",
    compareAtPrice: PDP_LIST_PRICE,
    cadence: "/mo",
    payLine:
      "Three months at $157 a month. $471 due today if prescribed. Then $471 every three months.",
    saveLabel: "$40 off",
    first: {
      label: "Due today if prescribed",
      member: "$147",
      prescription: "$324",
      total: "$471",
    },
    ongoing: {
      label: "Then every three months",
      member: "$147",
      prescription: "$324",
      total: "$471",
    },
    commitment:
      "$471 due today if prescribed for three months. Then $471 every three months unless you cancel. No annual lock.",
    billed: "$471 due today if prescribed for three months.",
  },
  {
    value: "six-month",
    label: "Six month",
    price: "$137",
    compareAtPrice: PDP_LIST_PRICE,
    cadence: "/mo",
    payLine:
      "Six months at $137 a month. $822 due today if prescribed. Then $822 every six months.",
    saveLabel: "$60 off",
    first: {
      label: "Due today if prescribed",
      member: "$294",
      prescription: "$528",
      total: "$822",
    },
    ongoing: {
      label: "Then every six months",
      member: "$294",
      prescription: "$528",
      total: "$822",
    },
    commitment:
      "$822 due today if prescribed for six months. Then $822 every six months unless you cancel. No annual lock.",
    billed: "$822 due today if prescribed for six months.",
  },
];

export const PDP_PAY_LINE =
  "First month $197 if prescribed. Then $177 each month.\nMember and prescription listed below.";

export const PDP_TRUST = [
  {
    text: "Direct from US based, state licensed pharmacies",
    icon: "pharmacy" as const,
  },
  {
    text: "Order up to six months supply at once",
    icon: "supply" as const,
  },
  {
    text: "Member price and prescription listed separately",
    icon: "pricing" as const,
  },
] as const;

function faqItem(
  id: string,
  question: string,
  answer: string,
  defaultOpen = false,
): PdpFaqItem {
  return { id, question, answer, defaultOpen };
}

export function careFaq(inclusions: string): readonly PdpFaqItem[] {
  return [
    faqItem("included", "What's included", inclusions, true),
    faqItem(
      "pricing",
      "What is the member price and the prescription price?",
      `${PDP_CARE_TERMS.memberDefined} ${PDP_CARE_TERMS.firstAndOngoing} First month member price is $39. Ongoing member price is $49 a month, billed with the supply you chose.`,
    ),
    faqItem(
      "commitment",
      "What is the total commitment?",
      `${PDP_CARE_TERMS.commitmentIntro} A single order is $197 if prescribed. Monthly is $197 the first month, then $177 each month. Quarterly is $471 every three months. Six month is $822 every six months.`,
    ),
    faqItem("renewals", "How do renewals work?", PDP_CARE_TERMS.renewals),
    faqItem("cancel", "How do I cancel?", PDP_CARE_TERMS.cancellation),
    faqItem(
      "not-prescribed",
      "What if treatment is not prescribed?",
      PDP_CARE_TERMS.notPrescribed,
    ),
  ];
}

const PDP_PROCESS_FAQ: readonly PdpFaqItem[] = [
  faqItem(
    "switch",
    "Can you switch from another provider?",
    "Yes. Tell us during intake if you are continuing care. Your clinician reviews history and decides whether to maintain, adjust, or change your plan if prescribed.",
  ),
  faqItem(
    "quality",
    "How TIDL ensures quality and safety",
    "We only work with US based, state licensed compounding pharmacies that run analytic testing. Batches are checked in chemistry and microbiology against defined parameters before a plan can ship, if prescribed.",
  ),
];

export const PDP_CARE_FAQ: readonly PdpFaqItem[] = careFaq(
  PDP_CARE_TERMS.inclusions,
);

export const PDP_CARE_FAQ_ORAL: readonly PdpFaqItem[] = careFaq(
  PDP_CARE_TERMS.inclusionsOral,
);

export const PDP_SHARED_FAQ: readonly PdpFaqItem[] = [
  ...PDP_CARE_FAQ,
  ...PDP_PROCESS_FAQ,
];

export const PDP_SHARED_FAQ_ORAL: readonly PdpFaqItem[] = [
  ...PDP_CARE_FAQ_ORAL,
  ...PDP_PROCESS_FAQ,
];

export function priceLineRows(line: PdpPriceLine): readonly {
  label: string;
  value: string;
}[] {
  return [
    { label: "Member price", value: line.member },
    { label: "Prescription", value: line.prescription },
    {
      label: "Total",
      value: line.cadence ? `${line.total}${line.cadence}` : line.total,
    },
  ];
}
