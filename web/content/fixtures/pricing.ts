import { PDP_CARE_FAQ, PDP_CARE_TERMS } from "@/content/pdp/pricing";

export const pricingTerms = {
  title: "Pricing and terms",
  close: "Close",
  memberDefined: PDP_CARE_TERMS.memberDefined,
  commitmentIntro: PDP_CARE_TERMS.commitmentIntro,
  items: PDP_CARE_FAQ,
  disclaimer:
    "Compounded medications are not FDA approved. They are prepared by state licensed compounding pharmacies subject to regulatory oversight. Available if prescribed after clinical review.",
} as const;
