import { MarketingImage } from "@/components/media/MarketingImage";
import { optVideoSrc } from "@/lib/media/opt-manifest";
import styles from "./MediaSlot.module.css";

type MediaSlotProps = {
  id: string;
  aspect?: string;
  label?: string;
  className?: string;
  tone?: "light" | "dark";
  /** Solid wireframe color when no src is provided. */
  swatch?: string;
  /** Short note shown under the slot id when wireframing. */
  note?: string;
  /** Stretch to fill a flex/grid parent instead of locking aspect. */
  fill?: boolean;
  /** Cover image path under /public. */
  src?: string;
  /** Optional looping video (muted, autoplay). Prefers over src for the main plane. */
  videoSrc?: string;
  /** Poster for video media. */
  poster?: string;
  /** Cover for film. Contain for product cutouts on a plate. */
  fit?: "cover" | "contain";
  /** Boost saturation for lifestyle/nature photography. Defaults true with image/video. */
  vivid?: boolean;
  /** Open shadows on underexposed stills. */
  lift?: boolean;
  /** Skip grain and wash. Use for product cutouts. */
  plain?: boolean;
};

/** Media surface for PDP and marketing. Image/video when src provided; else wireframe plate. */
export function MediaSlot({
  id,
  aspect = "16 / 9",
  label,
  className,
  tone = "light",
  swatch,
  note,
  fill = false,
  src,
  videoSrc,
  poster,
  fit = "cover",
  vivid,
  lift = false,
  plain = false,
}: MediaSlotProps) {
  const useFill = fill || aspect === "auto";
  const hasMedia = Boolean(src || videoSrc);
  const boost = vivid ?? (hasMedia && fit === "cover");
  const mobileVideo = videoSrc ? optVideoSrc(videoSrc) : undefined;

  return (
    <div
      className={[
        styles.root,
        tone === "dark" ? styles.dark : "",
        swatch && !hasMedia ? styles.swatch : "",
        useFill ? styles.fill : "",
        hasMedia ? styles.hasMedia : "",
        boost ? styles.vivid : "",
        lift ? styles.lift : "",
        fit === "contain" ? styles.contain : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(useFill ? null : { aspectRatio: aspect }),
        ...(swatch && !hasMedia ? { backgroundColor: swatch } : null),
      }}
      role={hasMedia ? undefined : "img"}
      aria-label={label ?? id}
      data-slot={id}
    >
      {videoSrc ? (
        <video
          className={styles.media}
          poster={poster ?? src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label ?? id}
        >
          {mobileVideo ? (
            <source src={mobileVideo} media="(width < 1025px)" />
          ) : null}
          <source src={videoSrc} />
        </video>
      ) : src ? (
        <MarketingImage
          className={styles.media}
          src={src}
          alt={label ?? ""}
          sizes="(width < 721px) 100vw, (width < 1025px) 80vw, 900px"
        />
      ) : (
        <span className={styles.label}>
          {note ?? id}
          <span className={styles.aspect}>
            {useFill ? "fill" : aspect.replace(/\s/g, "")}
          </span>
          {swatch ? <span className={styles.hex}>{swatch}</span> : null}
        </span>
      )}
      {hasMedia && !plain ? <span className={styles.grain} aria-hidden /> : null}
      {hasMedia && !plain ? <span className={styles.wash} aria-hidden /> : null}
    </div>
  );
}
