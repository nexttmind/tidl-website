import { weightLossPdp } from "@/content/fixtures/weight-loss-pdp";
import {
  PDP_CARE_FAQ,
  PDP_CARE_TERMS,
  PDP_PAY_LINE,
  PDP_PLAN_LABEL,
  PDP_PLAN_OPTIONS,
  PDP_SHARED_FAQ,
  PDP_TRUST,
} from "@/content/pdp/pricing";

export {
  PDP_CARE_FAQ,
  PDP_CARE_TERMS,
  PDP_PAY_LINE,
  PDP_PLAN_LABEL,
  PDP_PLAN_OPTIONS,
  PDP_SHARED_FAQ,
  PDP_TRUST,
};

export const PDP_PROMO = weightLossPdp.promo;
export const PDP_DISCLAIMER = weightLossPdp.disclaimer;
export const PDP_SAFETY = weightLossPdp.safetyLink;
export const PDP_SOCIAL = weightLossPdp.social;

export const PDP_QUALITY_TITLE = ["Always quality tested,", "batch by batch"] as const;

export const PDP_QUALITY_BODY = [
  "Your plan ships from a state licensed pharmacy in our network when prescribed.",
  "Every batch is tested in chemistry and microbiology labs at the pharmacy facility against defined parameters.",
] as const;

export const PDP_QUALITY_METRICS = weightLossPdp.quality.metrics;

export const PDP_CARE_STAGES = [
  {
    marker: "Day one",
    title: "Share your history",
    body: "Complete a medical intake from wherever you are. Cover current care, goals, and anything a clinician should know before they review.",
  },
  {
    marker: "Review",
    title: "A clinician decides",
    body: "A licensed physician reads your answers. They may prescribe, request a visit, or decline. Nothing ships without that review.",
  },
  {
    marker: "If prescribed",
    title: "Your plan ships",
    body: "A US based compounding pharmacy fills the plan. Supplies and instructions arrive with it. Care stays in the portal after that.",
  },
  {
    marker: "Ongoing",
    title: "Write when you need to",
    later: true,
    body: "Follow up through the portal. Your clinician can hold, adjust, or stop the plan. Pace follows how you feel, if prescribed.",
  },
] as const;

export const PDP_PROOF_THUMB = {
  quote: "The intake was clear and shipping was fast.",
  stars: 5,
} as const;
