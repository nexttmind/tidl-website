"use client";

import { useState } from "react";
import Link from "next/link";
import { TidlLogoLockup } from "@/components/brand/TidlLogoLockup";
import { ACCOUNT_LOGIN_HREF } from "@/content/clinical/entry-map";
import { CATALOG_HREF } from "@/content/fixtures/catalog";
import styles from "./NavGlobal.module.css";

type NavLink = { label: string; href: string };

type NavGlobalProps = {
  announcement?: string;
  leftLinks?: readonly NavLink[];
  rightLinks?: readonly NavLink[];
  valueProps?: readonly string[];
};

const DEFAULT_LEFT: NavLink[] = [
  { label: "Treatments", href: CATALOG_HREF },
];

const DEFAULT_RIGHT: NavLink[] = [
  { label: "Log In", href: ACCOUNT_LOGIN_HREF },
];

const DEFAULT_VALUE = [
  "Physician guided",
  "Made in the USA",
  "Pre-dosed pens",
  "$0 for consultations",
];

/** Pattern/Nav Global — announcement + nav + value bar (mid-page placement) */
export function NavGlobal({
  announcement = "Free shipping on orders over $100",
  leftLinks = DEFAULT_LEFT,
  rightLinks = DEFAULT_RIGHT,
  valueProps = DEFAULT_VALUE,
}: NavGlobalProps) {
  const [open, setOpen] = useState(false);
  const mobileLinks = [...leftLinks, ...rightLinks];

  return (
    <section className={styles.root} aria-label="Nav Global">
      <div className={styles.announcement} role="region" aria-label="Shipping">
        <p className={styles.announcementText}>{announcement}</p>
      </div>

      <div className={styles.bar}>
        <nav className={styles.left} aria-label="Nav Global left">
          {leftLinks.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.logo}>
          <TidlLogoLockup />
        </div>

        <nav className={styles.right} aria-label="Nav Global right">
          {rightLinks.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* DS-STUB: gap-nav-drawer */}
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="nav-global-mobile"
          onClick={() => setOpen((v) => !v)}
          data-ds-stub="true"
        >
          Menu
        </button>
      </div>

      {open ? (
        <nav
          id="nav-global-mobile"
          className={styles.mobilePanel}
          aria-label="Nav Global mobile"
          data-ds-stub="true"
        >
          {mobileLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className={styles.valueBar} aria-label="Value propositions">
        {valueProps.map((item) => (
          <p key={item} className={styles.valueItem}>
            <span className={styles.valueMark} aria-hidden>
              ✦
            </span>
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
