"use client";

import { useEffect, useRef, useState } from "react";
import { SoldOutTitle } from "@/components/category/SoldOutTitle";
import { MarketingImage } from "@/components/media/MarketingImage";
import { usePdpForm } from "./PdpFormContext";
import styles from "./PdpStickyChip.module.css";

type PdpStickyChipProps = {
  name: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref: string;
  soldOut?: boolean;
};

export function PdpStickyChip({
  name,
  imageSrc,
  ctaLabel,
  ctaHref,
  soldOut = false,
}: PdpStickyChipProps) {
  const [pastBuy, setPastBuy] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  const [yieldHit, setYieldHit] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const setRoot = (node: HTMLElement | null) => {
    rootRef.current = node;
  };
  const visible = pastBuy && !overFooter;
  const formHero = usePdpForm()?.heroSrc;
  const thumbSrc = formHero ?? imageSrc;

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

    const narrow = () =>
      window.matchMedia("(width < 721px)").matches ||
      window.matchMedia("(721px <= width < 1025px)").matches;

    const measure = () => {
      const chip = rootRef.current;
      const calc = document.querySelector("[aria-labelledby='bmi-title']");
      if (!chip || !calc || !narrow()) {
        setYieldHit(false);
        return;
      }
      const a = chip.getBoundingClientRect();
      const b = calc.getBoundingClientRect();
      setYieldHit(
        a.width > 0 &&
          a.height > 0 &&
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top,
      );
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const chip = (
    <>
      <span className={styles.thumb}>
        <MarketingImage src={thumbSrc} alt="" width={56} height={56} sizes="56px" />
      </span>
      <span className={styles.name}>
        {soldOut ? <SoldOutTitle>{name}</SoldOutTitle> : name}
      </span>
      <span className={styles.cta}>{ctaLabel}</span>
    </>
  );

  const quiet = !visible || yieldHit;

  if (soldOut && !ctaHref.startsWith("http")) {
    return (
      <div
        ref={setRoot}
        className={styles.root}
        data-visible={visible ? "true" : "false"}
        data-yield={yieldHit ? "true" : "false"}
        aria-label={`${name}. ${ctaLabel}`}
        aria-hidden={quiet}
        style={{ pointerEvents: "none" }}
        {...(quiet ? { inert: true } : {})}
      >
        {chip}
      </div>
    );
  }

  return (
    <a
      ref={setRoot}
      className={styles.root}
      href={ctaHref}
      data-visible={visible ? "true" : "false"}
      data-yield={yieldHit ? "true" : "false"}
      aria-label={`${name}. ${ctaLabel}`}
      aria-hidden={quiet}
      tabIndex={visible && !yieldHit ? undefined : -1}
      {...(quiet ? { inert: true } : {})}
    >
      {chip}
    </a>
  );
}
