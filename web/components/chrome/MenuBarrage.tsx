"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CatalogBarrage } from "@/components/home/CatalogBarrage";
import { hasMenuBarrage } from "@/content/pdp/barrage";
import styles from "./MenuBarrage.module.css";

export function menuTapStartsBarrage(
  id: string,
  event: {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    button: number;
  },
): boolean {
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return false;
  }
  return hasMenuBarrage(id);
}

/** Full screen playback of the landing catalog tile barrage. */
export function MenuBarrage({
  catalogId,
  onDone,
}: {
  catalogId: string;
  onDone: () => void;
}) {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setNode(document.body);
  }, []);

  if (!node) return null;

  return createPortal(
    <div className={styles.screen}>
      <CatalogBarrage catalogId={catalogId} onDone={onDone} cut />
    </div>,
    node,
  );
}
