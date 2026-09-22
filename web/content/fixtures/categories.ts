/** Program Section data — lifestyle programs for the home notecard stage */

export type CategorySlug =
  | "executive"
  | "athlete"
  | "transformation"
  | "parents"
  | "creative"
  | "legacy"
  | "traveler";

export type ProtocolBenefit = {
  label: string;
  description: string;
};

export type StackCategory = {
  slug: CategorySlug;
  titlePrimary: string;
  titleFaded: string;
  body?: string;
  cta: { label: string; href: string };
  chips: readonly string[];
  thumbLabel: string;
  heroSrc: string;
  /** Optional looping hero video. Poster stays on heroSrc. */
  heroVideo?: string;
  protocol: readonly ProtocolBenefit[];
};

export const stackCategories: readonly StackCategory[] = [
  {
    slug: "executive",
    titlePrimary: "Find peak",
    titleFaded: "performance",
    cta: { label: "Shop Peak Performance Treatments", href: "/programs/ceos-and-executives" },
    chips: ["executives", "attorneys", "entrepreneurs", "investors"],
    thumbLabel: "Peak Performance",
    heroSrc: "/landing/hero/ceos-and-executives.jpg?v=7",
    heroVideo: "/landing/hero/ceos-and-executives.mp4?v=7",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Targets the visceral fat that builds through working late.",
      },
      {
        label: "body repair",
        description:
          "Addresses the joint and connective tissue load of a sedentary, high travel schedule.",
      },
      {
        label: "mental health",
        description:
          "Supports focus, memory, and stress tolerance across a long day, with no stimulant load.",
      },
      {
        label: "sleep",
        description:
          "Supports restorative rest by deepening recovery phases.",
      },
      {
        label: "longevity",
        description:
          "Supports cardiometabolic and cognitive markers that shape the quality of the next decade.",
      },
    ],
  },
  {
    slug: "athlete",
    titlePrimary: "Train",
    titleFaded: "harder",
    cta: { label: "Shop Dynamic Training Treatments", href: "/programs/athletes" },
    chips: ["athletes", "recovery", "performance", "injury prevention"],
    thumbLabel: "Dynamic Training",
    heroSrc: "/landing/hero/athletes.jpg?v=1",
    heroVideo: "/landing/hero/athletes.mp4?v=1",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Partitions fuel toward lean tissue without suppressing appetite, so you can eat to train.",
      },
      {
        label: "body repair",
        description:
          "Supports tendon, ligament, muscle, and gut recovery so training load stays productive.",
      },
      {
        label: "mental health",
        description:
          "Supports focus and mood stability under heavy physical stress.",
      },
      {
        label: "sleep",
        description:
          "Deepens adaptation phases so today's work becomes next week's capacity.",
      },
      {
        label: "longevity",
        description:
          "Supports mitochondrial function under high oxidative load.",
      },
    ],
  },
  {
    slug: "transformation",
    titlePrimary: "Time to",
    titleFaded: "transform",
    cta: {
      label: "Shop Appetite Balance Treatments",
      href: "/stacks/transformation",
    },
    chips: ["life reset", "confidence", "body composition"],
    thumbLabel: "Appetite Balance",
    heroSrc: "/landing/hero/transformation.jpg?v=5",
    heroVideo: "/landing/hero/transformation.mp4?v=5",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Supports appetite and blood sugar so daily decisions take less willpower.",
      },
      {
        label: "body repair",
        description:
          "Protects lean muscle through the deficit, so what you keep is strength.",
      },
      {
        label: "mental health",
        description:
          "Supports mood and focus through the months when motivation fades.",
      },
      {
        label: "sleep",
        description: "Supports sleep depth that steadies hunger signaling.",
      },
      {
        label: "longevity",
        description:
          "Supports metabolic flexibility so you come out of the deficit more capable.",
      },
    ],
  },
  {
    slug: "parents",
    titlePrimary: "Create",
    titleFaded: "balance",
    cta: { label: "Shop Stress & Mood Treatments", href: "/programs/parents" },
    chips: ["energy", "stress resilience"],
    thumbLabel: "Stress & Mood",
    heroSrc: "/landing/hero/parents.jpg?v=1",
    heroVideo: "/landing/hero/parents.mp4?v=1",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Supports steady energy across interrupted days and late nights.",
      },
      {
        label: "body repair",
        description:
          "Supports recovery when sleep and training are both imperfect.",
      },
      {
        label: "mental health",
        description: "Supports calm focus under the load of work and family.",
      },
      {
        label: "sleep",
        description: "Supports deeper rest in the windows you actually get.",
      },
      {
        label: "longevity",
        description:
          "Supports the markers that keep you present for the decades ahead.",
      },
    ],
  },
  {
    slug: "creative",
    titlePrimary: "Find your",
    titleFaded: "focus",
    cta: {
      label: "Shop Focus Treatments",
      href: "/programs/creators-and-builders",
    },
    chips: ["creativity", "deep work", "productivity"],
    thumbLabel: "Focus",
    heroSrc: "/landing/hero/creators-and-builders.jpg?v=2",
    heroVideo: "/landing/hero/creators-and-builders.mp4?v=2",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Supports stable energy for long creative sessions without a crash.",
      },
      {
        label: "body repair",
        description:
          "Supports posture and connective tissue under desk-heavy days.",
      },
      {
        label: "mental health",
        description:
          "Supports clarity and creative stamina without stimulant load.",
      },
      {
        label: "sleep",
        description:
          "Supports wind-down after late work so tomorrow opens clean.",
      },
      {
        label: "longevity",
        description:
          "Supports cognitive markers that keep deep work sustainable.",
      },
    ],
  },
  {
    slug: "legacy",
    titlePrimary: "Build your",
    titleFaded: "legacy",
    cta: { label: "Shop Healthspan Treatments", href: "/programs/healthspan" },
    chips: ["healthspan", "prevention", "longevity"],
    thumbLabel: "Healthspan",
    heroSrc: "/landing/hero/healthspan.jpg?v=1",
    heroVideo: "/landing/hero/healthspan.mp4?v=1",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Supports metabolic markers that compound over decades.",
      },
      {
        label: "body repair",
        description:
          "Supports joint and tissue resilience for an active later life.",
      },
      {
        label: "mental health",
        description:
          "Supports cognitive clarity and mood as the years accumulate.",
      },
      {
        label: "sleep",
        description:
          "Supports restorative sleep that protects long-term healthspan.",
      },
      {
        label: "longevity",
        description:
          "Supports the systems that decide how those years feel.",
      },
    ],
  },
  {
    slug: "traveler",
    titlePrimary: "Arrive",
    titleFaded: "ready",
    cta: { label: "Shop Jetlag Recovery Treatments", href: "/programs/travelers" },
    chips: ["jet lag", "time zones", "travel days", "recovery"],
    thumbLabel: "Jetlag Recovery",
    heroSrc: "/landing/hero/travelers.jpg?v=1",
    heroVideo: "/landing/hero/travelers.mp4?v=1",
    protocol: [
      {
        label: "metabolic health",
        description:
          "Supports steady energy across long haul days and irregular meals.",
      },
      {
        label: "body repair",
        description:
          "Supports recovery when training and movement get interrupted by travel.",
      },
      {
        label: "mental health",
        description:
          "Supports focus and composure after red-eyes and packed calendars.",
      },
      {
        label: "sleep",
        description:
          "Supports restorative rest when time zones shift your night.",
      },
      {
        label: "longevity",
        description:
          "Supports the systems that take the wear of frequent flying.",
      },
    ],
  },
] as const;
