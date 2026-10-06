"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { MarketingImage } from "@/components/media/MarketingImage";
import { OPTION_E_NAV, OPTION_E_VIEW_ALL } from "@/content/fixtures/option-e-nav";
import {
  landingNotecards,
  type LandingNotecard,
  type LandingNote,
} from "@/content/fixtures/landing-notecards";
import {
  painReliefMenuProducts,
  painReliefPdpHref,
} from "@/content/fixtures/pain-relief";
import { PhoneTileTitle } from "@/components/catalog/PhoneTileTitle";
import { LandingGlass } from "./LandingGlass";
import {
  SHOP_CATALOG,
  catalogTileSrc,
  shopCatalogItem,
  type ShopKind,
} from "./shop-catalog";
import { ShopBloomPair } from "./ShopBloomPair";
import { bloomStyle } from "./shop-plates";
import shop from "./LandingShop.module.css";
import styles from "./LandingCatalog.module.css";

const LEAD_ID = "testosterone";

const COMPACT_QUERY = "(width < 1025px)";

/** Same row as the landing header dropdown. Shop All is the link, not a tab. */
const CATALOG_TABS = [
  { id: "products-bundles", label: "Products & Bundles" },
  { id: "treatments", label: "Treatments" },
  { id: "pain-relief", label: "Pain Relief" },
] as const;

type CatalogTab = (typeof CATALOG_TABS)[number]["id"];

const PAIN_IDS = new Set(painReliefMenuProducts.map((item) => item.id));

const PAIN_TILE_LABEL: Readonly<Record<string, string>> = {
  "evening-spray": "Evening Spray",
};

/** One line on the phone panel. Longer lines clip. */
const PAIN_HEADLINE: Readonly<Record<string, string>> = {
  "cryotherapy-spray": "Cooling spray after activity",
  "max-strength-spray": "Strongest cooling spray",
  "cryotherapy-cream": "Cooling cream, by hand",
  "heat-therapy-spray": "Spray for tight tissue",
  "evening-spray": "Evening wind down",
  "hot-cold-system": "Heat and cold sprays",
  "rapid-relief-duo": "Spray and cream kit",
};

const PAIN_SUBTITLE: Readonly<Record<string, string>> = Object.fromEntries(
  painReliefMenuProducts.map((item) => [item.id, item.meta]),
);

function useCompactCatalog() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(COMPACT_QUERY);
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false,
  );
}

function catalogTabFor(id: string): CatalogTab {
  if (PAIN_IDS.has(id)) return "pain-relief";
  const next = shopCatalogItem(id)?.kind;
  if (next === "treatment") return "treatments";
  return "products-bundles";
}

function painNotes(
  product: (typeof painReliefMenuProducts)[number],
): readonly [LandingNote, LandingNote, LandingNote] {
  const titles = [...product.uses, product.meta, product.name].slice(0, 3);
  const chips = ["Apply", "When", "Format"] as const;
  return [
    { chip: chips[0], title: titles[0] ?? product.name },
    { chip: chips[1], title: titles[1] ?? product.name },
    { chip: chips[2], title: titles[2] ?? product.name },
  ];
}

const PAIN_CARDS: readonly LandingNotecard[] = painReliefMenuProducts.flatMap(
  (product) => {
    const art = shopCatalogItem(product.id);
    if (!art) return [];
    return [
      {
        id: product.id,
        eyebrow: product.name,
        headline: PAIN_HEADLINE[product.id] ?? product.meta,
        body: product.body,
        href: product.href ?? painReliefPdpHref(product.id),
        iconSrc: "/landing/section-2/icons/cross.svg",
        fieldSrc: "/landing/nav/fields/pain-relief.jpg",
        notes: painNotes(product),
        cta: `Shop ${product.name}`,
        footnote: null,
      },
    ];
  },
);

function leadWith<T extends { id: string }>(items: readonly T[], id: string): T[] {
  const lead = items.find((item) => item.id === id);
  if (!lead) return [...items];
  return [lead, ...items.filter((item) => item.id !== id)];
}

function tilesForTab(tab: CatalogTab) {
  if (tab === "treatments") {
    return SHOP_CATALOG.filter((item) => item.kind === "treatment");
  }
  if (tab === "products-bundles") {
    return leadWith(
      [
        ...SHOP_CATALOG.filter((item) => item.kind === "product"),
        ...SHOP_CATALOG.filter((item) => item.kind === "bundle"),
      ].filter((item) => item.id !== "pain-relief" && !PAIN_IDS.has(item.id)),
      LEAD_ID,
    );
  }
  return painReliefMenuProducts.flatMap((product) => {
    const art = shopCatalogItem(product.id);
    if (!art) return [];
    return [
      {
        ...art,
        label: PAIN_TILE_LABEL[product.id] ?? product.name,
        href: product.href ?? painReliefPdpHref(product.id),
      },
    ];
  });
}

const SUBTITLE: Readonly<Record<string, string>> = Object.fromEntries(
  OPTION_E_NAV.flatMap((link) =>
    link.bloomItems.map((item) => [item.id, item.bloomSubtitle]),
  ),
);

/** Notecards in header order. Pain relief stays in its own header row. */
const DECK: readonly LandingNotecard[] = (() => {
  const byId = new Map(landingNotecards.map((card) => [card.id, card]));
  return SHOP_CATALOG.flatMap((item) => {
    const card = byId.get(item.id);
    return card ? [card] : [];
  });
})();

const COMPACT_DECK: readonly LandingNotecard[] = [
  ...DECK,
  ...PAIN_CARDS.filter((card) => !DECK.some((item) => item.id === card.id)),
];

/** Pain relief stays off the rotation. It shows only after the tab is tapped. */
const ROTATION_DECK: readonly LandingNotecard[] = COMPACT_DECK.filter(
  (card) => card.id !== "pain-relief" && !PAIN_IDS.has(card.id),
);

/** Same run lengths as the desktop glass. Bundles switch after two. */
const RUN: Record<ShopKind, number> = {
  treatment: 3,
  product: 3,
  bundle: 2,
};

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j] as T;
    next[j] = swap as T;
  }
  return next;
}

function mixCatalog(cards: readonly LandingNotecard[]): LandingNotecard[] {
  const buckets: Record<ShopKind, LandingNotecard[]> = {
    treatment: [],
    product: [],
    bundle: [],
  };
  for (const card of cards) {
    const kind = shopCatalogItem(card.id)?.kind;
    if (kind) buckets[kind].push(card);
  }
  (Object.keys(buckets) as ShopKind[]).forEach((kind) => {
    buckets[kind] = shuffle(buckets[kind]);
  });

  const mixed: LandingNotecard[] = [];
  let last: ShopKind | null = null;
  while (
    buckets.treatment.length ||
    buckets.product.length ||
    buckets.bundle.length
  ) {
    const remaining = (Object.keys(buckets) as ShopKind[]).filter(
      (kind) => buckets[kind].length > 0,
    );
    const choices =
      last && remaining.length > 1
        ? remaining.filter((kind) => kind !== last)
        : remaining;
    const kind = choices[Math.floor(Math.random() * choices.length)] as ShopKind;
    const take = Math.min(RUN[kind], buckets[kind].length);
    for (let i = 0; i < take; i += 1) {
      const card = buckets[kind].shift();
      if (card) mixed.push(card);
    }
    last = kind;
  }
  return mixed;
}

function isolateSrc(id: string) {
  return catalogTileSrc(id);
}

function openingId(tab: CatalogTab, list: readonly { id: string }[]) {
  const deckIds = new Set(
    (tab === "pain-relief" ? PAIN_CARDS : DECK).map((card) => card.id),
  );
  if (tab === "products-bundles" && list.some((item) => item.id === LEAD_ID)) {
    return LEAD_ID;
  }
  return (list.find((item) => deckIds.has(item.id)) ?? list[0])?.id;
}

export function LandingCatalog() {
  const compact = useCompactCatalog();
  const [tab, setTab] = useState<CatalogTab>("products-bundles");
  const [activeId, setActiveId] = useState(LEAD_ID);
  const [pressedId, setPressedId] = useState(LEAD_ID);
  const [compactDeck, setCompactDeck] =
    useState<readonly LandingNotecard[]>(ROTATION_DECK);

  const showLead = useCallback(() => {
    setTab("products-bundles");
    setActiveId(LEAD_ID);
    setPressedId(LEAD_ID);
  }, []);

  useEffect(() => {
    if (!compact) return;
    setCompactDeck(mixCatalog(ROTATION_DECK));
  }, [compact]);

  const tiles = useMemo(() => tilesForTab(tab), [tab]);

  const glassItems = useMemo(() => {
    if (tab === "pain-relief") return PAIN_CARDS;
    const ids = new Set(tiles.map((item) => item.id));
    const matched = (compact ? compactDeck : DECK).filter((card) => ids.has(card.id));
    return matched.length > 0 ? matched : DECK;
  }, [compact, compactDeck, tab, tiles]);

  const onTab = (next: CatalogTab) => {
    if (next === tab) return;
    const list = tilesForTab(next);
    const pick = openingId(next, list);
    setTab(next);
    if (!pick) return;
    setActiveId(pick);
    setPressedId(pick);
  };

  const onActiveIdChange = useCallback((id: string) => {
    setActiveId(id);
    setPressedId(id);
    setTab(catalogTabFor(id));
  }, []);

  const onSlideStart = useCallback((id: string) => {
    setPressedId(id);
    setTab(catalogTabFor(id));
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [artNear, setArtNear] = useState(false);

  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;
    let onScreen = false;
    const observer = new IntersectionObserver(([entry]) => {
      const next = Boolean(entry?.isIntersecting);
      if (onScreen && !next) showLead();
      onScreen = next;
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [showLead]);

  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setArtNear(true);
      },
      { rootMargin: "240px" },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const chrome = chromeRef.current;
    if (!card || !chrome) return;
    const sync = () => {
      card.style.setProperty("--catalog-chrome-h", `${chrome.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    const bar = thumb?.parentElement;
    if (!rail || !thumb || !bar) return;
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const travel = bar.clientWidth - thumb.offsetWidth;
      const progress = max > 1 ? rail.scrollLeft / max : 0;
      bar.hidden = max <= 1;
      thumb.style.transform = `translateX(${progress * travel}px)`;
    };
    sync();
    rail.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [tab, tiles]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(width >= 1025px)").matches) return;
    const tile = card.querySelector<HTMLElement>('[aria-pressed="true"]');
    const scroller = tile?.closest("ul");
    if (!tile || !(scroller instanceof HTMLElement)) return;
    const tileBox = tile.getBoundingClientRect();
    const frame = scroller.getBoundingClientRect();
    let delta = 0;
    if (tileBox.left < frame.left) {
      delta = tileBox.left - frame.left;
    } else if (tileBox.right > frame.right) {
      delta = tileBox.right - frame.right;
    }
    if (Math.abs(delta) < 1) return;
    scroller.scrollTo({ left: scroller.scrollLeft + delta, behavior: "auto" });
  }, [activeId, pressedId, tab]);

  return (
    <div className={styles.root}>
      <div className={styles.notecard} ref={cardRef}>
        <div className={styles.chrome} ref={chromeRef}>
          <div className={styles.tabRow}>
            <div className={styles.tabs}>
              <div className={styles.tabList} role="tablist" aria-label="Catalog">
              {CATALOG_TABS.map((row) => {
                const selected = row.id === tab;
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="tab"
                    id={`landing-catalog-${row.id}`}
                    aria-selected={selected}
                    aria-controls="landing-catalog-panel"
                    className={styles.tab}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => onTab(row.id)}
                  >
                    <span className={styles.tabLabel} data-label={row.label}>
                      <span>{row.label}</span>
                    </span>
                  </button>
                );
              })}
              </div>
              <Link href={OPTION_E_VIEW_ALL.href} className={styles.shopAll}>
                Shop All
                <svg
                  className={styles.shopAllArrow}
                  width="8"
                  height="8"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                >
                  <path
                    d="M2.2 7.8 L7.8 2.2 M4.6 2.2 H7.8 V5.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div
            id="landing-catalog-panel"
            className={styles.tileRail}
            role="tabpanel"
            aria-labelledby={`landing-catalog-${tab}`}
          >
            <ul className={styles.grid} ref={railRef}>
              {tiles.map((item) => {
                const current = item.id === (compact ? pressedId : activeId);
                const isolate = isolateSrc(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.tile}
                      data-kind={item.kind}
                      data-catalog-tokens={item.id}
                      aria-pressed={current}
                      onClick={() => {
                        setActiveId(item.id);
                        setPressedId(item.id);
                      }}
                      style={bloomStyle(item.bloom)}
                    >
                      <span className={styles.plate}>
                        {artNear ? (
                          <MarketingImage
                            className={styles.plateImg}
                            src={item.plateSrc}
                            alt=""
                            sizes="(width < 721px) 44vw, (width < 1025px) 22vw, 180px"
                          />
                        ) : null}
                        <span className={styles.ring} aria-hidden />
                        <span className={styles.lockup}>
                          <span
                            className={`${shop.bloomFrame} ${shop.bloomHost}`}
                            data-bloom={item.id}
                            data-kind={item.kind}
                          >
                            <ShopBloomPair
                              vialSrc={isolate}
                              bloomSrc={item.bloomSrc}
                              active={artNear}
                              sizes="(width < 721px) 44vw, (width < 1025px) 22vw, 180px"
                              vialSizes="(width < 721px) 44vw, (width < 1025px) 22vw, 180px"
                            />
                          </span>
                        </span>
                      </span>
                      <span className={styles.name}>
                        <PhoneTileTitle id={item.id} label={item.label} />
                      </span>
                      <span className={styles.lede}>
                        {SUBTITLE[item.id] ?? PAIN_SUBTITLE[item.id] ?? ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={styles.tileScroll} aria-hidden="true">
              <span className={styles.tileScrollThumb} ref={thumbRef} />
            </div>
          </div>
        </div>
        <LandingGlass
          items={glassItems}
          activeId={activeId}
          autoMs={0}
          onActiveIdChange={onActiveIdChange}
          onSlideStart={compact ? onSlideStart : undefined}
          className={styles.stage}
        />
      </div>
    </div>
  );
}
