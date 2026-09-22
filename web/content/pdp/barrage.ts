import type { ThemeId } from "@/content/brand/peptide-identity";

export type BarrageFrame = {
  src: string;
  alt: string;
};

function frames(srcs: readonly string[], label: string): BarrageFrame[] {
  return srcs.map((src, index) => ({
    src,
    alt: `${label} still ${index + 1}`,
  }));
}

const hs = (n: string) => `/landing/stills/healthspan/${n}.jpg`;
const sh = (n: string) => `/landing/stills/skin-hair/${n}.jpg`;
const pk = (n: string) => `/landing/stills/peak/${n}.jpg`;
const wl = (n: string) => `/landing/stills/weight-loss/${n}.jpg`;
const ma = (n: string) => `/landing/stills/male-athletes/${n}.jpg`;
const pa = (n: string) => `/landing/stills/parents/${n}.jpg`;
const ls = (n: string) => `/landing/stills/landscapes/${n}.jpg`;
const gx = (id: string) => `/landing/stills/graphics/${id}.jpg`;
const pr = (file: string) => `/pain-relief/lifestyle/${file}`;

function withTitleGraphic(
  srcs: readonly string[],
  graphicId: string,
): string[] {
  const next = srcs.slice();
  next.splice(5, 1, gx(graphicId));
  return next;
}

/**
 * Twelve stills per PDP, matching Scout's 01 / 12 chapter.
 * Lifestyle stills from Figma 1193:679. Beat six is the type-field
 * graphic from 1193:840.
 */
const THEME: Record<ThemeId, { label: string; srcs: readonly string[] }> = {
  transformation: {
    label: "Appetite Balance",
    srcs: [
      wl("03"),
      ma("02"),
      wl("06"),
      pk("13"),
      wl("09"),
      ls("12"),
      wl("11"),
      ma("03"),
      wl("04"),
      ls("09"),
      wl("08"),
      pk("10"),
    ],
  },
  "weight-loss": {
    label: "Weight Loss",
    srcs: [
      wl("02"),
      ma("01"),
      wl("04"),
      pk("09"),
      wl("07"),
      ls("07"),
      wl("08"),
      pk("14"),
      wl("10"),
      ls("11"),
      wl("03"),
      pk("06"),
    ],
  },
  athlete: {
    label: "Dynamic Training",
    srcs: [
      ma("01"),
      pk("03"),
      pk("05"),
      ma("02"),
      pk("07"),
      pk("09"),
      ma("03"),
      pk("11"),
      pk("13"),
      pk("14"),
      pk("19"),
      pk("21"),
    ],
  },
  "recovery-performance": {
    label: "Recovery & Performance",
    srcs: [
      pk("11"),
      pk("06"),
      pk("08"),
      ls("05"),
      pk("10"),
      pk("12"),
      pk("15"),
      ls("07"),
      pk("02"),
      pk("16"),
      ls("08"),
      pk("04"),
    ],
  },
  "mens-health": {
    label: "Energy & Strength",
    srcs: [
      ma("03"),
      pk("11"),
      pk("04"),
      ma("01"),
      pk("08"),
      pk("10"),
      ma("02"),
      pk("12"),
      pk("18"),
      pk("20"),
      pk("21"),
      pk("22"),
    ],
  },
  "womens-balance": {
    label: "Balance & Beauty",
    srcs: [
      sh("03"),
      wl("02"),
      sh("01"),
      wl("04"),
      sh("04"),
      wl("08"),
      sh("02"),
      ls("09"),
      sh("05"),
      wl("10"),
      sh("06"),
      ls("12"),
    ],
  },
  "skin-hair": {
    label: "Skin & Hair",
    srcs: [
      sh("01"),
      sh("03"),
      sh("02"),
      hs("01"),
      sh("04"),
      wl("04"),
      sh("05"),
      sh("06"),
      wl("08"),
      sh("07"),
      wl("10"),
      hs("05"),
    ],
  },
  "sexual-health": {
    label: "Sexual Health",
    srcs: [
      hs("03"),
      wl("02"),
      ma("01"),
      sh("03"),
      hs("06"),
      pk("02"),
      pk("14"),
      sh("04"),
      hs("04"),
      ls("04"),
      pk("09"),
      ls("06"),
    ],
  },
  traveler: {
    label: "Jetlag Recovery",
    srcs: [
      ls("10"),
      pa("01"),
      pk("03"),
      ls("04"),
      pa("03"),
      ma("01"),
      ls("11"),
      pa("05"),
      pk("07"),
      ls("07"),
      pk("14"),
      ls("12"),
    ],
  },
  executive: {
    label: "Peak Performance",
    srcs: [
      ma("01"),
      pk("09"),
      ma("02"),
      pk("13"),
      ma("03"),
      pk("14"),
      pk("10"),
      ls("04"),
      pk("06"),
      pk("21"),
      pk("15"),
      ls("10"),
    ],
  },
  creative: {
    label: "Focus",
    srcs: [
      ls("10"),
      pk("03"),
      pk("11"),
      pk("05"),
      ls("04"),
      pk("07"),
      ma("02"),
      pk("11"),
      pk("04"),
      ls("07"),
      pk("09"),
      pk("17"),
    ],
  },
  parents: {
    label: "Stress & Mood",
    srcs: [
      pa("01"),
      ls("11"),
      pa("03"),
      ls("12"),
      pa("02"),
      ls("07"),
      pa("04"),
      ls("05"),
      pa("05"),
      ls("08"),
      ls("06"),
      ls("04"),
    ],
  },
  legacy: {
    label: "Healthspan",
    srcs: [
      hs("01"),
      hs("03"),
      ls("06"),
      hs("06"),
      hs("04"),
      ls("07"),
      hs("02"),
      ls("08"),
      hs("05"),
      ls("04"),
      ls("05"),
      ls("10"),
    ],
  },
};

/**
 * One twelve-beat mix per Pain Relief PDP. Beat six is replaced by the
 * shared Pain Relief type field.
 */
const PAIN: Record<string, readonly string[]> = {
  "cryotherapy-spray": [
    pr("how-to.jpg"),
    pr("header-cryo.png"),
    pk("06"),
    pr("still-09.jpg"),
    ma("01"),
    ls("05"),
    pr("still-12.jpg"),
    pk("10"),
    ls("08"),
    pr("still-08.jpg"),
    pk("16"),
    pk("02"),
  ],
  "max-strength-spray": [
    pr("header-max.png"),
    pr("still-05.jpg"),
    pk("11"),
    pr("still-03.jpg"),
    ma("03"),
    ls("07"),
    pk("08"),
    pk("18"),
    pr("still-09.jpg"),
    pk("20"),
    ls("05"),
    pk("12"),
  ],
  "cryotherapy-cream": [
    pr("still-04.jpg"),
    pr("how-to.jpg"),
    pa("02"),
    pr("still-11.jpg"),
    pk("04"),
    ls("09"),
    pr("still-08.jpg"),
    pa("04"),
    ls("06"),
    pr("still-01.jpg"),
    pk("14"),
    ls("12"),
  ],
  "heat-therapy-spray": [
    pr("heat.jpg"),
    pr("header-heat.png"),
    pk("03"),
    pr("still-10.jpg"),
    ma("02"),
    ls("04"),
    pr("still-08.jpg"),
    pk("07"),
    pk("11"),
    ls("10"),
    pk("13"),
    pr("still-02.jpg"),
  ],
  "heat-roll-on": [
    pr("header-heat.png"),
    pa("01"),
    pr("heat.jpg"),
    pa("03"),
    pk("05"),
    ls("11"),
    pr("still-10.jpg"),
    pa("05"),
    pk("09"),
    ls("04"),
    pk("17"),
    ls("08"),
  ],
  "morning-spray": [
    pr("header-morning.png"),
    pr("still-06.jpg"),
    pa("01"),
    pr("still-07.jpg"),
    ls("06"),
    ls("11"),
    pa("02"),
    pk("03"),
    ls("12"),
    pr("still-01.jpg"),
    ls("01"),
    pa("04"),
  ],
  "evening-spray": [
    pr("header-evening.png"),
    pr("still-07.jpg"),
    ls("08"),
    pr("still-09.jpg"),
    pa("05"),
    ls("02"),
    pr("still-11.jpg"),
    pa("04"),
    pk("16"),
    ls("05"),
    ls("07"),
    pr("still-06.jpg"),
  ],
  "hot-cold-system": [
    pr("still-12.jpg"),
    pr("header-heat.png"),
    pr("header-cryo.png"),
    pk("11"),
    pr("heat.jpg"),
    ls("05"),
    ma("01"),
    pk("06"),
    pr("still-09.jpg"),
    pk("15"),
    ls("07"),
    pk("10"),
  ],
  "morning-evening-duo": [
    pr("still-01.jpg"),
    pr("header-morning.png"),
    pr("header-evening.png"),
    pa("03"),
    pr("still-06.jpg"),
    ls("12"),
    pr("still-07.jpg"),
    pa("01"),
    ls("11"),
    pa("05"),
    ls("06"),
    ls("04"),
  ],
  "rapid-relief-duo": [
    pr("still-11.jpg"),
    pr("how-to.jpg"),
    pr("still-04.jpg"),
    pr("header-cryo.png"),
    pk("02"),
    ls("09"),
    pr("still-08.jpg"),
    ma("02"),
    pk("14"),
    ls("08"),
    pr("still-12.jpg"),
    ls("05"),
  ],
  "performance-recovery": [
    pr("still-05.jpg"),
    pr("header-max.png"),
    pr("header-heat.png"),
    ma("03"),
    pr("header-evening.png"),
    ls("07"),
    pr("still-03.jpg"),
    pk("08"),
    pk("18"),
    pk("22"),
    pk("12"),
    pr("still-09.jpg"),
  ],
};

export function barrageFrames(
  themeId: ThemeId,
  graphicId: string = themeId,
  packId?: string,
): BarrageFrame[] {
  const pain = packId ? PAIN[packId] : undefined;
  const pack = pain
    ? { label: "Pain Relief", srcs: pain }
    : THEME[themeId] ?? THEME.transformation;
  return frames(withTitleGraphic(pack.srcs, graphicId), pack.label);
}
