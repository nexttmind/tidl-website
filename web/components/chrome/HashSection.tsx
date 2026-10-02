"use client";

import { useEffect } from "react";

/** App Router does not always honor hash targets on client navigations. */
export function HashSection() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const desktop = document.querySelector<HTMLElement>(
        '[data-catalog="desktop"]',
      );
      const compact = document.querySelector<HTMLElement>(
        '[data-catalog="compact"]',
      );
      const pane =
        desktop && window.getComputedStyle(desktop).display !== "none"
          ? desktop
          : compact && window.getComputedStyle(compact).display !== "none"
            ? compact
            : desktop ?? compact;
      const target =
        pane?.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ??
        document.getElementById(id);
      target?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
