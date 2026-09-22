"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TidlLogoLockup } from "@/components/brand/TidlLogoLockup";
import type { ClinicalEntry } from "@/content/clinical/entry-map";
import styles from "./IntakeSplitShell.module.css";

type Props = {
  entry: ClinicalEntry;
  children: ReactNode;
};

/** Full-viewport clinical shell: floating media + dark intake panel. */
export function IntakeSplitShell({ entry, children }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const indexRef = useRef(0);

  const playlist =
    entry.brandVideos && entry.brandVideos.length > 0
      ? entry.brandVideos
      : entry.brandVideo
        ? [entry.brandVideo]
        : [];
  const hasVideo = playlist.length > 0;
  const poster = entry.brandPoster ?? entry.brandImage;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    indexRef.current = 0;
    video.src = playlist[0];
    video.load();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }

    const playCurrent = () => {
      void video.play().catch(() => {
        /* Autoplay can fail; poster remains visible. */
      });
    };

    const onEnded = () => {
      if (playlist.length <= 1) {
        video.currentTime = 0;
        playCurrent();
        return;
      }
      indexRef.current = (indexRef.current + 1) % playlist.length;
      video.src = playlist[indexRef.current];
      video.load();
      playCurrent();
    };

    video.addEventListener("ended", onEnded);
    playCurrent();

    return () => {
      video.removeEventListener("ended", onEnded);
    };
  }, [hasVideo, playlist.join("|")]);

  return (
    <div className={`layout-bleed ${styles.frame}`}>
      <a className="sr-only" href="#intake-main">
        Skip to intake
      </a>

      <aside className={styles.mediaPane} aria-label="Care path">
        <div className={styles.mediaFrame}>
          {hasVideo ? (
            <video
              ref={videoRef}
              className={styles.media}
              poster={poster}
              muted
              playsInline
              autoPlay
              preload="metadata"
              aria-hidden
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.media}
              src={entry.brandImage}
              alt=""
              width={960}
              height={1400}
            />
          )}
          <div className={styles.mediaScrim} aria-hidden />
          <div className={styles.mediaContent}>
            <TidlLogoLockup href="/" className={styles.logo} compact />
            <h1 className={styles.mediaTitle}>{entry.label}</h1>
            <span className={styles.mediaSpacer} aria-hidden />
          </div>
        </div>
      </aside>

      <section className={styles.panel} id="intake-main">
        <div className={styles.panelBody}>{children}</div>
      </section>
    </div>
  );
}
