"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { SECTION_TABS, type SectionId, useTreatmentSection } from "./TreatmentSections";
import styles from "./TreatmentSectionNav.module.css";

function visibleHeader(): HTMLElement | null {
  for (const node of document.querySelectorAll("header")) {
    if (!(node instanceof HTMLElement)) continue;
    const box = node.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) return node;
  }
  return null;
}

function stickOffset(): number {
  const header = visibleHeader();
  if (!header) return 0;
  const stickyTop = Number.parseFloat(getComputedStyle(header).top) || 0;
  const top = header.getBoundingClientRect().top;
  if (header.dataset.pinned === "true") {
    const bar = [...header.querySelectorAll("div")].find((node) =>
      [...node.classList].some((name) => name.split("__").pop() === "bar"),
    );
    if (bar) return stickyTop + Math.max(0, bar.getBoundingClientRect().bottom - top);
  }
  return stickyTop + header.getBoundingClientRect().height;
}

function parkUnderTabs(nav: HTMLElement) {
  const track = document.querySelector("[data-guide-track]");
  if (!(track instanceof HTMLElement)) return;
  const stick = stickOffset();
  const trackDoc = track.getBoundingClientRect().top + window.scrollY;
  const target = Math.max(0, trackDoc - nav.offsetHeight - stick);
  if (window.scrollY > target + 1) {
    window.scrollTo({ top: target, behavior: "auto" });
  }
}

export function TreatmentSectionNav() {
  const { id, compact, select } = useTreatmentSection();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const sync = () => {
      if (!compact) {
        nav.style.removeProperty("--tab-stick");
        return;
      }
      nav.style.setProperty("--tab-stick", `${stickOffset()}px`);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      nav.style.removeProperty("--tab-stick");
    };
  }, [compact]);

  useEffect(() => {
    if (!compact) return;
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      const tab = SECTION_TABS.find((item) => item.id === hash);
      if (tab) select(tab.id);
      else if (!hash) select(SECTION_TABS[0].id);
      else return;
      const nav = navRef.current;
      if (nav) parkUnderTabs(nav);
    };
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [compact, select]);

  function onSelect(event: MouseEvent<HTMLAnchorElement>, next: SectionId) {
    if (!compact) return;
    event.preventDefault();
    select(next);
    const hash = `#${next}`;
    if (window.location.hash !== hash) history.pushState(null, "", hash);
    const nav = navRef.current;
    if (nav) parkUnderTabs(nav);
  }

  return (
    <nav
      ref={navRef}
      className={`sr-only ${styles.nav}`}
      data-section-nav=""
      aria-label="Treatment sections"
    >
      <ul className={styles.list}>
        {SECTION_TABS.map((tab) => (
          <li key={tab.id} className={styles.item}>
            <a
              className={id === tab.id ? `${styles.link} ${styles.current}` : styles.link}
              href={`#${tab.id}`}
              aria-current={id === tab.id ? "true" : undefined}
              onClick={(event) => onSelect(event, tab.id)}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
