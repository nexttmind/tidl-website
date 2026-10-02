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
      pill: "Men's Peak Performance",
      href: "/treatments/mens-health",
      iconSrc: CROSS_ICON,
      cardSrc: card("mens-health"),
      wideSrc: wide("mens-health"),
      fieldSrc: field("mens-health"),
      title: "Energy all day",
      claim: "For the guy who's dragging by mid afternoon and doesn't feel like himself lately. Get your energy and your edge back.",
      lede: "A physician guided stack for the crash, the softness, and the fog. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Energy",
          title: "The afternoon crash",
          sell: "The afternoon slump and the caffeine loop are the brief. This stack is built to hold the day without another cup.",
        },
        {
          chip: "Strength",
          title: "Work that isn't showing up",
          sell: "Training stopped showing. The protocol treats lean mass as the job, not a side effect of trying harder.",
        },
        {
          chip: "Drive",
          title: "Getting your edge back",
          sell: "Focus, mood, and libido as one visit. A physician writes the protocol instead of three separate guesses.",
        },
      ],
    },
    {
      id: "athlete",
      pill: "Rest & Rebuild",
      href: "/programs/athletes",
      iconSrc: CROSS_ICON,
      cardSrc: card("athlete"),
      wideSrc: wide("athlete"),
      fieldSrc: field("athlete"),
      title: "Recover faster",
      claim: "You train hard. Recovery's the part holding you back. Bounce back faster and show up ready.",
      lede: "A stack for the days between sessions. Tissue, sleep, and capacity, reviewed by a physician. Available if prescribed.",
      notes: [
        {
          chip: "Rebound",
          title: "Nights after the hard days",
          sell: "Soreness has been setting the calendar. This stack is built for the days between sessions, not another rest week you cannot take.",
        },
        {
          chip: "Durability",
          title: "Two hard days in a row",
          sell: "Tendons and joints that come back slow are the brief. The protocol is written for tissue, not for ignoring it.",
        },
        {
          chip: "Recharge",
          title: "Showing up recovered",
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
      claim: "Long days of real thinking take it out of you. Stay locked in for hours, then switch off at night.",
      lede: "A stack for long sessions, late hours, and a nervous system that never clocks out. Available if prescribed.",
      notes: [
        {
          chip: "Deep work",
          title: "Long days of real thinking",
          sell: "Long sessions without the spike and crash. This stack is built for the hours the work actually takes.",
        },
        {
          chip: "Output",
          title: "Remembering what you read",
          sell: "The job will not protect your rest. The protocol is written so the next morning is still usable.",
        },
        {
          chip: "Rest",
          title: "Turning it off at night",
          sell: "Chronic pressure is a physiological load. A physician writes for that, not for another productivity hack.",
        },
      ],
    },
    {
      id: "executive",
      pill: "Complete Stack",
      href: "/programs/ceos-and-executives",
      iconSrc: CROSS_ICON,
      cardSrc: card("executive"),
      wideSrc: wide("executive"),
      fieldSrc: field("executive"),
      title: "Perform under pressure",
      claim: "Your calendar isn't going to ease up. Energy, recovery and metabolism, all handled together.",
      lede: "A stack for a calendar that does not flex. Energy, composition, and stamina under physician review. Available if prescribed.",
      notes: [
        {
          chip: "Stamina",
          title: "When you want all of it covered",
          sell: "Hour ten is still the job. This stack is built for the calendar you cannot move.",
        },
        {
          chip: "Form",
          title: "So the week doesn't wreck you",
          sell: "Travel and dinners do not pause. The protocol treats the body as part of the job, not something you schedule later.",
        },
        {
          chip: "Command",
          title: "Travel and late dinners",
          sell: "A full calendar keeps taking strength. The protocol treats lean mass as part of the job, not what is left after it.",
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
      claim: "More years only matter if you feel good in them. This is about staying strong and sharp for the long haul.",
      lede: "A stack for function and capacity as the years add up, not just time on the clock. Available if prescribed.",
      notes: [
        {
          chip: "Vitality",
          title: "Catching it early",
          sell: "Fuel and composition drift before you feel it. This stack is built to read that early, with a physician on the numbers.",
        },
        {
          chip: "Clarity",
          title: "Still capable at seventy",
          sell: "Strength and recovery you still want to use. The protocol is written for function, not for time on the clock.",
        },
        {
          chip: "Legacy",
          title: "Better ones, not just more",
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
      claim: "Work all day, parent all night. Have some energy and patience left when you walk in the door.",
      lede: "A stack for the version of you that still has something left after work and bedtime. Available if prescribed.",
      notes: [
        {
          chip: "Energy",
          title: "Dinner, bedtime, all of it",
          sell: "The second shift starts when the workday ends. This stack is built for what you have left, not for a morning you do not get.",
        },
        {
          chip: "Patience",
          title: "Fewer hours, better ones",
          sell: "More hours are not an option. The protocol treats rest as the job, not a luxury.",
        },
        {
          chip: "Presence",
          title: "Running your day, not chasing it",
          sell: "Running a household is a load. A physician writes for that instead of asking you to absorb it.",
        },
      ],
    },
    {
      id: "recovery-performance",
      pill: "Repair & Mobility",
      href: "/treatments/recovery-and-performance",
      iconSrc: CROSS_ICON,
      cardSrc: card("recovery-performance"),
      wideSrc: wide("recovery-performance"),
      fieldSrc: field("recovery-performance"),
      title: "Come back faster",
      claim: "Sore joints and slow recovery shouldn't decide what you get to do. Recover fast and stay flexible.",
      lede: "A stack for soreness, wear, and the weeks lost to not bouncing back. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Recovery",
          title: "When soreness picks your schedule",
          sell: "The downtime between hard sessions is the brief. This stack is built to use those days, not waste them.",
        },
        {
          chip: "Repair",
          title: "Cranky knees, tight shoulders",
          sell: "Tissue that takes the impact and heals slowly. The protocol is written for coming back, not training around it.",
        },
        {
          chip: "Strengthen",
          title: "No more working around it",
          sell: "Getting back under load is the goal. The protocol is written for rebuilding, not just waiting it out.",
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
      claim: "Better sex starts with wanting it and trusting your body. This covers both, privately.",
      lede: "A physician guided stack for desire and reliability, reviewed in private. Available if prescribed after clinical review.",
      notes: [
        {
          chip: "Desire",
          title: "Wanting to, first",
          sell: "Function is not the whole brief. This stack is built for drive, reviewed in private by a physician.",
        },
        {
          chip: "Confidence",
          title: "Ready when it counts",
          sell: "Showing up with less uncertainty. The protocol is written for reliability, not a waiting room script.",
        },
        {
          chip: "Discretion",
          title: "Discreet from the first click",
          sell: "Real prescription review. A physician decides the plan, not a cart.",
        },
      ],
    },
    {
      id: "skin-hair",
      pill: "Hair, Skin & Nails",
      href: "/treatments/skin-and-hair",
      iconSrc: CROSS_ICON,
      cardSrc: card("skin-hair"),
      wideSrc: wide("skin-hair"),
      fieldSrc: field("skin-hair"),
      title: "Keep your hair",
      claim: "Keep the hair you have and get your glow back. This goes deeper than another serum.",
      lede: "A stack for hair you want to keep and skin that is more than a topical routine. Available if prescribed.",
      notes: [
        {
          chip: "Fullness",
          title: "Act while there's plenty",
          sell: "Act while you still have something to keep. This stack is built for that window, not a topical you already tried.",
        },
        {
          chip: "Firmness",
          title: "Where creams can't reach",
          sell: "Firmness and texture a cream does not reach. The protocol is written under the surface, not as a finish.",
        },
        {
          chip: "Glow",
          title: "The ones that keep breaking",
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
      claim: "When food's the loudest thing in your head, willpower doesn't stand a chance. Turn the volume down and get your day back.",
      lede: "A physician guided GLP 1 stack for appetite, composition, and the months it takes to change how you carry yourself. Available if prescribed.",
      notes: [
        {
          chip: "Freedom",
          title: "When food takes up too much room",
          sell: "The day has been organized around the next meal. This stack is built to change that, with a physician on the protocol, not another set of rules.",
        },
        {
          chip: "Simplicity",
          title: "More than a number on the scale",
          sell: "One plan instead of a system of rules. The protocol takes the tracking and the math off the day.",
        },
        {
          chip: "Care",
          title: "Months, not weeks",
          sell: "A physician stays in it after the first month. Dose, pace, and hold points move with how you actually respond.",
        },
      ],
    },
    {
      id: "traveler",
      pill: "Cellular Health",
      href: "/programs/travelers",
      iconSrc: CROSS_ICON,
      cardSrc: card("traveler"),
      wideSrc: wide("traveler"),
      fieldSrc: field("traveler"),
      title: "Take it with you",
      claim: "Tired in a way sleep doesn't fix? Energy starts in your cells. This starts there too.",
      lede: "A pre dosed stack that holds together across time zones, hotel sleep, and missed training. Available if prescribed.",
      notes: [
        {
          chip: "Rhythm",
          title: "Tired that sleep doesn't fix",
          sell: "Landing ready to work, not spent from the flight. This stack is built for the clock you cannot reset.",
        },
        {
          chip: "Sharpness",
          title: "Weeks that don't let up",
          sell: "Training and sleep that travel keeps interrupting. The protocol is written to hold when the room changes.",
        },
        {
          chip: "Consistency",
          title: "No caffeine required",
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
      claim: "Hunger's been running the show long enough. Quiet it down and everything else gets easier.",
      lede: "A physician guided GLP 1 stack for appetite, pace, and keeping muscle on the way down. Available if prescribed.",
      notes: [
        {
          chip: "Balance",
          title: "Hunger that won't quit",
          sell: "Hunger has been the whole job. This is a physician guided GLP 1 stack built to take that off the day.",
        },
        {
          chip: "Momentum",
          title: "Not a crash diet",
          sell: "The brief is a pace a physician will stand behind. Not a crash, and not a number you cannot keep.",
        },
        {
          chip: "Strength",
          title: "Liking what you see",
          sell: "Protect lean mass while the scale moves. The protocol treats composition as the job, not a casualty.",
        },
      ],
    },
    {
      id: "womens-balance",
      pill: "Women's Total Balance",
      href: "/treatments/womens-balance",
      iconSrc: CROSS_ICON,
      cardSrc: card("womens-balance"),
      wideSrc: wide("womens-balance"),
      fieldSrc: field("womens-balance"),
      title: "Meet every stage",
      claim: "Tired all the time and told it's normal? It doesn't have to be. Get your energy and balance back.",
      lede: "A stack for energy, mood, weight, and skin as your physiology shifts. Available if prescribed.",
      notes: [
        {
          chip: "Radiance",
          title: "Tired that gets called normal",
          sell: "Fatigue and mood swings that get called normal. This stack is built for those chapters, with a physician on the protocol.",
        },
        {
          chip: "Balance",
          title: "What used to work, doesn't",
          sell: "Weight that stopped responding to what used to work. The protocol is written for the shift, not another restriction you already know.",
        },
        {
          chip: "Glow",
          title: "Your skin changed too",
          sell: "Skin shifts with every hormonal chapter. A physician writes for that, not another shelf of serums.",
        },
      ],
    },
  ] as const satisfies readonly ValueFieldCard[],
} as const;
