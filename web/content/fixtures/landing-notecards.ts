/** Landing glass notecards. Products, bundles, then treatments. */

import { catalogHref } from "@/content/catalog/routes";

export type LandingNote = {
  chip: string;
  title: string;
};

export type LandingNotecard = {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
  href: string;
  iconSrc: string;
  fieldSrc: string;
  notes: readonly [LandingNote, LandingNote, LandingNote];
  cta: string;
  footnote: string | null;
};

const ICON = "/landing/section-2/icons/cross.svg";
const LINE = "Available if prescribed after clinical review.";

function field(id: string) {
  return `/landing/nav/fields/${id}.jpg`;
}

function card(
  id: string,
  eyebrow: string,
  headline: string,
  body: string,
  notes: readonly [LandingNote, LandingNote, LandingNote],
  cta: string,
  footnote: string | null = LINE,
  artId = id,
): LandingNotecard {
  return {
    id,
    eyebrow,
    headline,
    body,
    href: catalogHref(id),
    iconSrc: ICON,
    fieldSrc: field(artId),
    notes,
    cta,
    footnote,
  };
}

export const landingNotecards: readonly LandingNotecard[] = [
  card(
    "tirzepatide",
    "Tirzepatide",
    "Get your appetite in check",
    "Our strongest GLP 1, taken once a week, with your dose adjusted as you go.",
    [
      { chip: "Control", title: "Feel full sooner" },
      { chip: "Momentum", title: "Easy to stick with" },
      { chip: "Lean muscle", title: "Keep your strength" },
    ],
    "Shop Tirzepatide",
  ),
  card(
    "semaglutide",
    "Semaglutide",
    "Eat on your terms",
    "A simple place to start with GLP 1s, whether it's your first time or you're switching over.",
    [
      { chip: "Control", title: "Less food noise" },
      { chip: "Consistency", title: "Same day every week" },
      { chip: "Confidence", title: "Comfortable in your skin" },
    ],
    "Shop Semaglutide",
  ),
  card(
    "b12",
    "B12",
    "Feel more awake",
    "A B12 shot for steady energy, without the jitters of another coffee.",
    [
      { chip: "Energy", title: "Get up and go" },
      { chip: "Endurance", title: "Going strong all day" },
      { chip: "Spark", title: "Up for anything" },
    ],
    "Shop B12",
  ),
  card(
    "lipo-c",
    "Lipo C",
    "Get past the plateau",
    "Nutrients that support your liver and how your body handles fat, all in one shot.",
    [
      { chip: "Metabolism", title: "Extra support while you lose" },
      { chip: "Energy", title: "A lift through the week" },
      { chip: "Momentum", title: "Keep the progress coming" },
    ],
    "Shop Lipo C",
  ),
  card(
    "methylene-blue",
    "Methylene Blue",
    "Lock in",
    "A pill for clearer thinking on long days, with no stimulant crash after.",
    [
      { chip: "Focus", title: "Stay on task" },
      { chip: "Clarity", title: "Sharper afternoons" },
      { chip: "Energy", title: "Steady all day" },
    ],
    "Shop Methylene Blue",
  ),
  card(
    "sermorelin",
    "Sermorelin",
    "Sleep deeper",
    "Supports your body's overnight repair work.",
    [
      { chip: "Sleep", title: "Fewer 3am wake ups" },
      { chip: "Recovery", title: "Bounce back faster" },
      { chip: "Better mornings", title: "Rested and clear headed" },
    ],
    "Shop Sermorelin",
  ),
  card(
    "tesamorelin",
    "Tesamorelin",
    "Look as fit as you are",
    "Made for people who already train, to support lean muscle and body composition.",
    [
      { chip: "Definition", title: "Show the work" },
      { chip: "Lean muscle", title: "Keep what you've earned" },
      { chip: "Strength", title: "Power that lasts" },
    ],
    "Shop Tesamorelin",
  ),
  card(
    "at-home-lab",
    "MD Reviewed Blood Test",
    "Know where you stand",
    "Collect at home and see your results in the portal within 72 hours. No lab visit needed.",
    [
      { chip: "Answers", title: "The full picture" },
      { chip: "Baseline", title: "A clear starting point" },
      { chip: "Progress", title: "Track what changes" },
    ],
    "Shop MD Reviewed Blood Test",
    null,
  ),
  card(
    "head-start",
    "Head Start",
    "Make month one count",
    "Semaglutide, Lipo C and B12 together, so appetite and energy are covered from the start.",
    [
      { chip: "Momentum", title: "Early wins" },
      { chip: "Habits", title: "Routines that stick" },
      { chip: "Energy", title: "Feel good while you eat less" },
    ],
    "Shop Head Start",
    LINE,
    "fast-start",
  ),
  card(
    "rest-rise",
    "Rest & Rise",
    "Better nights, better days",
    "Sermorelin for deeper sleep and B12 for energy the next day.",
    [
      { chip: "Deep sleep", title: "Out cold till morning" },
      { chip: "Recovery", title: "Wake up refreshed" },
      { chip: "Energy", title: "Get more done" },
    ],
    "Shop Rest & Rise",
  ),
  card(
    "energy-lift",
    "Energy Lift",
    "Power through busy weeks",
    "More energy for the days that ask a lot of you, from B12 and Lipo C in one bundle.",
    [
      { chip: "Energy", title: "Up early, going late" },
      { chip: "Stamina", title: "Past the afternoon dip" },
      { chip: "Focus", title: "Clear head all day" },
    ],
    "Shop Energy Lift",
  ),
  card(
    "body-composition",
    "Body Composition",
    "Get lean, stay strong",
    "Works on appetite and body composition together, with an eye on healthy aging.",
    [
      { chip: "Lean muscle", title: "A toned build" },
      { chip: "Strength", title: "Still lifting heavy" },
      { chip: "Vitality", title: "Healthy for years to come" },
    ],
    "Shop Body Composition",
  ),
  card(
    "complete-stack",
    "Complete Stack",
    "Fire on all cylinders",
    "Our most complete treatment, for full days when you want to be at your best from start to finish.",
    [
      { chip: "Energy", title: "Plenty left at 6pm" },
      { chip: "Recovery", title: "Fresh every morning" },
      { chip: "Metabolism", title: "Stay on track anywhere" },
    ],
    "Shop Complete Stack",
  ),
  card(
    "lean-cut",
    "Lean & Cut",
    "Lose the fat, keep the muscle",
    "You've put in the gym time. This is about finally seeing the results.",
    [
      { chip: "Muscle", title: "Hold on to your gains" },
      { chip: "Definition", title: "See it in the mirror" },
      { chip: "Edge", title: "Stay lean after the cut" },
    ],
    "Shop Lean & Cut",
  ),
  card(
    "sexual-health",
    "Sexual Health",
    "Have better sex",
    "A private treatment for men and women, focused on desire and arousal.",
    [
      { chip: "Desire", title: "Want it more often" },
      { chip: "Performance", title: "Ready when you are" },
      { chip: "Confidence", title: "Enjoy it without worrying" },
    ],
    "Shop Sexual Health",
  ),
  card(
    "weight-loss",
    "Weight Loss",
    "Quiet the hunger",
    "A weekly GLP 1 that turns your appetite down, so you can eat less without white knuckling it. Your dose is adjusted as you go.",
    [
      { chip: "Control", title: "Fewer cravings" },
      { chip: "Progress", title: "A pace you can keep" },
      { chip: "Confidence", title: "Like how your clothes fit" },
    ],
    "Shop Weight Loss",
  ),
  card(
    "appetite-balance",
    "Appetite Balance",
    "Make peace with food",
    "A treatment for appetite and body composition, meant to run for several months.",
    [
      { chip: "Balance", title: "Eat without overthinking it" },
      { chip: "Shape", title: "Firmer all over" },
      { chip: "Consistency", title: "Easy to stay with" },
    ],
    "Shop Appetite Balance",
  ),
  card(
    "mens-peak-performance",
    "Men's Peak Performance",
    "Stay strong, keep your edge",
    "Energy, strength and drive in one treatment, for guys who want to feel like themselves again.",
    [
      { chip: "Energy", title: "Steady from morning to night" },
      { chip: "Strength", title: "More from every workout" },
      { chip: "Drive", title: "Your focus and libido back" },
    ],
    "Shop Men's Peak Performance",
  ),
  card(
    "repair-mobility",
    "Repair & Mobility",
    "Recover fast, stay flexible",
    "For joints, tendons and soft tissue that take a beating from training.",
    [
      { chip: "Recover", title: "Back out there faster" },
      { chip: "Flexibility", title: "Full range of motion" },
      { chip: "Strength", title: "Do what you love" },
    ],
    "Shop Repair & Mobility",
  ),
  card(
    "rest-rebuild",
    "Rest & Rebuild",
    "Revitalize to show up ready",
    "Hard training breaks you down. This helps your body keep up.",
    [
      { chip: "Sleep", title: "Solid, uninterrupted nights" },
      { chip: "Recovery", title: "Quick turnarounds" },
      { chip: "Readiness", title: "Good to go every session" },
    ],
    "Shop Rest & Rebuild",
  ),
  card(
    "longevity",
    "Longevity",
    "Live longer and live better",
    "Care built around your own labs, for staying strong, sharp and independent as the years go by.",
    [
      { chip: "Health", title: "Catch changes early" },
      { chip: "Strength", title: "Stay capable as you age" },
      { chip: "Years", title: "More good years" },
    ],
    "Shop Longevity",
  ),
  card(
    "focus",
    "Focus",
    "Stay sharp and focused",
    "Memory and mental clarity support, for long days of work that need your full attention.",
    [
      { chip: "Sharpness", title: "Think faster on your feet" },
      { chip: "Clarity", title: "Hold more in your head" },
      { chip: "Acuity", title: "Switch off at night" },
    ],
    "Shop Focus",
  ),
  card(
    "stress-mood",
    "Stress & Mood",
    "Be calm and in control",
    "Busy at work and busier at home? This covers mood, stress and sleep.",
    [
      { chip: "Calm", title: "Patience that lasts" },
      { chip: "Sleep", title: "Easier nights" },
      { chip: "Balance", title: "On top of your day" },
    ],
    "Shop Stress & Mood",
  ),
  card(
    "womens-total-balance",
    "Women's Total Balance",
    "Rediscover energy and balance",
    "Hormone aware care for mood, cycle and skin, through every stage of life.",
    [
      { chip: "Energy", title: "Awake through the afternoon" },
      { chip: "Balance", title: "Steadier days" },
      { chip: "Glow", title: "Skin that looks rested" },
    ],
    "Shop Women's Total Balance",
  ),
  card(
    "hair-skin-nails",
    "Hair, Skin & Nails",
    "Glowing skin and hair",
    "Support from the inside, to go with whatever skincare you already use.",
    [
      { chip: "Thick hair", title: "Fuller looking" },
      { chip: "Glowing skin", title: "A brighter complexion" },
      { chip: "Strong nails", title: "Grow them out" },
    ],
    "Shop Hair, Skin & Nails",
  ),
  card(
    "pain-relief",
    "Pain Relief",
    "Get relief where it hurts",
    "Cooling and warming sprays and creams for sore muscles and stiff joints.",
    [
      { chip: "Relief", title: "Feel better fast" },
      { chip: "Recovery", title: "Back to training sooner" },
      { chip: "Mobility", title: "Move more comfortably" },
    ],
    "Shop Pain Relief",
    null,
  ),
];
