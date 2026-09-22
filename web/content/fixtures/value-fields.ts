/** Expanding notecard rail under the shop. Goal framed. No molecule names. */

import type { ThemeId } from "@/content/brand/peptide-identity";

export type ValueNote = {
  chip: string;
  title: string;
  /** Full bleed benefits slide. No trailing if prescribed. */
  sell: string;
};

export type ValueFieldCard = {
  id: ThemeId;
  pill: string;
  href: string;
  iconSrc: string;
  cardSrc: string;
  wideSrc: string;
  fieldSrc: string;
  title: string;
  /** Glass panel headline. Goal framed. No molecule names. */
  claim: string;
  lede: string;
  notes: readonly [ValueNote, ValueNote, ValueNote];
};

const CROSS_ICON = "/landing/section-2/icons/cross.svg";
const card = (id: string) => `/landing/section-2/cards/${id}-card.jpg`;
const wide = (id: string) => `/landing/section-2/cards/${id}-wide.jpg`;
const field = (id: string) => `/landing/section-2/fields/${id}.png`;

export const valueFields = {
  titleLead: "Built for",
  titleAccent: "how you live",
  items: [
    {
      id: "mens-health",
      pill: "Energy & Strength",
      href: "/treatments/mens-health",
      iconSrc: CROSS_ICON,
      cardSrc: card("mens-health"),
      wideSrc: wide("mens-health"),
      fieldSrc: field("mens-health"),
      title: "Energy all day",
      claim: "Stop living on the caffeine loop. This stack is built for the crash, the softness, and the fog.",
      lede: "A physician guided stack for the crash, the softness, and the fog. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Energy",
          title: "Built for the afternoon slump and the caffeine loop",
          sell: "The afternoon slump and the caffeine loop are the brief. This stack is built to hold the day without another cup.",
        },
        {
          chip: "Strength",
          title: "Built for lean mass when training stops showing",
          sell: "Training stopped showing. The protocol treats lean mass as the job, not a side effect of trying harder.",
        },
        {
          chip: "Drive",
          title: "Built for focus, mood, and libido as one protocol",
          sell: "Focus, mood, and libido as one visit. A physician writes the protocol instead of three separate guesses.",
        },
      ],
    },
    {
      id: "athlete",
      pill: "Dynamic Training",
      href: "/programs/athletes",
      iconSrc: CROSS_ICON,
      cardSrc: card("athlete"),
      wideSrc: wide("athlete"),
      fieldSrc: field("athlete"),
      title: "Recover faster",
      claim: "Stop letting soreness set the calendar. This stack is built for the days between sessions.",
      lede: "A stack for the days between sessions. Tissue, sleep, and capacity, reviewed by a physician. Available if prescribed.",
      notes: [
        {
          chip: "Recovery",
          title: "Built for turnaround when soreness still sets the calendar",
          sell: "Soreness has been setting the calendar. This stack is built for the days between sessions, not another rest week you cannot take.",
        },
        {
          chip: "Repair",
          title: "Built for tendons, joints, and tissue that comes back slow",
          sell: "Tendons and joints that come back slow are the brief. The protocol is written for tissue, not for ignoring it.",
        },
        {
          chip: "Sleep",
          title: "Built for nights that have to absorb the training load",
          sell: "Nights have to absorb the training load. The protocol treats rest as part of the work, not what is left over.",
        },
      ],
    },
    {
      id: "creative",
      pill: "Focus",
      href: "/programs/creators-and-builders",
      iconSrc: CROSS_ICON,
      cardSrc: card("creative"),
      wideSrc: wide("creative"),
      fieldSrc: field("creative"),
      title: "Do deep work",
      claim: "Stop paying for deep work the next morning. This stack is built for long sessions.",
      lede: "A stack for long sessions, late hours, and a nervous system that never clocks out. Available if prescribed.",
      notes: [
        {
          chip: "Focus",
          title: "Built for sustained attention without the spike and crash",
          sell: "Long sessions without the spike and crash. This stack is built for the hours the work actually takes.",
        },
        {
          chip: "Sleep",
          title: "Built for rest on a schedule the job will not protect",
          sell: "The job will not protect your rest. The protocol is written so the next morning is still usable.",
        },
        {
          chip: "Stress",
          title: "Built for the physiological load of chronic pressure",
          sell: "Chronic pressure is a physiological load. A physician writes for that, not for another productivity hack.",
        },
      ],
    },
    {
      id: "executive",
      pill: "Peak Performance",
      href: "/programs/ceos-and-executives",
      iconSrc: CROSS_ICON,
      cardSrc: card("executive"),
      wideSrc: wide("executive"),
      fieldSrc: field("executive"),
      title: "Perform under pressure",
      claim: "Hour ten is still the job. This stack is built for a calendar that does not flex.",
      lede: "A stack for a calendar that does not flex. Energy, composition, and stamina under physician review. Available if prescribed.",
      notes: [
        {
          chip: "Stamina",
          title: "Built for hour ten, not just hour two",
          sell: "Hour ten is still the job. This stack is built for the calendar you cannot move.",
        },
        {
          chip: "Composition",
          title: "Built for travel, dinners, and a body you cannot schedule",
          sell: "Travel and dinners do not pause. The protocol treats the body as part of the job, not something you schedule later.",
        },
        {
          chip: "Focus",
          title: "Built for clear decisions across a long day",
          sell: "Clear decisions across a long day. The protocol is written for the meeting that still matters at eight.",
        },
      ],
    },
    {
      id: "legacy",
      pill: "Longevity",
      href: "/programs/healthspan",
      iconSrc: CROSS_ICON,
      cardSrc: card("legacy"),
      wideSrc: wide("legacy"),
      fieldSrc: field("legacy"),
      title: "Add good years",
      claim: "Time on the clock is not the protocol. This stack is built for function you still want to use.",
      lede: "A stack for function and capacity as the years add up, not just time on the clock. Available if prescribed.",
      notes: [
        {
          chip: "Metabolic",
          title: "Built for fuel, composition, and the drift you cannot feel yet",
          sell: "Fuel and composition drift before you feel it. This stack is built to read that early, with a physician on the numbers.",
        },
        {
          chip: "Capacity",
          title: "Built for strength and recovery you still want to use",
          sell: "Strength and recovery you still want to use. The protocol is written for function, not for time on the clock.",
        },
        {
          chip: "Baseline",
          title: "Built for a physician reading your numbers, not an average",
          sell: "A physician reads your numbers, not an average. That is the difference between a protocol and a supplement aisle.",
        },
      ],
    },
    {
      id: "parents",
      pill: "Stress & Mood",
      href: "/programs/parents",
      iconSrc: CROSS_ICON,
      cardSrc: card("parents"),
      wideSrc: wide("parents"),
      fieldSrc: field("parents"),
      title: "Have energy left",
      claim: "Bedtime should not take the last of you. This stack is built for what you have left.",
      lede: "A stack for the version of you that still has something left after work and bedtime. Available if prescribed.",
      notes: [
        {
          chip: "Energy",
          title: "Built for the second shift after the workday is done",
          sell: "The second shift starts when the workday ends. This stack is built for what you have left, not for a morning you do not get.",
        },
        {
          chip: "Sleep",
          title: "Built for rest when more hours are not an option",
          sell: "More hours are not an option. The protocol treats rest as the job, not a luxury.",
        },
        {
          chip: "Stress",
          title: "Built for the load of running a household, not absorbing it",
          sell: "Running a household is a load. A physician writes for that instead of asking you to absorb it.",
        },
      ],
    },
    {
      id: "recovery-performance",
      pill: "Recovery & Performance",
      href: "/treatments/recovery-and-performance",
      iconSrc: CROSS_ICON,
      cardSrc: card("recovery-performance"),
      wideSrc: wide("recovery-performance"),
      fieldSrc: field("recovery-performance"),
      title: "Come back faster",
      claim: "Stop training around what still hurts. This stack is built for coming back between sessions.",
      lede: "A stack for soreness, wear, and the weeks lost to not bouncing back. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Recovery",
          title: "Built for the downtime between hard sessions",
          sell: "The downtime between hard sessions is the brief. This stack is built to use those days, not waste them.",
        },
        {
          chip: "Repair",
          title: "Built for tissue that takes the impact and heals slowly",
          sell: "Tissue that takes the impact and heals slowly. The protocol is written for coming back, not training around it.",
        },
        {
          chip: "Mobility",
          title: "Built for moving well, not training around what hurts",
          sell: "Moving well is the job. The protocol treats what hurts as the visit, not a footnote.",
        },
      ],
    },
    {
      id: "sexual-health",
      pill: "Sexual Health",
      href: "/treatments/sexual-health",
      iconSrc: CROSS_ICON,
      cardSrc: card("sexual-health"),
      wideSrc: wide("sexual-health"),
      fieldSrc: field("sexual-health"),
      title: "Show up",
      claim: "Function is not the whole brief. This stack is built for desire and reliability.",
      lede: "A physician guided stack for desire and reliability, reviewed in private. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Desire",
          title: "Built for drive, not only function",
          sell: "Function is not the whole brief. This stack is built for drive, reviewed in private by a physician.",
        },
        {
          chip: "Confidence",
          title: "Built for showing up with less uncertainty",
          sell: "Showing up with less uncertainty. The protocol is written for reliability, not a waiting room script.",
        },
        {
          chip: "Care",
          title: "Built for real prescription review, not a waiting room",
          sell: "Real prescription review. A physician decides the plan, not a cart.",
        },
      ],
    },
    {
      id: "skin-hair",
      pill: "Skin & Hair",
      href: "/treatments/skin-and-hair",
      iconSrc: CROSS_ICON,
      cardSrc: card("skin-hair"),
      wideSrc: wide("skin-hair"),
      fieldSrc: field("skin-hair"),
      title: "Keep your hair",
      claim: "A topical is a finish. This stack is built for hair you want to keep.",
      lede: "A stack for hair you want to keep and skin that is more than a topical routine. Available if prescribed.",
      notes: [
        {
          chip: "Hair",
          title: "Built for acting while you still have something to keep",
          sell: "Act while you still have something to keep. This stack is built for that window, not a topical you already tried.",
        },
        {
          chip: "Skin",
          title: "Built for firmness and texture, not a finish that washes off",
          sell: "Firmness and texture a cream does not reach. The protocol is written under the surface, not as a finish.",
        },
        {
          chip: "Tone",
          title: "Built for the things you notice in every photo",
          sell: "The things you notice in every photo. A physician writes for that, not another serum.",
        },
      ],
    },
    {
      id: "transformation",
      pill: "Appetite Balance",
      href: "/stacks/transformation",
      iconSrc: CROSS_ICON,
      cardSrc: card("transformation"),
      wideSrc: wide("transformation"),
      fieldSrc: field("transformation"),
      title: "Get a different body",
      claim: "Willpower is not a protocol. This stack is built for appetite, composition, and the months it takes.",
      lede: "A physician guided GLP 1 stack for appetite, composition, and the months it takes to change how you carry yourself. Available if prescribed.",
      notes: [
        {
          chip: "Appetite",
          title: "Built for food noise that has been running the day",
          sell: "The day has been organized around the next meal. This stack is built to change that, with a physician on the protocol, not another set of rules.",
        },
        {
          chip: "Muscle",
          title: "Built for losing fat without giving up lean mass",
          sell: "Keep the shape you trained for. The protocol treats composition as the job, not a side effect of eating less.",
        },
        {
          chip: "Guidance",
          title: "Built for a physician adjusting the protocol as you go",
          sell: "A physician stays in it after the first month. Dose, pace, and hold points move with how you actually respond.",
        },
      ],
    },
    {
      id: "traveler",
      pill: "Jetlag Recovery",
      href: "/programs/travelers",
      iconSrc: CROSS_ICON,
      cardSrc: card("traveler"),
      wideSrc: wide("traveler"),
      fieldSrc: field("traveler"),
      title: "Take it with you",
      claim: "The protocol should not pause at the gate. This stack is built to hold across time zones.",
      lede: "A pre dosed stack that holds together across time zones, hotel sleep, and missed training. Available if prescribed.",
      notes: [
        {
          chip: "Rhythm",
          title: "Built for landing ready to work, not spent from the flight",
          sell: "Landing ready to work, not spent from the flight. This stack is built for the clock you cannot reset.",
        },
        {
          chip: "Recovery",
          title: "Built for training and sleep that travel keeps interrupting",
          sell: "Training and sleep that travel keeps interrupting. The protocol is written to hold when the room changes.",
        },
        {
          chip: "Continuity",
          title: "Built for a protocol that does not pause when you leave home",
          sell: "The protocol does not pause at the gate. A physician writes it to travel with you.",
        },
      ],
    },
    {
      id: "weight-loss",
      pill: "Weight Loss",
      href: "/treatments/weight-loss",
      iconSrc: CROSS_ICON,
      cardSrc: card("weight-loss"),
      wideSrc: wide("weight-loss"),
      fieldSrc: field("weight-loss"),
      title: "Stop fighting hunger",
      claim: "Stop letting hunger run the day. This stack is built for appetite, pace, and lean mass.",
      lede: "A physician guided GLP 1 stack for appetite, pace, and keeping muscle on the way down. Available if prescribed.",
      notes: [
        {
          chip: "Appetite",
          title: "Built for hunger that has been the whole job",
          sell: "Hunger has been the whole job. This is a physician guided GLP 1 stack built to take that off the day.",
        },
        {
          chip: "Pace",
          title: "Built for loss your physician is willing to stand behind",
          sell: "The brief is a pace a physician will stand behind. Not a crash, and not a number you cannot keep.",
        },
        {
          chip: "Muscle",
          title: "Built for protecting lean mass while the scale moves",
          sell: "Protect lean mass while the scale moves. The protocol treats composition as the job, not a casualty.",
        },
      ],
    },
    {
      id: "womens-balance",
      pill: "Balance & Beauty",
      href: "/treatments/womens-balance",
      iconSrc: CROSS_ICON,
      cardSrc: card("womens-balance"),
      wideSrc: wide("womens-balance"),
      fieldSrc: field("womens-balance"),
      title: "Meet every stage",
      claim: "Fatigue is not a personality. This stack is built for energy, mood, and every hormonal chapter.",
      lede: "A stack for energy, mood, weight, and desire as your physiology shifts. Available if prescribed.",
      notes: [
        {
          chip: "Energy",
          title: "Built for the fatigue and mood swings that get called normal",
          sell: "Fatigue and mood swings that get called normal. This stack is built for those chapters, with a physician on the protocol.",
        },
        {
          chip: "Metabolic",
          title: "Built for weight that stopped responding to what used to work",
          sell: "Weight that stopped responding to what used to work. The protocol is written for the shift, not another restriction you already know.",
        },
        {
          chip: "Desire",
          title: "Built for intimacy that is chronically under treated",
          sell: "Intimacy that is chronically under treated. A physician writes it into the visit instead of leaving it off the list.",
        },
      ],
    },
  ] as const satisfies readonly ValueFieldCard[],
} as const;
