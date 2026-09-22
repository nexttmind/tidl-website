import Link from "next/link";
import type { CSSProperties } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import { symptomsCta } from "@/content/clinical/entry-map";
import {
  catalogCopy,
  catalogItemById,
  catalogNotecardCopy,
} from "@/content/fixtures/catalog";
import type { ThemeId } from "@/content/brand/peptide-identity";
import styles from "./CategoryPairing.module.css";

export type PairingPose = {
  id: ThemeId;
  vialSrc: string;
  baseX: number;
  width: number;
  height: number;
};

export type CategoryPairingData = {
  title: string;
  fieldSrc: string;
  cta: { label: string; href?: string };
  left: PairingPose;
  right: PairingPose;
  leftBody?: string;
  rightBody?: string;
};

function catalogPairing(): CategoryPairingData | null {
  const { title, left, right, cta } = catalogCopy.pairing;
  const leftItem = catalogItemById(left.id);
  if (!leftItem) return null;
  return {
    title,
    fieldSrc: leftItem.fieldSrc,
    cta,
    left,
    right,
  };
}

function PairingVial({
  id,
  vialSrc,
  baseX,
  width,
  height,
  role,
}: PairingPose & { role: "lead" | "pair" }) {
  const item = catalogItemById(id);
  if (!item) return null;

  return (
    <Link
      href={item.href}
      className={styles.product}
      data-role={role}
      aria-label={`Shop ${item.pill}`}
      style={
        {
          "--base-x": baseX,
        } as CSSProperties
      }
    >
      <span className={styles.vialFrame}>
        <span className={styles.pool} aria-hidden />
        <span className={styles.ground} aria-hidden />
        <span className={styles.contact} aria-hidden />
        <MarketingImage
          className={styles.vial}
          src={vialSrc}
          alt=""
          width={width}
          height={height}
          sizes="(width < 721px) 55vw, 280px"
        />
      </span>
    </Link>
  );
}

export function CategoryPairing({ pairing }: { pairing?: CategoryPairingData }) {
  const data = pairing ?? catalogPairing();
  if (!data) return null;

  const leftItem = catalogItemById(data.left.id);
  const rightItem = catalogItemById(data.right.id);
  if (!leftItem || !rightItem) return null;

  const ctaHref = data.cta.href ?? symptomsCta().href;
  const leftBody = data.leftBody ?? catalogNotecardCopy(leftItem.id).body;
  const rightBody = data.rightBody ?? catalogNotecardCopy(rightItem.id).body;

  return (
    <section
      className={styles.root}
      aria-labelledby="pairing-title"
    >
      <div className={styles.field} aria-hidden>
        <MarketingImage
          className={styles.fieldPhoto}
          src={data.fieldSrc}
          alt=""
          sizes="100vw"
        />
      </div>
      <div className={styles.glass}>
        <div className={styles.scrim} aria-hidden />
        <div className={styles.inner}>
          <div className={styles.stage}>
            <span className={styles.floor} aria-hidden />
            <span className={styles.kiss} aria-hidden />
            <PairingVial {...data.right} role="pair" />
            <PairingVial {...data.left} role="lead" />
          </div>

          <div className={styles.copy}>
            <h2 id="pairing-title" className={styles.title}>
              {data.title}
            </h2>
            <ul className={styles.blurbs}>
              <li>
                <span className={styles.blurbLabel}>{leftItem.pill}</span>
                <p>{leftBody}</p>
              </li>
              <li>
                <span className={styles.blurbLabel}>{rightItem.pill}</span>
                <p>{rightBody}</p>
              </li>
            </ul>
            <Button href={ctaHref} className={styles.cta}>
              {data.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
