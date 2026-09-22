"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { MarketingImage } from "@/components/media/MarketingImage";
import { useInView } from "@/lib/media/use-in-view";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import {
  discoverCopy,
  discoverFamilies,
  type DiscoverCard,
  type DiscoverFamilyId,
} from "@/content/fixtures/discover";
import styles from "./CategoryDiscover.module.css";

type ViewMode = "card" | "grid";

function ViewIcon({ mode }: { mode: ViewMode }) {
  if (mode === "grid") {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <rect x="1" y="2" width="14" height="5" rx="0.5" fill="currentColor" />
      <rect x="1" y="9" width="14" height="5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function TreatmentCard({
  item,
  eager = false,
}: {
  item: DiscoverCard;
  eager?: boolean;
}) {
  const plate = item.themeId ? shopPlate(item.themeId) : null;
  const [cardRef, hot] = useInView<HTMLAnchorElement>(eager);
  const fieldStyle = {
    "--theme-night": item.nightCss,
    ...(plate ? bloomStyle(plate.bloom) : {}),
  } as CSSProperties;

  return (
    <a
      ref={cardRef}
      className={[
        styles.card,
        plate ? shop.bloomHost : "",
        plate ? styles.bloomOn : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href={item.href}
      data-bloom={item.themeId}
      style={fieldStyle}
      aria-label={`${item.label}${item.price ? `. ${item.price}` : ""}. ${discoverCopy.cta}`}
    >
      <div className={styles.copy}>
        <h3 className={styles.cardTitle}>{item.label}</h3>
        {item.price ? <p className={styles.price}>{item.price}</p> : null}
        <span className={styles.cta}>{discoverCopy.cta}</span>
      </div>
      <div className={styles.media}>
        {plate ? (
          <ShopBloomPair
            vialSrc={plate.vialSrc}
            bloomSrc={plate.bloomSrc}
            active={hot}
          />
        ) : hot ? (
          <MarketingImage
            className={styles.product}
            src={item.mediaSrc}
            alt=""
            sizes="(width < 721px) 40vw, 220px"
          />
        ) : null}
      </div>
    </a>
  );
}

function stackFamilies(lead: DiscoverFamilyId) {
  const selected = discoverFamilies.find((family) => family.id === lead);
  const rest = discoverFamilies.filter((family) => family.id !== lead);
  return selected ? [selected, ...rest] : [...discoverFamilies];
}

export function CategoryDiscover() {
  const [view, setView] = useState<ViewMode>("card");
  const [active, setActive] = useState<DiscoverFamilyId>(discoverFamilies[0].id);
  const families = stackFamilies(active);
  const pinReady = useRef(false);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "") as DiscoverFamilyId;
    if (discoverFamilies.some((family) => family.id === id)) setActive(id);
  }, []);

  useLayoutEffect(() => {
    if (!pinReady.current) {
      pinReady.current = true;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [active]);

  const selectFamily = (id: DiscoverFamilyId) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const nextView: ViewMode = view === "card" ? "grid" : "card";

  return (
    <div className={styles.root} data-view={view}>
      <h1 className="sr-only">{discoverCopy.title}</h1>
      <div id="treatments" className={styles.alias} />

      <nav className={styles.pills} aria-label={discoverCopy.filterLabel}>
        <div className={styles.switch}>
          {discoverFamilies.map((family) => {
            const isActive = family.id === active;
            return (
              <button
                key={family.id}
                type="button"
                className={styles.switchBtn}
                aria-current={isActive ? "true" : undefined}
                onClick={() => selectFamily(family.id)}
              >
                {family.title}
              </button>
            );
          })}
        </div>
      </nav>

      {families.map((family) => (
        <section
          key={family.id}
          id={family.id}
          className={styles.family}
          aria-labelledby={`${family.id}-title`}
        >
          {family.id === "metabolic" ? (
            <div id="health-goals" className={styles.alias} />
          ) : null}
          <header className={styles.familyHead}>
            <h2 id={`${family.id}-title`} className={styles.familyTitle}>
              {family.title}
            </h2>
            <p className={styles.familyLede}>{family.lede}</p>
          </header>
          <div className={styles.list}>
            {family.items.map((item, index) => (
              <TreatmentCard
                key={item.id}
                item={item}
                eager={family.id === families[0]?.id && index < 3}
              />
            ))}
          </div>
        </section>
      ))}

      <button
        type="button"
        className={styles.viewToggle}
        aria-pressed={view === "grid"}
        aria-label={`Show ${nextView} view`}
        onClick={() => setView(nextView)}
      >
        <span className={styles.viewMark}>
          <ViewIcon mode={nextView} />
        </span>
        <span className={styles.viewLabel}>
          {nextView === "grid" ? discoverCopy.viewGrid : discoverCopy.viewCard}
        </span>
      </button>
    </div>
  );
}
