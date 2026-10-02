"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SoldOutTitle } from "@/components/category/SoldOutTitle";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { SHOP_CATALOG, shopCatalogItem } from "@/components/home/shop-catalog";
import { MarketingImage } from "@/components/media/MarketingImage";
import { bloomStyle, shopPlate, type BloomLayout } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import {
  catalogCopy,
  catalogStackItems,
} from "@/content/fixtures/catalog";
import {
  painReliefMenuProducts,
  painReliefPdpHref,
  painReliefProducts,
} from "@/content/fixtures/pain-relief";
import styles from "./CategoryBrowse.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

type HeaderStackCard = {
  id: string;
  label: string;
  href: string;
  vialSrc: string;
  bloomSrc: string;
  bloom: BloomLayout;
  kind?: string;
  showBloom: boolean;
  /** Vial and pill art stays in the compact column. Sprays, creams, and kits do not. */
  vessel?: "vial" | "other";
};

/** Seats a product cutout that has no bloom plate. */
const PLAIN_BLOOM: BloomLayout = {
  groupW: 400,
  groupH: 520,
  vialX: 50,
  vialY: 46,
  vialW: 180,
  vialH: 400,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  hypotW: [100, 0],
  hypotH: [0, 100],
};

function themeStackCards(): HeaderStackCard[] {
  return catalogStackItems().map((item) => {
    const plate = shopPlate(item.id);
    return {
      id: item.id,
      label: item.pill,
      href: item.href,
      vialSrc: plate.vialSrc,
      bloomSrc: plate.bloomSrc,
      bloom: plate.bloom,
      showBloom: true,
    };
  });
}

const STACK_SKIP = new Set<string>([
  "at-home-lab",
  ...painReliefProducts.map((product) => product.id),
]);

function stackVessel(id: string): "vial" | "other" {
  return STACK_SKIP.has(id) ? "other" : "vial";
}

function catalogHeaderStack(): HeaderStackCard[] {
  const seen = new Set<string>();
  const cards: HeaderStackCard[] = [];
  for (const column of catalogMenuColumns()) {
    for (const group of column.groups) {
      for (const item of group.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const shop = shopCatalogItem(item.id);
        if (shop) {
          cards.push({
            id: shop.id,
            label: item.label,
            href: item.href,
            vialSrc: shop.vialSrc,
            bloomSrc: shop.bloomSrc,
            bloom: shop.bloom,
            kind: shop.kind,
            showBloom: true,
            vessel: stackVessel(shop.id),
          });
          continue;
        }
        const pain = painReliefProducts.find((product) => product.id === item.id);
        if (!pain?.mediaSrc) continue;
        cards.push({
          id: pain.id,
          label: item.label,
          href: item.href,
          vialSrc: pain.mediaSrc,
          bloomSrc: pain.mediaSrc,
          bloom: PLAIN_BLOOM,
          kind: "product",
          showBloom: false,
          vessel: "other",
        });
      }
    }
  }
  return cards.filter((card) => card.vessel !== "other").slice(0, 15);
}

function StackCard({
  item,
  inert = false,
  cardKey,
  active,
}: {
  item: HeaderStackCard;
  inert?: boolean;
  cardKey: string;
  active: boolean;
}) {
  return (
    <a
      className={`${styles.card} ${shop.bloomHost}`}
      href={item.href}
      aria-label={item.label}
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert || undefined}
      data-bloom={item.id}
      data-kind={item.kind}
      data-browse-card={cardKey}
      data-vessel={item.vessel}
      style={bloomStyle(item.bloom)}
    >
      <span className={styles.cardBody} aria-hidden>
        <span className={styles.cardKicker}>{item.label}</span>
        <span className={styles.cardBloom}>
          <ShopBloomPair
            vialSrc={item.vialSrc}
            bloomSrc={item.bloomSrc}
            showBloom={item.showBloom}
            active={active}
          />
        </span>
      </span>
    </a>
  );
}

type CategoryBrowseProps = {
  /** Themes keeps the short browse set. Catalog lists current products, bundles, and treatments. */
  names?: "themes" | "catalog";
};

type CatalogMenuItem = {
  id: string;
  label: string;
  href: string;
  soldOut?: boolean;
};

type CatalogMenuGroup = {
  id: string;
  label: string;
  items: readonly CatalogMenuItem[];
};

type CatalogMenuColumn = {
  id: string;
  groups: readonly CatalogMenuGroup[];
  pin?: CatalogMenuItem;
};

const PAIN_RELIEF_MENU: CatalogMenuGroup = {
  id: "pain-relief",
  label: "Pain Relief",
  items: painReliefMenuProducts.map((product) => ({
    id: product.id,
    label: product.name,
    href: product.href ?? painReliefPdpHref(product.id),
    soldOut: product.soldOut,
  })),
};

function catalogKindItems(
  kind: "product" | "bundle" | "treatment",
): CatalogMenuItem[] {
  return SHOP_CATALOG.filter(
    (item) =>
      item.kind === kind && !(kind === "product" && item.id === "pain-relief"),
  ).map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
  }));
}

function catalogMenuColumns(): CatalogMenuColumn[] {
  return [
    {
      id: "treatment",
      groups: [
        {
          id: "treatment",
          label: "Treatments",
          items: catalogKindItems("treatment"),
        },
      ],
    },
    {
      id: "product",
      groups: [
        {
          id: "product",
          label: "Products",
          items: catalogKindItems("product"),
        },
        {
          id: "bundle",
          label: "Product Bundles",
          items: catalogKindItems("bundle"),
        },
      ],
    },
    {
      id: "pain-relief",
      groups: [PAIN_RELIEF_MENU],
    },
  ];
}

/** Full-bleed browse header that scrubs into a landing-matched notecard on scroll. */
export function CategoryBrowse({ names = "themes" }: CategoryBrowseProps) {
  const scrollRootRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef(0);
  const offsetRef = useRef(0);
  const [condensed, setCondensed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const items = useMemo(
    () => (names === "catalog" ? catalogHeaderStack() : themeStackCards()),
    [names],
  );
  const menu =
    names === "catalog"
      ? null
      : items.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
        }));
  const menuColumns =
    names === "catalog" ? catalogMenuColumns() : null;
  const catalog = names === "catalog";
  const [windowCount, setWindowCount] = useState(4);
  const [head, setHead] = useState(0);
  const [hotKeys, setHotKeys] = useState<ReadonlySet<string>>(() =>
    names === "catalog"
      ? new Set(items.flatMap((item) => [`a-${item.id}`, `b-${item.id}`]))
      : new Set(items.slice(0, 4).map((item) => `a-${item.id}`)),
  );

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => motionMq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || reduceMotion) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const bleedW = document.documentElement.clientWidth;
      root.style.setProperty("--bleed-w", `${bleedW}px`);
      const rect = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      const chrome = document.querySelector("[data-hero-chrome]");
      const chromeH = chrome instanceof HTMLElement ? chrome.offsetHeight : 0;
      const next = clamp01((-rect.top - chromeH) / travel);
      setCondensed(next >= 0.98);
      root.style.setProperty("--hero-p", next.toFixed(4));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  useLayoutEffect(() => {
    if (!catalog) return;
    const stack = stackRef.current;
    if (!stack) return;
    const fit = () => {
      const card = stack.querySelector("[data-browse-card]");
      if (!(card instanceof HTMLElement)) return;
      const cardH = card.offsetHeight;
      if (cardH <= 0) return;
      const need = Math.min(items.length, Math.ceil(stack.clientHeight / cardH) + 1);
      setWindowCount((current) => (current === need ? current : need));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stack);
    return () => observer.disconnect();
  }, [catalog, items.length]);

  useEffect(() => {
    if (!catalog || reduceMotion) return;
    const track = trackRef.current;
    const stack = stackRef.current;
    if (!track || !stack) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = window.requestAnimationFrame(tick);
      if (fine.matches && (stack.matches(":hover") || stack.matches(":focus-within"))) {
        last = 0;
        return;
      }
      const card = track.querySelector("[data-browse-card]");
      if (!(card instanceof HTMLElement)) return;
      const cardH = card.offsetHeight;
      if (cardH <= 0) return;
      if (!last) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      offsetRef.current += (cardH / 5) * dt;
      if (offsetRef.current >= cardH) {
        offsetRef.current -= cardH;
        const next = (headRef.current + 1) % items.length;
        headRef.current = next;
        flushSync(() => setHead(next));
      }
      track.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      track.style.transform = "";
    };
  }, [catalog, items.length, reduceMotion]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const io = new IntersectionObserver(
      (entries) => {
        setHotKeys((current) => {
          let changed = false;
          const next = new Set(current);
          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.browseCard;
            if (!key) continue;
            if (entry.isIntersecting) {
              if (!next.has(key)) {
                next.add(key);
                changed = true;
              }
            } else if (next.has(key)) {
              next.delete(key);
              changed = true;
            }
          }
          return changed ? next : current;
        });
      },
      { root: stack, rootMargin: "80% 0px", threshold: 0 },
    );
    stack.querySelectorAll<HTMLElement>("[data-browse-card]").forEach((card) => {
      io.observe(card);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <header
      ref={scrollRootRef}
      className={[
        styles.scrollRoot,
        reduceMotion ? styles.reduceMotion : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="categories-hero-title"
      data-condensed={condensed ? "true" : "false"}
    >
      <div className={styles.sticky}>
        <div
          className={[styles.frame, mountFade.mount].join(" ")}
          data-browse-hero={names === "catalog" ? "catalog" : ""}
        >
          <h1
            id="categories-hero-title"
            className={
              names === "catalog" ? `sr-only ${styles.heroLabel}` : "sr-only"
            }
          >
            {names === "catalog"
              ? "All Treatments"
              : `${catalogCopy.titleLead} ${catalogCopy.titleAccent}`}
          </h1>
          <MarketingImage
            className={styles.field}
            src="/landing/categories/biker.png"
            alt=""
            width={1920}
            height={1080}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className={styles.wash} aria-hidden />

          <div
            className={styles.layout}
            aria-hidden={condensed || undefined}
          >
            <nav
              className={
                names === "catalog"
                  ? `${styles.menu} ${styles.menuCatalog}`
                  : styles.menu
              }
              aria-label="Categories"
            >
              {menuColumns
                ? menuColumns.map((column) => (
                    <div
                      key={column.id}
                      className={
                        column.pin
                          ? `${styles.menuColumn} ${styles.menuColumnPin}`
                          : styles.menuColumn
                      }
                    >
                      {column.groups.map((group) => (
                        <div key={group.id} className={styles.menuGroup}>
                          <p className={styles.menuColumnTitle}>{group.label}</p>
                          {group.items.map((item) => (
                            <div key={item.id} className={styles.menuEntry}>
                              <a className={styles.menuItem} href={item.href}>
                                {item.soldOut ? (
                                  <SoldOutTitle>{item.label}</SoldOutTitle>
                                ) : (
                                  item.label
                                )}
                              </a>
                            </div>
                          ))}
                        </div>
                      ))}
                      {column.pin ? (
                        <a className={`${styles.menuItem} ${styles.menuPin}`} href={column.pin.href}>
                          {column.pin.label}
                        </a>
                      ) : null}
                    </div>
                  ))
                : menu?.map((item) => (
                    <a key={item.id} className={styles.menuItem} href={item.href}>
                      {item.label}
                    </a>
                  ))}
            </nav>

            <div ref={stackRef} className={styles.stack}>
              <div
                ref={trackRef}
                className={catalog ? `${styles.track} ${styles.trackWindow}` : styles.track}
              >
                <div className={styles.segment}>
                  {(catalog
                    ? Array.from(
                        { length: Math.min(windowCount, items.length) },
                        (_, index) => items[(head + index) % items.length],
                      )
                    : items
                  ).map((item) => (
                    <StackCard
                      key={item.id}
                      item={item}
                      cardKey={`a-${item.id}`}
                      active={catalog || hotKeys.has(`a-${item.id}`)}
                    />
                  ))}
                </div>
                {catalog ? null : (
                  <div className={styles.segment} aria-hidden>
                    {items.map((item) => (
                      <StackCard
                        key={`${item.id}-loop`}
                        item={item}
                        cardKey={`b-${item.id}`}
                        inert
                        active={hotKeys.has(`b-${item.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
