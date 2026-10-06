/**
 * Mega menu list preview. Fields and callouts from Figma PDP Product
 * Imagery 1917:2, staged like preview wrap 2057:2.
 */

export type PreviewCallout = {
  chip: string;
  body: string;
};

export type PreviewShape = "vial" | "lockup" | "square" | "kit" | "pair";

export type PreviewWrap = {
  fieldSrc: string;
  callouts: readonly [PreviewCallout, PreviewCallout, PreviewCallout];
  shape: PreviewShape;
  stageW: string;
  stageH: string;
};

const REV = 4;

const VIAL_STAGE = { shape: "vial" as const, stageW: "41.071%", stageH: "81.964%" };
const PAIR_STAGE = { shape: "pair" as const, stageW: "90%", stageH: "81.964%" };

function field(id: string): string {
  return `/landing/nav/fields/${id}.jpg?v=${REV}`;
}

function wrap(
  id: string,
  a: PreviewCallout,
  b: PreviewCallout,
  c: PreviewCallout,
  stage: { shape: PreviewShape; stageW: string; stageH: string } = VIAL_STAGE,
): PreviewWrap {
  return { fieldSrc: field(id), callouts: [a, b, c], ...stage };
}

export const PREVIEW_WRAP: Readonly<Record<string, PreviewWrap>> = {
  tirzepatide: wrap(
    "tirzepatide",
    { chip: "Control", body: "Feel full sooner" },
    { chip: "Momentum", body: "Easy to stick with" },
    { chip: "Lean muscle", body: "Keep your strength" },
  ),
  semaglutide: wrap(
    "semaglutide",
    { chip: "Control", body: "Less food noise" },
    { chip: "Consistency", body: "Same day every week" },
    { chip: "Confidence", body: "Comfortable in your skin" },
  ),
  b12: wrap(
    "b12",
    { chip: "Energy", body: "Get up and go" },
    { chip: "Endurance", body: "Going strong all day" },
    { chip: "Spark", body: "Up for anything" },
  ),
  "lipo-c": wrap(
    "lipo-c",
    { chip: "Metabolism", body: "Extra support while you lose" },
    { chip: "Energy", body: "A lift through the week" },
    { chip: "Momentum", body: "Keep the progress coming" },
  ),
  "methylene-blue": wrap(
    "methylene-blue",
    { chip: "Focus", body: "Stay on task" },
    { chip: "Clarity", body: "Sharper afternoons" },
    { chip: "Energy", body: "Steady all day" },
    { shape: "square", stageW: "43.333%", stageH: "43.333%" },
  ),
  sermorelin: wrap(
    "sermorelin",
    { chip: "Sleep", body: "Fewer 3am wake ups" },
    { chip: "Recovery", body: "Bounce back faster" },
    { chip: "Better mornings", body: "Rested and clear headed" },
  ),
  testosterone: wrap(
    "testosterone",
    { chip: "Energy", body: "When the day starts flat" },
    { chip: "Drive", body: "Purposefully motivated" },
    { chip: "Strength", body: "Vitality all day long" },
  ),
  tesamorelin: wrap(
    "tesamorelin",
    { chip: "Definition", body: "Show the work" },
    { chip: "Lean muscle", body: "Keep what you have earned" },
    { chip: "Strength", body: "Power that lasts" },
  ),
  "at-home-lab": wrap(
    "at-home-lab",
    { chip: "Answers", body: "The full picture" },
    { chip: "Baseline", body: "A clear starting point" },
    { chip: "Progress", body: "Track what changes" },
    { shape: "kit", stageW: "75%", stageH: "31.75%" },
  ),
  "body-composition": wrap(
    "body-composition",
    { chip: "Lean muscle", body: "A toned build" },
    { chip: "Strength", body: "Still lifting heavy" },
    { chip: "Vitality", body: "Healthy for years to come" },
    PAIR_STAGE,
  ),
  "complete-stack": wrap(
    "complete-stack",
    { chip: "Energy", body: "Plenty left at 6pm" },
    { chip: "Recovery", body: "Fresh every morning" },
    { chip: "Metabolism", body: "Stay on track anywhere" },
  ),
  "lean-cut": wrap(
    "lean-cut",
    { chip: "Muscle", body: "Hold on to your gains" },
    { chip: "Definition", body: "See it in the mirror" },
    { chip: "Edge", body: "Stay lean after the cut" },
  ),
  "sexual-health": wrap(
    "sexual-health",
    { chip: "Desire", body: "Want it more often" },
    { chip: "Performance", body: "Ready when you are" },
    { chip: "Confidence", body: "Enjoy it without worrying" },
    { shape: "square", stageW: "48%", stageH: "48%" },
  ),
  "weight-loss": wrap(
    "weight-loss",
    { chip: "Control", body: "Fewer cravings" },
    { chip: "Progress", body: "A pace you can keep" },
    { chip: "Confidence", body: "Like how your clothes fit" },
  ),
  transformation: wrap(
    "transformation",
    { chip: "Freedom", body: "When food takes up too much room" },
    { chip: "Simplicity", body: "More than a number on the scale" },
    { chip: "Care", body: "Months, not weeks" },
  ),
  "mens-health": wrap(
    "mens-health",
    { chip: "Energy", body: "The afternoon crash" },
    { chip: "Strength", body: "Work that isn't showing up" },
    { chip: "Drive", body: "Getting your edge back" },
  ),
  "recovery-performance": wrap(
    "recovery-performance",
    { chip: "Recovery", body: "When soreness picks your schedule" },
    {
      chip: "Repair",
      body: "Cranky knees, tight shoulders",
    },
    { chip: "Strengthen", body: "No more working around it" },
  ),
  athletes: wrap(
    "athletes",
    {
      chip: "Rebound",
      body: "Nights after the hard days",
    },
    {
      chip: "Durability",
      body: "Two hard days in a row",
    },
    { chip: "Recharge", body: "Showing up recovered" },
  ),
  travelers: wrap(
    "travelers",
    { chip: "Rest", body: "Tired that sleep doesn't fix" },
    {
      chip: "Reset",
      body: "Weeks that don't let up",
    },
    { chip: "Recover", body: "No caffeine required" },
  ),
  healthspan: wrap(
    "healthspan",
    {
      chip: "Vitality",
      body: "Catching it early",
    },
    { chip: "Vigor", body: "Still capable at seventy" },
    {
      chip: "Clarity",
      body: "Better ones, not just more",
    },
  ),
  creators: wrap(
    "creators",
    { chip: "Focus", body: "Long days of real thinking" },
    { chip: "Rest", body: "Remembering what you read" },
    { chip: "Calm", body: "Turning it off at night" },
  ),
  parents: wrap(
    "parents",
    { chip: "Spark", body: "Dinner, bedtime, all of it" },
    { chip: "Sleep", body: "Fewer hours, better ones" },
    {
      chip: "Balance",
      body: "Running your day, not chasing it",
    },
  ),
  "womens-balance": wrap(
    "womens-balance",
    {
      chip: "Radiance",
      body: "Tired that gets called normal",
    },
    {
      chip: "Balance",
      body: "What used to work, doesn't",
    },
    { chip: "Glow", body: "Your skin changed too" },
  ),
  "skin-hair": wrap(
    "skin-hair",
    { chip: "Fullness", body: "Act while there's plenty" },
    {
      chip: "Firmness",
      body: "Where creams can't reach",
    },
    { chip: "Glow", body: "The ones that keep breaking" },
  ),
  "pain-relief": wrap(
    "pain-relief",
    { chip: "Relief", body: "Feel better fast" },
    { chip: "Recovery", body: "Back to training sooner" },
    { chip: "Mobility", body: "Move more comfortably" },
    { shape: "square", stageW: "61.333%", stageH: "61.333%" },
  ),
  "steady-start": wrap(
    "steady-start",
    { chip: "Momentum", body: "Early wins" },
    { chip: "Habits", body: "Routines that stick" },
    { chip: "Energy", body: "Feel good while you eat less" },
    { shape: "lockup", stageW: "60%", stageH: "45.833%" },
  ),
  "rest-rise": wrap(
    "rest-rise",
    { chip: "Deep sleep", body: "Out cold till morning" },
    { chip: "Recovery", body: "Wake up refreshed" },
    { chip: "Energy", body: "Get more done" },
    { shape: "lockup", stageW: "47.333%", stageH: "46.667%" },
  ),
  "fast-start": wrap(
    "fast-start",
    {
      chip: "Momentum",
      body: "When you want it moving now",
    },
    { chip: "Energy", body: "So it lasts past month one" },
    { chip: "Hold", body: "Eating less and still moving" },
    { shape: "lockup", stageW: "60%", stageH: "40.083%" },
  ),
  "energy-lift": wrap(
    "energy-lift",
    { chip: "Energy", body: "Up early, going late" },
    { chip: "Stamina", body: "Past the afternoon dip" },
    { chip: "Focus", body: "Clear head all day" },
    { shape: "lockup", stageW: "46.833%", stageH: "46.667%" },
  ),
  "appetite-balance": wrap(
    "appetite-balance",
    { chip: "Balance", body: "Eat without overthinking it" },
    { chip: "Shape", body: "Firmer all over" },
    { chip: "Consistency", body: "Easy to stay with" },
    PAIR_STAGE,
  ),
  "mens-peak-performance": wrap(
    "mens-peak-performance",
    { chip: "Energy", body: "Steady from morning to night" },
    { chip: "Strength", body: "More from every workout" },
    { chip: "Drive", body: "Your focus and libido back" },
  ),
  "repair-mobility": wrap(
    "repair-mobility",
    { chip: "Recover", body: "Back out there faster" },
    { chip: "Flexibility", body: "Full range of motion" },
    { chip: "Strength", body: "Do what you love" },
  ),
  "rest-rebuild": wrap(
    "rest-rebuild",
    { chip: "Sleep", body: "Solid, uninterrupted nights" },
    { chip: "Recovery", body: "Quick turnarounds" },
    { chip: "Readiness", body: "Good to go every session" },
  ),
  "cellular-health": wrap(
    "cellular-health",
    { chip: "Energy", body: "Alert from the start" },
    { chip: "Stamina", body: "Keep up with your schedule" },
    { chip: "Clarity", body: "Less brain fog" },
  ),
  longevity: wrap(
    "longevity",
    { chip: "Health", body: "Catch changes early" },
    { chip: "Strength", body: "Stay capable as you age" },
    { chip: "Years", body: "More good years" },
  ),
  focus: wrap(
    "focus",
    { chip: "Sharpness", body: "Think faster on your feet" },
    { chip: "Clarity", body: "Hold more in your head" },
    { chip: "Acuity", body: "Switch off at night" },
    PAIR_STAGE,
  ),
  "stress-mood": wrap(
    "stress-mood",
    { chip: "Calm", body: "Patience that lasts" },
    { chip: "Sleep", body: "Easier nights" },
    { chip: "Balance", body: "On top of your day" },
  ),
  "womens-total-balance": wrap(
    "womens-total-balance",
    { chip: "Energy", body: "Awake through the afternoon" },
    { chip: "Balance", body: "Steadier days" },
    { chip: "Glow", body: "Skin that looks rested" },
  ),
  "hair-skin-nails": wrap(
    "hair-skin-nails",
    { chip: "Thick hair", body: "Fuller looking" },
    { chip: "Glowing skin", body: "A brighter complexion" },
    { chip: "Strong nails", body: "Grow them out" },
  ),
};

const WRAP_ALIAS: Readonly<Record<string, string>> = {
  "head-start": "steady-start",
};

export function previewWrapFor(id: string): PreviewWrap | undefined {
  return PREVIEW_WRAP[id] ?? PREVIEW_WRAP[WRAP_ALIAS[id] ?? ""];
}
