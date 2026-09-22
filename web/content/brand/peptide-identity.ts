/**
 * TIDL peptide identity system.
 *
 * Consumer surfaces stay goal framed and stack named. No molecule names.
 * Longevity is the company field, not a stack. Directions are the atoms.
 *
 * Marks are filled stamps. One metaphor per category. Same ink, same
 * canvas, same optical weight. Direction marks are atomic. Photographic
 * flare remains a second expression for plates and vials.
 */

export type DirectionId = "metabolic" | "repair" | "mental" | "sleep";

export type CategoryId =
  | "executive"
  | "athlete"
  | "transformation"
  | "parents"
  | "creative"
  | "legacy"
  | "traveler";

export type Direction = {
  id: DirectionId;
  label: string;
  index: string;
  hue: string;
  /** Ops only. Never render on consumer chrome. */
  role: string;
};

export type CategoryGlow = {
  id: CategoryId;
  label: string;
  index: string;
  /** Dominant field hue */
  primary: string;
  /** Hot core in the glow */
  core: string;
  /** Warm heel. Always present so night plates never go cold clinical. */
  heel: string;
  /** Photographic light-leak plate. Prefer this over CSS radials. */
  fieldSrc?: string;
  css: string;
};

export type ThemeId = CategoryId | TreatmentThemeId;

export type TreatmentThemeId =
  | "weight-loss"
  | "sexual-health"
  | "mens-health"
  | "womens-balance"
  | "skin-hair"
  | "recovery-performance";

export type ThemeKind = "program" | "treatment";

export type ThemeCloud = {
  color: string;
  opacity: number;
  /** CSS position, e.g. "18% 22%". Clouds sit in opposite corners. */
  at: string;
  size?: string;
};

export type ThemeExpression = {
  name: string;
  wash: string;
  depth: string;
  clouds: readonly ThemeCloud[];
  accents: Readonly<Record<string, string>>;
  css: string;
};

export type ThemeField = {
  id: ThemeId;
  label: string;
  kind: ThemeKind;
  index: string;
  /** One line. The feeling, not the footage. */
  theme: string;
  metaphor: string;
  ink: string;
  atmosphere: ThemeExpression;
  streak: ThemeExpression;
  night: {
    /** Dark saturated ground. Neutral black greys every cloud that sits on it. */
    ground: string;
    primary: string;
    core: string;
    heel: string;
    fieldSrc?: string;
    clouds: readonly ThemeCloud[];
    css: string;
  };
};

function meshCss(
  wash: string,
  depth: string,
  clouds: readonly ThemeCloud[],
): string {
  const radials = clouds.map(
    (cloud) =>
      `radial-gradient(ellipse ${cloud.size ?? "78% 70%"} at ${cloud.at}, ${cloud.color} 0%, transparent 70%)`,
  );
  return `${radials.join(", ")}, linear-gradient(145deg, ${wash} 0%, ${depth} 100%)`;
}

function nightWave(
  one: string,
  two: string,
  three: string,
  four: string,
  five: string,
  six: string,
): ThemeCloud[] {
  return [
    { color: one, opacity: 0.8, at: "8% 88%", size: "122% 110%" },
    { color: two, opacity: 0.76, at: "12% 10%", size: "118% 106%" },
    { color: three, opacity: 0.78, at: "90% 86%", size: "122% 110%" },
    { color: four, opacity: 0.74, at: "88% 12%", size: "118% 106%" },
    { color: five, opacity: 0.68, at: "68% 56%", size: "140% 124%" },
    { color: six, opacity: 0.58, at: "38% 52%", size: "150% 132%" },
  ];
}

function nightMesh(
  ground: string,
  primary: string,
  clouds: readonly ThemeCloud[],
): string {
  const radials = clouds.map((cloud) => {
    const size = cloud.size ?? "108% 96%";
    return `radial-gradient(ellipse ${size} at ${cloud.at}, ${cloud.color} 0%, color-mix(in srgb, ${cloud.color} 55%, transparent) 34%, color-mix(in srgb, ${cloud.color} 22%, transparent) 60%, transparent 80%)`;
  });
  return `${radials.join(", ")}, linear-gradient(155deg, ${ground} 0%, ${primary} 100%)`;
}

function nightField(
  ground: string,
  primary: string,
  core: string,
  heel: string,
  clouds: readonly ThemeCloud[],
  fieldSrc?: string,
): ThemeField["night"] {
  return {
    ground,
    primary,
    core,
    heel,
    fieldSrc,
    clouds,
    css: nightMesh(ground, primary, clouds),
  };
}

function expression(
  name: string,
  wash: string,
  depth: string,
  clouds: readonly ThemeCloud[],
  accents: Readonly<Record<string, string>>,
): ThemeExpression {
  return {
    name,
    wash,
    depth,
    clouds,
    accents,
    css: meshCss(wash, depth, clouds),
  };
}

export const FIELD = {
  night: "#070709",
  nightLift: "#12141A",
  white: "#FFFFFF",
  ink: "#1A1A1A",
  paper: "#FBF9F6",
  gold: "#EBBB3E",
  champagne: "#F4E6C8",
  slate: "#405774",
} as const;

/** Four directions of care. Each has its own mark. Longevity is the company field. */
export const DIRECTIONS: readonly Direction[] = [
  {
    id: "metabolic",
    label: "Metabolic",
    index: "01",
    hue: "#EBBB3E",
    role: "Fuel, appetite, composition",
  },
  {
    id: "repair",
    label: "Repair",
    index: "02",
    hue: "#C4783A",
    role: "Tissue, joint, rebound",
  },
  {
    id: "mental",
    label: "Mental",
    index: "03",
    hue: "#5B7BA6",
    role: "Focus, composure, stamina",
  },
  {
    id: "sleep",
    label: "Sleep",
    index: "04",
    hue: "#3D4A7A",
    role: "Rhythm, depth, recovery nights",
  },
] as const;

/**
 * One object per header theme. Atmosphere is the label. Streak is the heat.
 * Night is the vial. Video is a veto, not a source.
 */
export const THEME_FIELDS: readonly ThemeField[] = [
  {
    id: "weight-loss",
    label: "Weight Loss",
    kind: "treatment",
    index: "61",
    theme: "Quiet the food noise.",
    metaphor: "Quiet mist",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A3238",
      "#14181C",
      [
        { color: "#A8B4B8", opacity: 0.68, at: "18% 20%", size: "82% 74%" },
        { color: "#7A9A88", opacity: 0.58, at: "84% 78%", size: "78% 72%" },
        { color: "#D0B890", opacity: 0.46, at: "72% 18%", size: "60% 54%" },
      ],
      { mist: "#A8B4B8", sage: "#7A9A88", sand: "#D0B890" },
    ),
    streak: expression(
      "Streak",
      "#1C2226",
      "#6A7A76",
      [
        { color: "#C5D0D4", opacity: 0.55, at: "78% 28%", size: "74% 66%" },
        { color: "#8FAAA0", opacity: 0.46, at: "22% 74%", size: "72% 68%" },
        { color: "#D4C8B0", opacity: 0.3, at: "50% 48%", size: "54% 48%" },
      ],
      { mist: "#C5D0D4", sage: "#8FAAA0", sand: "#D4C8B0" },
    ),
    night: nightField(
      "#2A3834",
      "#4A6058",
      "#7A9A88",
      "#C4A070",
      [
        { color: "#6A8A78", opacity: 0.58, at: "92% 78%", size: "132% 118%" },
        { color: "#C4A070", opacity: 0.64, at: "52% 72%", size: "118% 106%" },
        { color: "#1E5D39", opacity: 0.74, at: "6% 94%", size: "96% 84%" },
        { color: "#8A9AA0", opacity: 0.78, at: "12% 12%", size: "90% 80%" },
        { color: "#E6940B", opacity: 0.76, at: "94% 88%", size: "90% 80%" },
        { color: "#7A9A88", opacity: 0.8, at: "96% 8%", size: "90% 80%" },
      ],
    ),
  },
  {
    id: "sexual-health",
    label: "Sexual Health",
    kind: "treatment",
    index: "62",
    theme: "Private heat.",
    metaphor: "Crimson hour",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A0810",
      "#120408",
      [
        { color: "#C41E32", opacity: 0.64, at: "18% 22%", size: "78% 70%" },
        { color: "#E04040", opacity: 0.52, at: "82% 74%", size: "76% 70%" },
        { color: "#6A1020", opacity: 0.46, at: "74% 20%", size: "58% 52%" },
      ],
      { crimson: "#C41E32", scarlet: "#E04040", deep: "#6A1020" },
    ),
    streak: expression(
      "Streak",
      "#1A0408",
      "#C41E32",
      [
        { color: "#E04040", opacity: 0.62, at: "80% 30%", size: "74% 68%" },
        { color: "#C41E32", opacity: 0.5, at: "22% 72%", size: "70% 64%" },
        { color: "#8A1428", opacity: 0.4, at: "50% 48%", size: "54% 48%" },
      ],
      { scarlet: "#E04040", crimson: "#C41E32", deep: "#8A1428" },
    ),
    night: nightField(
      "#671D2B",
      "#A81828",
      "#C41E32",
      "#E04040",
      nightWave("#C41E32", "#E04040", "#9C582E", "#A81828", "#E04040", "#671D2B"),
    ),
  },
  {
    id: "mens-health",
    label: "Energy & Strength",
    kind: "treatment",
    index: "63",
    theme: "Morning composure.",
    metaphor: "Steel and first light",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A3038",
      "#14181E",
      [
        { color: "#8A9AA4", opacity: 0.6, at: "18% 20%", size: "80% 72%" },
        { color: "#E0C4A8", opacity: 0.48, at: "84% 78%", size: "74% 68%" },
        { color: "#D4DCE2", opacity: 0.4, at: "72% 24%", size: "56% 50%" },
      ],
      { steel: "#8A9AA4", ember: "#E0C4A8", ice: "#D4DCE2" },
    ),
    streak: expression(
      "Streak",
      "#1A2028",
      "#405774",
      [
        { color: "#D4DCE2", opacity: 0.58, at: "80% 26%", size: "72% 64%" },
        { color: "#F0F4F8", opacity: 0.42, at: "48% 48%", size: "54% 48%" },
        { color: "#E0C4A8", opacity: 0.36, at: "18% 80%", size: "70% 66%" },
      ],
      { steel: "#D4DCE2", ice: "#F0F4F8", ember: "#E0C4A8" },
    ),
    night: nightField(
      "#101820",
      "#2A4A68",
      "#5AA8C8",
      "#EBBB3E",
      nightWave("#5AA8C8", "#EBBB3E", "#D47838", "#B0D4E4", "#4A88A8", "#1A4060"),
    ),
  },
  {
    id: "skin-hair",
    label: "Skin & Hair",
    kind: "treatment",
    index: "64",
    theme: "What shows.",
    metaphor: "Porcelain and rose",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2C2A30",
      "#161418",
      [
        { color: "#D8D4D8", opacity: 0.58, at: "20% 26%", size: "78% 70%" },
        { color: "#C49080", opacity: 0.5, at: "82% 74%", size: "74% 68%" },
        { color: "#E0C8A0", opacity: 0.36, at: "74% 20%", size: "56% 50%" },
      ],
      { porcelain: "#D8D4D8", rose: "#C49080", champagne: "#E0C8A0" },
    ),
    streak: expression(
      "Streak",
      "#1C1A1E",
      "#C49080",
      [
        { color: "#E0C8A0", opacity: 0.52, at: "78% 28%", size: "72% 64%" },
        { color: "#D8D4D8", opacity: 0.44, at: "28% 70%", size: "68% 62%" },
        { color: "#C49080", opacity: 0.4, at: "16% 20%", size: "58% 54%" },
      ],
      { champagne: "#E0C8A0", porcelain: "#D8D4D8", rose: "#C49080" },
    ),
    night: nightField(
      "#1C1A1E",
      "#C49080",
      "#C49080",
      "#E0C8A0",
      nightWave("#E0C8A0", "#D8D4D8", "#C49080", "#E0C8A0", "#D8D4D8", "#C49080"),
    ),
  },
  {
    id: "womens-balance",
    label: "Balance & Beauty",
    kind: "treatment",
    index: "65",
    theme: "Steady through a shift.",
    metaphor: "Rose dusk",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A1820",
      "#140C10",
      [
        { color: "#F0719D", opacity: 0.62, at: "18% 20%", size: "82% 74%" },
        { color: "#E0C8A0", opacity: 0.54, at: "84% 68%", size: "78% 70%" },
        { color: "#D14A21", opacity: 0.5, at: "48% 86%", size: "70% 58%" },
      ],
      { rose: "#F0719D", champagne: "#E0C8A0", terracotta: "#D14A21" },
    ),
    streak: expression(
      "Streak",
      "#1A1014",
      "#6A4850",
      [
        { color: "#F0719D", opacity: 0.62, at: "18% 22%", size: "80% 72%" },
        { color: "#E0C8A0", opacity: 0.52, at: "84% 64%", size: "76% 68%" },
        { color: "#D14A21", opacity: 0.5, at: "70% 88%", size: "64% 52%" },
      ],
      { rose: "#F0719D", champagne: "#E0C8A0", terracotta: "#D14A21" },
    ),
    night: nightField(
      "#674553",
      "#6A4850",
      "#D14A21",
      "#E0C8A0",
      nightWave("#D14A21", "#E0C8A0", "#C47868", "#F0719D", "#D4A898", "#6A4850"),
    ),
  },
  {
    id: "recovery-performance",
    label: "Recovery & Performance",
    kind: "treatment",
    index: "66",
    theme: "Tissue coming back.",
    metaphor: "Green liquid",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#213817",
      "#325420",
      [
        { color: "#8FBF68", opacity: 0.6, at: "78% 28%", size: "76% 68%" },
        { color: "#163028", opacity: 0.55, at: "16% 18%", size: "72% 70%" },
        { color: "#C4D48A", opacity: 0.4, at: "82% 76%", size: "64% 58%" },
      ],
      { moss: "#8FBF68", teal: "#163028", chartreuse: "#C4D48A" },
    ),
    streak: expression(
      "Streak",
      "#1C3014",
      "#7BAA58",
      [
        { color: "#B5E887", opacity: 0.55, at: "28% 36%", size: "70% 64%" },
        { color: "#D2E8A0", opacity: 0.36, at: "72% 70%", size: "62% 56%" },
        { color: "#1A3A32", opacity: 0.42, at: "86% 18%", size: "58% 52%" },
      ],
      { lime: "#B5E887", pale: "#D2E8A0", pine: "#1A3A32" },
    ),
    night: nightField(
      "#3A7320",
      "#357D19",
      "#8FBF68",
      "#E0FF30",
      nightWave("#8FBF68", "#2C7C27", "#81E6A4", "#B5E887", "#E0FF30", "#6A8A48"),
    ),
  },
  {
    id: "executive",
    label: "Peak Performance",
    kind: "program",
    index: "78",
    theme: "Composure under load.",
    metaphor: "Sage and slate",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#1A2824",
      "#0C1814",
      [
        { color: "#8FAAA6", opacity: 0.58, at: "18% 22%", size: "80% 72%" },
        { color: "#A9FF5E", opacity: 0.48, at: "80% 30%", size: "68% 62%" },
        { color: "#C4B898", opacity: 0.42, at: "78% 82%", size: "70% 64%" },
      ],
      { sage: "#8FAAA6", lime: "#A9FF5E", heel: "#C4B898" },
    ),
    streak: expression(
      "Streak",
      "#14201C",
      "#386C5F",
      [
        { color: "#A9FF5E", opacity: 0.55, at: "74% 24%", size: "72% 64%" },
        { color: "#8FAAA6", opacity: 0.48, at: "22% 70%", size: "74% 68%" },
        { color: "#C4B898", opacity: 0.4, at: "82% 78%", size: "56% 50%" },
      ],
      { lime: "#A9FF5E", sage: "#8FAAA6", heel: "#C4B898" },
    ),
    night: nightField(
      "#1A2824",
      "#386C5F",
      "#8FAAA6",
      "#C4B898",
      nightWave("#8FAAA6", "#C4B898", "#7A9AB8", "#40AB83", "#A9FF5E", "#7A9A90"),
      "/brand/peptide/fields/glow-executive.png",
    ),
  },
  {
    id: "athlete",
    label: "Dynamic Training",
    kind: "program",
    index: "24",
    theme: "Heat after work.",
    metaphor: "Moss into lime",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#1A2824",
      "#0C1814",
      [
        { color: "#8FAAA6", opacity: 0.58, at: "18% 24%", size: "78% 70%" },
        { color: "#A9FF5E", opacity: 0.5, at: "82% 72%", size: "74% 68%" },
        { color: "#C4B898", opacity: 0.36, at: "70% 20%", size: "56% 50%" },
      ],
      { sage: "#8FAAA6", lime: "#A9FF5E", heel: "#C4B898" },
    ),
    streak: expression(
      "Streak",
      "#14201C",
      "#386C5F",
      [
        { color: "#A9FF5E", opacity: 0.52, at: "78% 28%", size: "72% 64%" },
        { color: "#40AB83", opacity: 0.44, at: "24% 74%", size: "70% 64%" },
        { color: "#8FAAA6", opacity: 0.4, at: "50% 48%", size: "54% 48%" },
      ],
      { lime: "#A9FF5E", moss: "#40AB83", sage: "#8FAAA6" },
    ),
    night: nightField(
      "#1A2824",
      "#386C5F",
      "#8FAAA6",
      "#C4B898",
      nightWave("#8FAAA6", "#C4B898", "#7A9AB8", "#40AB83", "#A9FF5E", "#7A9A90"),
      "/brand/peptide/fields/glow-athlete.png",
    ),
  },
  {
    id: "transformation",
    label: "Appetite Balance",
    kind: "program",
    index: "11",
    theme: "Reset.",
    metaphor: "Indigo and lamp",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#182430",
      "#0C141C",
      [
        { color: "#3A3A78", opacity: 0.56, at: "18% 22%", size: "78% 70%" },
        { color: "#D4A04A", opacity: 0.48, at: "82% 74%", size: "74% 68%" },
        { color: "#8A4A58", opacity: 0.34, at: "70% 20%", size: "56% 50%" },
      ],
      { indigo: "#3A3A78", lamp: "#D4A04A", dusk: "#8A4A58" },
    ),
    streak: expression(
      "Streak",
      "#121820",
      "#3A5D78",
      [
        { color: "#D4A04A", opacity: 0.5, at: "78% 28%", size: "72% 64%" },
        { color: "#E0B86A", opacity: 0.4, at: "26% 72%", size: "68% 62%" },
        { color: "#3A3A78", opacity: 0.38, at: "50% 48%", size: "54% 48%" },
      ],
      { lamp: "#D4A04A", champagne: "#E0B86A", indigo: "#3A3A78" },
    ),
    night: nightField(
      "#182430",
      "#3A5D78",
      "#3A3A78",
      "#D4A04A",
      nightWave("#3A3A78", "#D4A04A", "#8A4A58", "#C4A878", "#E0B86A", "#4A7680"),
      "/brand/peptide/fields/glow-transformation.png",
    ),
  },
  {
    id: "parents",
    label: "Stress & Mood",
    kind: "program",
    index: "36",
    theme: "Held warmth.",
    metaphor: "Sea and lamp",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#0E2430",
      "#081418",
      [
        { color: "#3A7A8A", opacity: 0.62, at: "18% 22%", size: "78% 70%" },
        { color: "#FFFC37", opacity: 0.54, at: "84% 74%", size: "74% 68%" },
        { color: "#4A7A88", opacity: 0.4, at: "70% 20%", size: "56% 50%" },
      ],
      { sea: "#3A7A8A", lamp: "#FFFC37", dusk: "#4A7A88" },
    ),
    streak: expression(
      "Streak",
      "#0A1A20",
      "#2A5A68",
      [
        { color: "#E9E366", opacity: 0.6, at: "80% 28%", size: "72% 64%" },
        { color: "#3A7A8A", opacity: 0.5, at: "22% 72%", size: "70% 64%" },
        { color: "#2A5060", opacity: 0.38, at: "50% 48%", size: "54% 48%" },
      ],
      { lamp: "#E9E366", sea: "#3A7A8A", deep: "#2A5060" },
    ),
    night: nightField(
      "#0E2430",
      "#2A5A68",
      "#3A7A8A",
      "#FFFC37",
      nightWave("#3A7A8A", "#FFFC37", "#2A5060", "#4A7A88", "#E9E366", "#2A6070"),
      "/brand/peptide/fields/glow-parents.png",
    ),
  },
  {
    id: "creative",
    label: "Focus",
    kind: "program",
    index: "42",
    theme: "Night focus.",
    metaphor: "Dusty violet studio",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A2038",
      "#141018",
      [
        { color: "#5A4A7A", opacity: 0.55, at: "16% 20%", size: "74% 68%" },
        { color: "#F4EEFF", opacity: 0.58, at: "80% 28%", size: "72% 64%" },
        { color: "#C4A88A", opacity: 0.44, at: "78% 80%", size: "70% 64%" },
      ],
      { lilac: "#F4EEFF", taupe: "#C4A88A", violet: "#5A4A7A" },
    ),
    streak: expression(
      "Streak",
      "#1C1428",
      "#5A4A7A",
      [
        { color: "#F4EEFF", opacity: 0.6, at: "74% 24%", size: "70% 64%" },
        { color: "#C4A88A", opacity: 0.42, at: "22% 78%", size: "72% 66%" },
        { color: "#8A7AA0", opacity: 0.38, at: "50% 50%", size: "54% 48%" },
      ],
      { lilac: "#F4EEFF", taupe: "#C4A88A", violet: "#5A4A7A" },
    ),
    night: nightField(
      "#35264C",
      "#5A4A7A",
      "#5A4A7A",
      "#C4A88A",
      nightWave("#5A4A7A", "#C4A88A", "#8A7AB0", "#3A2A58", "#FC9116", "#6A5A88"),
      "/brand/peptide/fields/glow-creators.png",
    ),
  },
  {
    id: "legacy",
    label: "Healthspan",
    kind: "program",
    index: "55",
    theme: "Long air.",
    metaphor: "Longevity traverse",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#2A3423",
      "#4C6852",
      [
        { color: "#7A9A68", opacity: 0.58, at: "78% 30%", size: "76% 68%" },
        { color: "#2A4038", opacity: 0.52, at: "16% 18%", size: "72% 70%" },
        { color: "#A8B878", opacity: 0.4, at: "82% 78%", size: "62% 56%" },
      ],
      { olive: "#7A9A68", pine: "#2A4038", moss: "#A8B878" },
    ),
    streak: expression(
      "Streak",
      "#0A0E0A",
      "#5A9A5C",
      [
        { color: "#88CB76", opacity: 0.62, at: "36% 42%", size: "72% 66%" },
        { color: "#C4E090", opacity: 0.4, at: "68% 68%", size: "58% 52%" },
        { color: "#1A3830", opacity: 0.36, at: "84% 16%", size: "56% 50%" },
      ],
      { lime: "#88CB76", pale: "#C4E090", teal: "#1A3830" },
    ),
    night: nightField(
      "#335733",
      "#5A9A5C",
      "#76ADCB",
      "#C4E090",
      nightWave("#76ADCB", "#C4E090", "#1A3830", "#5A9A5C", "#C4E090", "#335733"),
      "/brand/peptide/fields/glow-healthspan.png",
    ),
  },
  {
    id: "traveler",
    label: "Jetlag Recovery",
    kind: "program",
    index: "09",
    theme: "Horizon.",
    metaphor: "Horizon ice",
    ink: "#141210",
    atmosphere: expression(
      "Atmosphere",
      "#235A62",
      "#0C2428",
      [
        { color: "#6A9AA8", opacity: 0.6, at: "18% 24%", size: "76% 70%" },
        { color: "#B5F0FF", opacity: 0.5, at: "80% 28%", size: "70% 64%" },
        { color: "#EDE266", opacity: 0.42, at: "78% 80%", size: "68% 62%" },
      ],
      { sea: "#6A9AA8", ice: "#B5F0FF", lamp: "#EDE266" },
    ),
    streak: expression(
      "Streak",
      "#102830",
      "#235A62",
      [
        { color: "#B5F0FF", opacity: 0.56, at: "72% 26%", size: "72% 64%" },
        { color: "#EDE266", opacity: 0.44, at: "78% 72%", size: "64% 58%" },
        { color: "#1A4050", opacity: 0.4, at: "20% 78%", size: "70% 66%" },
      ],
      { ice: "#B5F0FF", lamp: "#EDE266", deep: "#1A4050" },
    ),
    night: nightField(
      "#235A62",
      "#B5F0FF",
      "#6A9AA8",
      "#EDE266",
      nightWave("#6A9AA8", "#EDE266", "#1A4050", "#B5F0FF", "#EDE266", "#235A62"),
      "/brand/peptide/fields/glow-travelers.png",
    ),
  },
] as const;

export const CATEGORY_GLOWS: readonly CategoryGlow[] = THEME_FIELDS.filter(
  (field) => field.kind === "program",
).map((field) => ({
  id: field.id as CategoryId,
  label: field.label,
  index: field.index,
  primary: field.night.primary,
  core: field.night.core,
  heel: field.night.heel,
  fieldSrc: field.night.fieldSrc,
  css: field.night.css,
}));

/** Header slide id to theme. Footage can change. The theme does not. */
export const HERO_THEME: Readonly<Record<string, ThemeId>> = {
  executives: "executive",
  "ceos-and-executives": "executive",
  transformation: "transformation",
  "weight-loss": "weight-loss",
  creators: "creative",
  "creators-and-builders": "creative",
  "recovery-performance": "recovery-performance",
  "recovery-and-performance": "recovery-performance",
  "mens-health": "mens-health",
  "sexual-health": "sexual-health",
  "womens-balance": "womens-balance",
  "skin-hair": "skin-hair",
  "skin-and-hair": "skin-hair",
  athletes: "athlete",
  healthspan: "legacy",
  parents: "parents",
  travelers: "traveler",
};

export type IdentityScale = "peptide" | "stack" | "category";

export type PeptideMark = {
  id: DirectionId;
  label: string;
  form: string;
  markSrc: string;
  plateSrc: string;
};

/**
 * Direction marks. Atomic. Filled stamps, not lattices.
 */
export const PEPTIDE_MARKS: readonly PeptideMark[] = [
  {
    id: "metabolic",
    label: "Metabolic",
    form: "Cycle",
    markSrc: "/brand/peptide/marks/stamp/direction-metabolic.svg",
    plateSrc: "/brand/peptide/plates/peptide-metabolic.png",
  },
  {
    id: "repair",
    label: "Repair",
    form: "Mend",
    markSrc: "/brand/peptide/marks/stamp/direction-repair.svg",
    plateSrc: "/brand/peptide/plates/peptide-repair.png",
  },
  {
    id: "mental",
    label: "Mental",
    form: "Focus",
    markSrc: "/brand/peptide/marks/stamp/direction-mental.svg",
    plateSrc: "/brand/peptide/plates/peptide-mental.png",
  },
  {
    id: "sleep",
    label: "Sleep",
    form: "Night",
    markSrc: "/brand/peptide/marks/stamp/direction-sleep.svg",
    plateSrc: "/brand/peptide/plates/peptide-sleep.png",
  },
] as const;

export type CategoryMark = {
  id: CategoryId;
  label: string;
  form: string;
  markSrc: string;
};

export const CATEGORY_MARKS: readonly CategoryMark[] = [
  {
    id: "executive",
    label: "Peak Performance",
    form: "Composure",
    markSrc: "/brand/peptide/marks/stamp/category-executive.svg",
  },
  {
    id: "athlete",
    label: "Dynamic Training",
    form: "Motion",
    markSrc: "/brand/peptide/marks/stamp/category-athlete.svg",
  },
  {
    id: "transformation",
    label: "Appetite Balance",
    form: "Turn",
    markSrc: "/brand/peptide/marks/stamp/category-transformation.svg",
  },
  {
    id: "parents",
    label: "Stress & Mood",
    form: "Hold",
    markSrc: "/brand/peptide/marks/stamp/category-parents.svg",
  },
  {
    id: "creative",
    label: "Focus",
    form: "Spark",
    markSrc: "/brand/peptide/marks/stamp/category-creative.svg",
  },
  {
    id: "legacy",
    label: "Healthspan",
    form: "Root",
    markSrc: "/brand/peptide/marks/stamp/category-legacy.svg",
  },
  {
    id: "traveler",
    label: "Jetlag Recovery",
    form: "Horizon",
    markSrc: "/brand/peptide/marks/stamp/category-traveler.svg",
  },
] as const;

export type IdentitySpec = {
  scale: IdentityScale;
  /** Consumer name. Stack named or direction named. Never a molecule. */
  name: string;
  directions: readonly DirectionId[];
  category: CategoryId;
  index: string;
  plateSrc?: string;
};

export const SCALE_RULES: Record<
  IdentityScale,
  { object: string; field: string }
> = {
  peptide: {
    object: "A filled stamp. The atom.",
    field: "Same ink. Same canvas. Same optical weight.",
  },
  stack: {
    object: "Two whole marks on one field.",
    field: "Do not fuse the marks.",
  },
  category: {
    object: "A filled stamp. The seal. Heavier idea, same finish.",
    field: "Same ink. Same canvas. Same optical weight.",
  },
};

export const IDENTITY_EXAMPLES: readonly IdentitySpec[] = [
  {
    scale: "peptide",
    name: "Metabolic",
    directions: ["metabolic"],
    category: "executive",
    index: "01",
    plateSrc: "/brand/peptide/plates/peptide-metabolic.png",
  },
  {
    scale: "peptide",
    name: "Repair",
    directions: ["repair"],
    category: "athlete",
    index: "02",
    plateSrc: "/brand/peptide/plates/peptide-repair.png",
  },
  {
    scale: "peptide",
    name: "Mental",
    directions: ["mental"],
    category: "creative",
    index: "03",
    plateSrc: "/brand/peptide/plates/peptide-mental.png",
  },
  {
    scale: "peptide",
    name: "Sleep",
    directions: ["sleep"],
    category: "legacy",
    index: "04",
    plateSrc: "/brand/peptide/plates/peptide-sleep.png",
  },
  {
    scale: "stack",
    name: "Recovery Stack",
    directions: ["repair", "sleep"],
    category: "athlete",
    index: "12",
    plateSrc: "/brand/peptide/plates/peptide-repair.png",
  },
  {
    scale: "category",
    name: "Peak Performance",
    directions: ["metabolic", "repair", "mental", "sleep"],
    category: "executive",
    index: "78",
    plateSrc: "/brand/peptide/plates/category-executive.png",
  },
] as const;

export function directionById(id: DirectionId): Direction {
  const found = DIRECTIONS.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown direction: ${id}`);
  return found;
}

export function themeField(id: ThemeId): ThemeField {
  const found = THEME_FIELDS.find((field) => field.id === id);
  if (!found) throw new Error(`Unknown theme: ${id}`);
  return found;
}

export function heroTheme(slideId: string): ThemeField | null {
  const direct = THEME_FIELDS.find((field) => field.id === slideId);
  if (direct) return direct;
  const id = HERO_THEME[slideId];
  return id ? themeField(id) : null;
}

export function categoryGlow(id: CategoryId): CategoryGlow {
  const found = CATEGORY_GLOWS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

export function peptideMark(id: DirectionId): PeptideMark {
  const found = PEPTIDE_MARKS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown mark: ${id}`);
  return found;
}

export function categoryMark(id: CategoryId): CategoryMark {
  const found = CATEGORY_MARKS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown category mark: ${id}`);
  return found;
}

/** 2:1 bloom fields. Printed on oral tablets and packaging. */
export const THEME_LABEL: Readonly<Record<TreatmentThemeId, string>> = {
  "weight-loss": "/brand/peptide/labels/weight-loss.png",
  "sexual-health": "/brand/peptide/labels/sexual-health.png",
  "mens-health": "/brand/peptide/labels/testosterone.png",
  "womens-balance": "/brand/peptide/labels/womens-health.png",
  "skin-hair": "/brand/peptide/labels/skin-hair.png",
  "recovery-performance": "/brand/peptide/labels/recovery.png",
};
