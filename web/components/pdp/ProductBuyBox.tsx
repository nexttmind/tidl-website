"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SoldOutTitle } from "@/components/category/SoldOutTitle";
import { Button } from "@/components/ui/Button";
import { usePricingTerms } from "@/components/legal/PricingTermsProvider";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { MarketingImage } from "@/components/media/MarketingImage";
import { optCssImageSet } from "@/lib/media/opt-manifest";
import {
  catalogFieldId,
  pdpStageSrc,
  shopCatalogItem,
} from "@/components/home/shop-catalog";
import {
  menuBarrageActive,
  subscribeMenuBarrage,
} from "@/components/chrome/menu-barrage-session";
import { stageLockupStyle } from "@/components/home/lockup-vial-fit";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import { FaqAccordion } from "@/components/pdp/FaqAccordion";
import { PriceBreakdown } from "@/components/pdp/PriceBreakdown";
import { PurchaseModule } from "@/components/pdp/PurchaseModule";
import {
  ProductGallery,
  type GalleryPlate,
} from "@/components/pdp/ProductGallery";
import type { PdpPlanOption } from "@/content/pdp/types";
import { PDP_PAYMENT_NOTE } from "@/content/pdp/pricing";
import { launchPageExists } from "@/content/pdp/launch-pricing";
import { usePdpForm } from "@/components/pdp/PdpFormContext";
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

/** Sold out stays a dead button unless the destination is an external store. */
function buyHref(soldOut: boolean, href: string | undefined) {
  if (!soldOut) return href;
  return href?.startsWith("http") ? href : undefined;
}

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
  soldOut?: boolean;
  price: string;
  compareAtPrice?: string;
  primaryCta: string;
  primaryCtaHref?: string;
  complianceLine?: string;
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
  /** Category field fallback when no catalog plate exists. */
  themeId?: ThemeId;
  /** Shop catalog id. Prefer this for vial, bloom, and plate. */
  catalogId?: string;
  /** Hero plate, bloom, and cutout. Does not turn on launch purchase. */
  artId?: string;
  category?: string;
  tagline?: string;
  dek?: readonly [string, string];
  payLine?: string;
  /** Price, stock, and tagline came from the PrescribeRx sandbox catalog. */
  sandboxLive?: boolean;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function onceOnGrid(text: string): string {
  return text
    .replace(/,?\s*if prescribed after clinical review/gi, "")
    .replace(/,?\s*if prescribed/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
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
  soldOut = false,
  title,
  price,
  compareAtPrice,
  primaryCta,
  primaryCtaHref,
  complianceLine,
  body,
  trust,
  planLabel,
  planOptions,
  promoText,
  discount,
  faq,
  disclaimer,
}: {
  stockLabel?: string;
  soldOut?: boolean;
  title: string;
  price: string;
  compareAtPrice?: string;
  primaryCta: string;
  primaryCtaHref: string;
  complianceLine?: string;
  body: string;
  trust: readonly TrustItem[];
  planLabel: string;
  planOptions: readonly PlanOption[];
  promoText: string;
  discount: DiscountCard | null;
  faq: readonly FaqItem[];
  disclaimer: string;
}) {
  return (
    <div className={styles.infoCol}>
      <header className={styles.identity}>
        {stockLabel && !soldOut ? (
          <p className={styles.stock}>{stockLabel}</p>
        ) : null}
        <h1 id="pdp-title" className={styles.title}>
          {soldOut ? <SoldOutTitle>{title}</SoldOutTitle> : title}
        </h1>
        <p className={styles.body}>{body}</p>
      </header>

      <div className={styles.offer}>
        <div className={styles.priceRow}>
          <p className={styles.price}>{price}</p>
          {compareAtPrice ? (
            <p className={styles.compareAt}>{compareAtPrice}</p>
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
        <Button
          href={buyHref(soldOut, primaryCtaHref)}
          disabled={!buyHref(soldOut, primaryCtaHref)}
          className={styles.cta}
        >
          {primaryCta}
        </Button>
        {complianceLine ? (
          <p className={styles.compliance}>{complianceLine}</p>
        ) : null}
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
  catalogId,
  category,
  title,
  soldOut = false,
  price,
  compareAtPrice,
  tagline,
  dek,
  body,
  sandboxLive = false,
  planLabel,
  planOptions,
  primaryCta,
  primaryCtaHref,
  complianceLine,
  payLine,
  disclaimer,
  media,
}: {
  catalogId?: string;
  category?: string;
  title: string;
  soldOut?: boolean;
  price: string;
  compareAtPrice?: string;
  tagline?: string;
  dek?: readonly [string, string];
  body: string;
  sandboxLive?: boolean;
  planLabel: string;
  planOptions: readonly PlanOption[];
  primaryCta: string;
  primaryCtaHref: string;
  complianceLine?: string;
  payLine?: string;
  disclaimer: string;
  media?: ReactNode;
}) {
  const launch = Boolean(catalogId && launchPageExists(catalogId));
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
        {category ? <p className={styles.splitCategory}>{category}</p> : null}
        <h1 id="pdp-title" className={styles.splitTitle}>
          {soldOut ? <SoldOutTitle>{title}</SoldOutTitle> : title}
        </h1>
        {dek ? (
          <p className={styles.splitDek} data-pdp-dek="">
            <span>{dek[0]}</span> <span>{dek[1]}</span>
          </p>
        ) : null}
        {launch ? null : (
          <div className={styles.splitPriceRow} aria-live="polite">
            <p
              className={
                sandboxLive
                  ? `${styles.splitPrice} ${styles.sandboxLive}`
                  : styles.splitPrice
              }
            >
              {offerPrice}
              {cadence ? (
                <span className={styles.splitCadence}>{cadence}</span>
              ) : null}
            </p>
            {afterPrice ? (
              <p className={styles.splitAfter}>
                {afterPrice}
                {afterCadence ? (
                  <span className={styles.splitCadence}>{afterCadence}</span>
                ) : null}
              </p>
            ) : null}
            {offerCompare ? (
              <p className={styles.splitCompare}>{offerCompare}</p>
            ) : null}
          </div>
        )}
      </div>
      {media}
      <div className={styles.splitRest}>
        {tagline ? (
          <p
            className={
              sandboxLive
                ? `${styles.splitTagline} ${styles.sandboxLive}`
                : styles.splitTagline
            }
          >
            {onceOnGrid(tagline)}
          </p>
        ) : null}
        <p className={styles.splitBody}>{onceOnGrid(body)}</p>

        {launch && catalogId ? (
          <PurchaseModule catalogId={catalogId} ctaHref={primaryCtaHref} />
        ) : (
          <>
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
                    const selectedChip = plan === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={[
                          styles.splitChip,
                          selectedChip ? styles.splitChipOn : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={selectedChip}
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

            <Button
              href={buyHref(soldOut, primaryCtaHref)}
              disabled={!buyHref(soldOut, primaryCtaHref)}
              className={[styles.splitCta, styles.splitCtaFrost].join(" ")}
            >
              <span className={styles.splitCtaLabel}>{primaryCta}</span>
              {selected ? (
                <span className={styles.splitCtaSupply}>{selected.label}</span>
              ) : null}
            </Button>
            {complianceLine ? (
              <p className={styles.splitCompliance}>{complianceLine}</p>
            ) : null}
            {offerPay ? <p className={styles.splitPay}>{offerPay}</p> : null}
            <p className={styles.splitPay}>{PDP_PAYMENT_NOTE}</p>
          </>
        )}
        <details className={styles.splitTerms}>
          <summary className={styles.splitTermsSummary}>Price details</summary>
          {!launch && selected?.first ? <PriceBreakdown plan={selected} /> : null}
          <p className={styles.splitDisclaimer}>{disclaimer}</p>
          <button type="button" className={styles.splitSafety} onClick={openModal}>
            Full price and cancellation terms
          </button>
        </details>
      </div>
    </div>
  );
}

export function ProductBuyBox({
  title,
  stockLabel,
  soldOut = false,
  price,
  compareAtPrice,
  primaryCta,
  primaryCtaHref = "#how",
  complianceLine,
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
  themeId,
  catalogId,
  artId,
  category,
  tagline,
  dek,
  payLine,
  sandboxLive = false,
}: ProductBuyBoxProps) {
  const scrollRootRef = useRef<HTMLElement>(null);
  const splitMediaRef = useRef<HTMLDivElement>(null);
  const art = artId ? shopCatalogItem(artId) : undefined;
  const fieldKey = art ? undefined : catalogFieldId(catalogId, themeId);
  const tokenKey = artId ?? fieldKey;
  const pdpForm = usePdpForm();
  const stageForm =
    catalogId && pdpForm?.catalogId === catalogId ? pdpForm.form : undefined;
  const formStage =
    catalogId && pdpForm?.catalogId === catalogId ? pdpForm.heroSrc : undefined;
  const stageSrc =
    formStage ??
    (artId ? pdpStageSrc(artId) : catalogId ? pdpStageSrc(catalogId) : undefined);
  const stageFormRef = useRef(stageForm);
  const [stageReplay, setStageReplay] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [splitExpanded, setSplitExpanded] = useState(false);
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
    if (layout !== "split") return;
    const narrow = window.matchMedia("(width < 1025px)");
    const root = document.documentElement;
    const lock = () => {
      if (!narrow.matches) {
        root.style.removeProperty("--screen-w");
        root.removeAttribute("data-screen-lock");
        return;
      }
      const vv = window.visualViewport;
      const w = Math.round(Math.min(root.clientWidth, vv?.width ?? root.clientWidth));
      root.style.setProperty("--screen-w", `${w}px`);
      root.setAttribute("data-screen-lock", "");
    };
    lock();
    narrow.addEventListener("change", lock);
    window.addEventListener("resize", lock);
    window.visualViewport?.addEventListener("resize", lock);
    return () => {
      narrow.removeEventListener("change", lock);
      window.removeEventListener("resize", lock);
      window.visualViewport?.removeEventListener("resize", lock);
      root.style.removeProperty("--screen-w");
      root.removeAttribute("data-screen-lock");
    };
  }, [layout]);

  useLayoutEffect(() => {
    if (layout !== "split") return;
    const media = splitMediaRef.current;
    if (!media) return;

    const narrow = window.matchMedia("(width < 1025px)");
    let frame = 0;
    let observed: Element | null = null;
    let ro: ResizeObserver;

    const measure = () => {
      const host = media.querySelector<HTMLElement>("[data-glass-host]");
      const vial = media.querySelector<HTMLElement>("[data-bloom-vial]");
      if (!host) return;
      if (vial && vial !== observed) {
        if (observed) ro.unobserve(observed);
        ro.observe(vial);
        observed = vial;
      }
      if (!vial || !narrow.matches) {
        host.style.removeProperty("--glass-w");
        host.style.removeProperty("--glass-h");
        host.style.removeProperty("--glass-x");
        host.style.removeProperty("--glass-y");
        media.style.removeProperty("--media-tuck");
        media.parentElement?.style.removeProperty("--art-drop");
        return;
      }
      const rect = vial.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const hostCs = getComputedStyle(host);
      const transform = getComputedStyle(vial).transform;
      let sx = 1;
      let sy = 1;
      if (transform && transform !== "none") {
        const matrix = new DOMMatrix(transform);
        if (matrix.a) sx = matrix.a;
        if (matrix.d) sy = matrix.d;
      }
      const span = Number.parseFloat(hostCs.getPropertyValue("--lockup-vial-span"));
      const aspect = Number.parseFloat(hostCs.getPropertyValue("--lockup-vial-aspect"));
      const mid = Number.parseFloat(hostCs.getPropertyValue("--lockup-vial-mid"));
      const imageW = rect.width / sx;
      const imageH = rect.height / sy;
      let w = imageW;
      let h = imageH;
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;
      if (span > 0 && aspect > 0 && mid > 0) {
        h = imageH * span;
        w = h * aspect;
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height * mid;
      }
      if (w < 2 || h < 2) return;
      // Same frame for the vial and the pen. The pen plate is measured
      // from the drawn vial, which is seated at the isolate size.
      // The pill is square, so the vial's wide plate leaves long side
      // gaps. Match the top and bottom gap on the left and right.
      // Sprays, creams, the pill, and the kit are wider than a vial.
      // Size their wash from the vial aspect, then use the vial plate.
      const plateH = Math.round(h * 1.28);
      const pill = host.getAttribute("data-bloom") === "sexual-health";
      const bundle = host.getAttribute("data-kind") === "bundle";
      const vialAspect = 402 / 924;
      const drawW =
        !pill && !bundle && w / h > vialAspect ? h * vialAspect : w;
      let plateW = pill ? Math.round(w + (plateH - h)) : Math.round(drawW * 2.5);
      const sideInset = 16;
      if (bundle) {
        plateW = Math.min(plateW, Math.max(0, window.innerWidth - sideInset * 2));
      }
      cx -= hostRect.left;
      cy -= hostRect.top;
      let glassX = cx - plateW / 2;
      if (bundle) {
        const minX = sideInset - hostRect.left;
        const maxX = window.innerWidth - sideInset - plateW - hostRect.left;
        glassX = Math.min(Math.max(glassX, minX), maxX);
      }
      host.style.setProperty("--glass-w", `${plateW}px`);
      host.style.setProperty("--glass-h", `${plateH}px`);
      host.style.setProperty("--glass-x", `${glassX}px`);
      host.style.setProperty("--glass-y", `${cy - plateH / 2}px`);
      const copy = media.parentElement;
      if (copy) {
        const mediaRect = media.getBoundingClientRect();
        /* An off-screen rect makes the plate slack nonsense. Keep the last tuck. */
        if (mediaRect.bottom < 0 || mediaRect.top > window.innerHeight) return;
        const plateBottom = hostRect.top + cy + plateH / 2;
        const slack = mediaRect.bottom - plateBottom;
        /* Tuck closes the empty band under the plate. It does not depend on
         * scroll. --art-drop used to push the vial back below the header by
         * growing margin-top from the scroll position. Scroll anchoring added
         * that same delta back into scrollY, so the two chased until the cap
         * and the hero shuddered. Leave the margin alone. */
        if (copy.style.getPropertyValue("--art-drop")) {
          copy.style.removeProperty("--art-drop");
        }
        const nextTuck = Math.max(0, Math.min(240, Math.round(slack)));
        const tuckNow =
          Number.parseFloat(getComputedStyle(media).getPropertyValue("--media-tuck")) || 0;
        if (Math.abs(nextTuck - tuckNow) > 1) {
          media.style.setProperty("--media-tuck", `${nextTuck}px`);
          schedule();
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const info = media.closest("section");
    const cover = () => {
      if (!narrow.matches || !info) return;
      const vv = window.visualViewport;
      const laid = Math.ceil(
        Math.max(window.innerHeight, vv?.height ?? 0, document.documentElement.clientHeight),
      );
      info.style.setProperty("--field-cover", `${laid}px`);
    };

    ro = new ResizeObserver(schedule);
    ro.observe(media);
    schedule();
    cover();
    media.addEventListener("load", schedule, true);
    media.addEventListener("transitionend", schedule);
    media.addEventListener("animationend", schedule);
    const settled = window.setTimeout(schedule, 1700);
    narrow.addEventListener("change", schedule);
    window.addEventListener("scroll", cover, { passive: true });
    window.visualViewport?.addEventListener("resize", cover);
    window.visualViewport?.addEventListener("scroll", cover);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settled);
      ro.disconnect();
      media.removeEventListener("load", schedule, true);
      media.removeEventListener("transitionend", schedule);
      media.removeEventListener("animationend", schedule);
      narrow.removeEventListener("change", schedule);
      window.removeEventListener("scroll", cover);
      window.visualViewport?.removeEventListener("resize", cover);
      window.visualViewport?.removeEventListener("scroll", cover);
    };
  }, [layout, stageSrc]);

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
      let cancelled = false;
      let imagesReady = false;
      const play = () => {
        if (cancelled || !imagesReady || menuBarrageActive()) return;
        setSplitExpanded(true);
      };
      const imgs = Array.from(media.querySelectorAll("img"));
      const pending = imgs.filter((img) => !(img.complete && img.naturalWidth > 0));
      const unsub = subscribeMenuBarrage(play);
      if (pending.length === 0) {
        imagesReady = true;
        play();
        return () => {
          cancelled = true;
          unsub();
        };
      }
      let left = pending.length;
      const done = () => {
        left -= 1;
        if (left > 0) return;
        imagesReady = true;
        play();
      };
      for (const img of pending) {
        if (img.complete) {
          done();
          continue;
        }
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
      return () => {
        cancelled = true;
        unsub();
        for (const img of pending) {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
        }
      };
    }

    if (hoverMq.matches) {
      const onEnter = () => setSplitExpanded(true);
      media.addEventListener("pointerenter", onEnter);
      const timer = window.setTimeout(() => setSplitExpanded(true), 5000);
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

  useLayoutEffect(() => {
    if (layout !== "split") return;
    const previous = stageFormRef.current;
    stageFormRef.current = stageForm;
    if (previous == null || previous === stageForm) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStageReplay(false);
      setSplitExpanded(true);
      return;
    }

    setStageReplay(true);
    setSplitExpanded(false);
    const timer = window.setTimeout(() => {
      setStageReplay(false);
      setSplitExpanded(true);
    }, 48);
    return () => window.clearTimeout(timer);
  }, [layout, stageForm]);

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
      setCondensed(true);
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
      setCondensed(next >= 0.98);
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
      soldOut={soldOut}
      title={title}
      price={price}
      compareAtPrice={compareAtPrice}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      complianceLine={complianceLine}
      body={body}
      trust={trust}
      planLabel={planLabel}
      planOptions={planOptions}
      promoText={promoText}
      discount={discount}
      faq={faq}
      disclaimer={disclaimer}
    />
  );

  if (layout === "split") {
    const field = themeId ? heroTheme(themeId) : null;
    const catalog = art ?? shopCatalogItem(catalogId ?? themeId ?? "");
    const plate = themeId ? shopPlate(themeId) : null;
    const bloom = catalog?.bloom ?? plate?.bloom;
    const lockupStyle =
      stageForm === "vial-pen" && catalog
        ? stageLockupStyle(catalog.id, catalog.kind, catalog.vialSrc, catalog.penLockupSrc)
        : undefined;
    const plateSrc = catalog?.plateSrc ?? plate?.plateSrc;
    const paintKey = artId ?? fieldKey;
    const platePaint =
      !paintKey && plateSrc
        ? ({ backgroundImage: optCssImageSet(plateSrc, 1920) } as CSSProperties)
        : undefined;
    const nightPaint = paintKey
      ? "var(--field-image)"
      : plateSrc
        ? optCssImageSet(plateSrc, 1920)
        : field?.night.css;
    const fieldStyle = nightPaint
      ? ({
          "--theme-night": nightPaint,
          "--theme-primary": field?.night.primary,
        } as CSSProperties)
      : undefined;

    const splitMedia = (
      <div
        ref={splitMediaRef}
        className={styles.splitMedia}
        data-split-media=""
        data-expanded={splitExpanded ? "true" : undefined}
        data-stage-replay={stageReplay ? "" : undefined}
        style={bloom ? bloomStyle(bloom) : undefined}
      >
        {heroSrc && (catalog || plate) && bloom ? (
          <>
            <span
              className={styles.splitFieldExpand}
              aria-hidden
              data-catalog-field={paintKey}
              style={platePaint}
            />
            <div
              className={`${styles.splitBloomHost} ${shop.bloomSeated}`}
              data-glass-host=""
              data-bloom={catalog?.id ?? plate?.id}
              data-kind={catalog?.kind}
              data-stage-lockup={lockupStyle ? "" : undefined}
              style={lockupStyle}
            >
              <span className={styles.splitGlassCard} data-glass-plate="" aria-hidden />
              <div className={styles.splitStage}>
                <ShopBloomPair
                  vialSrc={stageSrc ?? catalog?.vialSrc ?? heroSrc}
                  bloomSrc={catalog?.bloomSrc ?? plate?.bloomSrc ?? ""}
                  showBloom
                  alt={title}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(width < 721px) 92vw, (width < 1025px) 72vw, 760px"
                  vialSizes="(width < 721px) 84vw, (width < 1025px) 52vw, 460px"
                />
              </div>
            </div>
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
        data-catalog-tokens={tokenKey}
        style={fieldStyle}
      >
        <div
          className={styles.splitInfo}
          data-field={nightPaint ? "true" : undefined}
        >
          {nightPaint ? (
            <>
              <div
                className={styles.splitField}
                aria-hidden
                data-catalog-field={paintKey}
                data-pain-header={art ? "true" : undefined}
                style={platePaint}
              />
              {fieldKey || art ? null : <div className={styles.splitGrain} aria-hidden />}
              <div className={styles.splitGlass} aria-hidden data-split-glass="" />
            </>
          ) : null}
          <SplitDecision
            catalogId={catalogId}
            category={category}
            title={title}
            soldOut={soldOut}
            price={price}
            compareAtPrice={compareAtPrice}
            tagline={tagline}
            dek={dek}
            body={body}
            sandboxLive={sandboxLive}
            planLabel={planLabel}
            planOptions={planOptions}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            complianceLine={complianceLine}
            payLine={payLine}
            disclaimer={disclaimer}
            media={splitMedia}
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
      <div className={styles.card}>
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
