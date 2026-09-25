/**
 * Ops-owned map: merchandising entry → PrescribeRx encounter type.
 * IDs are demo sandbox UUIDs. Replace with TIDL tenant IDs at cutover.
 * Consumer surfaces stay goal framed; this module is server/client shared config.
 */

export type EntryKind = "treatment" | "program" | "stack" | "general";

export type ClinicalEntry = {
  slug: string;
  kind: EntryKind;
  label: string;
  /** Short line for the brand panel. Goal framed. */
  purpose: string;
  /** Merchandising page that launched this intake */
  sourceHref: string;
  /** Poster / still for the intake media panel */
  brandImage: string;
  /** Optional looping video for the floating media panel */
  brandVideo?: string;
  /** Optional playlist; plays in order and loops the sequence */
  brandVideos?: readonly string[];
  /** Optional explicit poster when brandImage is a different asset */
  brandPoster?: string;
  /** PrescribeRx encounter type UUID */
  encounterTypeId: string;
  /** PrescribeRx slug (debug / fallback lookup) */
  encounterTypeSlug: string;
  /** Whether this path typically needs a live visit after review */
  visitGateDefault: boolean;
};

/**
 * Sandbox defaults from demo.prescribe-rx.com telehealth encounter types.
 * Weight / transformation → GLP 1 screening
 * Men's health → male TRT
 * Women's health → female HRT
 * Sexual health → men's sexual health ED assessment
 * Recovery / skin / peptide-leaning → peptide assessment
 * Programs without a tighter match → universal encounter
 * Open symptoms / find care → universal encounter (multi pathway)
 *
 * Phase 1 verified 2026-09-22 against live token: every encounterTypeId below
 * returns 200 on GET .../encounter-types/{id}/schema. Visit-gated entries use
 * sandbox `quick-video-visit` (019f11f4-69a6-72d7-8e63-2c1f0fee3c4a) because
 * male-trt-consult / female-hrt are not in the playground token's available
 * types (intake 422). Restore tenant TRT/HRT IDs at cutover.
 */

/** Open symptom path: no care protocol or health goal preselected. */
export const SYMPTOMS_ENTRY_SLUG = "symptoms";

/** Catch-all clinical CTA. Peer pattern: Hims "See what's right for me". */
export const SYMPTOMS_CTA_LABEL = "See what's right for you";

export const CLINICAL_ENTRIES: readonly ClinicalEntry[] = [
  {
    slug: SYMPTOMS_ENTRY_SLUG,
    kind: "general",
    label: SYMPTOMS_CTA_LABEL,
    purpose:
      "Share what you are feeling. A licensed provider recommends the care path that fits.",
    sourceHref: "/",
    brandImage: "/landing/hero/womens-balance.jpg?v=3",
    brandVideo: "/landing/hero/womens-balance.mp4?v=3",
    brandVideos: [
      "/landing/hero/womens-balance.mp4?v=3",
      "/landing/hero/weight-loss.mp4",
      "/landing/hero/transformation.mp4?v=5",
    ],
    brandPoster: "/landing/hero/womens-balance.jpg?v=3",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
  {
    slug: "weight-loss",
    kind: "treatment",
    label: "Weight Loss",
    purpose: "Quiet food noise. Build a plan a clinician can stand behind.",
    sourceHref: "/treatments/weight-loss",
    brandImage: "/landing/hero/weight-loss.jpg",
    brandVideo: "/landing/hero/weight-loss.mp4",
    brandPoster: "/landing/hero/weight-loss.jpg",
    encounterTypeId: "019ce396-46a1-73ab-87d6-c40310555401",
    encounterTypeSlug: "glp-1-screening",
    visitGateDefault: false,
  },
  {
    slug: "transformation",
    kind: "stack",
    label: "Appetite Balance",
    purpose: "A full reset for mind, body, and the days between.",
    sourceHref: "/stacks/transformation",
    brandImage: "/landing/hero/transformation.jpg?v=5",
    brandVideo: "/landing/hero/transformation.mp4?v=5",
    brandPoster: "/landing/hero/transformation.jpg?v=5",
    encounterTypeId: "019ce396-46a1-73ab-87d6-c40310555401",
    encounterTypeSlug: "glp-1-screening",
    visitGateDefault: false,
  },
  {
    slug: "testosterone",
    kind: "treatment",
    label: "Energy & Strength",
    purpose: "Energy, drive, and recovery reviewed with a licensed clinician.",
    sourceHref: "/treatments/mens-health",
    brandImage: "/landing/hero/mens-health.jpg?v=3",
    brandVideo: "/landing/hero/mens-health.mp4?v=3",
    brandPoster: "/landing/hero/mens-health.jpg?v=3",
    encounterTypeId: "019f11f4-69a6-72d7-8e63-2c1f0fee3c4a",
    encounterTypeSlug: "quick-video-visit",
    visitGateDefault: true,
  },
  {
    slug: "womens-balance",
    kind: "treatment",
    label: "Balance & Beauty",
    purpose: "Support across hormonal shifts, guided by your clinician.",
    sourceHref: "/treatments/womens-balance",
    brandImage: "/landing/hero/womens-balance.jpg?v=3",
    brandVideo: "/landing/hero/womens-balance.mp4?v=3",
    brandPoster: "/landing/hero/womens-balance.jpg?v=3",
    encounterTypeId: "019f11f4-69a6-72d7-8e63-2c1f0fee3c4a",
    encounterTypeSlug: "quick-video-visit",
    visitGateDefault: true,
  },
  {
    slug: "sexual-health",
    kind: "treatment",
    label: "Sexual Health",
    purpose: "Private care for better intimacy and confidence.",
    sourceHref: "/treatments/sexual-health",
    brandImage: "/landing/hero/sexual-health.jpg?v=2",
    brandVideo: "/landing/hero/sexual-health.mp4?v=2",
    brandPoster: "/landing/hero/sexual-health.jpg?v=2",
    encounterTypeId: "019cf5ff-116d-737b-91e0-7304d67ecaf7",
    encounterTypeSlug: "mens-sexual-health-ed-assessment",
    visitGateDefault: false,
  },
  {
    slug: "recovery-performance",
    kind: "treatment",
    label: "Recovery & Performance",
    purpose: "Protocols that help you rebound between sessions.",
    sourceHref: "/treatments/recovery-and-performance",
    brandImage: "/landing/hero/recovery-and-performance.jpg?v=2",
    brandVideo: "/landing/hero/recovery-and-performance.mp4?v=2",
    brandPoster: "/landing/hero/recovery-and-performance.jpg?v=2",
    encounterTypeId: "019d2842-2d46-723f-bba5-a0a8d36fdc0b",
    encounterTypeSlug: "peptide-assessment",
    visitGateDefault: false,
  },
  {
    slug: "skin-hair",
    kind: "treatment",
    label: "Skin & Hair",
    purpose: "Clinician guided options for clarity and density.",
    sourceHref: "/treatments/skin-and-hair",
    brandImage: "/landing/treatments/bg-skin-hair.png",
    encounterTypeId: "019d2842-2d46-723f-bba5-a0a8d36fdc0b",
    encounterTypeSlug: "peptide-assessment",
    visitGateDefault: false,
  },
  {
    slug: "executives",
    kind: "program",
    label: "Peak Performance",
    purpose: "Care built for high demand calendars and sustained output.",
    sourceHref: "/programs/ceos-and-executives",
    brandImage: "/landing/hero/ceos-and-executives.jpg?v=7",
    brandVideo: "/landing/hero/ceos-and-executives.mp4?v=7",
    brandPoster: "/landing/hero/ceos-and-executives.jpg?v=7",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
  {
    slug: "healthspan",
    kind: "program",
    label: "Healthspan",
    purpose: "Longevity minded care focused on years you feel capable.",
    sourceHref: "/programs/healthspan",
    brandImage: "/landing/hero/healthspan.jpg?v=1",
    brandVideo: "/landing/hero/healthspan.mp4?v=1",
    brandPoster: "/landing/hero/healthspan.jpg?v=1",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
  {
    slug: "parents",
    kind: "program",
    label: "Stress & Mood",
    purpose: "Care that respects sleep debt, schedules, and family life.",
    sourceHref: "/programs/parents",
    brandImage: "/landing/hero/parents.jpg?v=1",
    brandVideo: "/landing/hero/parents.mp4?v=1",
    brandPoster: "/landing/hero/parents.jpg?v=1",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
  {
    slug: "athletes",
    kind: "program",
    label: "Dynamic Training",
    purpose: "Training cycles, recovery windows, competition calendars.",
    sourceHref: "/programs/athletes",
    brandImage: "/landing/hero/athletes.jpg?v=1",
    brandVideo: "/landing/hero/athletes.mp4?v=1",
    brandPoster: "/landing/hero/athletes.jpg?v=1",
    encounterTypeId: "019d2842-2d46-723f-bba5-a0a8d36fdc0b",
    encounterTypeSlug: "peptide-assessment",
    visitGateDefault: false,
  },
  {
    slug: "creators",
    kind: "program",
    label: "Focus",
    purpose: "Focus and stamina for people who ship creative work.",
    sourceHref: "/programs/creators-and-builders",
    brandImage: "/landing/hero/creators-and-builders.jpg?v=2",
    brandVideo: "/landing/hero/creators-and-builders.mp4?v=2",
    brandPoster: "/landing/hero/creators-and-builders.jpg?v=2",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
  {
    slug: "travelers",
    kind: "program",
    label: "Jetlag Recovery",
    purpose: "Protocols that travel with you across time zones.",
    sourceHref: "/programs/travelers",
    brandImage: "/landing/hero/travelers.jpg?v=1",
    brandVideo: "/landing/hero/travelers.mp4?v=1",
    brandPoster: "/landing/hero/travelers.jpg?v=1",
    encounterTypeId: "019df619-5f51-71d0-90fc-a38d8db60163",
    encounterTypeSlug: "universal-encounter",
    visitGateDefault: false,
  },
] as const;

const DEFAULT_ENTRY: ClinicalEntry = CLINICAL_ENTRIES[0];

export function resolveClinicalEntry(slug: string | null | undefined): ClinicalEntry {
  if (!slug) return DEFAULT_ENTRY;
  const hit = CLINICAL_ENTRIES.find((e) => e.slug === slug);
  return hit ?? DEFAULT_ENTRY;
}

export function intakeHref(slug: string): string {
  return `/care/intake?entry=${encodeURIComponent(slug)}`;
}

/** Header Log In. Account wizard then continues to /care/home. */
export const ACCOUNT_LOGIN_HREF = "/care/account?mode=login";
/** Header Sign Up. Same portal, create tab. */
export const ACCOUNT_SIGNUP_HREF = "/care/account?mode=create";

export function symptomsIntakeHref(): string {
  return intakeHref(SYMPTOMS_ENTRY_SLUG);
}

export function symptomsCta(): { label: string; href: string } {
  return { label: SYMPTOMS_CTA_LABEL, href: symptomsIntakeHref() };
}
