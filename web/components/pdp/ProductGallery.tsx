"use client";

import { useState } from "react";
import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./ProductGallery.module.css";

export type GalleryPlate = {
  id: string;
  label: string;
  swatch?: string;
  note?: string;
  src?: string;
  videoSrc?: string;
  poster?: string;
  /** Optional dedicated thumbnail. Falls back to poster, then src. */
  thumbSrc?: string;
  /** Main-stage fit. Cover for film, contain for product cutouts. */
  fit?: "cover" | "contain";
  vivid?: boolean;
};

type ProofThumb = {
  quote: string;
  stars: number;
};

type ProductGalleryProps = {
  /** Preferred: color plates or real media for sticky PDP. */
  plates?: readonly GalleryPlate[];
  /** Legacy slot ids when plates are not provided. */
  mainSlot?: string;
  thumbSlots?: readonly string[];
  proof?: ProofThumb;
  label: string;
  /** Fill the sticky column with plate above thumbs. */
  stickyFill?: boolean;
};

export function ProductGallery({
  plates,
  mainSlot,
  thumbSlots,
  proof,
  label,
  stickyFill = false,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const slots: readonly GalleryPlate[] =
    plates ??
    (thumbSlots ?? (mainSlot ? [mainSlot] : [])).map((id) => ({
      id,
      label,
    }));
  const current = slots[active] ?? slots[0];

  if (!current) return null;

  return (
    <div
      className={[styles.root, stickyFill ? styles.stickyFill : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={styles.mainStage}
        style={
          current.swatch && (current.fit === "contain" || (!current.src && !current.videoSrc))
            ? { backgroundColor: current.swatch }
            : undefined
        }
      >
        <MediaSlot
          id={current.id}
          aspect={stickyFill ? "auto" : "1 / 1"}
          fill={stickyFill}
          label={current.label}
          swatch={current.swatch}
          note={current.note}
          src={current.src}
          videoSrc={current.videoSrc}
          poster={current.poster}
          fit={current.fit}
          vivid={current.vivid}
          className={styles.main}
        />
      </div>
      <div className={styles.thumbs} role="list">
        {slots.map((slot, index) => {
          const isProof = proof && index === slots.length - 1;
          const thumbSrc = slot.thumbSrc ?? slot.poster ?? slot.src;
          const productThumb = slot.fit === "contain" && !isProof;
          return (
            <button
              key={slot.id}
              type="button"
              role="listitem"
              className={[
                styles.thumb,
                index === active ? styles.thumbActive : "",
                isProof ? styles.thumbProof : "",
                thumbSrc && !isProof ? styles.thumbMedia : "",
                productThumb ? styles.thumbProduct : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={isProof ? "Patient quote" : slot.label}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              style={
                isProof
                  ? undefined
                  : thumbSrc
                    ? {
                        backgroundImage: `url(${thumbSrc})`,
                        borderColor: "transparent",
                        ...(slot.swatch && productThumb
                          ? { backgroundColor: slot.swatch }
                          : null),
                      }
                    : slot.swatch
                      ? {
                          backgroundColor: slot.swatch,
                          borderColor: "transparent",
                        }
                      : undefined
              }
            >
              {isProof && proof ? (
                <span className={styles.proof}>
                  <span className={styles.stars} aria-hidden>
                    {"★".repeat(proof.stars)}
                  </span>
                  <span className={styles.proofQuote}>{proof.quote}</span>
                </span>
              ) : thumbSrc && !productThumb ? (
                <span className={styles.thumbScrim} aria-hidden />
              ) : thumbSrc ? null : (
                <span
                  className={styles.thumbLabel}
                  style={
                    slot.swatch ? { color: "rgba(255,255,255,0.85)" } : undefined
                  }
                >
                  {slot.note ?? slot.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
