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

const cat = (id: string, n: string) => `/landing/stills/catalog/${id}/${n}.jpg`;

function catalogPack(id: string, label: string) {
  return {
    label,
    srcs: [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ].map((n) => cat(id, n)),
  };
}

const pr = (file: string) => `/pain-relief/lifestyle/${file}`;
const pc = (n: string) => cat("pain-relief", n);
const hc = (file: string) => `/pain-relief/pdp/hot-cold-system/${file}`;

/**
 * Twelve stills per PDP from Barrage 1193:679, grouped by the renamed
 * section. Every beat is a photograph. Type-field graphics stay off this run.
 */
const CATALOG: Record<string, { label: string; srcs: readonly string[] }> = {
  tirzepatide: catalogPack("tirzepatide", "Tirzepatide"),
  semaglutide: catalogPack("semaglutide", "Semaglutide"),
  b12: catalogPack("mens-peak-performance", "B12"),
  "lipo-c": catalogPack("lipo-c", "Lipo-C"),
  "methylene-blue": catalogPack("methylene-blue", "Methylene Blue"),
  sermorelin: catalogPack("sermorelin", "Sermorelin"),
  tesamorelin: catalogPack("tesamorelin", "Tesamorelin"),
  testosterone: {
    label: "Testosterone",
    srcs: [
      cat("mens-peak-performance", "01"),
      cat("mens-peak-performance", "02"),
      cat("mens-peak-performance", "04"),
      cat("lean-cut", "03"),
      cat("lean-cut", "08"),
      cat("lean-cut", "10"),
      cat("repair-mobility", "08"),
      cat("repair-mobility", "11"),
      cat("tesamorelin", "04"),
      cat("tesamorelin", "05"),
      cat("repair-mobility", "02"),
      cat("tesamorelin", "12"),
    ],
  },
  "at-home-lab": {
    label: "MD Reviewed Blood Test",
    srcs: [
      "01",
      "12",
      "09",
      "06",
      "04",
      "02",
      "11",
      "05",
      "03",
      "10",
      "08",
      "07",
    ].map((n) => cat("at-home-lab", n)),
  },
  "steady-start": catalogPack("steady-start", "Steady Start"),
  "rest-rise": catalogPack("rest-rise", "Rest & Rise"),
  "head-start": catalogPack("fast-start", "Head Start"),
  "energy-lift": catalogPack("energy-lift", "Energy Lift"),
  "body-composition": catalogPack("body-composition", "Body Composition"),
  "complete-stack": catalogPack("complete-stack", "Complete Stack"),
  "lean-cut": catalogPack("lean-cut", "Lean & Cut"),
  "sexual-health": catalogPack("sexual-health", "Sexual Health"),
  "weight-loss": catalogPack("weight-loss", "Weight Loss"),
  "appetite-balance": catalogPack("appetite-balance", "Appetite Balance"),
  "mens-peak-performance": catalogPack(
    "mens-peak-performance",
    "Men's Peak Performance",
  ),
  "repair-mobility": catalogPack("repair-mobility", "Repair & Mobility"),
  "rest-rebuild": catalogPack("rest-rebuild", "Rest & Rebuild"),
  "cellular-health": catalogPack("cellular-health", "Cellular Health"),
  longevity: catalogPack("longevity", "Longevity"),
  focus: catalogPack("focus", "Focus"),
  "stress-mood": catalogPack("stress-mood", "Stress & Mood"),
  "womens-total-balance": catalogPack(
    "womens-total-balance",
    "Women's Total Balance",
  ),
  "hair-skin-nails": catalogPack("hair-skin-nails", "Hair, Skin & Nails"),
  "pain-relief": catalogPack("pain-relief", "Pain Relief"),
};

/**
 * One twelve-beat mix per Pain Relief PDP. First third matches word one,
 * middle third word two, last third word three.
 */
const PAIN: Record<string, readonly string[]> = {
  "cryotherapy-spray": [
    pr("still-12.jpg"),
    pr("how-to.jpg"),
    pr("header-cryo.png"),
    pc("03"),
    pr("still-08.jpg"),
    pc("06"),
    pr("still-06.jpg"),
    pc("08"),
    pr("still-09.jpg"),
    pc("12"),
    pr("still-01.jpg"),
    pc("05"),
  ],
  "max-strength-spray": [
    pr("still-02.jpg"),
    pr("still-05.jpg"),
    pr("still-03.jpg"),
    pc("07"),
    pr("header-max.png"),
    pc("06"),
    pc("04"),
    pr("still-09.jpg"),
    pr("still-10.jpg"),
    pc("03"),
    pr("still-12.jpg"),
    pc("12"),
  ],
  "cryotherapy-cream": [
    pr("still-04.jpg"),
    pr("how-to.jpg"),
    pr("header-evening.png"),
    pc("10"),
    pr("still-11.jpg"),
    pc("06"),
    pr("still-01.jpg"),
    pc("05"),
    pc("01"),
    pc("02"),
    pr("still-07.jpg"),
    pr("still-09.jpg"),
  ],
  "heat-therapy-spray": [
    pr("heat.jpg"),
    pr("header-heat.png"),
    pr("still-10.jpg"),
    pc("08"),
    pr("still-08.jpg"),
    pc("06"),
    pc("05"),
    pr("how-to.jpg"),
    pr("still-07.jpg"),
    pc("09"),
    pc("10"),
    pr("still-09.jpg"),
  ],
  "evening-spray": [
    pr("header-evening.png"),
    pc("09"),
    pr("still-09.jpg"),
    pc("06"),
    pr("still-07.jpg"),
    pc("02"),
    pc("10"),
    pr("still-11.jpg"),
    pc("11"),
    pr("still-01.jpg"),
    pr("still-03.jpg"),
    pr("still-12.jpg"),
  ],
  "hot-cold-system": [
    pr("heat.jpg"),
    pr("header-heat.png"),
    hc("back.jpg"),
    pc("08"),
    pr("still-12.jpg"),
    pc("06"),
    pr("header-cryo.png"),
    pr("how-to.jpg"),
    hc("combo.jpg"),
    hc("shoulder.jpg"),
    hc("leg.jpg"),
    pc("04"),
  ],
  "rapid-relief-duo": [
    pr("how-to.jpg"),
    pr("header-cryo.png"),
    pr("still-12.jpg"),
    pc("03"),
    pr("still-04.jpg"),
    pc("06"),
    pr("header-evening.png"),
    pr("still-08.jpg"),
    pr("still-11.jpg"),
    pc("01"),
    pr("still-09.jpg"),
    pc("11"),
  ],
};

export function hasMenuBarrage(id: string): boolean {
  return Boolean(CATALOG[id] || PAIN[id]);
}

export function barrageFrames(
  catalogId: string,
  packId?: string,
): BarrageFrame[] {
  const pain = (packId && PAIN[packId]) || PAIN[catalogId];
  const pack = pain
    ? { label: "Pain Relief", srcs: pain }
    : CATALOG[catalogId] ?? CATALOG["appetite-balance"];
  return frames(pack.srcs, pack.label);
}
