/** Treatments index copy. Shared care line carries the prescription condition. */

import { SHOP_CATALOG, formHeroSrc } from "@/components/home/shop-catalog";
import { catalogHref } from "@/content/catalog/routes";
import { CATALOG_PRICE, catalogProductSrc } from "@/content/fixtures/catalog";
import {
  painReliefPdpHref,
  painReliefProducts,
  painReliefStartsAt,
} from "@/content/fixtures/pain-relief";
import {
  formatUsd,
  launchFormsFor,
  launchLowestStartsAt,
  type LaunchForm,
} from "@/content/pdp/launch-pricing";

export const peptideGuideCopy = {
  viewStack: "View",
  viewPdp: "View",
  care: "You complete intake. A licensed physician reviews it. If prescribed, a US pharmacy fills a pre dosed treatment and ships it to you.",
  groups: {
    product: "Products",
    bundle: "Bundles",
    treatment: "Treatments",
    pain: "Pain Relief Products",
  },
  rows: {
    notes: "Good for",
    what: "What you get",
    fits: "Good fit if",
    care: "How care works",
    related: "Also look at",
    price: "Starting from",
  },
  price: CATALOG_PRICE.replace("Starting at ", ""),
} as const;

export type PeptideGuideNote = {
  chip: string;
  title: string;
};

export type PeptideGuideKind = "product" | "bundle" | "treatment" | "pain";

export type PeptideGuideRelated = {
  id: string;
  label: string;
  href: string;
};

export type PeptideGuideFormId = "vial" | "vial-pen" | "capsule";

export type PeptideGuideForm = {
  form: PeptideGuideFormId;
  label: string;
  src: string;
};

export type PeptideGuideEntry = {
  id: string;
  kind: PeptideGuideKind;
  name: string;
  tagline: string;
  href: string;
  vialSrc: string;
  notes: readonly PeptideGuideNote[];
  stack: string;
  mood: string;
  /** Null hides the care row. Omitted uses the shared line. */
  care?: string | null;
  price?: string;
  forms: readonly PeptideGuideForm[];
  soldOut?: boolean;
  related: readonly PeptideGuideRelated[];
};

const FORM_LABEL: Record<PeptideGuideFormId, string> = {
  vial: "MDV",
  "vial-pen": "TIDL Flow pen",
  capsule: "Oral tablet",
};

type GuideCopy = {
  tagline: string;
  notes: readonly [PeptideGuideNote, PeptideGuideNote, PeptideGuideNote];
  stack: string;
  fits: string;
  care?: string;
  price?: string;
};

const COPY: Readonly<Record<string, GuideCopy>> = {
  tirzepatide: {
    tagline: "Get your appetite in check",
    notes: [
      { chip: "Control", title: "Feel full sooner" },
      { chip: "Momentum", title: "Easy to stick with" },
      { chip: "Lean muscle", title: "Keep your strength" },
    ],
    stack:
      "Our strongest GLP 1, taken once a week in the TIDL Flow pen. Filled by a US pharmacy and shipped to your door, with your dose adjusted as you go.",
    fits: "You want the strongest option we offer, and you are choosing between this and semaglutide.",
  },
  semaglutide: {
    tagline: "Eat on your terms",
    notes: [
      { chip: "Control", title: "Less food noise" },
      { chip: "Consistency", title: "Same day every week" },
      { chip: "Confidence", title: "Comfortable in your skin" },
    ],
    stack:
      "A weekly GLP 1 in the TIDL Flow pen, filled by a US pharmacy and shipped to your door. Your dose can be held, stepped up or stopped as you report how you feel.",
    fits: "You are new to GLP 1s, or switching over, and you want the simpler of the two.",
  },
  b12: {
    tagline: "Feel more awake",
    notes: [
      { chip: "Energy", title: "Get up and go" },
      { chip: "Endurance", title: "Going strong all day" },
      { chip: "Spark", title: "Up for anything" },
    ],
    stack:
      "A B12 shot you can take on its own or add to any bundle or treatment. Everything you need to take it ships with it.",
    fits: "You are running on caffeine and want something steadier, or you are already on a treatment and want energy support alongside it.",
  },
  "lipo-c": {
    tagline: "Get past the plateau",
    notes: [
      { chip: "Metabolism", title: "Extra support while you lose" },
      { chip: "Energy", title: "A lift through the week" },
      { chip: "Momentum", title: "Keep the progress coming" },
    ],
    stack:
      "A shot with nutrients that support your liver and how your body handles fat. Works on its own or alongside a weight treatment.",
    fits: "You are working on weight and want extra metabolic support in the same order.",
  },
  "methylene-blue": {
    tagline: "Lock in",
    notes: [
      { chip: "Focus", title: "Stay on task" },
      { chip: "Clarity", title: "Sharper afternoons" },
      { chip: "Energy", title: "Steady all day" },
    ],
    stack:
      "A pill for clearer thinking on long days. No injection, and no stimulant crash after.",
    fits: "Your work runs long and you want something steadier than another coffee.",
  },
  sermorelin: {
    tagline: "Sleep deeper",
    notes: [
      { chip: "Sleep", title: "Fewer 3am wake ups" },
      { chip: "Recovery", title: "Bounce back faster" },
      { chip: "Better mornings", title: "Rested and clear headed" },
    ],
    stack:
      "A shot taken at night, supporting the repair work your body does while you sleep. Filled by a US pharmacy and shipped to your door.",
    fits: "You are getting the hours in and still waking up tired.",
  },
  tesamorelin: {
    tagline: "Look as fit as you are",
    notes: [
      { chip: "Definition", title: "Show the work" },
      { chip: "Lean muscle", title: "Keep what you have earned" },
      { chip: "Strength", title: "Power that lasts" },
    ],
    stack:
      "A shot that supports lean muscle and body composition, built around the training you already do.",
    fits: "You train regularly and the gap is how your body looks, not how hard you work.",
  },
  "at-home-lab": {
    tagline: "Know where you stand",
    notes: [
      { chip: "Answers", title: "The full picture" },
      { chip: "Baseline", title: "A clear starting point" },
      { chip: "Progress", title: "Track what changes" },
    ],
    stack:
      "A single use collection kit that ships to you. Collect at home, and your results land in the portal within 72 hours.",
    fits: "You want numbers before you start anything, or you want to see what has moved since you did.",
    care: "Order the kit, collect at home, and read your results in the portal within 72 hours. No prescription needed. A clinician can go through them with you if you start a treatment later.",
  },
  "rest-rise": {
    tagline: "Better nights, better days",
    notes: [
      { chip: "Deep sleep", title: "Out cold till morning" },
      { chip: "Recovery", title: "Wake up refreshed" },
      { chip: "Energy", title: "Get more done" },
    ],
    stack: "Sermorelin for the night and B12 for the day after, in one bundle.",
    fits: "Sleep is the weak link and you want the next morning to feel different.",
  },
  "head-start": {
    tagline: "Make month one count",
    notes: [
      { chip: "Momentum", title: "Early wins" },
      { chip: "Habits", title: "Routines that stick" },
      { chip: "Energy", title: "Feel good while you eat less" },
    ],
    stack:
      "Semaglutide, Lipo C and B12 in one bundle, so appetite and energy are covered from the start.",
    fits: "You want the strongest start available and you are ready to go all in from month one.",
  },
  "energy-lift": {
    tagline: "Power through busy weeks",
    notes: [
      { chip: "Energy", title: "Up early, going late" },
      { chip: "Stamina", title: "Past the afternoon dip" },
      { chip: "Focus", title: "Clear head all day" },
    ],
    stack: "B12 and Lipo C in one bundle. Either one is also available on its own.",
    fits: "You want more energy day to day and you are not looking for a weight treatment.",
  },
  "body-composition": {
    tagline: "Get lean, stay strong",
    notes: [
      { chip: "Lean muscle", title: "A toned build" },
      { chip: "Strength", title: "Still lifting heavy" },
      { chip: "Vitality", title: "Healthy for years to come" },
    ],
    stack:
      "One treatment working on appetite and body composition together, with healthy aging in mind. What goes in it is decided at your review and listed on your prescription.",
    fits: "You care more about how your body looks and performs than the number on the scale.",
  },
  "complete-stack": {
    tagline: "Fire on all cylinders",
    notes: [
      { chip: "Energy", title: "Plenty left at 6pm" },
      { chip: "Recovery", title: "Fresh every morning" },
      { chip: "Metabolism", title: "Stay on track anywhere" },
    ],
    stack:
      "Our most complete treatment, covering energy, recovery and metabolism in one review and one shipment.",
    fits: "You want everything handled at once instead of picking one area and coming back for the rest.",
  },
  "lean-cut": {
    tagline: "Lose the fat, keep the muscle",
    notes: [
      { chip: "Muscle", title: "Hold on to your gains" },
      { chip: "Definition", title: "See it in the mirror" },
      { chip: "Edge", title: "Stay lean after the cut" },
    ],
    stack:
      "A treatment focused on turning fat into muscle, built around the training you already do.",
    fits: "You already train hard and want the results to show.",
  },
  "sexual-health": {
    tagline: "Have better sex",
    notes: [
      { chip: "Desire", title: "Want it more often" },
      { chip: "Performance", title: "Ready when you are" },
      { chip: "Confidence", title: "Enjoy it without worrying" },
    ],
    stack:
      "An oral treatment for men and women, focused on desire and arousal. Reviewed privately and shipped discreetly.",
    fits: "You want desire handled and not just function, and you would rather do it online than in a waiting room.",
  },
  "weight-loss": {
    tagline: "Quiet the hunger",
    notes: [
      { chip: "Control", title: "Fewer cravings" },
      { chip: "Progress", title: "A pace you can keep" },
      { chip: "Confidence", title: "Like how your clothes fit" },
    ],
    stack:
      "A weekly GLP 1 in the TIDL Flow pen, with your dose adjusted as you go and lean muscle kept in view.",
    fits: "Hunger is the thing getting in your way and you want a steady pace rather than a crash.",
  },
  "appetite-balance": {
    tagline: "Make peace with food",
    notes: [
      { chip: "Balance", title: "Eat without overthinking it" },
      { chip: "Shape", title: "Firmer all over" },
      { chip: "Consistency", title: "Easy to stay with" },
    ],
    stack:
      "A treatment for appetite and body composition, meant to run over several months rather than a few weeks.",
    fits: "Food takes up too much space in your head and you want a longer run at settling it.",
  },
  "mens-peak-performance": {
    tagline: "Stay strong, keep your edge",
    notes: [
      { chip: "Energy", title: "Steady from morning to night" },
      { chip: "Strength", title: "More from every workout" },
      { chip: "Drive", title: "Your focus and libido back" },
    ],
    stack:
      "Energy, strength and drive covered in one treatment and one review, instead of three separate visits.",
    fits: "More than one thing has slipped at once and you want it all looked at together.",
  },
  "repair-mobility": {
    tagline: "Recover fast, stay flexible",
    notes: [
      { chip: "Recover", title: "Back out there faster" },
      { chip: "Flexibility", title: "Full range of motion" },
      { chip: "Strength", title: "Do what you love" },
    ],
    stack:
      "A treatment for joints, tendons and soft tissue, aimed at the days between the sessions that matter.",
    fits: "Soreness is deciding what you can do the next day.",
  },
  "rest-rebuild": {
    tagline: "Revitalize to show up ready",
    notes: [
      { chip: "Sleep", title: "Solid, uninterrupted nights" },
      { chip: "Recovery", title: "Quick turnarounds" },
      { chip: "Readiness", title: "Good to go every session" },
    ],
    stack:
      "A treatment for sleep and between session recovery, built around a real training load.",
    fits: "You train hard and the gap is what happens between sessions.",
  },
  "cellular-health": {
    tagline: "Feel fully charged every day",
    notes: [
      { chip: "Energy", title: "Alert from the start" },
      { chip: "Stamina", title: "Keep up with your schedule" },
      { chip: "Clarity", title: "Less brain fog" },
    ],
    stack:
      "Cellular level energy support, written for weeks of travel, late nights and early starts.",
    fits: "You are tired in a way that more sleep is not fixing.",
  },
  longevity: {
    tagline: "Live longer and live better",
    notes: [
      { chip: "Health", title: "Catch changes early" },
      { chip: "Strength", title: "Stay capable as you age" },
      { chip: "Years", title: "More good years" },
    ],
    stack: "Care built around your own labs, with your markers tracked over time.",
    fits: "You are thinking about the next decade, not the next twelve weeks.",
  },
  focus: {
    tagline: "Stay sharp and focused",
    notes: [
      { chip: "Sharpness", title: "Think faster on your feet" },
      { chip: "Clarity", title: "Hold more in your head" },
      { chip: "Acuity", title: "Switch off at night" },
    ],
    stack:
      "A treatment for memory and mental clarity, covering long days of work and winding down after.",
    fits: "Your work needs long stretches of attention and you struggle to switch off at night.",
  },
  "stress-mood": {
    tagline: "Be calm and in control",
    notes: [
      { chip: "Calm", title: "Patience that lasts" },
      { chip: "Sleep", title: "Easier nights" },
      { chip: "Balance", title: "On top of your day" },
    ],
    stack:
      "A treatment covering mood, stress and sleep, built for interrupted nights rather than a perfect routine.",
    fits: "The second shift at home starts when work ends, and there is nothing left by bedtime.",
  },
  "womens-total-balance": {
    tagline: "Rediscover energy and balance",
    notes: [
      { chip: "Energy", title: "Awake through the afternoon" },
      { chip: "Balance", title: "Steadier days" },
      { chip: "Glow", title: "Skin that looks rested" },
    ],
    stack:
      "Hormone aware care covering mood, cycle, energy and skin, adjusted to the stage you are in.",
    fits: "Your energy, weight or skin changed, and what used to work stopped working.",
  },
  "hair-skin-nails": {
    tagline: "Glowing skin and hair",
    notes: [
      { chip: "Thick hair", title: "Fuller looking" },
      { chip: "Glowing skin", title: "A brighter complexion" },
      { chip: "Strong nails", title: "Grow them out" },
    ],
    stack:
      "Support from the inside for hair, skin and nails, alongside whatever you already use on top.",
    fits: "You want to act on thinning hair while there is still plenty to work with.",
  },
  "pain-relief": {
    tagline: "Get relief where it hurts",
    notes: [
      { chip: "Relief", title: "Feel better fast" },
      { chip: "Recovery", title: "Back to training sooner" },
      { chip: "Mobility", title: "Move more comfortably" },
    ],
    stack:
      "Cooling and warming sprays and creams for sore muscles and stiff joints, sold on the Pain Relief page.",
    fits: "You want something topical you can use today.",
    care: "Shop the Pain Relief page and use as directed on the label.",
  },
};

const RELATED: Readonly<Record<string, readonly string[]>> = {
  tirzepatide: ["semaglutide", "weight-loss", "head-start"],
  semaglutide: ["tirzepatide", "weight-loss", "head-start"],
  b12: ["energy-lift", "lipo-c", "rest-rise"],
  "lipo-c": ["b12", "energy-lift", "weight-loss"],
  "methylene-blue": ["focus", "stress-mood", "b12"],
  sermorelin: ["rest-rise", "rest-rebuild", "longevity"],
  tesamorelin: ["body-composition", "lean-cut", "longevity"],
  "at-home-lab": ["longevity", "focus", "mens-peak-performance"],
  "head-start": ["tirzepatide", "semaglutide", "weight-loss"],
  "rest-rise": ["sermorelin", "b12", "rest-rebuild"],
  "energy-lift": ["b12", "lipo-c", "rest-rise"],
  "body-composition": ["lean-cut", "weight-loss", "tesamorelin"],
  "complete-stack": ["mens-peak-performance", "longevity", "energy-lift"],
  "lean-cut": ["body-composition", "tesamorelin", "weight-loss"],
  "sexual-health": ["mens-peak-performance", "womens-total-balance", "complete-stack"],
  "weight-loss": ["tirzepatide", "semaglutide", "appetite-balance"],
  "appetite-balance": ["weight-loss", "body-composition", "head-start"],
  "mens-peak-performance": ["complete-stack", "sexual-health", "energy-lift"],
  "repair-mobility": ["rest-rebuild", "pain-relief", "longevity"],
  "rest-rebuild": ["repair-mobility", "rest-rise", "sermorelin"],
  longevity: ["at-home-lab", "sermorelin", "rest-rebuild"],
  focus: ["methylene-blue", "stress-mood", "head-start"],
  "stress-mood": ["focus", "womens-total-balance", "rest-rebuild"],
  "womens-total-balance": ["hair-skin-nails", "stress-mood", "sexual-health"],
  "hair-skin-nails": ["womens-total-balance", "longevity", "at-home-lab"],
  "pain-relief": ["repair-mobility", "rest-rebuild", "complete-stack"],
};

const PAIN_ORDER = [
  "evening-spray",
  "heat-therapy-spray",
  "cryotherapy-spray",
  "max-strength-spray",
  "cryotherapy-cream",
  "hot-cold-system",
  "rapid-relief-duo",
] as const;

const PAIN_COPY: Readonly<Record<(typeof PAIN_ORDER)[number], GuideCopy>> = {
  "cryotherapy-spray": {
    tagline: "Spray it and go",
    notes: [
      { chip: "Relief", title: "Cools the second it lands" },
      { chip: "Recovery", title: "Made for after training" },
      { chip: "Mobility", title: "Move easier" },
    ],
    stack:
      "A 360 degree menthol spray for sore muscles and stiff joints. It dries fast, there is nothing to rub in, and it sprays upside down so you can reach your own back.",
    fits: "You want fast cooling relief anywhere on your body without getting it on your hands.",
  },
  "max-strength-spray": {
    tagline: "Our strongest spray",
    notes: [
      { chip: "Power", title: "Two actives at full strength" },
      { chip: "Endurance", title: "Relief that holds" },
      { chip: "Performance", title: "Back at it tomorrow" },
    ],
    stack:
      "Menthol and camphor at maximum strength, in the same fast drying 360 degree spray. For the days when regular is not cutting it.",
    fits: "Regular strength wears off too fast, or you are dealing with a bad day.",
  },
  "cryotherapy-cream": {
    tagline: "Work it in where it aches",
    notes: [
      { chip: "Comfort", title: "Cools as you rub it in" },
      { chip: "Flexibility", title: "Right into the joint" },
      { chip: "Control", title: "Exactly where you want it" },
    ],
    stack:
      "The same cooling menthol as the spray, in a cream you massage in. Better for one knee, one shoulder or one hand.",
    fits: "You want to target one spot rather than cover a whole area.",
  },
  "heat-therapy-spray": {
    tagline: "Warm up before you move",
    notes: [
      { chip: "Readiness", title: "Loosen up first" },
      { chip: "Flexibility", title: "Good for tight backs" },
      { chip: "Confidence", title: "A better first set" },
    ],
    stack:
      "A warming spray for tight muscles, in the same no rub format. Use it before training, or first thing on a stiff morning.",
    fits: "Your muscles are tight rather than sore, and cold is not what you want.",
  },
  "evening-spray": {
    tagline: "Settle in for the night",
    notes: [
      { chip: "Calm", title: "A gentler scent" },
      { chip: "Comfort", title: "For evening aches" },
      { chip: "Rest", title: "Part of the bedtime routine" },
    ],
    stack:
      "Lavender and menthol, for the aches you notice once you finally sit down. Made for the end of the day.",
    fits: "The soreness gets loudest at night and you want something calmer than a mint blast.",
  },
  "hot-cold-system": {
    tagline: "Warm up, cool down",
    notes: [
      { chip: "Readiness", title: "Both ends covered" },
      { chip: "Recovery", title: "The part most people skip" },
      { chip: "Balance", title: "One kit, whole session" },
    ],
    stack:
      "The heat spray and the cryotherapy spray together. Heat before you train, cold after, the way athletes have always done it.",
    fits: "You train regularly and want the full routine in one purchase.",
  },
  "rapid-relief-duo": {
    tagline: "Cover ground, then get specific",
    notes: [
      { chip: "Relief", title: "Two ways to apply" },
      { chip: "Comfort", title: "Spray the back, rub the knee" },
      { chip: "Confidence", title: "Covered either way" },
    ],
    stack:
      "The cryotherapy spray for big areas, the cream for the one spot that needs your hands.",
    fits: "One bottle never quite covers everything you need it for.",
  },
};

function painGuideEntries(): PeptideGuideEntry[] {
  return PAIN_ORDER.map((id) => {
    const item = painReliefProducts.find((product) => product.id === id);
    const copy = PAIN_COPY[id];
    if (!item) throw new Error(`Missing pain relief product ${id}`);
    return {
      id,
      kind: "pain",
      name: item.name,
      tagline: copy.tagline,
      href: painReliefPdpHref(id),
      vialSrc: item.mediaSrc ?? "",
      notes: copy.notes,
      stack: copy.stack,
      mood: copy.fits,
      care: null,
      price: startingFrom(item.price),
      forms: [],
      soldOut: item.soldOut === true,
      related: [],
    };
  });
}

function startingFrom(amount: string): string {
  const value = amount
    .replace(/^starting from\s+/i, "")
    .replace(/^starting at\s+/i, "")
    .replace(/^from\s+/i, "")
    .trim();
  return `Starting from ${value}`;
}

function guideStartsAt(id: string, explicit?: string): string {
  if (explicit) return startingFrom(explicit);
  if (id === "pain-relief") return startingFrom(painReliefStartsAt());
  const amount = launchLowestStartsAt(id);
  return startingFrom(amount == null ? peptideGuideCopy.price : formatUsd(amount));
}

function isGuideForm(form: LaunchForm): form is PeptideGuideFormId {
  return form === "vial" || form === "vial-pen" || form === "capsule";
}

/** Pen lockup is a different bottle than the group shot, so the guide shows the vial only. */
const GUIDE_VIAL_ONLY = new Set(["appetite-balance", "body-composition", "focus"]);

function guideForms(id: string): PeptideGuideForm[] {
  return launchFormsFor(id).flatMap((form) => {
    if (!isGuideForm(form)) return [];
    if (form === "vial-pen" && GUIDE_VIAL_ONLY.has(id)) return [];
    const src = formHeroSrc(id, form);
    if (!src) return [];
    return [{ form, label: FORM_LABEL[form], src }];
  });
}

function relatedFor(id: string): PeptideGuideRelated[] {
  return (RELATED[id] ?? []).flatMap((relatedId) => {
    const item = SHOP_CATALOG.find((row) => row.id === relatedId);
    if (!item) return [];
    return [{ id: relatedId, label: item.label, href: catalogHref(relatedId) }];
  });
}

/** The three Good for chips on the treatments page. */
export function peptideGuideChips(id: string): readonly string[] {
  return COPY[id]?.notes.map((note) => note.chip) ?? [];
}

export function peptideGuideEntries(): PeptideGuideEntry[] {
  const entries = SHOP_CATALOG.filter((item) => item.id !== "pain-relief").map((item) => {
    const copy = COPY[item.id];
    if (!copy) {
      throw new Error(`Missing peptide guide copy for ${item.id}`);
    }
    return {
      id: item.id,
      kind: item.kind,
      name: item.label,
      tagline: copy.tagline,
      href: catalogHref(item.id),
      vialSrc: item.vialSrc || catalogProductSrc(item.id),
      notes: copy.notes,
      stack: copy.stack,
      mood: copy.fits,
      care: copy.care,
      price: guideStartsAt(item.id, copy.price),
      forms: guideForms(item.id),
      related: relatedFor(item.id),
    };
  });
  return [...entries, ...painGuideEntries()];
}
