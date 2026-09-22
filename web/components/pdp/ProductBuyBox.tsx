"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { usePricingTerms } from "@/components/legal/PricingTermsProvider";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { MarketingImage } from "@/components/media/MarketingImage";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import { FaqAccordion } from "@/components/pdp/FaqAccordion";
import { PriceBreakdown } from "@/components/pdp/PriceBreakdown";
import {
  ProductGallery,
  type GalleryPlate,
} from "@/components/pdp/ProductGallery";
import type { PdpPlanOption } from "@/content/pdp/types";
import { PromoCallout } from "@/components/pdp/PromoCallout";
import {
  DiscountNotecard,
  savingsAmount,
} from "@/components/pdp/DiscountNotecard";
import {
  TrustBadge,
  type TrustIconId,
} from "@/components/pdp/TrustBadge";
import styles from "./ProductBuyBox.module.css";

type PlanOption = PdpPlanOption;
type FaqItem = {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
};
export type TrustItem = { text: string; icon: TrustIconId };

export type HeroCallout = {
  chip: string;
  body: string;
  side: "left" | "right";
  anchor: "cap" | "label" | "base";
};

type PromoShape = {
  eyebrow?: string;
  title: string;
  body?: string;
  code?: string;
};

type ProductBuyBoxProps = {
  title: string;
  stockLabel?: string;
  price: string;
  compareAtPrice?: string;
  primaryCta: string;
  primaryCtaHref?: string;
  body: string;
  trust: readonly TrustItem[];
  planLabel: string;
  planOptions: readonly PlanOption[];
  promo: string | PromoShape;
  gallery: {
    plates?: readonly GalleryPlate[];
    main?: string;
    thumbs?: readonly string[];
    proofThumb: { quote: string; stars: number };
  };
  faq: readonly FaqItem[];
  disclaimer: string;
  safetyLink?: { label: string; href: string };
  /** Full-bleed → notecard morph with left media / right buy column. */
  stickyMedia?: boolean;
  /** Static 50/50 Abel-style split. Takes over stickyMedia morph. */
  layout?: "default" | "split";
  /** Product still for the split left column. */
  heroSrc?: string;
  /** Value props around the split vial. */
  heroCallouts?: readonly HeroCallout[];
  /** Category field for the split right wash. Maps to Figma vial wraps. */
  themeId?: ThemeId;
  category?: string;
  tagline?: string;
  /** Highlight buy-box fields that came from PrescribeRx sandbox. */
  sandboxLive?: boolean;
  payLine?: string;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

type DiscountCard = {
  amount: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  code?: string;
};

function DecisionColumn({
  stockLabel,
  title,
  price,
  compareAtPrice,
  primaryCta,
  primaryCtaHref,
  body,
  trust,
  planLabel,
  planOptions,
  promoText,
  discount,
  faq,
  disclaimer,
  sandboxLive,
}: {
  stockLabel?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  primaryCta: string;
  primaryCtaHref: string;
  body: string;
  trust: readonly TrustItem[];
  planLabel: string;
  planOptions: readonly PlanOption[];
  promoText: string;
  discount: DiscountCard | null;
  faq: readonly FaqItem[];
  disclaimer: string;
  sandboxLive?: boolean;
}) {
  const live = Boolean(sandboxLive);
  return (
    <div className={styles.infoCol}>
      <header className={styles.identity}>
        {live ? <p className={styles.sandboxMark}>Sandbox</p> : null}
        {stockLabel ? (
          <p className={`${styles.stock} ${live ? styles.sandboxValue : ""}`}>
            {stockLabel}
          </p>
        ) : null}
        <h1 id="pdp-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.body}>{body}</p>
      </header>

      <div className={styles.offer}>
        <div className={styles.priceRow}>
          <p className={`${styles.price} ${live ? styles.sandboxValue : ""}`}>
            {price}
          </p>
          {compareAtPrice ? (
            <p
              className={`${styles.compareAt} ${live ? styles.sandboxValue : ""}`}
            >
              {compareAtPrice}
            </p>
          ) : null}
        </div>
        <div className={styles.plan}>
          <label className={styles.planLabel} htmlFor="pdp-plan">
            {planLabel}
          </label>
          <select id="pdp-plan" className={styles.select} defaultValue="">
            {planOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.action}>
        <Button href={primaryCtaHref} className={styles.cta}>
          {primaryCta}
        </Button>
        <ul className={styles.trust}>
          {trust.map((item) => (
            <li key={item.text}>
              <TrustBadge text={item.text} icon={item.icon} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.details} aria-label="Plan details">
        <FaqAccordion items={faq} />
        {discount ? (
          <DiscountNotecard
            amount={discount.amount}
            eyebrow={discount.eyebrow}
            title={discount.title}
            body={discount.body}
            code={discount.code}
          />
        ) : (
          <PromoCallout text={promoText} />
        )}
        <p className={styles.disclaimer}>{disclaimer}</p>
      </div>
    </div>
  );
}

function SplitDecision({
  category,
  title,
  price,
  compareAtPrice,
  tagline,
  body,
  planLabel,
  planOptions,
  primaryCta,
  primaryCtaHref,
  payLine,
  disclaimer,
  media,
  stockLabel,
  sandboxLive,
}: {
  category?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  tagline?: string;
  body: string;
  planLabel: string;
  planOptions: readonly PlanOption[];
  primaryCta: string;
  primaryCtaHref: string;
  payLine?: string;
  disclaimer: string;
  media?: ReactNode;
  stockLabel?: string;
  sandboxLive?: boolean;
}) {
  const live = Boolean(sandboxLive);
  const chips = planOptions.filter((option) => option.value);
  const [plan, setPlan] = useState(
    () =>
      chips.find((option) => option.value === "monthly")?.value ??
      chips[0]?.value ??
      "",
  );
  const { openModal } = usePricingTerms();
  const selected = chips.find((option) => option.value === plan) ?? chips[0];
  const offerPrice = selected?.price ?? price;
  const offerCompare = selected?.compareAtPrice ?? compareAtPrice;
  const offerPay = selected?.payLine ?? payLine;
  const cadence = selected?.cadence;
  const afterPrice = selected?.afterPrice;
  const afterCadence = selected?.afterCadence;

  return (
    <div className={styles.splitCopy}>
      <div className={styles.splitLead}>
        {live ? <p className={styles.sandboxMark}>Sandbox</p> : null}
        {category ? <p className={styles.splitCategory}>{category}</p> : null}
        {stockLabel ? (
          <p
            className={`${styles.stock} ${live ? styles.sandboxValue : ""}`}
          >
            {stockLabel}
          </p>
        ) : null}
        <h1 id="pdp-title" className={styles.splitTitle}>
          {title}
        </h1>
        <div className={styles.splitPriceRow} aria-live="polite">
          <p
            className={`${styles.splitPrice} ${live ? styles.sandboxValue : ""}`}
          >
            {offerPrice}
            {cadence ? (
              <span className={styles.splitCadence}>{cadence}</span>
            ) : null}
          </p>
          {afterPrice ? (
            <p
              className={`${styles.splitAfter} ${live ? styles.sandboxValue : ""}`}
            >
              {afterPrice}
              {afterCadence ? (
                <span className={styles.splitCadence}>{afterCadence}</span>
              ) : null}
            </p>
          ) : null}
          {offerCompare ? (
            <p
              className={`${styles.splitCompare} ${live ? styles.sandboxValue : ""}`}
            >
              {offerCompare}
            </p>
          ) : null}
        </div>
      </div>
      {media}
      <div className={styles.splitRest}>
        {tagline ? (
          <p
            className={`${styles.splitTagline} ${live ? styles.sandboxValue : ""}`}
          >
            {tagline}
          </p>
        ) : null}
        <p className={styles.splitBody}>{body}</p>

        {chips.length > 0 ? (
          <div className={styles.splitPlan}>
            <p className={styles.splitPlanLabel} id="pdp-plan-label">
              {planLabel}
            </p>
            <div
              className={styles.splitChips}
              role="group"
              aria-labelledby="pdp-plan-label"
            >
              {chips.map((option) => {
                const selected = plan === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      styles.splitChip,
                      selected ? styles.splitChipOn : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    aria-label={
                      option.saveLabel
                        ? `${option.label}, ${option.saveLabel} if prescribed`
                        : option.label
                    }
                    onClick={() => setPlan(option.value)}
                  >
                    {option.saveLabel ? (
                      <span className={styles.splitSave} aria-hidden>
                        <span className={styles.splitSaveAmt}>{option.saveLabel}</span>
                      </span>
                    ) : null}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <Button href={primaryCtaHref} className={[styles.splitCta, styles.splitCtaFrost].join(" ")}>
          <span className={styles.splitCtaLabel}>{primaryCta}</span>
          {selected ? (
            <span className={styles.splitCtaSupply}>{selected.label}</span>
          ) : null}
        </Button>
        {offerPay ? <p className={styles.splitPay}>{offerPay}</p> : null}
        <details className={styles.splitTerms}>
          <summary className={styles.splitTermsSummary}>Price details</summary>
          {selected?.first ? <PriceBreakdown plan={selected} /> : null}
          <p className={styles.splitDisclaimer}>{disclaimer}</p>
          {selected?.first ? (
            <button type="button" className={styles.splitSafety} onClick={openModal}>
              Full price and cancellation terms
            </button>
          ) : null}
        </details>
      </div>
    </div>
  );
}

export function ProductBuyBox({
  title,
  stockLabel,
  price,
  compareAtPrice,
  primaryCta,
  primaryCtaHref = "#how",
  body,
  trust,
  planLabel,
  planOptions,
  promo,
  gallery,
  faq,
  disclaimer,
  stickyMedia = false,
  layout = "default",
  heroSrc,
  heroCallouts,
  themeId,
  category,
  tagline,
  sandboxLive,
  payLine,
}: ProductBuyBoxProps) {
  const scrollRootRef = useRef<HTMLElement>(null);
  const splitMediaRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [splitExpanded, setSplitExpanded] = useState(false);
  const condensed = progress >= 0.98;

  const promoText =
    typeof promo === "string"
      ? promo
      : [promo.eyebrow, promo.title, promo.body].filter(Boolean).join(" · ");

  const amount = savingsAmount(price, compareAtPrice);
  const discount =
    amount == null
      ? null
      : typeof promo === "string"
        ? {
            amount,
            eyebrow: "Limited time",
            body: promo,
          }
        : {
            amount,
            eyebrow: promo.eyebrow ?? "Limited time",
            title: promo.title,
            body: promo.body,
            code: promo.code,
          };

  useEffect(() => {
    if (!stickyMedia) return;
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => motionMq.removeEventListener("change", syncMotion);
  }, [stickyMedia]);

  useEffect(() => {
    if (layout !== "split" || !heroCallouts?.length) return;
    const media = splitMediaRef.current;
    if (!media) return;
    const narrowMq = window.matchMedia("(width < 1025px)");

    let timer = 0;
    let cancelled = false;
    const sync = () => {
      if (narrowMq.matches) return;
      const mediaRect = media.getBoundingClientRect();
      if (mediaRect.width < 2 || mediaRect.height < 2) return;
      const origin = mediaRect;
      media.style.setProperty("--field-w", `${origin.width}px`);
      media.style.setProperty("--field-h", `${origin.height}px`);
      const sample = (ink: HTMLElement) => {
        const callout = ink.closest("li");
        const shown =
          !callout || parseFloat(getComputedStyle(callout).opacity) > 0.8;
        const rect = ink.getBoundingClientRect();
        ink.style.setProperty("--chip-x", `${rect.left - origin.left}px`);
        ink.style.setProperty("--chip-y", `${rect.top - origin.top}px`);
        if (shown) ink.dataset.sampled = "true";
      };
      media.querySelectorAll<HTMLElement>("[data-chip-ink]").forEach(sample);
    };
    const queue = (delay = 40) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(sync, delay);
    };

    const onTransitionEnd = () => queue();
    const onPointerEnter = () => queue(760);
    const onResize = () => queue();

    const ro = new ResizeObserver(onResize);
    ro.observe(media);
    media.addEventListener("transitionend", onTransitionEnd);
    media.addEventListener("pointerenter", onPointerEnter);
    window.addEventListener("resize", onResize);
    void document.fonts.ready.then(() => {
      if (!cancelled) queue(splitExpanded ? 760 : 40);
    });
    queue(splitExpanded ? 760 : 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      ro.disconnect();
      media.removeEventListener("transitionend", onTransitionEnd);
      media.removeEventListener("pointerenter", onPointerEnter);
      window.removeEventListener("resize", onResize);
    };
  }, [layout, heroCallouts, splitExpanded, themeId]);

  useEffect(() => {
    if (layout !== "split") return;
    const media = splitMediaRef.current;
    if (!media) return;

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMq.matches) {
      setSplitExpanded(true);
      return;
    }

    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const narrow = window.matchMedia("(width < 1025px)").matches;

    if (narrow) {
      setSplitExpanded(true);
      return;
    }

    if (hoverMq.matches) {
      let hovered = false;
      const onEnter = () => {
        hovered = true;
        window.clearTimeout(timer);
      };
      media.addEventListener("pointerenter", onEnter);
      const timer = window.setTimeout(() => {
        if (!hovered) setSplitExpanded(true);
      }, 5000);
      return () => {
        window.clearTimeout(timer);
        media.removeEventListener("pointerenter", onEnter);
      };
    }

    let playTimer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(playTimer);
        if (!entry?.isIntersecting) return;
        playTimer = window.setTimeout(() => setSplitExpanded(true), 600);
      },
      { threshold: 0.4 },
    );
    io.observe(media);

    const onToggle = () => {
      window.clearTimeout(playTimer);
      setSplitExpanded((open) => !open);
    };
    media.addEventListener("click", onToggle);

    return () => {
      window.clearTimeout(playTimer);
      io.disconnect();
      media.removeEventListener("click", onToggle);
    };
  }, [layout]);

  useEffect(() => {
    if (!stickyMedia) return;
    const root = scrollRootRef.current;
    if (!root) return;

    if (reduceMotion) {
      root.style.setProperty("--buy-p", "1");
      root.style.setProperty(
        "--bleed-w",
        `${document.documentElement.clientWidth}px`,
      );
      root.style.setProperty("--buy-frame-h", `${window.innerHeight}px`);
      setProgress(1);
      return;
    }

    let raf = 0;

    const measure = () => {
      raf = 0;
      const bleedW = document.documentElement.clientWidth;
      root.style.setProperty("--bleed-w", `${bleedW}px`);
      /* Always fill the viewport so olive / white run under fixed overlay chrome. */
      root.style.setProperty("--buy-frame-h", `${window.innerHeight}px`);
      const chrome = document.querySelector("[data-fixed-chrome]");
      const chromeH = chrome
        ? Math.round(chrome.getBoundingClientRect().height)
        : 100;
      root.style.setProperty("--buy-chrome-pad", `${chromeH}px`);
      const rect = root.getBoundingClientRect();
      /* Morph over first ~55vh of section scroll; sticky media continues after. */
      const travel = Math.max(window.innerHeight * 0.55, 1);
      const next = clamp01(-rect.top / travel);
      setProgress(next);
      root.style.setProperty("--buy-p", next.toFixed(4));
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
  }, [stickyMedia, reduceMotion]);

  const galleryNode = (
    <ProductGallery
      plates={gallery.plates}
      mainSlot={gallery.main}
      thumbSlots={gallery.thumbs}
      proof={gallery.proofThumb}
      label={title}
      stickyFill={stickyMedia}
    />
  );

  const decision = (
    <DecisionColumn
      stockLabel={stockLabel}
      title={title}
      price={price}
      compareAtPrice={compareAtPrice}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      body={body}
      trust={trust}
      planLabel={planLabel}
      planOptions={planOptions}
      promoText={promoText}
      discount={discount}
      faq={faq}
      disclaimer={disclaimer}
      sandboxLive={sandboxLive}
    />
  );

  if (layout === "split") {
    const field = themeId ? heroTheme(themeId) : null;
    const plate = themeId ? shopPlate(themeId) : null;
    const fieldStyle = field
      ? ({
          "--theme-night": field.night.css,
          "--theme-primary": field.night.primary,
        } as CSSProperties)
      : undefined;

    const splitMedia = (
      <div
        ref={splitMediaRef}
        className={styles.splitMedia}
        data-expanded={splitExpanded ? "true" : undefined}
      >
        {heroSrc && plate ? (
          <>
            <span className={styles.splitFieldExpand} aria-hidden>
              <span className={styles.splitFieldGrain} />
            </span>
            <div
              className={styles.splitBloomHost}
              data-bloom={plate.id}
              style={bloomStyle(plate.bloom)}
            >
              <span className={styles.splitGlassCard} aria-hidden />
              <div className={styles.splitStage}>
                <ShopBloomPair
                  vialSrc={heroSrc}
                  bloomSrc={plate.bloomSrc}
                  alt={title}
                />
              </div>
            </div>
            {heroCallouts && heroCallouts.length > 0 ? (
              <ul className={styles.splitCallouts} aria-hidden>
                {heroCallouts.map((item, index) => (
                  <li
                    key={item.chip}
                    className={styles.splitCallout}
                    data-side={item.side}
                    data-anchor={item.anchor}
                    style={{ "--callout-i": index } as CSSProperties}
                  >
                    <span className={styles.splitCalloutChip}>
                      <span className={styles.splitCalloutChipInk} data-chip-ink="">
                        {item.chip}
                      </span>
                    </span>
                    <span className={styles.splitCalloutStem} />
                    <p className={styles.splitCalloutBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : heroSrc ? (
          <MarketingImage
            className={styles.splitHero}
            src={heroSrc}
            alt={title}
            sizes="(width < 721px) 100vw, (width < 1025px) 50vw, 560px"
          />
        ) : (
          galleryNode
        )}
      </div>
    );

    return (
      <section
        className={styles.splitRoot}
        id="buy"
        aria-labelledby="pdp-title"
        data-theme={field?.id}
        style={fieldStyle}
      >
        <div
          className={styles.splitInfo}
          data-field={field ? "true" : undefined}
        >
          {field ? (
            <>
              <div className={styles.splitField} aria-hidden />
              <div className={styles.splitGrain} aria-hidden />
              <div className={styles.splitGlass} aria-hidden />
            </>
          ) : null}
          <SplitDecision
            category={category}
            title={title}
            price={price}
            compareAtPrice={compareAtPrice}
            tagline={tagline}
            body={body}
            planLabel={planLabel}
            planOptions={planOptions}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            payLine={payLine}
            disclaimer={disclaimer}
            media={splitMedia}
            stockLabel={stockLabel}
            sandboxLive={sandboxLive}
          />
        </div>
      </section>
    );
  }

  if (!stickyMedia) {
    return (
      <section
        className={`section-bg ${styles.root}`}
        id="buy"
        aria-labelledby="pdp-title"
      >
        <div className={styles.columns}>
          <div className={styles.mediaCol}>{galleryNode}</div>
          <div className={styles.infoStack}>{decision}</div>
        </div>
      </section>
    );
  }

  const cardStyle = {
    "--buy-p": progress.toFixed(4),
  } as CSSProperties;

  return (
    <section
      ref={scrollRootRef}
      className={[
        styles.scrollRoot,
        reduceMotion ? styles.reduceMotion : "",
      ]
        .filter(Boolean)
        .join(" ")}
      id="buy"
      aria-labelledby="pdp-title"
      data-condensed={condensed ? "true" : "false"}
    >
      <div className={styles.card} style={cardStyle}>
        <div className={styles.columnsMorph}>
          <div className={styles.mediaTrack}>
            <div className={styles.mediaMorph}>{galleryNode}</div>
          </div>
          <div className={styles.infoMorph}>
            <div className={styles.decisionPane}>{decision}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
