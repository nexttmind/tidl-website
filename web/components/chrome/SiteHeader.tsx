"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AskAiIcon } from "@/components/ai/AskAiIcon";
import { useAskTidl } from "@/components/ai/AskTidlProvider";
import { TidlLogoLockup } from "@/components/brand/TidlLogoLockup";
import { MarketingImage } from "@/components/media/MarketingImage";
import {
  MEGA_MENU_ITEMS,
  type CatalogLink,
} from "@/content/fixtures/ask-tidl";
import {
  ACCOUNT_LOGIN_HREF,
  ACCOUNT_SIGNUP_HREF,
} from "@/content/clinical/entry-map";
import { CATALOG_HREF } from "@/content/fixtures/catalog";
import { PEPTIDE_GUIDE_HREF, peptideGuideCopy } from "@/content/fixtures/peptide-guide";
import styles from "./SiteHeader.module.css";

type CatalogKey = "treatments" | "programs";

type HeaderLink = {
  label: string;
  href: string;
  icon: CatalogKey;
  items: readonly CatalogLink[];
  /** Glass note card trigger (desktop overlay nav). */
  glass: {
    title: string;
    titleAccent: string;
    mediaSrc: string;
  };
};

type SiteHeaderProps = {
  announcement?: string;
  navLinks?: readonly HeaderLink[];
  /**
   * Transparent over page media until the pin morph engages.
   * Without glassNav, chrome keeps dark ink (PDPs with white buy column).
   */
  overlay?: boolean;
  /**
   * Landing-only notecard catalog triggers (“Start with a health goal” etc.).
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
   * Floating pill morph after scroll. Off for hims-style sticky top chrome.
   */
  pinOnScroll?: boolean;
  /**
   * Force the pinned (floating pill) visual. Used for the landing post-scroll header.
   */
  forcePinned?: boolean;
  /**
   * In-flow header inside the landing white sheet. Not sticky.
   */
  embedded?: boolean;
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
   * Landing passes the overlay grid so phones open on the video.
   */
  mobileMenu?: ReactNode;
  /**
   * Categories page: orbiting mark reads electric blue on the white bar.
   */
  askAiAccent?: "electric";
};

/** Top-level catalog nav. One Treatments menu holds every stack. */
export const PERSONA_NAV: readonly HeaderLink[] = [
  {
    label: "Treatments",
    href: CATALOG_HREF,
    icon: "programs",
    items: MEGA_MENU_ITEMS,
    glass: {
      title: "Match care to",
      titleAccent: "how you live",
      mediaSrc: "/landing/category/note-executive.png",
    },
  },
];

const CATALOG_ICONS = {
  treatments: {
    dark: "/brand/icons/icon-health-goals-dark.png",
    dark2x: "/brand/icons/icon-health-goals-dark@2x.png",
    white: "/brand/icons/icon-health-goals-white.png",
    white2x: "/brand/icons/icon-health-goals-white@2x.png",
  },
  programs: {
    dark: "/brand/icons/icon-treatments-dark.png",
    dark2x: "/brand/icons/icon-treatments-dark@2x.png",
    white: "/brand/icons/icon-treatments-white.png",
    white2x: "/brand/icons/icon-treatments-white@2x.png",
  },
} as const;

function CatalogIcon({ name }: { name: CatalogKey }) {
  const icon = CATALOG_ICONS[name];
  return (
    <span className={styles.navIcon} aria-hidden>
      <img
        className={styles.navIconOnLight}
        src={icon.dark}
        srcSet={`${icon.dark} 1x, ${icon.dark2x} 2x`}
        alt=""
        width={18}
        height={17}
      />
      <img
        className={styles.navIconOnDark}
        src={icon.white}
        srcSet={`${icon.white} 1x, ${icon.white2x} 2x`}
        alt=""
        width={18}
        height={17}
      />
    </span>
  );
}

function CatalogGoalGrid({
  items,
  onNavigate,
  hot = true,
}: {
  items: readonly CatalogLink[];
  onNavigate?: () => void;
  /** Closed desktop dropdown stays in the DOM. Do not fetch thumbs until open. */
  hot?: boolean;
}) {
  return (
    <ul className={styles.goalGrid}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={styles.goalLink}
            role="menuitem"
            onClick={onNavigate}
          >
            <span
              className={styles.goalThumb}
              data-vial={
                item.imageSrc?.includes("/vials/") ||
                item.imageSrc?.includes("/pain-relief/")
                  ? "true"
                  : undefined
              }
              data-pill={
                item.imageSrc?.includes("/brand/pills/") ? "true" : undefined
              }
              data-pack={
                item.imageSrc &&
                !item.imageSrc.includes("/vials/") &&
                !item.imageSrc.includes("/brand/pills/") &&
                !item.imageSrc.includes("/pain-relief/")
                  ? "true"
                  : undefined
              }
            >
              {hot && item.imageSrc ? (
                <MarketingImage
                  src={item.imageSrc}
                  alt=""
                  sizes="72px"
                />
              ) : null}
            </span>
            <span className={styles.goalCopy}>
              <span className={styles.goalLabel}>{item.label}</span>
              <span className={styles.goalSubtitle}>
                {item.navSubtitle ?? item.blurb}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={[styles.chevron, open ? styles.chevronOpen : ""].filter(Boolean).join(" ")}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function CatalogDropdown({
  link,
  isOpen,
  locked,
  onHoverOpen,
  onHoverClose,
  onToggleLock,
  onDismiss,
}: {
  link: HeaderLink;
  isOpen: boolean;
  locked: boolean;
  onHoverOpen: () => void;
  onHoverClose: () => void;
  onToggleLock: () => void;
  onDismiss: () => void;
}) {
  const panelId = useId();
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !locked) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!itemRef.current?.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, locked, onDismiss]);

  return (
    <div
      ref={itemRef}
      className={[styles.catalogItem, isOpen ? styles.catalogItemOpen : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={onHoverOpen}
      onMouseLeave={onHoverClose}
    >
      <button
        type="button"
        className={styles.glassTrigger}
        aria-label={link.label}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={panelId}
        data-locked={locked ? "true" : "false"}
        onClick={onToggleLock}
      >
        <span className={styles.glassCopy}>
          <span className={styles.glassTitle}>
            {link.glass.title} <em>{link.glass.titleAccent}</em>
          </span>
        </span>
        <span
          className={styles.glassMedia}
          aria-hidden
          data-pill={link.glass.mediaSrc.startsWith("/brand/pills/") ? "true" : undefined}
        >
          <MarketingImage
            src={link.glass.mediaSrc}
            alt=""
            sizes="(width < 721px) 40vw, 180px"
          />
        </span>
      </button>

      <button
        type="button"
        className={styles.navLink}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={panelId}
        data-locked={locked ? "true" : "false"}
        onClick={onToggleLock}
      >
        <CatalogIcon name={link.icon} />
        {link.label}
        <IconChevron open={isOpen} />
      </button>

      <div
        id={panelId}
        className={[styles.dropdown, styles.dropdownMega].filter(Boolean).join(" ")}
        role="menu"
        aria-label={link.label}
        hidden={!isOpen}
      >
        <div className={styles.dropdownCard}>
          <p className={styles.dropdownEyebrow}>{link.label}</p>
          <CatalogGoalGrid items={link.items} hot={isOpen} />
          <div className={styles.dropdownFoot}>
            <Link href={PEPTIDE_GUIDE_HREF} className={styles.dropdownFooter}>
              {peptideGuideCopy.title}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pattern/Header — Superpower-style morph + catalog dropdowns.
 * Hover opens. Click locks open until scroll.
 */
export function SiteHeader({
  announcement,
  navLinks = PERSONA_NAV,
  overlay = false,
  glassNav = false,
  inverse = false,
  pinOnScroll = true,
  forcePinned = false,
  embedded = false,
  compact = false,
  layout = "default",
  mobileMenu,
  askAiAccent,
}: SiteHeaderProps) {
  const { openModal } = useAskTidl();
  const mobileNavId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerPinned, setHeaderPinned] = useState(forcePinned);
  const [pinEnter, setPinEnter] = useState(false);
  const [pinDir, setPinDir] = useState<"in" | "out">(forcePinned ? "in" : "out");
  const [activeMenu, setActiveMenu] = useState<CatalogKey | null>(null);
  const [menuLocked, setMenuLocked] = useState(false);
  const wasPinnedRef = useRef(forcePinned);
  const centered = layout === "centered";
  const allowPin = pinOnScroll;

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
      const next = window.scrollY > 40;
      if (next && !wasPinnedRef.current) {
        setPinDir("in");
        setPinEnter(true);
        window.setTimeout(() => setPinEnter(false), 720);
      } else if (!next && wasPinnedRef.current) {
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
  }, [allowPin, forcePinned]);

  useEffect(() => {
    if (!activeMenu && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveMenu(null);
      setMenuLocked(false);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMenu, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const openHover = (key: CatalogKey) => {
    if (menuLocked && activeMenu === key) return;
    setActiveMenu(key);
    if (menuLocked && activeMenu !== key) setMenuLocked(false);
  };

  const closeHover = () => {
    if (menuLocked) return;
    setActiveMenu(null);
  };

  const toggleLock = (key: CatalogKey) => {
    if (activeMenu === key && menuLocked) {
      setActiveMenu(null);
      setMenuLocked(false);
      return;
    }
    setActiveMenu(key);
    setMenuLocked(true);
  };

  const showGlassNav = Boolean(overlay && glassNav);
  const pinned = forcePinned || headerPinned;
  const showCatalogNav = navLinks.length > 0 && (!centered || pinned);

  return (
    <header
      className={[
        embedded ? "" : "layout-bleed",
        styles.root,
        embedded ? styles.embedded : "",
        compact ? styles.compact : "",
        centered ? styles.centered : "",
        overlay ? styles.overlay : "",
        showGlassNav ? styles.glassNav : "",
        overlay && inverse ? styles.inverse : "",
        pinned ? styles.pinned : "",
        pinEnter ? styles.pinEnter : "",
        showCatalogNav ? "" : styles.noCatalog,
        mobileMenu || navLinks.some((link) => link.items.length)
          ? styles.hasMobileMenu
          : "",
        askAiAccent === "electric" ? styles.askAiElectric : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-pinned={pinned ? "true" : "false"}
      data-pin-dir={pinDir}
      data-overlay={overlay ? "true" : "false"}
      data-glass-nav={showGlassNav ? "true" : "false"}
      data-catalog-nav={showCatalogNav ? "true" : "false"}
      data-compact={compact ? "true" : "false"}
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      {announcement && !pinned ? (
        <div className={styles.announcement} role="region" aria-label="Shipping">
          <p className={styles.announcementText}>{announcement}</p>
        </div>
      ) : null}

      <div className={styles.shell}>
        <div className={styles.bar}>
          {centered ? (
            <div className={styles.brandStart}>
              <button
                type="button"
                className={styles.brandMenu}
                aria-expanded={mobileOpen}
                aria-controls={mobileNavId}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <IconHamburger />
                Menu
              </button>
            </div>
          ) : null}

          <div className={styles.logo}>
            <TidlLogoLockup href="/" compact />
          </div>

          {showCatalogNav ? (
            <nav className={styles.nav} aria-label="Catalog">
              {navLinks.map((link) => (
                <CatalogDropdown
                  key={link.label}
                  link={link}
                  isOpen={activeMenu === link.icon}
                  locked={menuLocked && activeMenu === link.icon}
                  onHoverOpen={() => openHover(link.icon)}
                  onHoverClose={closeHover}
                  onToggleLock={() => toggleLock(link.icon)}
                  onDismiss={() => {
                    setActiveMenu(null);
                    setMenuLocked(false);
                  }}
                />
              ))}
            </nav>
          ) : null}

          <div className={styles.utils}>
            <button
              type="button"
              className={styles.askAi}
              aria-label="Ask TIDL AI"
              onClick={() => openModal()}
            >
              <AskAiIcon className={styles.askAiIcon} />
              <span className={styles.askAiLabel}>
                Ask TIDL<span className={styles.askAiMark}> AI</span>
              </span>
            </button>
            <div className={styles.auth}>
              <Link href={ACCOUNT_LOGIN_HREF} className={styles.login}>
                Log In
              </Link>
              <span className={styles.authRule} aria-hidden />
              <Link href={ACCOUNT_SIGNUP_HREF} className={styles.signup}>
                Sign Up
              </Link>
            </div>
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={mobileOpen}
              aria-controls={mobileNavId}
              onClick={() => setMobileOpen((v) => !v)}
              data-ds-stub="true"
            >
              <span className={styles.menuDots} aria-hidden>
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
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id={mobileNavId}
          className={[styles.mobilePanel, styles.mobilePanelCatalog]
            .filter(Boolean)
            .join(" ")}
          aria-label={mobileMenu ? "Catalog" : "Treatments"}
          data-ds-stub="true"
          onClick={(event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest("a")) setMobileOpen(false);
          }}
        >
          {mobileMenu ? (
            <div className={styles.mobileCatalog}>{mobileMenu}</div>
          ) : (
            navLinks.map((link) => (
              <div key={link.label} className={styles.mobileCatalog}>
                <p className={styles.dropdownEyebrow}>{link.label}</p>
                <CatalogGoalGrid
                  items={link.items}
                  onNavigate={() => setMobileOpen(false)}
                />
                <div className={styles.dropdownFoot}>
                  <Link
                    href={PEPTIDE_GUIDE_HREF}
                    className={styles.dropdownFooter}
                    onClick={() => setMobileOpen(false)}
                  >
                    {peptideGuideCopy.title}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            ))
          )}
          <button
            type="button"
            className={`${styles.mobileLink} ${styles.mobileAskAi}`}
            onClick={() => {
              setMobileOpen(false);
              openModal();
            }}
          >
            Ask TIDL AI
          </button>
          <div className={styles.mobileAuth}>
            <Link
              href={ACCOUNT_LOGIN_HREF}
              className={`${styles.mobileLink} ${styles.mobileAuthLogin}`}
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </Link>
            <Link
              href={ACCOUNT_SIGNUP_HREF}
              className={`${styles.mobileLink} ${styles.mobileAuthSignup}`}
              onClick={() => setMobileOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
