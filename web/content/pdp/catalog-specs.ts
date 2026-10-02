/** PDP copy for the launch catalog. Products may name isolates. Treatments stay goal framed. */

export type CatalogStill = { src: string; label: string; swatch: string };

export type CatalogPdpSpec = {
  id: string;
  title: string;
  tagline: string;
  metadataDescription: string;
  body: string;
  leadTitle: string;
  whatIs: string;
  chips: readonly [string, string, string];
  callouts: readonly [string, string, string];
  sells: readonly [string, string, string];
  video: string;
  poster: string;
  stills: readonly [CatalogStill, CatalogStill, CatalogStill];
  form?: "pen" | "oral" | "kit" | "otc";
  addon?: boolean;
  bmi?: boolean;
};

const L = "/landing/lifestyle";

const still = (
  src: string,
  label: string,
  swatch: string,
): CatalogStill => ({ src, label, swatch });

const METABOLIC_STILLS = [
  still(`${L}/weight-loss-walk.png`, "Walk", "#3a4a3c"),
  still(`${L}/weight-loss-chop.png`, "Kitchen", "#5c4a3a"),
  still(`${L}/transformation-dressed.png`, "Dressed", "#4a3c38"),
] as const;

const MENS_STILLS = [
  still(`${L}/mens-health-locker.png`, "Locker", "#3a4a5c"),
  still(`${L}/mens-health-chalk.png`, "Chalk", "#5c4a3a"),
  still(`${L}/mens-health-gym.png`, "Gym", "#4a5c58"),
] as const;

const SEXUAL_STILLS = [
  still(`${L}/sexual-health-evening.png`, "Evening in", "#4a3a48"),
  still(`${L}/sexual-health-linen.png`, "Linen", "#6a5a4a"),
  still(`${L}/sexual-health-nightstand.png`, "Nightstand", "#3a3a42"),
] as const;

const WOMENS_STILLS = [
  still(`${L}/womens-health-stretch.png`, "Stretch", "#6a5c58"),
  still(`${L}/womens-health-tea.png`, "Tea", "#8a7a6a"),
  still(`${L}/womens-health-windowsill.png`, "Windowsill", "#7a8a7a"),
] as const;

const REPAIR_STILLS = [
  still(`${L}/recovery-stretch.png`, "Stretch", "#4a5c6a"),
  still(`${L}/recovery-tape.png`, "Tape", "#5c6a4a"),
  still(`${L}/recovery-bench.png`, "Bench", "#3a4a52"),
] as const;

const ATHLETE_STILLS = [
  still(`${L}/athlete-track.png`, "Track", "#3a4a42"),
  still(`${L}/athlete-hold.png`, "Hold", "#4a3c32"),
  still(`${L}/athlete-crop.png`, "Crop", "#5c5348"),
] as const;

const LONGEVITY_STILLS = [
  still(`${L}/legacy-park.png`, "Park", "#4a5c48"),
  still(`${L}/legacy-hands.png`, "Hands", "#6a5a4a"),
  still(`${L}/legacy-kitchen.png`, "Kitchen", "#5c5348"),
] as const;

const CELLULAR_STILLS = [
  still(`${L}/traveler-hotel.png`, "Hotel", "#3a3a42"),
  still(`${L}/traveler-passport.png`, "Passport", "#4a4a3c"),
  still(`${L}/traveler-nightstand.png`, "Nightstand", "#3c4248"),
] as const;

const FOCUS_STILLS = [
  still(`${L}/creative-desk.png`, "Desk", "#3a3c42"),
  still(`${L}/creative-screen.png`, "Screen", "#2a2c32"),
  still(`${L}/creative-workbench.png`, "Workbench", "#4a4238"),
] as const;

const STRESS_STILLS = [
  still(`${L}/parents-rush.png`, "Rush", "#5c4a42"),
  still(`${L}/parents-counter.png`, "Counter", "#6a5c52"),
  still(`${L}/parents-steps.png`, "Steps", "#4a4c48"),
] as const;

const HAIR_STILLS = [
  still(`${L}/skin-hair-bathroom.png`, "Bathroom", "#6a5a58"),
  still(`${L}/skin-hair-face.png`, "Face", "#8a7a72"),
  still(`${L}/skin-hair-vanity.png`, "Vanity", "#5c4a48"),
] as const;

const EXEC_STILLS = [
  still(`${L}/executive-desk.png`, "Desk", "#3a3c42"),
  still(`${L}/executive-corridor.png`, "Corridor", "#2a2c32"),
  still(`${L}/executive-ledge.png`, "Ledge", "#4a4238"),
] as const;

export const CATALOG_PDP_SPECS: readonly CatalogPdpSpec[] = [
  {
    id: "tirzepatide",
    title: "Tirzepatide",
    tagline: "Weekly metabolic support, if prescribed",
    metadataDescription:
      "Physician guided tirzepatide care for appetite, pace, and lean mass. Available if prescribed after clinical review.",
    body: "A weekly plan for hunger, gastric emptying, and how you hold lean mass, if prescribed after clinical review. Filled by a US compounding pharmacy and delivered through the TIDL Flow pen.",
    leadTitle: "Appetite, pace,\nand lean mass\nin one weekly plan",
    whatIs:
      "Tirzepatide is a physician guided weekly metabolic plan. The visit covers hunger, pace, and composition. Available if prescribed after clinical review. Dose and fill details stay on the prescription.",
    chips: ["Control", "Momentum", "Lean muscle"],
    callouts: [
      "When hunger runs your day",
      "Progress that actually sticks",
      "Losing fat, not strength",
    ],
    sells: [
      "When you're not hungry all the time, everything else gets easier. That's the whole idea.",
      "Fast isn't the goal. A steady pace you can keep is, and it gets adjusted as you go.",
      "The scale doesn't tell you what you're losing. Keeping your muscle is part of this from day one.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "semaglutide",
    title: "Semaglutide",
    tagline: "Weekly GLP 1 care, if prescribed",
    metadataDescription:
      "Physician guided semaglutide care for appetite and metabolic rhythm. Available if prescribed after clinical review.",
    body: "A weekly GLP 1 plan for appetite and metabolic rhythm across the week, if prescribed after clinical review. Filled by a US compounding pharmacy and delivered through the TIDL Flow pen.",
    leadTitle: "A steadier week\naround appetite\nand metabolic load",
    whatIs:
      "Semaglutide is a physician guided weekly GLP 1 plan. The visit covers appetite, blood sugar context, and how you hold the week. Available if prescribed after clinical review.",
    chips: ["Control", "Consistency", "Confidence"],
    callouts: [
      "Food noise that never quits",
      "A routine you won't forget",
      "How your clothes fit",
    ],
    sells: [
      "Less thinking about food. More room in your head for everything else.",
      "One dose a week. Same day, done.",
      "The number on the scale is nice. Liking how you feel in your clothes is better.",
    ],
    video: "/landing/hero/weight-loss.mp4",
    poster: "/landing/hero/weight-loss.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "b12",
    title: "B12",
    tagline: "Energy and cellular support, if prescribed",
    metadataDescription:
      "Physician guided B12 support for daytime energy. Available as a plan or an add on, if prescribed after clinical review.",
    body: "Cellular support for morning energy and the hours that ask more of you, if prescribed after clinical review. Add it to any product, bundle, or treatment when a clinician writes it that way.",
    leadTitle: "Daytime energy\nwithout making\ncaffeine the plan",
    whatIs:
      "B12 is physician guided cellular support. It can stand alone or add on to any TIDL plan. Available if prescribed after clinical review.",
    chips: ["Energy", "Endurance", "Spark"],
    callouts: [
      "Mornings that start on fumes",
      "The back half of the day",
      "Feeling like yourself again",
    ],
    sells: [
      "If you need coffee just to feel normal, this is for you. Energy that isn't borrowed from a cup.",
      "Most people fade after lunch. Keep going.",
      "Not wired, not dragging. Just awake, interested, and up for things again.",
    ],
    video: "/landing/hero/mens-health.mp4",
    poster: "/landing/hero/mens-health.jpg",
    stills: MENS_STILLS,
    form: "pen",
    addon: true,
  },
  {
    id: "lipo-c",
    title: "Lipo C",
    tagline: "Metabolic and liver support, if prescribed",
    metadataDescription:
      "Physician guided Lipo C support for metabolic processing. Available as a plan or an add on, if prescribed after clinical review.",
    body: "Metabolic and liver support for processing load through the week, if prescribed after clinical review. Add it to any product, bundle, or treatment when a clinician writes it that way.",
    leadTitle: "Metabolic processing\nwritten as support,\nnot another crash plan",
    whatIs:
      "Lipo C is physician guided metabolic support. It can stand alone or add on to any TIDL plan. Available if prescribed after clinical review.",
    chips: ["Metabolism", "Energy", "Momentum"],
    callouts: [
      "When everything feels slow",
      "Something left by Friday",
      "For weeks that stall out",
    ],
    sells: [
      "Give your metabolism some backup, with liver and metabolic support in one.",
      "A little more energy, Monday through Friday.",
      "Everyone hits a flat stretch. This is the nudge that gets the week moving again.",
    ],
    video: "/landing/hero/travelers.mp4",
    poster: "/landing/hero/travelers.jpg",
    stills: CELLULAR_STILLS,
    form: "pen",
    addon: true,
  },
  {
    id: "methylene-blue",
    title: "Methylene Blue",
    tagline: "Mitochondrial and cognitive support, if prescribed",
    metadataDescription:
      "Physician guided methylene blue support for focus and cellular stamina. Available as a plan or an add on, if prescribed after clinical review.",
    body: "Mitochondrial support for meetings, deep work, and the stretch after lunch, if prescribed after clinical review. Add it to any product, bundle, or treatment when a clinician writes it that way.",
    leadTitle: "Focus and cellular\nstamina for the hours\nthe work actually takes",
    whatIs:
      "Methylene Blue is physician guided mitochondrial and cognitive support. It can stand alone or add on to any TIDL plan. Available if prescribed after clinical review.",
    chips: ["Focus", "Clarity", "Energy"],
    callouts: [
      "Work that needs your whole head",
      "Thinking straight at three",
      "It starts in your cells",
    ],
    sells: [
      "For the days you need to lock in and stay there.",
      "Think clearly at three, when your brain usually checks out.",
      "Not a stimulant rush and not a crash after. Steady energy that actually holds.",
    ],
    video: "/landing/hero/creators-and-builders.mp4",
    poster: "/landing/hero/creators-and-builders.jpg",
    stills: FOCUS_STILLS,
    addon: true,
  },
  {
    id: "sermorelin",
    title: "Sermorelin",
    tagline: "Overnight recovery support, if prescribed",
    metadataDescription:
      "Physician guided sermorelin care for sleep quality and next day repair. Available if prescribed after clinical review.",
    body: "Overnight rebuild support for sleep quality and how you land the next morning, if prescribed after clinical review. Filled by a US compounding pharmacy.",
    leadTitle: "Nights that have\nto absorb the load\nyou already carry",
    whatIs:
      "Sermorelin is a physician guided overnight recovery plan. The visit covers sleep quality, repair, and how you feel the next morning. Available if prescribed after clinical review.",
    chips: ["Sleep", "Recovery", "Better mornings"],
    callouts: [
      "Nights that actually count",
      "While you're out cold",
      "When the alarm goes off",
    ],
    sells: [
      "Good sleep fixes a lot. This is for getting more of the deep kind.",
      "Your body does its repair work overnight. Give it better nights to work with.",
      "Wake up feeling like you actually slept.",
    ],
    video: "/landing/hero/athletes.mp4",
    poster: "/landing/hero/athletes.jpg",
    stills: ATHLETE_STILLS,
    form: "pen",
  },
  {
    id: "tesamorelin",
    title: "Tesamorelin",
    tagline: "Composition and visceral support, if prescribed",
    metadataDescription:
      "Physician guided tesamorelin care for lean mass and composition. Available if prescribed after clinical review.",
    body: "A composition plan for lean mass, training load, and metabolic resilience, if prescribed after clinical review. Filled by a US compounding pharmacy.",
    leadTitle: "Lean mass and\ncomposition in the\nsame clinical brief",
    whatIs:
      "Tesamorelin is a physician guided composition plan. The visit covers lean mass, visceral fat context, and training load. Available if prescribed after clinical review.",
    chips: ["Definition", "Lean muscle", "Strength"],
    callouts: [
      "What the scale can't see",
      "You already put in the work",
      "Ten years from now",
    ],
    sells: [
      "Two people can weigh the same and look nothing alike. This is about how you're built, not what you weigh.",
      "You're already putting in the work. Hold on to the muscle you've earned.",
      "Stay strong year after year, with your own markers tracked along the way.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
  },
  {
    id: "at-home-lab",
    title: "MD Reviewed Blood Test",
    tagline: "A kit at home. Portal results in seventy two hours",
    metadataDescription:
      "An at home blood collection kit with portal results in seventy two hours. No prescription required to order the kit.",
    body: "A single use collection kit shipped to you. You collect at home. Portal results land in seventy two hours. Use it alone or add it beside any plan.",
    leadTitle: "Numbers a clinician\ncan read before\nthey write a plan",
    whatIs:
      "The MD Reviewed Blood Test is a single use collection kit. Results appear in the portal in seventy two hours. You can order the kit without a prescription. A clinician can use the panel when they review a plan.",
    chips: ["Answers", "Baseline", "Progress"],
    callouts: [
      "No more wondering",
      "Before you change anything",
      "Check again in three months",
    ],
    sells: [
      "Guessing gets old. The kit comes to you, you collect at home, and there's no lab visit to book.",
      "Results show up in your portal in seventy two hours. Now you know where you're starting from.",
      "Test again in a few months and see exactly what moved. Beats guessing every time.",
    ],
    video: "/landing/hero/recovery-and-performance.mp4",
    poster: "/landing/hero/recovery-and-performance.jpg",
    stills: REPAIR_STILLS,
    form: "kit",
    addon: true,
  },
  {
    id: "rest-rise",
    title: "Rest & Rise",
    tagline: "Rest, repair, and rise, if prescribed",
    metadataDescription:
      "A physician stacked protocol for overnight repair and how you rise. Available if prescribed after clinical review.",
    body: "Energy, repair, and metabolic care combined into one longevity protocol, if prescribed after clinical review. Two vials. One visit.",
    leadTitle: "Repair at night.\nCapacity in the morning.",
    whatIs:
      "Rest and Rise is a stacked protocol for overnight repair and how you rise. A physician reviews the pair as one visit. Available if prescribed after clinical review.",
    chips: ["Deep sleep", "Recovery", "Energy"],
    callouts: [
      "Nights that do the work",
      "Better nights, better days",
      "Mornings that don't drag",
    ],
    sells: [
      "Better nights are where this starts. More of the deep sleep your body does its repair work in.",
      "Two vials in one bundle. Sermorelin for the night, B12 for the day after.",
      "Wake up with something in the tank.",
    ],
    video: "/landing/hero/athletes.mp4",
    poster: "/landing/hero/athletes.jpg",
    stills: ATHLETE_STILLS,
    form: "pen",
  },
  {
    id: "head-start",
    title: "Head Start",
    tagline: "Momentum, habit, and energy, if prescribed",
    metadataDescription:
      "A physician stacked protocol for momentum, appetite, and energy. Available if prescribed after clinical review.",
    body: "Fat to muscle conversion support with composition and appetite in the same stack, if prescribed after clinical review. One visit. Three vials.",
    leadTitle: "Momentum without\ntreating the first month\nlike a stunt",
    whatIs:
      "Head Start is a stacked protocol for momentum, habit, and energy. A physician reviews the stack as one visit. Available if prescribed after clinical review.",
    chips: ["Momentum", "Habits", "Energy"],
    callouts: [
      "When you want it moving now",
      "So it lasts past month one",
      "Eating less and still moving",
    ],
    sells: [
      "The first month matters most. Semaglutide, Lipo C and B12 together to get you moving.",
      "Quick wins are great. Habits are what keep them.",
      "Eating less shouldn't mean dragging all day. Energy support is part of the bundle.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "energy-lift",
    title: "Energy Lift",
    tagline: "Energy, stamina, and focus, if prescribed",
    metadataDescription:
      "A physician stacked B12 and Lipo C protocol for energy and stamina. Available if prescribed after clinical review.",
    body: "B12 and Lipo C stacked for daytime energy, stamina, and metabolic support, if prescribed after clinical review. Two vials. One visit. Either vial can also add on to another plan.",
    leadTitle: "Energy and stamina\nstacked as one visit,\nnot two carts",
    whatIs:
      "Energy Lift is B12 and Lipo C reviewed as one stack. The visit covers daytime energy, stamina, and metabolic processing. Available if prescribed after clinical review.",
    chips: ["Energy", "Stamina", "Focus"],
    callouts: [
      "Two vials for big days",
      "When the day won't end",
      "Still sharp at six",
    ],
    sells: [
      "B12 and Lipo C in one bundle. For when you've got a lot on and not much left.",
      "Skip the fourth coffee. Keep going anyway.",
      "Stay with it from the first email to the last.",
    ],
    video: "/landing/hero/travelers.mp4",
    poster: "/landing/hero/travelers.jpg",
    stills: CELLULAR_STILLS,
    form: "pen",
  },
  {
    id: "body-composition",
    title: "Body Composition",
    tagline: "Appetite and healthy aging, if prescribed",
    metadataDescription:
      "Physician guided care for composition, appetite, and how you age in the body you have. Available if prescribed after clinical review.",
    body: "A care plan for composition, appetite, and healthy aging as one visit, if prescribed after clinical review.",
    leadTitle: "How you carry\nyourself, not only\nwhat the scale says",
    whatIs:
      "Body Composition is a care plan when appetite and how you carry yourself belong in the same visit. A physician reviews what, if anything, is prescribed. Molecule details stay behind login.",
    chips: ["Lean muscle", "Strength", "Vitality"],
    callouts: [
      "Losing fat the right way",
      "Lean doesn't have to mean weak",
      "Now and in ten years",
    ],
    sells: [
      "Lose the fat, keep the muscle. Appetite's covered too, so it's all working in the same direction.",
      "You can get lean and still be the strong one.",
      "Feel good in your body now, and keep feeling that way as the years go by.",
    ],
    video: "/landing/hero/recovery-and-performance.mp4",
    poster: "/landing/hero/recovery-and-performance.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "complete-stack",
    title: "Complete Stack",
    tagline: "Energy, repair, and metabolism, if prescribed",
    metadataDescription:
      "Physician guided stacked care for energy, repair, and metabolic load. Available if prescribed after clinical review.",
    body: "A full protocol for energy, repair, and metabolic care in one visit, if prescribed after clinical review. Built for a calendar that does not flex.",
    leadTitle: "One protocol\nfor a calendar\nthat does not flex",
    whatIs:
      "Complete Stack is a care plan when energy, repair, and metabolic load cannot be three separate visits. A physician reviews the stack. Named compounds appear only after login.",
    chips: ["Energy", "Recovery", "Metabolism"],
    callouts: [
      "When you want all of it covered",
      "So the week doesn't wreck you",
      "Travel and late dinners",
    ],
    sells: [
      "Energy, recovery and metabolism, handled together. This is the everything option.",
      "You push hard all week. Make sure your body can keep up with you.",
      "Travel and late dinners happen. Stay on track anyway.",
    ],
    video: "/landing/hero/ceos-and-executives.mp4",
    poster: "/landing/hero/ceos-and-executives.jpg",
    stills: EXEC_STILLS,
    form: "pen",
  },
  {
    id: "lean-cut",
    title: "Lean & Cut",
    tagline: "Fat to muscle conversion, if prescribed",
    metadataDescription:
      "Physician guided care for lean mass and composition. Available if prescribed after clinical review.",
    body: "A care plan for lean mass and fat to muscle conversion, if prescribed after clinical review. Composition is the job. The scale is not the only brief.",
    leadTitle: "Lean mass first.\nThe cut follows\nthe protocol.",
    whatIs:
      "Lean and Cut is a care plan when the brief is composition, not a crash. A physician reviews what, if anything, is prescribed. Molecule details stay behind login.",
    chips: ["Muscle", "Definition", "Edge"],
    callouts: [
      "Cutting without losing what you built",
      "Where the training shows",
      "Holding it after the cut",
    ],
    sells: [
      "Anyone can lose weight by losing muscle. This goes the other way.",
      "All those sessions should show up in the mirror.",
      "Getting lean is half of it. There's a maintenance phase after the cut so you hold on to it.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "sexual-health",
    title: "Sexual Health",
    tagline: "Desire, function, and reliability, if prescribed",
    metadataDescription:
      "Private physician guided care for desire and reliability. Available if prescribed after clinical review.",
    body: "Private care for desire and reliability, reviewed by a physician, if prescribed after clinical review. An oral plan from a US compounding pharmacy.",
    leadTitle: "Desire and reliability\nreviewed in private,\nnot in a waiting room",
    whatIs:
      "Sexual Health is a care plan when intimacy is the reason for the visit. Desire and reliability, reviewed in private. Available if prescribed after clinical review. Molecule details stay behind login.",
    chips: ["Desire", "Performance", "Confidence"],
    callouts: [
      "Wanting to, first",
      "Ready when it counts",
      "Discreet from the first click",
    ],
    sells: [
      "It's hard to have great sex when you're just not in the mood. Start there.",
      "Blood flow, arousal and drive all matter. Stop overthinking it and be ready when the moment shows up.",
      "Private from start to finish. Nobody needs to know but you.",
    ],
    video: "/landing/hero/sexual-health.mp4",
    poster: "/landing/hero/sexual-health.jpg",
    stills: SEXUAL_STILLS,
    form: "oral",
  },
  {
    id: "weight-loss",
    title: "Weight Loss",
    tagline: "Physician guided GLP 1 care, if prescribed",
    metadataDescription:
      "Physician guided GLP 1 care for appetite, pace, and lean mass. Available if prescribed after clinical review.",
    body: "Physician guided GLP 1 care for appetite, metabolic pace, and how composition holds over time, if prescribed after clinical review.",
    leadTitle: "Appetite goals,\nmetabolic support,\nclinician guided care",
    whatIs:
      "Weight Loss is a care plan when hunger is the main work of the day. Physician guided GLP 1 care with a pace the clinician sets, and lean mass written into the brief. Available if prescribed after clinical review.",
    chips: ["Control", "Progress", "Confidence"],
    callouts: [
      "Hunger that won't quit",
      "Not a crash diet",
      "Liking what you see",
    ],
    sells: [
      "You eat when you're hungry, and then you stop. That's what quiet feels like.",
      "Slow and steady really does win here. A pace you can live with beats a crash every time.",
      "Keeping your muscle while the weight comes off is what makes the difference in the mirror.",
    ],
    video: "/landing/hero/weight-loss.mp4",
    poster: "/landing/hero/weight-loss.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "appetite-balance",
    title: "Appetite Balance",
    tagline: "Composition, appetite, and the months it takes",
    metadataDescription:
      "A physician guided plan for appetite, composition, and a multi month reset. Available if prescribed after clinical review.",
    body: "A steadier rhythm across hunger cues, energy between meals, and day to day metabolic load, if prescribed after clinical review.",
    leadTitle: "A multi month reset.\nAppetite and composition\nin the same protocol.",
    whatIs:
      "Appetite Balance is a care plan for a months long reset of hunger and composition, not a two week cut. A physician reviews what, if anything, is prescribed. Molecule details stay behind login.",
    chips: ["Balance", "Shape", "Consistency"],
    callouts: [
      "When food takes up too much room",
      "More than a number on the scale",
      "Months, not weeks",
    ],
    sells: [
      "Food stops being a fight, and the goal is to keep it that way for months.",
      "The scale only tells you so much. This works on fat and muscle together.",
      "Things get adjusted as the months go by, so you're never stuck on something that stopped working.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: METABOLIC_STILLS,
    form: "pen",
    bmi: true,
  },
  {
    id: "mens-peak-performance",
    title: "Men's Peak Performance",
    tagline: "Energy, lean mass, and drive, if prescribed",
    metadataDescription:
      "Physician guided men's care for energy, lean mass, and drive. Available if prescribed after clinical review.",
    body: "Support for daytime energy, drive, and the recovery window after hard sessions, if prescribed after clinical review. A physician writes the protocol as one visit.",
    leadTitle: "Energy, lean mass,\nand drive as one\nclinical brief",
    whatIs:
      "Men's Peak Performance is a care plan for men whose energy, body composition, and drive have slipped together. The visit covers daytime energy, lean mass, and libido as one protocol. Available if prescribed after clinical review.",
    chips: ["Energy", "Strength", "Drive"],
    callouts: [
      "The afternoon crash",
      "Work that isn't showing up",
      "Getting your edge back",
    ],
    sells: [
      "You shouldn't need a third coffee to get through the day. Steady energy, morning to night.",
      "You're putting in the work. It should show.",
      "Energy, lean mass and drive tend to dip together. This goes after all three at once.",
    ],
    video: "/landing/hero/mens-health.mp4",
    poster: "/landing/hero/mens-health.jpg",
    stills: MENS_STILLS,
    form: "pen",
  },
  {
    id: "repair-mobility",
    title: "Repair & Mobility",
    tagline: "Tissue repair and recovery, if prescribed",
    metadataDescription:
      "Physician guided care for joints, soft tissue, and rebound. Available if prescribed after clinical review.",
    body: "Joints, soft tissue, and rebound so you can return to the work that matters, if prescribed after clinical review. The gap is not another training plan.",
    leadTitle: "Tissue, soreness,\nand the days between\nhard sessions",
    whatIs:
      "Repair and Mobility is a care plan for tissue, soreness, and mobility when the gap is not another training plan. The visit is the days between sessions. Available if prescribed after clinical review.",
    chips: ["Recover", "Flexibility", "Strength"],
    callouts: [
      "When soreness picks your schedule",
      "Cranky knees, tight shoulders",
      "No more working around it",
    ],
    sells: [
      "When you're sore for days, your body's deciding when you train. Take that back.",
      "Tendons and joints come back slow. Give them some help and stay flexible.",
      "Whatever you love doing, do it without working around something that hurts.",
    ],
    video: "/landing/hero/transformation.mp4",
    poster: "/landing/hero/transformation.jpg",
    stills: REPAIR_STILLS,
    form: "pen",
  },
  {
    id: "rest-rebuild",
    title: "Rest & Rebuild",
    tagline: "Recover, rebuild, and return, if prescribed",
    metadataDescription:
      "Physician guided recovery care for sleep debt and training load. Available if prescribed after clinical review.",
    body: "Between session recovery built for sleep debt, training load, and showing up ready, if prescribed after clinical review.",
    leadTitle: "The days between\nsessions are the\nactual work",
    whatIs:
      "Rest and Rebuild is a care plan for people who already train hard. The gap is recovery, tissue, and sleep around that load. Available if prescribed after clinical review.",
    chips: ["Sleep", "Recovery", "Readiness"],
    callouts: [
      "Nights after the hard days",
      "Two hard days in a row",
      "Showing up recovered",
    ],
    sells: [
      "Training breaks you down. Sleep builds you back. Get more of the good kind.",
      "Less time sore, more time training.",
      "Walk into the next session feeling like you recovered from the last one.",
    ],
    video: "/landing/hero/athletes.mp4",
    poster: "/landing/hero/athletes.jpg",
    stills: ATHLETE_STILLS,
    form: "pen",
  },
  {
    id: "longevity",
    title: "Longevity",
    tagline: "Healthy aging and repair, if prescribed",
    metadataDescription:
      "Physician guided healthspan care for capacity and aging markers. Available if prescribed after clinical review.",
    body: "Healthspan minded care for aging markers, capacity, and the years you want to feel capable, if prescribed after clinical review.",
    leadTitle: "Function over the\nnext decade, not a\nseason of training",
    whatIs:
      "Longevity is a care plan for the next decade of function, not a race or a weight target. Metabolic markers, capacity, and a physician reading your numbers. Available if prescribed after clinical review.",
    chips: ["Health", "Strength", "Years"],
    callouts: [
      "Catching it early",
      "Still capable at seventy",
      "Better ones, not just more",
    ],
    sells: [
      "A lot shows up in your labs before you ever feel it. This starts with yours.",
      "Strong now is good. Strong at seventy is the goal.",
      "Live longer, sure. But mostly live better, with your numbers tracked the whole way.",
    ],
    video: "/landing/hero/healthspan.mp4",
    poster: "/landing/hero/healthspan.jpg",
    stills: LONGEVITY_STILLS,
    form: "pen",
  },
  {
    id: "focus",
    title: "Focus",
    tagline: "Memory and mental clarity, if prescribed",
    metadataDescription:
      "Physician guided care for sustained attention and mental clarity. Available if prescribed after clinical review.",
    body: "A care plan for long sessions, late hours, and a nervous system that never clocks out, if prescribed after clinical review.",
    leadTitle: "Sustained attention\nfor the hours the\nwork actually takes",
    whatIs:
      "Focus is a care plan for long sessions and late hours. Attention, wind down, and the physiological load of chronic pressure sit in one stack. Available if prescribed after clinical review.",
    chips: ["Sharpness", "Clarity", "Acuity"],
    callouts: [
      "Long days of real thinking",
      "Remembering what you read",
      "Turning it off at night",
    ],
    sells: [
      "Stay sharp through the whole session, without the jitters or the crash after.",
      "Some days your brain just works. Have more of those.",
      "Being on all day only works if you can turn it off at night. Tomorrow needs you too.",
    ],
    video: "/landing/hero/creators-and-builders.mp4",
    poster: "/landing/hero/creators-and-builders.jpg",
    stills: FOCUS_STILLS,
    form: "pen",
  },
  {
    id: "stress-mood",
    title: "Stress & Mood",
    tagline: "Mood, stress, and clearer days, if prescribed",
    metadataDescription:
      "Physician guided care for mood and the physiological load of stress. Available if prescribed after clinical review.",
    body: "Care for the version of you that still has something left after work and bedtime, if prescribed after clinical review.",
    leadTitle: "The second shift\nis physiology.\nTreat it that way.",
    whatIs:
      "Stress and Mood is a care plan that assumes interrupted sleep and a second shift. School runs and bedtime are the constraints. Available if prescribed after clinical review.",
    chips: ["Calm", "Sleep", "Balance"],
    callouts: [
      "Dinner, bedtime, all of it",
      "Fewer hours, better ones",
      "Running your day, not chasing it",
    ],
    sells: [
      "Work's done, and now there's dinner and bedtime. Stay calm through all of it.",
      "You can't add hours to the night. You can make the ones you get count.",
      "Feel like you're the one running your day.",
    ],
    video: "/landing/hero/parents.mp4",
    poster: "/landing/hero/parents.jpg",
    stills: STRESS_STILLS,
    form: "pen",
  },
  {
    id: "womens-total-balance",
    title: "Women's Total Balance",
    tagline: "Hormone, energy, and skin, if prescribed",
    metadataDescription:
      "Physician guided women's care for energy, mood, and every hormonal chapter. Available if prescribed after clinical review.",
    body: "Hormone aware care for mood, cycle, energy, and skin across every chapter, if prescribed after clinical review.",
    leadTitle: "Energy, mood,\nand metabolic support\nas physiology shifts",
    whatIs:
      "Women's Total Balance is a care plan for energy, mood, weight, and desire as physiology shifts across cycle, perimenopause, and menopause. Available if prescribed after clinical review.",
    chips: ["Energy", "Balance", "Glow"],
    callouts: [
      "Tired that gets called normal",
      "What used to work, doesn't",
      "Your skin changed too",
    ],
    sells: [
      "Being exhausted all the time isn't just part of getting older. Get your energy back.",
      "Same diet, same workouts, different results. Your hormones changed the rules. This helps you catch up.",
      "Look and feel like yourself again, whatever stage you're in.",
    ],
    video: "/landing/hero/womens-balance.mp4",
    poster: "/landing/hero/womens-balance.jpg",
    stills: WOMENS_STILLS,
    form: "pen",
  },
  {
    id: "hair-skin-nails",
    title: "Hair, Skin & Nails",
    tagline: "Skin health and healing, if prescribed",
    metadataDescription:
      "Physician guided care for hair you want to keep and skin a topical does not reach. Available if prescribed after clinical review.",
    body: "A stack for hair you want to keep and skin that is more than a topical, if prescribed after clinical review.",
    leadTitle: "Hair you want to keep.\nSkin a cream does\nnot reach.",
    whatIs:
      "Hair, Skin and Nails is a care plan for thinning hair and for skin quality that a cream does not reach. Built to act while there is still hair to keep. Available if prescribed after clinical review.",
    chips: ["Thick hair", "Glowing skin", "Strong nails"],
    callouts: [
      "Act while there's plenty",
      "Where creams can't reach",
      "The ones that keep breaking",
    ],
    sells: [
      "Hair's a lot easier to keep than to get back. Start while you've got plenty to work with.",
      "Creams work on the surface. This works on firmness and texture from underneath.",
      "Stronger nails, and one less thing you notice in every photo.",
    ],
    video: "/landing/hero/skin-and-hair.mp4",
    poster: "/landing/hero/skin-and-hair.jpg",
    stills: HAIR_STILLS,
    form: "pen",
  },
  {
    id: "pain-relief",
    title: "Pain Relief",
    tagline: "Sore tissue and inflammation",
    metadataDescription:
      "TIDL topical pain relief for sore tissue. Shop the OTC line. No prescription required.",
    body: "Topical care for sore tissue and inflammation. This line is over the counter. Shop the sprays, creams, and systems on the Pain Relief page.",
    leadTitle: "Sore tissue.\nA topical line.\nNo intake required.",
    whatIs:
      "Pain Relief is TIDL's topical line for sore tissue and inflammation. It is over the counter. It is not a peptide visit. Shop the products on the Pain Relief page.",
    chips: ["Relief", "Recovery", "Mobility"],
    callouts: [
      "Sore, aching muscles",
      "The day after a hard session",
      "Getting back to training",
    ],
    sells: [
      "Cooling and warming topicals you put right where it hurts.",
      "Sprays and creams for the soreness that shows up later.",
      "Stay loose so you can get back to training.",
    ],
    video: "/landing/hero/recovery-and-performance.mp4",
    poster: "/landing/hero/recovery-and-performance.jpg",
    stills: REPAIR_STILLS,
    form: "otc",
  },
];

export const CATALOG_PDP_BY_ID: Readonly<Record<string, CatalogPdpSpec>> =
  Object.fromEntries(CATALOG_PDP_SPECS.map((spec) => [spec.id, spec]));
