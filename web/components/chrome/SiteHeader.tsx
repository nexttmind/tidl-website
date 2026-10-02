"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AskAiIcon } from "@/components/ai/AskAiIcon";
import { useAskTidl } from "@/components/ai/AskTidlProvider";
import { TidlLogoLockup } from "@/components/brand/TidlLogoLockup";
import {
  DesktopLoadHeaderCatalog,
  DesktopMenuTiles,
  OptionEListPreview,
  OptionEMobileMenu,
  WarmPreviewFields,
  type DesktopMenuTab,
} from "@/components/chrome/OptionEMega";
import {
  menuBarrageActive,
  playMenuBarrage,
  subscribeMenuBarrage,
} from "@/components/chrome/menu-barrage-session";
import { useNavPullOpen } from "@/components/chrome/menu-compress";
import {
  OPTION_E_NAV,
  type OptionENavLink,
} from "@/content/fixtures/option-e-nav";

function subscribePhoneMenu(onChange: () => void) {
  const mq = window.matchMedia("(width < 721px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Phone catalog stays out of the desktop document. SSR snapshot is closed. */
function usePhoneMenu() {
  return useSyncExternalStore(
    subscribePhoneMenu,
    () => window.matchMedia("(width < 721px)").matches,
    () => false,
  );
}

function subscribeNarrowMenu(onChange: () => void) {
  const mq = window.matchMedia("(width < 1025px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Phone and tablet. Desktop snapshot stays closed so the paper menus do not flash glass. */
function useNarrowMenu() {
  return useSyncExternalStore(
    subscribeNarrowMenu,
    () => window.matchMedia("(width < 1025px)").matches,
    () => false,
  );
}
import {
  ACCOUNT_LOGIN_HREF,
  ACCOUNT_SIGNUP_HREF,
} from "@/content/clinical/entry-map";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  announcement?: string;
  navLinks?: readonly OptionENavLink[];
  /**
   * Transparent over page media until the pin morph engages.
   * Without glassNav, chrome keeps dark ink (PDPs with white buy column).
   */
  overlay?: boolean;
  /**
   * Landing-only notecard catalog triggers (Explore Treatments, Flow Pen).
   * Requires overlay chrome; enables inverse (white) logo/nav over a dark hero.
   * Do not enable on treatment/stack PDPs.
   */
  glassNav?: boolean;
  /**
   * Inverse (white) chrome over a dark hero, without glass notecards.
   * Requires overlay. Do not use on PDPs with a white buy column.
   */
  inverse?: boolean;
  /**
   * Landing phone menu: glass over the hero capture, not the paper sheet.
   * On phone and tablet PDPs and the treatments index, the open catalog
   * uses the same sheet. Do not put backdrop-filter on this header.
   */
  menuGlass?: boolean;
  /**
   * Blurred plate behind the open glass sheet. The landing phone menu
   * already has a capture sibling, so it does not set this.
   */
  glassPlate?: boolean;
  /**
   * Floating pill morph after scroll. Off for hims-style sticky top chrome.
   */
  pinOnScroll?: boolean;
  /**
   * Force the pinned (floating pill) visual. Used for the landing post-scroll header.
   */
  forcePinned?: boolean;
  /**
   * Desktop catalog menus use the landing scroll-state panel
   * (tiles plus preview) before the bar pins. PDP overlay chrome.
   */
  scrollMenus?: boolean;
  /**
   * In-flow header inside the landing white sheet. Not sticky.
   */
  embedded?: boolean;
  /**
   * Landing desktop first paint: Ask left, centered wordmark, auth right.
   * The all-in-one catalog is rendered directly below this bar.
   */
  desktopLoadState?: boolean;
  /**
   * Pre-scroll catalog tabs under the load-state bar. Hidden once the bar pins.
   */
  loadCatalog?: boolean;
  /**
   * Landing phone and tablet catalog. Starts closed. The menu button
   * opens it over the hero. Page scroll stays unlocked. Requires
   * overlay, inverse, and menuGlass.
   */
  mobileLoadState?: boolean;
  /**
   * Landing scroll morph: smaller wordmark left, mirrored settle on the right.
   */
  compact?: boolean;
  /**
   * Abel-style bar: Menu left, wordmark centered, Log In right.
   * Overlay chrome, no pin morph. Catalog lives inside Menu.
   */
  layout?: "default" | "centered";
  /**
   * Replaces the accordion catalog in the mobile drawer.
   * Landing used to pass the overlay grid. Option E owns the drawer now.
   */
  mobileMenu?: ReactNode;
  /** Treatments index: the phone end tab is Pain Relief, not Shop All. */
  menuEndTab?: "shop-all" | "pain-relief";
  /**
   * Categories page: orbiting mark reads electric blue on the white bar.
   */
  askAiAccent?: "electric";
  /**
   * Treatments compact header: white ink over the dark browse hero,
   * dark ink once that hero has scrolled above the bar.
   */
  contrastInk?: boolean;
  /** Hide the Ask TIDL AI control in utils (and load-state Ask). */
  hideAskAi?: boolean;
  /**
   * Landing phone and tablet bar. The wordmark stays a still home link.
   * Desktop layout does not read this.
   */
  landingBar?: boolean;
  /** Tablet landing catalog is open. Shows Ask on the left of the bar. */
  tabletCatalogOpen?: boolean;
};

/** Top-level catalog nav. Products, Bundles, Treatments. */
export const PERSONA_NAV: readonly OptionENavLink[] = OPTION_E_NAV;

function hexLuminance(hex: string): number | null {
  const match = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  let value = match[1];
  if (value.length === 3) {
    value = [...value].map((char) => char + char).join("");
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function fieldIsDark(node: HTMLElement): boolean {
  const tile = getComputedStyle(node).getPropertyValue("--tile-1").trim();
  const luminance = hexLuminance(tile);
  if (luminance == null) return true;
  return luminance < 0.55;
}

/** One wash for the whole bar. Paper plate stays dark ink. A dark field goes inverse. */
function headerWashIsDark(header: HTMLElement): boolean {
  const media = document.querySelector<HTMLElement>("[data-split-media]");
  if (media?.dataset.expanded === "true") {
    const field =
      media.querySelector<HTMLElement>("[data-catalog-field]") ??
      document.querySelector<HTMLElement>("[data-catalog-field]") ??
      media;
    return fieldIsDark(field);
  }

  const box = header.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return false;
  const x = box.left + Math.min(72, box.width * 0.12);
  const y = Math.max(0, box.top + Math.min(box.height / 2, 10));
  const stack = document.elementsFromPoint(x, y);
  for (const node of stack) {
    if (!(node instanceof HTMLElement) || header.contains(node)) continue;
    if (node.closest("[data-split-media]")) return false;
    const field = node.closest<HTMLElement>(
      "[data-catalog-field], [data-catalog-tokens]",
    );
    if (field && parseFloat(getComputedStyle(field).opacity) > 0.2) {
      return fieldIsDark(field);
    }
  }
  return false;
}

function IconHamburger() {
  return (
    <span className={styles.hamburger} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

function ShopAllMark() {
  return (
    <svg className={styles.shopAllArrow} viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M2.2 7.8 L7.8 2.2 M4.6 2.2 H7.8 V5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function scrollPreviewLink(pane: DesktopMenuTab): OptionENavLink | null {
  if (pane === "products-bundles") {
    const products = OPTION_E_NAV.find((row) => row.id === "products");
    const bundles = OPTION_E_NAV.find((row) => row.id === "bundles");
    if (!products) return null;
    return {
      ...products,
      bloomItems: [...products.bloomItems, ...(bundles?.bloomItems ?? [])],
      listItems: [...products.listItems, ...(bundles?.listItems ?? [])],
    };
  }
  if (pane === "shop-all") return null;
  return OPTION_E_NAV.find((row) => row.id === pane) ?? null;
}

function CatalogDropdown({
  label,
  pane,
  shopAll = false,
  isOpen,
  locked,
  onHoverOpen,
  onHoverClose,
  onToggleLock,
  onDismiss,
  onCatalogTap,
}: {
  label: string;
  pane: DesktopMenuTab;
  shopAll?: boolean;
  isOpen: boolean;
  locked: boolean;
  onHoverOpen: () => void;
  onHoverClose: () => void;
  onToggleLock: () => void;
  onDismiss: () => void;
  onCatalogTap?: (id: string, href: string) => void;
}) {
  const panelId = useId();
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !locked) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (itemRef.current?.contains(target)) return;
      if (target?.closest?.("[data-catalog-item]")) return;
      onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, locked, onDismiss]);

  const previewLink = scrollPreviewLink(pane);

  return (
    <div
      ref={itemRef}
      data-catalog-item=""
      className={[styles.catalogItem, isOpen ? styles.catalogItemOpen : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={onHoverOpen}
      onMouseLeave={onHoverClose}
    >
      <button
        type="button"
        className={styles.navLink}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={panelId}
        data-locked={locked ? "true" : "false"}
        onClick={onToggleLock}
      >
        {label}
      </button>
      {shopAll ? (
        <Link href="/treatments" className={styles.shopAllArrowLink} aria-label="Treatments">
          <ShopAllMark />
        </Link>
      ) : null}

      <div
        id={panelId}
        className={[styles.dropdown, styles.dropdownMega].filter(Boolean).join(" ")}
        role="menu"
        aria-label={label}
        hidden={!isOpen}
      >
        {isOpen ? (
          <div className={styles.dropdownCard}>
            {previewLink ? (
              <OptionEListPreview
                link={previewLink}
                onCatalogTap={onCatalogTap}
              />
            ) : (
              <DesktopMenuTiles tab={pane} onCatalogTap={onCatalogTap} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Pattern/Header — Superpower-style morph + Option E catalog dropdowns.
 * Hover opens. Click locks open until scroll.
 */
export function SiteHeader({
  announcement,
  navLinks = PERSONA_NAV,
  overlay = false,
  glassNav = false,
  inverse = false,
  menuGlass = false,
  glassPlate = false,
  pinOnScroll = true,
  forcePinned = false,
  scrollMenus = false,
  embedded = false,
  desktopLoadState = false,
  loadCatalog = false,
  mobileLoadState = false,
  compact = false,
  layout = "default",
  mobileMenu,
  menuEndTab = "shop-all",
  askAiAccent,
  contrastInk = false,
  hideAskAi = false,
  landingBar = false,
  tabletCatalogOpen = false,
}: SiteHeaderProps) {
  const { openModal } = useAskTidl();
  const router = useRouter();
  const mobileNavId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuSpin, setMenuSpin] = useState(0);
  const [loadExpanded, setLoadExpanded] = useState(Boolean(mobileLoadState));
  const [fieldInverse, setFieldInverse] = useState(false);
  const [headerPinned, setHeaderPinned] = useState(forcePinned);
  const [pinEnter, setPinEnter] = useState(false);
  const [pinDir, setPinDir] = useState<"in" | "out">(forcePinned ? "in" : "out");
  const [activeMenu, setActiveMenu] = useState<DesktopMenuTab | null>(null);
  const [menuLocked, setMenuLocked] = useState(false);
  const wasPinnedRef = useRef(forcePinned);
  const closeTimerRef = useRef(0);
  const loadDismissedRef = useRef(false);
  const flickClosedRef = useRef(false);
  const pullGuardRef = useRef(false);
  const loadPanelRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const loadExpandedRef = useRef(loadExpanded);
  const mobileOpenRef = useRef(mobileOpen);
  loadExpandedRef.current = loadExpanded;
  mobileOpenRef.current = mobileOpen;
  const centered = layout === "centered";
  const phoneMenu = usePhoneMenu();
  const narrowMenu = useNarrowMenu();
  const allowPin = pinOnScroll || (landingBar && narrowMenu);
  const loadMenu = Boolean(mobileLoadState && narrowMenu);
  const catalogOpen = mobileOpen || ((phoneMenu || loadMenu) && loadExpanded);
  const [holdMenuPaint, setHoldMenuPaint] = useState(false);
  const menuPainted = catalogOpen || holdMenuPaint;

  useEffect(() => {
    if (!catalogOpen) return;
    const tiles = headerRef.current?.querySelector("[data-menu-tiles]");
    if (tiles instanceof HTMLElement) tiles.scrollTop = 0;
  }, [catalogOpen]);

  useLayoutEffect(() => {
    setHoldMenuPaint(false);
  }, [catalogOpen]);

  const catalogWasOpenRef = useRef(catalogOpen);
  const shopDocBeforeCloseRef = useRef<number | null>(null);
  const markCatalogScrolledOff = () => {
    if (!window.matchMedia("(width < 1025px)").matches) return;
    if (window.scrollY <= 8) return;
    const panel = loadPanelRef.current;
    const shop = document.querySelector<HTMLElement>('[class*="afterHero"]');
    if (panel) panel.dataset.scrollAway = "true";
    shopDocBeforeCloseRef.current = shop
      ? shop.getBoundingClientRect().top + window.scrollY
      : null;
  };
  useLayoutEffect(() => {
    const wasOpen = catalogWasOpenRef.current;
    catalogWasOpenRef.current = catalogOpen;
    const panel = loadPanelRef.current;
    const shop = document.querySelector<HTMLElement>('[class*="afterHero"]');
    const away = panel?.dataset.scrollAway === "true";
    if (
      wasOpen &&
      !catalogOpen &&
      away &&
      shop &&
      shopDocBeforeCloseRef.current != null &&
      window.matchMedia("(width < 1025px)").matches
    ) {
      const shopDoc = shop.getBoundingClientRect().top + window.scrollY;
      const removed = shopDocBeforeCloseRef.current - shopDoc;
      if (removed > 1) {
        window.scrollTo(0, Math.max(0, window.scrollY - removed));
      }
    }
    shopDocBeforeCloseRef.current = null;
  }, [catalogOpen]);

  useEffect(() => {
    const dismissMenus = () => {
      setActiveMenu(null);
      setMenuLocked(false);
    };
    window.addEventListener("scroll", dismissMenus, { passive: true });
    return () => window.removeEventListener("scroll", dismissMenus);
  }, []);

  useEffect(() => {
    if (forcePinned) {
      setHeaderPinned(true);
      setPinDir("in");
      wasPinnedRef.current = true;
      return;
    }
    if (!allowPin) {
      setHeaderPinned(false);
      setPinEnter(false);
      setPinDir("out");
      wasPinnedRef.current = false;
      return;
    }
    const onScroll = () => {
      if (
        mobileLoadState &&
        loadExpandedRef.current &&
        window.matchMedia("(width < 1025px)").matches
      ) {
        setHeaderPinned(false);
        wasPinnedRef.current = false;
        return;
      }
      const next = window.scrollY > 40;
      /* Landing wordmark stays a flat bar. The pill morph is what bounces it. */
      const landingFlat =
        landingBar && window.matchMedia("(width < 1025px)").matches;
      if (!landingFlat && next && !wasPinnedRef.current) {
        setPinDir("in");
        setPinEnter(true);
        window.setTimeout(() => setPinEnter(false), 720);
      } else if (!landingFlat && !next && wasPinnedRef.current) {
        setPinDir("out");
      }
      wasPinnedRef.current = next;
      setHeaderPinned(next);
      setActiveMenu(null);
      setMenuLocked(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [allowPin, forcePinned, landingBar, mobileLoadState, narrowMenu]);

  useEffect(() => {
    if (!contrastInk) return;
    const header = headerRef.current;
    if (!header) return;
    const mq = window.matchMedia("(width < 1025px)");

    const sync = () => {
      if (!mq.matches) {
        delete header.dataset.ink;
        return;
      }
      const hero = document.querySelector("[data-browse-hero]");
      const bar = barRef.current;
      if (!(hero instanceof HTMLElement) || !bar) {
        if (header.dataset.ink !== "dark") header.dataset.ink = "dark";
        return;
      }
      const next =
        hero.getBoundingClientRect().bottom > bar.getBoundingClientRect().bottom
          ? "light"
          : "dark";
      if (header.dataset.ink !== next) header.dataset.ink = next;
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      mq.removeEventListener("change", sync);
      delete header.dataset.ink;
    };
  }, [contrastInk]);

  useEffect(() => {
    if (!mobileLoadState) {
      setLoadExpanded(false);
      return;
    }

    const compactMq = window.matchMedia("(width < 1025px)");
    lastScrollYRef.current = window.scrollY;

    const sync = () => {
      if (!compactMq.matches) {
        setLoadExpanded(false);
        return;
      }
      const y = window.scrollY;
      lastScrollYRef.current = y;
      if (y <= 8 || !loadExpandedRef.current) return;
      const panel = loadPanelRef.current;
      const bar = barRef.current;
      if (!panel || !bar) return;
      if (panel.getBoundingClientRect().bottom > bar.getBoundingClientRect().bottom + 0.5) return;
      markCatalogScrolledOff();
      loadDismissedRef.current = true;
      setLoadExpanded(false);
      setHeaderPinned(y > 40);
      wasPinnedRef.current = y > 40;
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    compactMq.addEventListener("change", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      compactMq.removeEventListener("change", sync);
    };
  }, [mobileLoadState]);

  useNavPullOpen(
    barRef,
    loadPanelRef,
    false,
    () => {
      flickClosedRef.current = false;
      loadDismissedRef.current = false;
      pullGuardRef.current = true;
      window.setTimeout(() => {
        pullGuardRef.current = false;
      }, 450);
      if (window.scrollY <= 8) {
        loadPanelRef.current?.removeAttribute("data-scroll-away");
        setLoadExpanded(true);
        return;
      }
      setMobileOpen(true);
    },
  );

  useEffect(() => {
    if (loadExpanded) return;
    const panel = loadPanelRef.current;
    if (!panel) return;
    panel.style.transition = "";
    panel.style.height = "";
    panel.style.overflow = "";
    panel.style.touchAction = "";
  }, [loadExpanded]);

  useEffect(() => {
    if (!activeMenu && !catalogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveMenu(null);
      setMenuLocked(false);
      setMobileOpen(false);
      if (loadExpanded) {
        markCatalogScrolledOff();
        loadDismissedRef.current = true;
        setLoadExpanded(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMenu, catalogOpen, loadExpanded]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (menuBarrageActive()) return;
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    return () => window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    return subscribeMenuBarrage(() => {
      if (menuBarrageActive()) return;
      if (!mobileOpenRef.current && !loadExpandedRef.current) return;
      setMobileOpen(false);
      markCatalogScrolledOff();
      setLoadExpanded(false);
      loadDismissedRef.current = true;
    });
  }, []);

  const beginMenuBarrage = (id: string, href: string) => {
    playMenuBarrage(router, id, href);
  };

  const showGlassNav = Boolean(overlay && glassNav);
  const pinned = forcePinned || headerPinned;
  const autoInk = overlay && !inverse && !showGlassNav && !pinned && !catalogOpen;
  /* Phone and tablet glass sheets. Inverse drops while the catalog is
   * open (auto ink), so keep both classes for that open state. Desktop
   * stays on the paper menus. */
  const glassOpen = Boolean(menuGlass && narrowMenu && menuPainted);
  const overlayInverse = (inverse && !pinned) || fieldInverse || glassOpen;
  const applyMenuGlass = Boolean(menuGlass && (inverse || glassOpen));
  const loadSheet = loadExpanded && !mobileOpen;

  const onMobileToggle = () => {
    setMenuSpin((turn) => turn + 1);
    if (catalogOpen) {
      setMobileOpen(false);
      if (loadExpanded) {
        markCatalogScrolledOff();
        loadDismissedRef.current = true;
        setLoadExpanded(false);
      }
      return;
    }
    if (
      mobileLoadState &&
      window.matchMedia("(width < 1025px)").matches &&
      window.scrollY <= 8
    ) {
      loadDismissedRef.current = false;
      flickClosedRef.current = false;
      loadPanelRef.current?.removeAttribute("data-scroll-away");
      setLoadExpanded(true);
      return;
    }
    setMobileOpen(true);
  };

  useEffect(() => {
    if (!autoInk) {
      setFieldInverse(false);
      return;
    }
    const header = headerRef.current;
    if (!header) return;

    const sync = () => setFieldInverse(headerWashIsDark(header));

    sync();
    const scope = header.parentElement?.parentElement ?? document.body;
    const mo = new MutationObserver(sync);
    mo.observe(scope, {
      attributes: true,
      subtree: true,
      childList: true,
      attributeFilter: ["data-expanded", "data-catalog-field", "data-catalog-tokens"],
    });
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [autoInk]);

  useEffect(() => {
    if (!loadCatalog || !desktopLoadState || pinned) return;
    const header = headerRef.current;
    if (!header) return;
    const sync = () => {
      const media = document.querySelector("[data-split-media]");
      const open = media?.getAttribute("data-expanded") === "true";
      header.dataset.pane = open ? "open" : "closed";
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-expanded"],
    });
    return () => {
      mo.disconnect();
      delete header.dataset.pane;
    };
  }, [loadCatalog, desktopLoadState, pinned]);

  const openHover = (key: DesktopMenuTab) => {
    window.clearTimeout(closeTimerRef.current);
    if (menuLocked && activeMenu === key) return;
    setActiveMenu(key);
    if (menuLocked && activeMenu !== key) setMenuLocked(false);
  };

  const closeHover = () => {
    if (menuLocked) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMenu(null);
    }, 220);
  };

  const toggleLock = (key: DesktopMenuTab) => {
    window.clearTimeout(closeTimerRef.current);
    if (activeMenu === key && menuLocked) {
      setActiveMenu(null);
      setMenuLocked(false);
      return;
    }
    setActiveMenu(key);
    setMenuLocked(true);
  };

  const showCatalogNav = navLinks.length > 0 && (!centered || pinned);
  const catalogNav = showCatalogNav ? (
    <nav className={styles.nav} aria-label="Catalog">
      {navLinks.map((link) => {
        if (link.id === "pain-relief") return null;
        if (pinned && link.id === "bundles") return null;
        const pane: DesktopMenuTab =
          pinned && link.id === "products" ? "products-bundles" : link.id;
        const label =
          pane === "products-bundles"
            ? "Products & Bundles"
            : link.id === "bundles"
              ? "Bundles"
              : link.label;
        return (
          <CatalogDropdown
            key={pane}
            label={label}
            pane={pane}
            isOpen={activeMenu === pane}
            locked={menuLocked && activeMenu === pane}
            onHoverOpen={() => openHover(pane)}
            onHoverClose={closeHover}
            onToggleLock={() => toggleLock(pane)}
            onDismiss={() => {
              queueMicrotask(() => {
                setActiveMenu(null);
                setMenuLocked(false);
              });
            }}
            onCatalogTap={beginMenuBarrage}
          />
        );
      })}
      <CatalogDropdown
        label="Pain Relief"
        pane="pain-relief"
        isOpen={activeMenu === "pain-relief"}
        locked={menuLocked && activeMenu === "pain-relief"}
        onHoverOpen={() => openHover("pain-relief")}
        onHoverClose={closeHover}
        onToggleLock={() => toggleLock("pain-relief")}
        onDismiss={() => {
          queueMicrotask(() => {
            setActiveMenu(null);
            setMenuLocked(false);
          });
        }}
        onCatalogTap={beginMenuBarrage}
      />
      <Link href="/treatments" className={styles.desktopShopAllLink}>
        Shop All
        <ShopAllMark />
      </Link>
    </nav>
  ) : null;

  return (
    <>
    <header
      ref={headerRef}
      className={[
        embedded ? "" : "layout-bleed",
        styles.root,
        embedded ? styles.embedded : "",
        desktopLoadState ? styles.desktopLoadState : "",
        loadCatalog ? styles.pdpLoadHeader : "",
        compact ? styles.compact : "",
        centered ? styles.centered : "",
        overlay || glassOpen ? styles.overlay : "",
        showGlassNav ? styles.glassNav : "",
        (overlay && overlayInverse) || glassOpen ? styles.inverse : "",
        (overlay && overlayInverse && applyMenuGlass) || glassOpen
          ? styles.menuGlass
          : "",
        glassPlate ? styles.glassPlate : "",
        pinned ? styles.pinned : "",
        scrollMenus ? styles.scrollMenus : "",
        pinEnter ? styles.pinEnter : "",
        showCatalogNav ? "" : styles.noCatalog,
        styles.hasMobileMenu,
        askAiAccent === "electric" ? styles.askAiElectric : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-pinned={pinned ? "true" : "false"}
      data-pin-dir={pinDir}
      data-overlay={overlay || glassOpen ? "true" : "false"}
      data-glass-nav={showGlassNav ? "true" : "false"}
      data-catalog-nav={showCatalogNav ? "true" : "false"}
      data-compact={compact ? "true" : "false"}
      data-mobile-open={
        menuPainted ? "true" : narrowMenu ? "false" : undefined
      }
      data-video-under={mobileLoadState ? "true" : undefined}
      data-mobile-load={loadSheet ? "true" : "false"}
      data-desktop-load-state={desktopLoadState ? "true" : "false"}
      data-landing-bar={landingBar ? "true" : undefined}
      data-menu-end={menuEndTab === "pain-relief" ? "pain-relief" : undefined}
      data-tablet-catalog={tabletCatalogOpen ? "open" : undefined}
    >
      <div
        className={styles.menuFrost}
        aria-hidden="true"
        style={{ backdropFilter: "blur(22px) saturate(1.15)" }}
      />
      {showCatalogNav ? <WarmPreviewFields /> : null}
      {announcement && !pinned ? (
        <div className={styles.announcement} role="region" aria-label="Shipping">
          <p className={styles.announcementText}>{announcement}</p>
        </div>
      ) : null}

      <div className={styles.shell}>
        <div className={styles.bar} ref={barRef}>
          {centered ? (
            <div className={styles.brandStart}>
              <button
                type="button"
                className={styles.brandMenu}
                aria-expanded={catalogOpen}
                aria-controls={mobileNavId}
                onClick={onMobileToggle}
              >
                <IconHamburger />
                Menu
              </button>
            </div>
          ) : null}

          <div className={styles.navAuth}>
            <Link href={ACCOUNT_LOGIN_HREF} className={styles.login}>
              Log In
            </Link>
            <span className={styles.authRule} aria-hidden />
            <Link href={ACCOUNT_SIGNUP_HREF} className={styles.signup}>
              Sign Up
            </Link>
          </div>

          {desktopLoadState && !hideAskAi ? (
            <div className={styles.loadStateAsk}>
              <button
                type="button"
                className={styles.askAi}
                aria-label="Ask TIDL AI"
                onClick={() => openModal()}
              >
                <AskAiIcon className={styles.askAiIcon} />
                <span>Ask TIDL AI</span>
              </button>
            </div>
          ) : null}

          <div className={styles.logo}>
            <TidlLogoLockup href="/" compact />
          </div>

          <div className={styles.utils}>
            {hideAskAi ? null : (
              <button
                type="button"
                className={styles.askAi}
                aria-label="Ask TIDL AI"
                onClick={() => openModal()}
              >
                <AskAiIcon className={styles.askAiIcon} />
                <span className={styles.askAiLabel}>
                  <span className={styles.askAiAsk}>Ask </span>TIDL<span className={styles.askAiMark}> AI</span>
                </span>
              </button>
            )}
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={catalogOpen}
              aria-controls={mobileNavId}
              onClick={onMobileToggle}
              data-ds-stub="true"
            >
              <span
                className={styles.menuDots}
                style={
                  menuSpin > 0
                    ? { transform: `rotate(${menuSpin * 360}deg)` }
                    : undefined
                }
                aria-hidden
              >
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="sr-only">Menu</span>
            </button>
          </div>

          {desktopLoadState ? (
            <div className={`${styles.auth} ${styles.loadStateAuth}`}>
              <Link
                href={ACCOUNT_LOGIN_HREF}
                className={`${styles.login} ${styles.loadStateLogin}`}
              >
                Log In
              </Link>
              <span className={styles.authRule} aria-hidden />
              <Link
                href={ACCOUNT_SIGNUP_HREF}
                className={`${styles.signup} ${styles.loadStateSignup}`}
              >
                Sign Up
              </Link>
            </div>
          ) : null}
          {pinned || !desktopLoadState ? catalogNav : null}
        </div>
      </div>

      {pinned || !desktopLoadState ? null : catalogNav}
      {loadCatalog && desktopLoadState && !pinned ? (
        <DesktopLoadHeaderCatalog onCatalogTap={beginMenuBarrage} />
      ) : null}

      {(mobileLoadState || mobileOpen) ? (
        <nav
          id={mobileNavId}
          ref={loadPanelRef}
          data-menu-compress=""
          className={[
            styles.mobilePanel,
            styles.mobilePanelCatalog,
            mobileLoadState ? styles.mobileLoadPanel : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Catalog"
          aria-hidden={!catalogOpen}
          data-ds-stub="true"
          data-open={
            catalogOpen ? "true" : narrowMenu ? "false" : undefined
          }
          onClick={(event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest("a")) {
              window.setTimeout(() => {
                markCatalogScrolledOff();
                setMobileOpen(false);
                setLoadExpanded(false);
                loadDismissedRef.current = window.scrollY <= 8;
              }, 200);
            }
          }}
        >
          <div className={styles.mobileLoadClip}>
            <div className={styles.mobileCatalog}>
              {mobileMenu ?? (
                <OptionEMobileMenu
                  onCatalogTap={beginMenuBarrage}
                  endTab={menuEndTab}
                />
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
    </>
  );
}
