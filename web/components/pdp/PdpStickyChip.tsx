"use client";

import { useEffect, useState } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./PdpStickyChip.module.css";

type PdpStickyChipProps = {
  name: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref: string;
};

export function PdpStickyChip({
  name,
  imageSrc,
  ctaLabel,
  ctaHref,
}: PdpStickyChipProps) {
  const [pastBuy, setPastBuy] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  const visible = pastBuy && !overFooter;

  useEffect(() => {
    const buy = document.getElementById("buy");
    const footer = document.querySelector("footer");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id === "buy") {
            setPastBuy(!entry.isIntersecting);
          } else {
            setOverFooter(entry.isIntersecting);
          }
        }
      },
      { threshold: 0 },
    );

    if (buy) io.observe(buy);
    else setPastBuy(true);
    if (footer) io.observe(footer);

    return () => io.disconnect();
  }, []);

  return (
    <a
      className={styles.root}
      href={ctaHref}
      data-visible={visible ? "true" : "false"}
      aria-label={`${name}. ${ctaLabel}`}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      {...(!visible ? { inert: true } : {})}
    >
      <span className={styles.thumb}>
        <MarketingImage src={imageSrc} alt="" width={56} height={56} sizes="56px" />
      </span>
      <span className={styles.name}>{name}</span>
      <span className={styles.cta}>{ctaLabel}</span>
    </a>
  );
}
