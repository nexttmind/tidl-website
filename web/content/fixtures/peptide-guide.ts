/** Peptide Guide. Goal framed. Stack named. No molecule names. */

import { themeField, type ThemeId, type ThemeKind } from "@/content/brand/peptide-identity";
import {
  CATALOG_PRICE,
  catalogItemById,
  catalogItemsByKind,
  catalogVialSrc,
} from "@/content/fixtures/catalog";
import { valueFields, type ValueFieldCard } from "@/content/fixtures/value-fields";

export const PEPTIDE_GUIDE_HREF = "/guide";

export const peptideGuideCopy = {
  title: "Peptide Guide",
  viewStack: "View stack",
  viewPdp: "View",
  navPrompt: "Have questions about peptides? Open the peptide guide",
  navHint: "Have questions about peptides?",
  care: "You complete intake. A licensed physician reviews it. If prescribed, a US pharmacy fills a pre dosed stack and ships it.",
  groups: {
    treatment: "Health Goals",
    program: "Treatments",
  },
  rows: {
    notes: "Notes",
    startsAt: "Starts at",
    stack: "The stack",
    fits: "When it fits",
    care: "How care works",
    related: "Also look at",
  },
  price: CATALOG_PRICE.replace("Starting at ", ""),
} as const;

export type PeptideGuideNote = {
  chip: string;
  title: string;
};

/** Collapsed row. What the stack is for. Not an atmosphere line. */
const TAGLINE: Record<ThemeId, string> = {
  "mens-health":
    "A stack for daytime energy, lean mass, and drive in one visit",
  "sexual-health":
    "Private care for desire, function, and reliability",
  "weight-loss":
    "Physician guided GLP 1 care for appetite, pace, and lean mass",
  "womens-balance":
    "Care for energy, mood, and weight through every hormonal chapter",
  "recovery-performance":
    "A stack for soreness, tissue, and coming back between sessions",
  "skin-hair":
    "Care for hair you want to keep and skin that is more than a topical",
  executive:
    "A stack for hour ten, travel, and a calendar that does not flex",
  transformation:
    "A full reset for appetite, composition, and the months it takes",
  legacy:
    "Function and capacity as the years add up, not time on a clock",
  parents:
    "Care for the second shift after work, school runs, and bedtime",
  athlete:
    "Recovery, repair, and sleep built around a real training load",
  creative:
    "Focus and stamina for long sessions that never clock out",
  traveler:
    "A protocol that has to hold across flights, hotels, and time zones",
};

/** Expanded notes. What each part of the visit actually covers. */
const NOTES: Record<ThemeId, readonly [PeptideGuideNote, PeptideGuideNote, PeptideGuideNote]> = {
  "mens-health": [
    {
      chip: "Energy",
      title:
        "Daytime energy that currently depends on caffeine, including the afternoon drop",
    },
    {
      chip: "Strength",
      title:
        "Lean mass and training response when work in the gym no longer changes how you look or lift",
    },
    {
      chip: "Drive",
      title:
        "Focus, mood, and libido in one protocol, so they are not treated as separate problems",
    },
  ],
  "sexual-health": [
    {
      chip: "Desire",
      title: "Interest and drive, not only whether function is present",
    },
    {
      chip: "Function",
      title: "Reliability when you want to be sexual, reviewed as a clinical visit",
    },
    {
      chip: "Privacy",
      title: "A physician review in private. Not a waiting room product",
    },
  ],
  "weight-loss": [
    {
      chip: "Appetite",
      title: "Hunger and food noise that currently occupy most of the day",
    },
    {
      chip: "Pace",
      title: "A rate of loss a physician is willing to stand behind, not a crash diet",
    },
    {
      chip: "Muscle",
      title: "The brief includes lean mass, not only the number on the scale",
    },
  ],
  "womens-balance": [
    {
      chip: "Energy",
      title:
        "Fatigue and mood changes that get called normal, including around cycle, perimenopause, and menopause",
    },
    {
      chip: "Metabolic",
      title:
        "Weight that stopped responding to diet and training that used to work",
    },
    {
      chip: "Desire",
      title: "Intimacy and drive as physiology shifts, not an afterthought",
    },
  ],
  "recovery-performance": [
    {
      chip: "Recovery",
      title:
        "The days between hard sessions, when soreness still decides what you can do",
    },
    {
      chip: "Repair",
      title:
        "Tendons, joints, and connective tissue that take load and come back slowly",
    },
    {
      chip: "Mobility",
      title: "Moving well, rather than building a training week around what still hurts",
    },
  ],
  "skin-hair": [
    {
      chip: "Hair",
      title: "Thinning or shedding while there is still hair to keep",
    },
    {
      chip: "Skin",
      title: "Firmness and texture that a topical routine does not reach",
    },
    {
      chip: "Tone",
      title: "Changes in the face and hairline you notice in every photo",
    },
  ],
  executive: [
    {
      chip: "Stamina",
      title: "Output from morning through hour ten, not only the first half of the day",
    },
    {
      chip: "Composition",
      title:
        "Body composition under travel, dinners, and a schedule you cannot pause for the gym",
    },
    {
      chip: "Focus",
      title: "Clear decisions across a long day, without a stimulant crash at the end",
    },
  ],
  transformation: [
    {
      chip: "Appetite",
      title: "Food noise and hunger through a multi month reset, not a two week cut",
    },
    {
      chip: "Composition",
      title: "Fat and lean mass in the same protocol, so the scale is not the only brief",
    },
    {
      chip: "Guidance",
      title: "A physician adjusting the plan as the months accumulate",
    },
  ],
  legacy: [
    {
      chip: "Metabolic",
      title: "Fuel, composition, and drift that does not announce itself year to year",
    },
    {
      chip: "Capacity",
      title: "Strength and recovery you still want to use later, not only time on a clock",
    },
    {
      chip: "Baseline",
      title: "A physician reading your labs, not a protocol built for an average",
    },
  ],
  parents: [
    {
      chip: "Energy",
      title: "The second shift after work, school runs, and bedtime",
    },
    {
      chip: "Sleep",
      title: "Rest when more hours of sleep are not available",
    },
    {
      chip: "Stress",
      title: "The physiological load of running a household, not absorbing it",
    },
  ],
  athlete: [
    {
      chip: "Recovery",
      title:
        "Turnaround between sessions so training load can stay productive",
    },
    {
      chip: "Repair",
      title: "Tendon, ligament, muscle, and connective tissue under repeated load",
    },
    {
      chip: "Sleep",
      title: "Nights that have to absorb training, not only rest from a desk day",
    },
  ],
  creative: [
    {
      chip: "Focus",
      title: "Sustained attention for long sessions, without a spike and crash",
    },
    {
      chip: "Sleep",
      title: "Wind down after late work when the job will not protect rest",
    },
    {
      chip: "Stress",
      title: "The body load of chronic deadline pressure, treated as physiology",
    },
  ],
  traveler: [
    {
      chip: "Rhythm",
      title: "Time zones, red eyes, and the day after a flight when work does not wait",
    },
    {
      chip: "Recovery",
      title: "Training and sleep that keep getting interrupted by travel",
    },
    {
      chip: "Continuity",
      title: "A pre dosed protocol that does not pause when you leave home",
    },
  ],
};

/** Expanded summary. What this category is, distinct from the others. */
const STACK: Record<ThemeId, string> = {
  "mens-health":
    "A health goal for men whose energy, body composition, and drive have slipped together. The visit covers daytime energy, lean mass, and libido as one protocol. Available if prescribed after clinical review.",
  "sexual-health":
    "A health goal when intimacy is the reason for the visit. Desire and reliability, reviewed in private by a physician. Available if prescribed after clinical review.",
  "weight-loss":
    "A health goal when hunger is the main work of the day. Physician guided GLP 1 care with a pace the clinician sets, and lean mass written into the brief. Available if prescribed after clinical review.",
  "womens-balance":
    "A health goal for energy, mood, weight, and desire as physiology shifts across cycle, perimenopause, and menopause. Available if prescribed after clinical review.",
  "recovery-performance":
    "A health goal for tissue, soreness, and mobility when the gap is not another training plan. The visit is the days between sessions. Available if prescribed after clinical review.",
  "skin-hair":
    "A health goal for thinning hair and for skin quality that a cream does not reach. Built to act while there is still hair to keep. Available if prescribed after clinical review.",
  executive:
    "A treatment for a calendar that does not flex. Travel, dinners, and hour ten are the default, so stamina, composition, and focus sit in the same stack. Available if prescribed after clinical review.",
  transformation:
    "A treatment for a multi month reset of appetite and composition, not a short cut. Physician guided GLP 1 care with the months and the muscle in the same protocol. Available if prescribed after clinical review.",
  legacy:
    "A treatment for the next decade of function, not a season of training or a weight target. Metabolic markers, capacity, and a physician reading your numbers. Available if prescribed after clinical review.",
  parents:
    "A treatment that assumes interrupted sleep and a second shift. School runs and bedtime are the constraints, not a perfect training week. Available if prescribed after clinical review.",
  athlete:
    "A treatment for people who already train hard. The gap is recovery, tissue, and sleep around that load, reviewed by a physician. Available if prescribed after clinical review.",
  creative:
    "A treatment for long sessions and late hours. Focus, wind down, and the physiological load of chronic pressure sit in one stack. Available if prescribed after clinical review.",
  traveler:
    "A pre dosed treatment for weeks of flights, hotels, and time zones. Rhythm, recovery, and a protocol that travels with you. Available if prescribed after clinical review.",
};

/** When this category is the right one to open. */
const FITS: Record<ThemeId, string> = {
  "mens-health":
    "If mornings start on caffeine, training no longer changes your body, and focus, mood, or libido feel like they belong in the same visit.",
  "sexual-health":
    "If intimacy is why you are here, and you want desire and reliability reviewed in private rather than folded into a general energy visit.",
  "weight-loss":
    "If hunger is running the day, and you want a physician to set the pace and keep lean mass in the brief.",
  "womens-balance":
    "If energy, mood, weight, or desire shifted with a hormonal chapter, including perimenopause and menopause.",
  "recovery-performance":
    "If soreness still decides the calendar, and you want tissue and mobility care rather than another block of training.",
  "skin-hair":
    "If hair is thinning or skin quality is more than a topical can address, and you still have something to keep.",
  executive:
    "If the calendar does not move, travel and dinners are default, and hour ten is still the job.",
  transformation:
    "If you want a months long reset of appetite and how you carry yourself, with a physician in the protocol, not a two week push.",
  legacy:
    "If the brief is function over the next decade, not a race, a cut, or a single symptom.",
  parents:
    "If sleep is interrupted, the second shift is real, and the protocol has to fit school runs and bedtime.",
  athlete:
    "If you already train hard and the gap is what happens between sessions: tissue, sleep, and turnaround.",
  creative:
    "If the work is long sessions and late hours, and focus, sleep, and stress belong in the same stack.",
  traveler:
    "If weeks are flights, hotels, and time zones, and the protocol has to hold when home is not the room.",
};

const RELATED: Record<ThemeId, readonly ThemeId[]> = {
  "weight-loss": ["transformation", "mens-health", "womens-balance"],
  "sexual-health": ["mens-health", "womens-balance", "parents"],
  "mens-health": ["sexual-health", "executive", "athlete"],
  "womens-balance": ["parents", "skin-hair", "transformation"],
  "recovery-performance": ["athlete", "traveler", "executive"],
  "skin-hair": ["womens-balance", "legacy", "creative"],
  executive: ["traveler", "transformation", "mens-health"],
  athlete: ["recovery-performance", "transformation", "traveler"],
  transformation: ["weight-loss", "athlete", "executive"],
  parents: ["womens-balance", "executive", "traveler"],
  creative: ["executive", "parents", "skin-hair"],
  legacy: ["executive", "athlete", "transformation"],
  traveler: ["executive", "athlete", "parents"],
};

export type PeptideGuideRelated = {
  id: ThemeId;
  label: string;
  href: string;
};

export type PeptideGuideEntry = {
  id: ThemeId;
  kind: ThemeKind;
  name: string;
  tagline: string;
  href: string;
  vialSrc: string;
  notes: readonly PeptideGuideNote[];
  stack: string;
  mood: string;
  related: readonly PeptideGuideRelated[];
};

function relatedFor(id: ThemeId): PeptideGuideRelated[] {
  return RELATED[id].flatMap((relatedId) => {
    const item = catalogItemById(relatedId);
    if (!item) return [];
    return [{ id: relatedId, label: item.pill, href: item.href }];
  });
}

function toEntry(item: ValueFieldCard): PeptideGuideEntry {
  const field = themeField(item.id);
  return {
    id: item.id,
    kind: field.kind,
    name: item.pill,
    tagline: TAGLINE[item.id],
    href: item.href,
    vialSrc: catalogVialSrc(item.id),
    notes: NOTES[item.id],
    stack: STACK[item.id],
    mood: FITS[item.id],
    related: relatedFor(item.id),
  };
}

/** Health goals, then treatments. Traveler stays in the guide. */
export function peptideGuideEntries(): PeptideGuideEntry[] {
  const healthGoals = catalogItemsByKind("treatment").map(toEntry);
  const treatments = catalogItemsByKind("program").map(toEntry);
  const traveler = valueFields.items.find((item) => item.id === "traveler");
  if (traveler && !treatments.some((entry) => entry.id === "traveler")) {
    treatments.push(toEntry(traveler));
  }
  return [...healthGoals, ...treatments];
}
