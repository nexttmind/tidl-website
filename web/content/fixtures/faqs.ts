import { PDP_CARE_FAQ, PDP_CARE_TERMS, PDP_SHARED_FAQ } from "@/content/pdp/pricing";
import { PDP_DISCLAIMER } from "@/content/pdp/shared";
import { weightLossPdp } from "@/content/fixtures/weight-loss-pdp";

export const FAQS_HREF = "/faqs";

const CARE_FAQ_IDS = new Set(PDP_CARE_FAQ.map((item) => item.id));

/** Site FAQ. Pricing and terms first, then shared process and page questions. */
export const faqsPage = {
  title: "Frequently asked questions",
  intro:
    "Member price, prescription price, first month and ongoing rates, renewals, cancellation, and what happens if treatment is not prescribed.",
  pricing: {
    title: "Pricing and terms",
    paragraphs: [PDP_CARE_TERMS.memberDefined, PDP_CARE_TERMS.commitmentIntro],
    items: PDP_CARE_FAQ,
  },
  more: {
    title: "Care and quality",
    items: [
      ...PDP_SHARED_FAQ.filter((item) => !CARE_FAQ_IDS.has(item.id)),
      ...weightLossPdp.pageFaq.items.filter(
        (item) => !PDP_SHARED_FAQ.some((shared) => shared.id === item.id),
      ),
    ],
  },
  disclaimer: PDP_DISCLAIMER,
} as const;
