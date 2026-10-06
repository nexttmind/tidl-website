"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { MarketingImage } from "@/components/media/MarketingImage";
import { PhoneTileTitle } from "@/components/catalog/PhoneTileTitle";
import {
  optEntry,
  splitMediaSrc,
  withQuery,
} from "@/lib/media/opt-manifest";
import {
  ACCOUNT_LOGIN_HREF,
  ACCOUNT_SIGNUP_HREF,
} from "@/content/clinical/entry-map";
import type { CatalogLink } from "@/content/fixtures/ask-tidl";
import {
  OPTION_E_NAV,
  OPTION_E_VIEW_ALL,
  bloomLink,
  productsBundlesMenuProducts,
  type OptionEItem,
  type OptionENavId,
  type OptionENavLink,
} from "@/content/fixtures/option-e-nav";
import { CATALOG_CHROME } from "@/content/fixtures/catalog";
import { previewWrapFor } from "@/content/fixtures/preview-wrap";
import { CATALOG_PDP_BY_ID } from "@/content/pdp/catalog-specs";
import { SoldOutBadge, SoldOutTitle } from "@/components/category/SoldOutTitle";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { shopCatalogItem } from "@/components/home/shop-catalog";
import { bloomStyle } from "@/components/home/shop-plates";
import {
  painReliefCopy,
  painReliefMenuProducts,
  painReliefPdpHref,
  painReliefProducts,
} from "@/content/fixtures/pain-relief";
import { painReliefMenuPreview } from "@/content/pdp/pain-relief";
import shop from "@/components/home/LandingShop.module.css";
import { menuTapStartsBarrage } from "./MenuBarrage";
import { warmMenuBarrageAfterPaint, warmMenuBarrageSequence } from "./menu-barrage-session";
import { clearMenuPaneShift, useMenuTabSwipe } from "./menu-compress";
import styles from "./SiteHeader.module.css";

/** Bundles section uses the multi-vial lockups. */

function shopIdFor(item: CatalogLink): string {
  return item.id;
}

/** Last two words stay together so a paragraph cannot end on a widow. */
function splitWidow(text: string): { head: string; tail: string | null } {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return { head: text, tail: null };
  const last = parts.pop() as string;
  const prev = parts.pop() as string;
  return {
    head: parts.length ? `${parts.join(" ")} ` : "",
    tail: `${prev} ${last}`,
  };
}

type Preview = {
  fieldSrc?: string;
  vialSrc?: string;
  bloomSrc?: string;
  shape: "vial" | "lockup" | "square" | "kit" | "pair";
  callouts: readonly { chip: string; body: string }[];
  plate?: boolean;
};

const warmed = new Set<string>();

function warmMedia(src?: string) {
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  const { query } = splitMediaSrc(src);
  const entry = optEntry(src);
  const href = entry
    ? withQuery(
        (entry.webp.find((row) => row.w >= 800) ??
          entry.webp[0] ?? { src: entry.fallback }).src,
        query,
      )
    : src;
  const img = new Image();
  img.decoding = "async";
  img.src = href;
}

function warmPreview(item: CatalogLink, section?: OptionENavId) {
  warmMedia(previewFor(item, section).fieldSrc);
}

/** Warm the first field of each section once a catalog menu is actually approached. */
export function WarmPreviewFields() {
  useEffect(() => {
    if (window.matchMedia("(width < 1025px)").matches) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      for (const nav of OPTION_E_NAV) {
        const first = nav.bloomItems[0];
        if (first) warmPreview(bloomLink(first), nav.id);
      }
      warmMedia(CATALOG_CHROME.viewAll);
    };
    const onOver = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-catalog-item]")) return;
      run();
      document.removeEventListener("pointerover", onOver);
    };
    document.addEventListener("pointerover", onOver);
    return () => document.removeEventListener("pointerover", onOver);
  }, []);
  return null;
}

function PreviewField({ src }: { src: string }) {
  const [painted, setPainted] = useState(src);

  return (
    <>
      {painted !== src ? (
        <MarketingImage
          src={painted}
          alt=""
          sizes="560px"
          loading="eager"
          className={styles.previewField}
        />
      ) : null}
      <MarketingImage
        src={src}
        alt=""
        sizes="560px"
        loading="eager"
        fetchPriority="high"
        className={styles.previewField}
        onLoad={() => setPainted(src)}
      />
    </>
  );
}

function chromePreview(
  fieldSrc: string,
  callouts: Preview["callouts"] = [],
): Preview {
  return {
    fieldSrc,
    shape: "lockup",
    callouts,
    plate: true,
  };
}

const PAIN_VIEW_ALL: CatalogLink = {
  id: "view-all-pain-relief",
  label: "Shop All",
  href: "/pain-relief",
  blurb: "Browse pain relief.",
  keywords: [],
};

function previewFor(item: CatalogLink, section?: OptionENavId): Preview {
  if (item.id === "view-all-treatments" || item.id === "view-all-pain-relief") {
    return chromePreview(CATALOG_CHROME.viewAll);
  }
  const shopId = shopIdFor(item);
  const visual = shopCatalogItem(shopId);
  const wrap = previewWrapFor(shopId) ?? previewWrapFor(item.id);
  const spec = CATALOG_PDP_BY_ID[shopId] ?? CATALOG_PDP_BY_ID[item.id];
  const shape = wrap?.shape ?? (visual?.kind === "bundle" ? "lockup" : "vial");
  const callouts =
    wrap?.callouts ??
    (spec
      ? spec.chips.map((chip, index) => ({
          chip,
          body: spec.callouts[index],
        }))
      : [
          {
            chip: "Care",
            body: item.navSubtitle ?? item.blurb,
          },
        ]);
  return {
    fieldSrc: wrap?.fieldSrc ?? visual?.plateSrc,
    vialSrc: visual?.vialSrc,
    bloomSrc: visual?.bloomSrc,
    shape,
    callouts,
  };
}

export function ChromeFace() {
  return (
    <span className={`${styles.notecardFace} ${styles.notecardFaceGuide}`}>
      <MarketingImage
        className={styles.guideField}
        src="/landing/nav/notecards/view-all-bg.png"
        alt=""
        sizes="(width < 721px) 28vw, 180px"
      />
      <MarketingImage
        className={styles.guideTitle}
        src="/landing/nav/notecards/view-all-title.png"
        alt=""
        sizes="(width < 721px) 22vw, 140px"
      />
    </span>
  );
}

function BloomCard({
  item,
  hot,
  variant = "default",
  section,
  selected = false,
  onPreview,
  kicker,
  reserveKicker = false,
  loading,
  fetchPriority,
  onCatalogTap,
  liClassName,
}: {
  item: CatalogLink;
  hot: boolean;
  variant?: "default" | "all";
  section?: OptionENavId;
  selected?: boolean;
  onPreview?: () => void;
  /** Title sitting above this tile. */
  kicker?: string;
  /** Keep a title-height slot so neighboring tiles stay aligned. */
  reserveKicker?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  onCatalogTap?: (id: string, href: string) => void;
  liClassName?: string;
}) {
  const shopId = shopIdFor(item);
  const visual = variant === "default" ? shopCatalogItem(shopId) : undefined;
  const faceSrc = item.imageSrc;

  return (
    <li className={liClassName}>
      {reserveKicker ? (
        kicker ? (
          <h2 className={styles.optionLoadHeading}>{kicker}</h2>
        ) : (
          <span className={styles.optionLoadKicker} aria-hidden="true" />
        )
      ) : null}
      <Link
        href={item.href}
        className={[
          styles.bloomCard,
          variant === "all" ? styles.bloomCardAll : "",
          selected ? styles.bloomCardSelected : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="menuitem"
        data-bloom={visual ? shopId : undefined}
        data-kind={visual?.kind}
        aria-current={selected ? "true" : undefined}
        style={visual ? bloomStyle(visual.bloom) : undefined}
        onMouseEnter={onPreview}
        onFocus={onPreview}
        onPointerDown={(event) => {
          if (!menuTapStartsBarrage(shopId, event)) return;
          warmMenuBarrageSequence(shopId);
        }}
        onClick={(event) => {
          if (!onCatalogTap || !menuTapStartsBarrage(shopId, event)) return;
          event.preventDefault();
          event.stopPropagation();
          onCatalogTap(shopId, item.href);
        }}
      >
        <span
          className={
            visual ? `${styles.bloomThumb} ${shop.bloomHost}` : styles.bloomThumb
          }
          data-bloom={visual ? shopId : undefined}
          data-kind={visual?.kind}
          aria-hidden
        >
          {variant === "all" ? (
            <ChromeFace />
          ) : visual ? (
            <>
              <span className={styles.bloomPlate}>
                <MarketingImage
                  src={visual.plateSrc}
                  alt=""
                  sizes="160px"
                  loading={loading}
                  fetchPriority={fetchPriority}
                />
              </span>
              <ShopBloomPair
                vialSrc={visual.vialSrc}
                bloomSrc={visual.bloomSrc}
                active={hot}
                sizes="160px"
                vialSizes="160px"
                loading={loading}
                fetchPriority={fetchPriority}
              />
            </>
          ) : faceSrc ? (
            <span className={styles.bloomField}>
              <MarketingImage
                src={faceSrc}
                alt=""
                sizes="160px"
                loading={loading}
                fetchPriority={fetchPriority}
              />
            </span>
          ) : null}
        </span>
        <span className={styles.bloomCopy}>
          <span className={styles.bloomLabel}>
            {variant === "all" ? (
              "Shop All"
            ) : (
              <PhoneTileTitle
                id={shopId}
                label={DESKTOP_TILE_TITLE[shopId] ?? item.label}
              />
            )}
          </span>
          {variant === "all" || !item.navSubtitle ? null : (
            <span className={styles.bloomSub}>{item.navSubtitle}</span>
          )}
        </span>
      </Link>
    </li>
  );
}

function AuthFooter() {
  return (
    <div className={styles.optionAuth}>
      <Link href={ACCOUNT_LOGIN_HREF} className={styles.optionAuthLogin}>
        Log In
      </Link>
      <span className={styles.optionAuthRule} aria-hidden />
      <Link href={ACCOUNT_SIGNUP_HREF} className={styles.optionAuthSignup}>
        Sign Up
      </Link>
    </div>
  );
}

function bloomCards(
  items: readonly OptionEItem[],
  section: OptionENavId,
  media?: { loading?: "eager" | "lazy"; fetchPriority?: "high" | "low" | "auto" },
  onCatalogTap?: (id: string, href: string) => void,
  liClassName?: string,
) {
  return items.map((item) => (
    <BloomCard
      key={item.id}
      item={bloomLink(item)}
      hot
      section={section}
      liClassName={liClassName}
      loading={media?.loading}
      fetchPriority={media?.fetchPriority}
      onCatalogTap={onCatalogTap}
    />
  ));
}

export type DesktopMenuTab =
  | "products"
  | "bundles"
  | "products-bundles"
  | "treatments"
  | "pain-relief"
  | "shop-all";

const DESKTOP_TILE_TITLE: Readonly<Record<string, string>> = {
  "at-home-lab": "Blood Test Kit",
  "body-composition": "Body Comp",
  "mens-peak-performance": "Mens Blend",
  "womens-total-balance": "Women's Blend",
};

const DESKTOP_MENU_TABS: readonly { id: Exclude<DesktopMenuTab, "shop-all" | "products-bundles">; label: string }[] = [
  { id: "products", label: "Products & Bundles" },
  { id: "treatments", label: "Treatments" },
  { id: "pain-relief", label: "Pain Relief" },
];

export function DesktopMenuTiles({
  tab,
  onCatalogTap,
}: {
  tab: DesktopMenuTab;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const products = OPTION_E_NAV.find((row) => row.id === "products");
  const bundles = OPTION_E_NAV.find((row) => row.id === "bundles");
  const treatments = OPTION_E_NAV.find((row) => row.id === "treatments");
  const label =
    DESKTOP_MENU_TABS.find((row) => row.id === tab)?.label ?? "Shop All";

  return (
    <div className={styles.desktopTileScroll}>
      <ul className={styles.desktopTileTrack} aria-label={label}>
        {tab === "products" && products
          ? bloomCards(products.bloomItems, "products", undefined, onCatalogTap)
          : null}
        {tab === "bundles" && bundles
          ? bloomCards(bundles.bloomItems, "bundles", undefined, onCatalogTap)
          : null}
        {tab === "products-bundles" ? (
          <>
            {products
              ? bloomCards(products.bloomItems, "products", undefined, onCatalogTap)
              : null}
            {bundles
              ? bloomCards(bundles.bloomItems, "bundles", undefined, onCatalogTap)
              : null}
          </>
        ) : null}
        {tab === "treatments" && treatments
          ? bloomCards(treatments.bloomItems, "treatments", undefined, onCatalogTap)
          : null}
        {tab === "pain-relief"
          ? painReliefMenuProducts.map((product) => (
              <PainReliefMenuTile
                key={product.id}
                product={product}
                hot
                onCatalogTap={onCatalogTap}
              />
            ))
          : null}
        {tab === "shop-all" ? (
          <>
            {products
              ? bloomCards(products.bloomItems, "products", undefined, onCatalogTap)
              : null}
            {bundles
              ? bloomCards(bundles.bloomItems, "bundles", undefined, onCatalogTap)
              : null}
            {treatments
              ? bloomCards(treatments.bloomItems, "treatments", undefined, onCatalogTap)
              : null}
          </>
        ) : null}
      </ul>
    </div>
  );
}

function DesktopLoadCatalog({
  onCatalogTap,
}: {
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const [active, setActive] = useState<DesktopMenuTab>("products");
  const catalogRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = catalogRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const place = () => {
      const tab = root.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      const cr = card.getBoundingClientRect();
      if (cr.width === 0) return;
      const tr = tab.getBoundingClientRect();
      card.style.setProperty("--caret-x", `${tr.left + tr.width / 2 - cr.left}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(card);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active]);
  const productsLink = OPTION_E_NAV.find((row) => row.id === "products");
  const bundlesLink = OPTION_E_NAV.find((row) => row.id === "bundles");
  const activeLink =
    active === "products" && productsLink
      ? {
          ...productsLink,
          bloomItems: [
            ...productsBundlesMenuProducts(),
            ...(bundlesLink?.bloomItems ?? []),
          ],
          listItems: [
            ...productsBundlesMenuProducts(),
            ...(bundlesLink?.listItems ?? []),
          ],
        }
      : OPTION_E_NAV.find((row) => row.id === active);

  return (
    <div className={styles.desktopCatalog} ref={catalogRef}>
      <div className={styles.desktopSubNav}>
        <div className={styles.desktopSubTabs} role="tablist" aria-label="Catalog">
          {DESKTOP_MENU_TABS.map((row) => (
            <button
              key={row.id}
              type="button"
              role="tab"
              aria-selected={active === row.id}
              className={styles.desktopSubTab}
              onMouseEnter={() => setActive(row.id)}
              onFocus={() => setActive(row.id)}
              onClick={() => setActive(row.id)}
            >
              <span className={styles.desktopSubTabLabel} data-label={row.label}>
                <span>{row.label}</span>
              </span>
            </button>
          ))}
        </div>
        <Link href="/treatments" className={styles.desktopShopAllLink}>
          Shop All
          <svg className={styles.shopAllArrow} viewBox="0 0 10 10" aria-hidden="true">
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
      {activeLink ? (
        <div className={styles.desktopLoadCard} ref={cardRef}>
          <OptionEListPreview link={activeLink} onCatalogTap={onCatalogTap} />
        </div>
      ) : null}
    </div>
  );
}

function MenuTileRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const clip = scrollerRef.current;
    const row = rowRef.current;
    if (!clip || !row) return;

    const rowMq = window.matchMedia("(width < 1025px)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const maxPull = 18;
    const coastTau = 680;
    const coastMax = 2400;
    let offset = 0;
    let pull = 0;
    let velocity = 0;
    let lastX = 0;
    let lastT = 0;
    let coastRaf = 0;
    let tracking = false;
    let armed = false;
    let dragged = false;
    let pointerId = -1;
    let originX = 0;
    let originY = 0;
    let startOffset = 0;

    const stopCoast = () => {
      if (coastRaf) window.cancelAnimationFrame(coastRaf);
      coastRaf = 0;
    };

    const limit = () => {
      const last = row.querySelector(":scope > li:last-child");
      if (!(last instanceof HTMLElement)) return 0;
      const pad = Number.parseFloat(getComputedStyle(row).paddingRight) || 0;
      const end =
        last.getBoundingClientRect().right - row.getBoundingClientRect().left + pad;
      return Math.max(0, end - clip.clientWidth);
    };

    const paint = (animate: boolean) => {
      if (!rowMq.matches || getComputedStyle(clip).display === "contents") {
        row.style.transform = "";
        row.style.transition = "";
        return;
      }
      const shown = offset + pull;
      row.style.transition =
        animate && !reduceMq.matches
          ? "transform 380ms cubic-bezier(0.22, 1.35, 0.36, 1)"
          : "none";
      row.style.transform = `translate3d(${-shown}px, 0, 0)`;
    };

    const follow = (dx: number) => {
      const max = limit();
      const raw = startOffset + dx;
      if (raw < 0) {
        offset = 0;
        pull = Math.max(-maxPull, raw * 0.32);
      } else if (raw > max) {
        offset = max;
        pull = Math.min(maxPull, (raw - max) * 0.32);
      } else {
        offset = raw;
        pull = 0;
      }
      paint(false);
    };

    const begin = (x: number, y: number) => {
      stopCoast();
      tracking = true;
      armed = false;
      dragged = false;
      originX = x;
      originY = y;
      startOffset = offset;
      pull = 0;
      velocity = 0;
      lastX = x;
      lastT = performance.now();
      row.style.transition = "none";
    };

    const moveBy = (x: number, y: number) => {
      if (!tracking) return false;
      const dx = originX - x;
      const dy = originY - y;
      if (!armed) {
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return false;
        armed = true;
        dragged = true;
        clip.style.touchAction = "none";
        lastX = x;
        lastT = performance.now();
      }
      const now = performance.now();
      const stepX = x - lastX;
      const dt = Math.max(8, now - lastT);
      const instant = (-stepX / dt) * 1000;
      velocity = velocity * 0.62 + instant * 0.38;
      lastX = x;
      lastT = now;
      follow(dx);
      return true;
    };

    const endDrag = () => {
      if (!tracking) return;
      tracking = false;
      clip.style.touchAction = "";
      if (!armed) return;
      const idle = performance.now() - lastT;
      let speed =
        reduceMq.matches || idle > 90
          ? 0
          : Math.max(-coastMax, Math.min(coastMax, velocity));
      pull = 0;
      if (Math.abs(speed) < 6) {
        offset = Math.max(0, Math.min(limit(), offset));
        paint(true);
        return;
      }
      let prev = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(now - prev, 48);
        prev = now;
        const max = limit();
        offset += speed * (dt / 1000);
        if (offset <= 0 || offset >= max) {
          const dir = offset <= 0 ? -1 : 1;
          offset = dir < 0 ? 0 : max;
          pull = dir * Math.min(maxPull, Math.abs(speed) * 0.01);
          paint(false);
          window.requestAnimationFrame(() => {
            pull = 0;
            paint(true);
          });
          coastRaf = 0;
          return;
        }
        speed *= Math.exp(-dt / coastTau);
        paint(false);
        if (Math.abs(speed) < 6) {
          coastRaf = 0;
          return;
        }
        coastRaf = window.requestAnimationFrame(tick);
      };
      coastRaf = window.requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      if (!rowMq.matches || getComputedStyle(clip).display === "contents") return;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      begin(event.clientX, event.clientY);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.pointerId !== pointerId) return;
      if (!moveBy(event.clientX, event.clientY)) return;
      try {
        clip.setPointerCapture(event.pointerId);
      } catch {
        /* The pointer can end before capture. */
      }
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.pointerId !== pointerId) return;
      if (clip.hasPointerCapture(event.pointerId)) {
        clip.releasePointerCapture(event.pointerId);
      }
      endDrag();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!rowMq.matches || getComputedStyle(clip).display === "contents") return;
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      begin(touch.clientX, touch.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      if (moveBy(touch.clientX, touch.clientY)) event.preventDefault();
    };

    const onTouchEnd = () => {
      endDrag();
    };

    const onClick = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    clip.addEventListener("pointerdown", onDown);
    clip.addEventListener("pointermove", onMove);
    clip.addEventListener("pointerup", onUp);
    clip.addEventListener("pointercancel", onUp);
    clip.addEventListener("touchstart", onTouchStart, { passive: true });
    clip.addEventListener("touchmove", onTouchMove, { passive: false });
    clip.addEventListener("touchend", onTouchEnd);
    clip.addEventListener("touchcancel", onTouchEnd);
    clip.addEventListener("click", onClick, true);

    const ro = new ResizeObserver(() => {
      stopCoast();
      offset = Math.max(0, Math.min(limit(), offset));
      pull = 0;
      paint(false);
    });
    ro.observe(clip);
    ro.observe(row);
    paint(false);

    return () => {
      clip.removeEventListener("pointerdown", onDown);
      clip.removeEventListener("pointermove", onMove);
      clip.removeEventListener("pointerup", onUp);
      clip.removeEventListener("pointercancel", onUp);
      clip.removeEventListener("touchstart", onTouchStart);
      clip.removeEventListener("touchmove", onTouchMove);
      clip.removeEventListener("touchend", onTouchEnd);
      clip.removeEventListener("touchcancel", onTouchEnd);
      clip.removeEventListener("click", onClick, true);
      clip.style.touchAction = "";
      stopCoast();
      ro.disconnect();
      row.style.transform = "";
      row.style.transition = "";
    };
  }, []);

  return (
    <div className={styles.menuTileRow}>
      <div className={styles.menuTileScroller} ref={scrollerRef} data-menu-row="">
        <ul ref={rowRef} className={styles.bloomGrid} aria-label={label}>
          {children}
        </ul>
      </div>
    </div>
  );
}

function ChromeTiles({
  item = OPTION_E_VIEW_ALL,
  selectedId,
  onPreview,
  reserveKicker = false,
  kicker,
  loading,
  fetchPriority,
  liClassName,
}: {
  item?: CatalogLink;
  selectedId?: string;
  onPreview?: (id: string) => void;
  reserveKicker?: boolean;
  kicker?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  liClassName?: string;
}) {
  return (
    <BloomCard
      item={item}
      hot
      variant="all"
      reserveKicker={reserveKicker}
      kicker={kicker}
      loading={loading}
      fetchPriority={fetchPriority}
      liClassName={liClassName}
      selected={selectedId === item.id}
      onPreview={onPreview ? () => onPreview(item.id) : undefined}
    />
  );
}

function PainReliefMenuTile({
  product,
  hot,
  loading,
  fetchPriority,
  onPreview,
  onCatalogTap,
}: {
  product: (typeof painReliefProducts)[number];
  hot: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  onPreview?: () => void;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const art = shopCatalogItem(product.id);
  if (!art) return null;
  const href = product.href ?? painReliefPdpHref(product.id);

  return (
    <li>
        <Link
        href={href}
        className={styles.bloomCard}
        role="menuitem"
        data-bloom={product.id}
        data-kind={art.kind}
        data-catalog-tokens={product.id}
        aria-label={product.soldOut ? `${product.name}, sold out` : undefined}
        style={bloomStyle(art.bloom)}
        onMouseEnter={onPreview}
        onFocus={onPreview}
        onPointerDown={(event) => {
          if (!menuTapStartsBarrage(product.id, event)) return;
          warmMenuBarrageSequence(product.id);
        }}
        onClick={(event) => {
          if (!onCatalogTap || !menuTapStartsBarrage(product.id, event)) return;
          event.preventDefault();
          event.stopPropagation();
          onCatalogTap(product.id, href);
        }}
      >
        <span
          className={`${styles.bloomThumb} ${shop.bloomHost}`}
          data-bloom={product.id}
          data-kind={art.kind}
          aria-hidden
        >
          <span className={styles.bloomPlate}>
            <MarketingImage
              src={art.plateSrc}
              alt=""
              sizes="160px"
              loading={loading}
              fetchPriority={fetchPriority}
            />
          </span>
          <ShopBloomPair
            vialSrc={art.vialSrc}
            bloomSrc={art.bloomSrc}
            active={hot}
            sizes="160px"
            vialSizes="160px"
            loading={loading}
            fetchPriority={fetchPriority}
          />
          {product.soldOut ? <SoldOutBadge /> : null}
        </span>
        <span className={styles.bloomCopy}>
          <span className={styles.bloomLabel}>
            {product.soldOut ? (
              <SoldOutTitle mark={false}>{product.name}</SoldOutTitle>
            ) : (
              product.name
            )}
          </span>
          <span className={styles.bloomSub}>{product.meta}</span>
        </span>
      </Link>
    </li>
  );
}

function LoadBloomGrid({
  items,
  section,
  hot,
  heading,
  onCatalogTap,
}: {
  items: readonly OptionEItem[];
  section: OptionENavId;
  hot: boolean;
  /** Row title. Sits above the first tile, level with Index. */
  heading?: string;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  return (
    <ul className={styles.optionLoadGrid}>
      {items.map((item, index) => (
        <BloomCard
          key={item.id}
          item={bloomLink(item)}
          hot={hot}
          section={section}
          reserveKicker={Boolean(heading)}
          kicker={heading && index === 0 ? heading : undefined}
        onCatalogTap={onCatalogTap}
      />
      ))}
    </ul>
  );
}

export function DesktopLoadHeaderCatalog({
  onCatalogTap,
}: {
  onCatalogTap?: (id: string, href: string) => void;
}) {
  return (
    <nav className={`${styles.optionLoadMega} ${styles.pdpLoadCatalog}`} aria-label="Browse catalog">
      <DesktopLoadCatalog onCatalogTap={onCatalogTap} />
    </nav>
  );
}

export function OptionEDesktopLoadMega({
  hot = true,
  onCatalogTap,
}: {
  hot?: boolean;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const [painOpen, setPainOpen] = useState(false);
  const [wide, setWide] = useState(false);
  useLayoutEffect(() => {
    const query = window.matchMedia("(width >= 721px)");
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const byId = new Map(OPTION_E_NAV.map((link) => [link.id, link]));
  const products = byId.get("products");
  const treatments = byId.get("treatments");
  const bundles = byId.get("bundles");
  if (!products || !treatments || !bundles) return null;

  return (
    <nav className={styles.optionLoadMega} aria-label="Browse catalog">
      <DesktopLoadCatalog onCatalogTap={onCatalogTap} />
      <section className={styles.optionLoadSection}>
        <div className={styles.optionLoadPair}>
          <ul className={styles.optionLoadGrid}>
            {products.bloomItems.map((item, index) => (
              <BloomCard
                key={item.id}
                item={bloomLink(item)}
                hot={hot}
                section="products"
                reserveKicker
                kicker={index === 0 ? products.label : undefined}
                onCatalogTap={onCatalogTap}
              />
            ))}
          </ul>
          <ul className={`${styles.optionLoadGrid} ${styles.optionLoadBundles}`}>
            {bundles.bloomItems.map((item, index) => (
              <BloomCard
                key={item.id}
                item={bloomLink(item)}
                hot={hot}
                section="bundles"
                reserveKicker
                kicker={index === 0 ? "Product Bundles" : undefined}
                onCatalogTap={onCatalogTap}
              />
            ))}
            <ChromeTiles
              reserveKicker
              liClassName={styles.optionLoadIndex}
            />
          </ul>
        </div>
      </section>
      <section className={`${styles.optionLoadSection} ${styles.optionLoadTreatments}`}>
        <LoadBloomGrid
          items={treatments.bloomItems}
          section="treatments"
          hot={hot}
          heading={treatments.label}
          onCatalogTap={onCatalogTap}
        />
      </section>
      <section
        className={`${styles.optionLoadSection} ${styles.optionLoadPain}`}
        data-open={painOpen ? "true" : "false"}
      >
        <h2 className={styles.optionLoadHeading}>
          <button
            type="button"
            className={styles.optionLoadPainToggle}
            aria-expanded={painOpen}
            aria-controls="desktop-load-pain"
            onClick={() => setPainOpen((open) => !open)}
          >
            {painReliefCopy.title}
            <span className={styles.optionLoadPainIcon} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </h2>
        <div
          className={styles.optionLoadPainPanel}
          id="desktop-load-pain"
          inert={wide && !painOpen ? true : undefined}
        >
          <ul className={styles.optionLoadGrid}>
            {painReliefMenuProducts.map((product) => (
              <PainReliefMenuTile
                key={product.id}
                product={product}
                hot={hot}
                onCatalogTap={onCatalogTap}
              />
            ))}
          </ul>
        </div>
      </section>
      <AuthFooter />
    </nav>
  );
}

export function OptionEBloomMega({
  link,
  hot,
  onCatalogTap,
}: {
  link: OptionENavLink;
  hot: boolean;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  if (link.id === "pain-relief") {
    return (
      <div className={styles.optionMega}>
        <p className={styles.dropdownEyebrow}>{link.label}</p>
        <ul className={styles.bloomGrid}>
          {painReliefMenuProducts.map((product) => (
            <PainReliefMenuTile
              key={product.id}
              product={product}
              hot={hot}
              onCatalogTap={onCatalogTap}
            />
          ))}
        </ul>
        <AuthFooter />
      </div>
    );
  }
  return (
    <div className={styles.optionMega}>
      <p className={styles.dropdownEyebrow}>{link.label}</p>
      <ul className={styles.bloomGrid}>
        {link.bloomItems.map((item) => (
          <BloomCard
            key={item.id}
            item={bloomLink(item)}
            hot={hot}
            section={link.id}
            onCatalogTap={onCatalogTap}
          />
        ))}
        {link.id === "treatments" ? <ChromeTiles /> : null}
      </ul>
      <AuthFooter />
    </div>
  );
}

export function OptionEListPreview({
  link,
  onCatalogTap,
}: {
  link: OptionENavLink;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const pain = link.id === "pain-relief";
  const painProducts = painReliefMenuProducts.filter((product) => product.soldOut !== true);
  const items = link.bloomItems;
  const [activeId, setActiveId] = useState(() =>
    pain
      ? (painProducts[0]?.id ?? "")
      : link.id === "products"
        ? "testosterone"
        : (items[0]?.id ?? ""),
  );
  const tileRows = items.map((item) => bloomLink(item));
  const catalogRows = [
    ...tileRows,
    ...(link.id === "treatments" || link.id === "products"
      ? [OPTION_E_VIEW_ALL]
      : []),
  ];
  const shown =
    catalogRows.find((item) => item.id === activeId) ?? catalogRows[0] ?? null;
  const shownPain = painProducts.find((product) => product.id === activeId) ?? painProducts[0];
  const painCopy = shownPain ? painReliefMenuPreview(shownPain.id) : null;
  const painVisual = shownPain ? shopCatalogItem(shownPain.id) : undefined;
  const preview: Preview | null =
    activeId === PAIN_VIEW_ALL.id
      ? chromePreview(CATALOG_CHROME.viewAll)
      : pain
    ? painCopy
      ? {
          fieldSrc: painCopy.fieldSrc,
          vialSrc: painVisual?.vialSrc,
          shape: "vial",
          callouts: painCopy.callouts,
        }
      : null
    : shown
      ? previewFor(shown, link.id)
      : null;

  useEffect(() => {
    setActiveId(
      pain
        ? (painProducts[0]?.id ?? "")
        : link.id === "products"
          ? "testosterone"
          : (items[0]?.id ?? ""),
    );
  }, [link.id]);

  useEffect(() => {
    if (pain) {
      for (const product of painProducts) {
        const copy = painReliefMenuPreview(product.id);
        warmMedia(copy?.fieldSrc);
        warmMedia(shopCatalogItem(product.id)?.vialSrc);
      }
      return;
    }
    for (const item of items) {
      warmPreview(bloomLink(item), link.id);
    }
    if (link.id === "treatments") {
      warmPreview(OPTION_E_VIEW_ALL, link.id);
    }
  }, [items, link.id, pain]);

  return (
    <div
      className={`${styles.optionMega} ${styles.optionMegaList} ${styles.optionMegaTiles}`}
    >
      <div className={styles.listCol}>
        <p className={styles.dropdownEyebrow}>{link.label}</p>
        <ul
          className={styles.listGrid}
          data-section={link.id}
          aria-label={link.label}
        >
          {pain
            ? painReliefMenuProducts.map((product) => (
                <PainReliefMenuTile
                  key={product.id}
                  product={product}
                  hot
                  onPreview={() => setActiveId(product.id)}
                  onCatalogTap={onCatalogTap}
                />
              ))
            : null}
          {pain
            ? null
            : tileRows.map((row) => (
            <BloomCard
              key={row.id}
              item={row}
              hot
              section={link.id}
              selected={row.id === shown?.id}
              onPreview={() => setActiveId(row.id)}
              onCatalogTap={onCatalogTap}
            />
          ))}
          {link.id === "treatments" || link.id === "products" ? (
            <ChromeTiles
              selectedId={shown?.id}
              onPreview={setActiveId}
            />
          ) : null}
          {pain ? (
            <ChromeTiles
              item={PAIN_VIEW_ALL}
              selectedId={activeId}
              onPreview={setActiveId}
            />
          ) : null}
        </ul>
      </div>
      {preview ? (
        <div className={styles.previewWrap} aria-hidden>
          <div className={styles.previewScale}>
          {preview.plate && preview.fieldSrc ? (
            <MarketingImage
              src={preview.fieldSrc}
              alt=""
              sizes="560px"
              loading="eager"
              fetchPriority="high"
              className={styles.previewPlate}
            />
          ) : preview.fieldSrc ? (
            <PreviewField src={preview.fieldSrc} />
          ) : (
            <span className={styles.previewWash} />
          )}
          <span className={styles.previewGlass} />
          {preview.plate ? null : <span className={styles.previewScrim} />}
          {preview.plate ? null : (
            <span className={styles.previewStage}>
              {preview.vialSrc ? (
                <span
                  className={styles.previewVial}
                  data-shape={preview.shape}
                  data-pain={pain && activeId !== PAIN_VIEW_ALL.id ? "" : undefined}
                >
                  <MarketingImage src={preview.vialSrc} alt="" sizes="420px" />
                </span>
              ) : null}
            </span>
          )}
          {preview.plate || preview.callouts.length === 0 ? null : (
            <ul className={styles.previewCallouts}>
              {preview.callouts.map((callout) => {
                const { head, tail } = splitWidow(callout.body);
                return (
                  <li key={callout.chip}>
                    <span className={styles.previewCalloutLabel}>{callout.chip}</span>
                    <span className={styles.previewCalloutBody}>
                      {head}
                      {tail ? (
                        <span className={styles.previewCalloutTail}>{tail}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const MOBILE_MENU_TABS = [
  { id: "treatments", label: "Treatments" },
  { id: "products-bundles", label: "Products & Bundles" },
] as const;

type MobileMenuTab = (typeof MOBILE_MENU_TABS)[number]["id"] | "shop-all" | "pain-relief";

function tileMedia(pane: MobileMenuTab) {
  return pane === "products-bundles"
    ? { loading: "eager" as const, fetchPriority: "auto" as const }
    : { loading: "eager" as const, fetchPriority: "low" as const };
}

export function OptionEMobileMenu({
  onCatalogTap,
}: {
  onCatalogTap?: (id: string, href: string) => void;
  /** Kept so existing callers can still pass the treatments-index flag. */
  endTab?: "shop-all" | "pain-relief";
} = {}) {
  const [active, setActive] = useState<MobileMenuTab>("products-bundles");
  const trackRef = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState({ left: 0, width: 0 });
  const [cached, setCached] = useState<ReadonlySet<MobileMenuTab>>(
    () => new Set<MobileMenuTab>(["products-bundles"]),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const panesRef = useRef<HTMLDivElement>(null);
  const products = OPTION_E_NAV.find((row) => row.id === "products");
  const bundles = OPTION_E_NAV.find((row) => row.id === "bundles");
  const treatments = OPTION_E_NAV.find((row) => row.id === "treatments");

  useEffect(() => {
    setCached((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setCached(
        new Set<MobileMenuTab>([
          ...MOBILE_MENU_TABS.map((row) => row.id),
          "shop-all",
        ]),
      );
    }, 160);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!cached.has("treatments") || !cached.has("products-bundles")) return;
    const root = panesRef.current;
    const visible = root?.querySelector<HTMLElement>('[data-active="true"]') ?? root;
    if (!root || !visible) return;
    const ids = [...root.querySelectorAll<HTMLElement>("[data-bloom]")]
      .map((el) => el.dataset.bloom)
      .filter((id): id is string => Boolean(id));
    return warmMenuBarrageAfterPaint(ids, visible);
  }, [cached]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const place = () => {
      const tab = track.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      const range = document.createRange();
      range.selectNodeContents(tab);
      const text = range.getBoundingClientRect();
      const frame = track.getBoundingClientRect();
      const overhang = track.closest("header")?.dataset.videoUnder === "true" ? 8 : 0;
      setMark({
        left: text.left - frame.left - overhang / 2,
        width: text.width + overhang,
      });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(track);
    const header = track.closest("header");
    const marks = new MutationObserver(place);
    if (header) marks.observe(header, { attributes: true, attributeFilter: ["data-video-under"] });
    return () => {
      observer.disconnect();
      marks.disconnect();
    };
  }, [active]);

  useLayoutEffect(() => {
    clearMenuPaneShift(panesRef.current);
    const scroller = panesRef.current?.parentElement;
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0;
  }, [active]);

  useMenuTabSwipe(
    rootRef,
    panesRef,
    true,
    () => active,
    () => {
      const phone = window.matchMedia("(width < 721px)").matches;
      if (phone) {
        return ["treatments", "products-bundles", "pain-relief"];
      }
      return ["treatments", "products-bundles", "pain-relief"];
    },
    (next) => {
      if (
        next !== "treatments" &&
        next !== "products-bundles" &&
        next !== "pain-relief" &&
        next !== "shop-all"
      ) {
        return;
      }
      setActive(next);
    },
    () => {},
  );

  return (
    <div className={styles.optionMobile} ref={rootRef}>
      <div className={styles.segments} role="tablist" aria-label="Catalog">
        <div className={styles.segmentsTrack} ref={trackRef}>
          {MOBILE_MENU_TABS.map((row) => {
            const selected = row.id === active;
            return (
              <button
                key={row.id}
                type="button"
                role="tab"
                id={`mobile-tab-${row.id}`}
                aria-controls={`mobile-panel-${row.id}`}
                aria-selected={selected}
                className={[
                  styles.segment,
                  selected ? styles.segmentActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActive(row.id)}
              >
                {row.label}
              </button>
            );
          })}
          <div className={styles.shopAllSegment}>
            <button
              type="button"
              id="mobile-tab-pain-relief-end"
              className={[
                styles.segment,
                active === "pain-relief" ? styles.segmentActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="tab"
              aria-selected={active === "pain-relief"}
              aria-controls="mobile-panel-pain-relief"
              onClick={() => setActive("pain-relief")}
            >
              Pain Relief
            </button>
          </div>
          <span
            className={styles.segmentMark}
            style={{
              width: mark.width,
              transform: `translateX(${mark.left}px)`,
            }}
            aria-hidden
          />
        </div>
      </div>
      <div className={styles.menuScroll} data-menu-tiles="">
      <div className={styles.menuPanes} ref={panesRef}>
        {cached.has("products-bundles") ? (
          <div
            className={styles.menuPane}
            id="mobile-panel-products-bundles"
            role="tabpanel"
            aria-labelledby="mobile-tab-products-bundles"
            data-active={active === "products-bundles" ? "true" : "false"}
            aria-hidden={active === "products-bundles" ? undefined : true}
          >
            <MenuTileRow label="Products & Bundles">
              {bloomCards(
                productsBundlesMenuProducts(),
                "products",
                tileMedia("products-bundles"),
                onCatalogTap,
              )}
              {bundles
                ? bloomCards(
                    bundles.bloomItems,
                    "bundles",
                    tileMedia("products-bundles"),
                    onCatalogTap,
                    styles.phoneBundleTile,
                  )
                : null}
              <ChromeTiles {...tileMedia("products-bundles")} />
            </MenuTileRow>
          </div>
        ) : null}
        {cached.has("treatments") ? (
          <div
            className={styles.menuPane}
            id="mobile-panel-treatments"
            role="tabpanel"
            aria-labelledby="mobile-tab-treatments"
            data-active={active === "treatments" ? "true" : "false"}
            aria-hidden={active === "treatments" ? undefined : true}
          >
            <MenuTileRow label="Treatments">
              {treatments
                ? bloomCards(
                    treatments.bloomItems,
                    "treatments",
                    tileMedia("treatments"),
                    onCatalogTap,
                  )
                : null}
              <ChromeTiles {...tileMedia("treatments")} />
            </MenuTileRow>
          </div>
        ) : null}
        {cached.has("pain-relief") ? (
          <div
            className={styles.menuPane}
            id="mobile-panel-pain-relief"
            role="tabpanel"
            aria-labelledby="mobile-tab-pain-relief"
            data-active={active === "pain-relief" ? "true" : "false"}
            aria-hidden={active === "pain-relief" ? undefined : true}
          >
            <MenuTileRow label="Pain Relief">
              {painReliefMenuProducts.map((product) => (
                <PainReliefMenuTile
                  key={product.id}
                  product={product}
                  hot
                  {...tileMedia("pain-relief")}
                  onCatalogTap={onCatalogTap}
                />
              ))}
              <ChromeTiles {...tileMedia("pain-relief")} />
            </MenuTileRow>
          </div>
        ) : null}
        {cached.has("shop-all") ? (
          <div
            className={`${styles.menuPane} ${styles.shopAllPane}`}
            id="mobile-panel-shop-all"
            role="tabpanel"
            aria-labelledby="mobile-tab-shop-all"
            data-active={active === "shop-all" ? "true" : "false"}
            aria-hidden={active === "shop-all" ? undefined : true}
          >
            <MenuTileRow label="Shop All">
              {products
                ? bloomCards(
                    products.bloomItems,
                    "products",
                    tileMedia("shop-all"),
                    onCatalogTap,
                  )
                : null}
              {bundles
                ? bloomCards(
                    bundles.bloomItems,
                    "bundles",
                    tileMedia("shop-all"),
                    onCatalogTap,
                  )
                : null}
              {treatments
                ? bloomCards(
                    treatments.bloomItems,
                    "treatments",
                    tileMedia("shop-all"),
                    onCatalogTap,
                  )
                : null}
            </MenuTileRow>
          </div>
        ) : null}
      </div>
      <AuthFooter />
      </div>
    </div>
  );
}
