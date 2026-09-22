"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import { connectionPrefersLite } from "@/lib/media/connection";
import { optVideoSrc } from "@/lib/media/opt-manifest";
import styles from "./LandingHero.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

export type HeroSlide = {
  id: string;
  /** Short label for the left chapter rail. */
  railLabel: string;
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  mediaSrc: string;
  /** Optional 390-framed file. Falls back to mediaSrc. */
  mediaSrcMobile?: string;
  posterSrc?: string;
  /** CSS object-position. Portrait clips often need a head-biased crop. */
  mediaPosition?: string;
  /** Phone crop. Used when width is under 721. */
  mediaPositionPhone?: string;
  themeId?: ThemeId;
};

type LandingHeroProps = {
  id?: string;
  slides: readonly HeroSlide[];
  loopsBeforeAdvance?: number;
  startMode?: "random" | "fixed";
  /** Compact glass catalog overlaid on the video. */
  catalog?: ReactNode;
  /** Fires on mount and whenever the active chapter changes. */
  onSlideChange?: (index: number) => void;
  /**
   * Skip the catalog-sheet tuck. Use when this hero is first paint,
   * not sitting under LandingTop.
   */
  flush?: boolean;
  ariaLabel?: string;
};

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M11.25 4.5 6.75 9l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M6.75 4.5 11.25 9l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" fill="currentColor" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 3.4v9.2L13 8 5 3.4z" fill="currentColor" />
    </svg>
  );
}

function pickStartIndex(count: number, mode: "random" | "fixed") {
  if (count <= 1 || mode === "fixed") return 0;
  return Math.floor(Math.random() * count);
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Finite duration only. Infinity / NaN show up on some short hero encodes. */
function readMediaDuration(video: HTMLVideoElement) {
  const duration = video.duration;
  if (Number.isFinite(duration) && duration > 0) return duration;
  try {
    if (video.seekable.length > 0) {
      const end = video.seekable.end(video.seekable.length - 1);
      if (Number.isFinite(end) && end > 0) return end;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

/** Resolve --hero-travel to px. Custom properties are not computed to px. */
function readHeroTravelPx(root: HTMLElement) {
  const raw = getComputedStyle(root).getPropertyValue("--hero-travel").trim();
  if (raw.endsWith("vh")) {
    return (parseFloat(raw) / 100) * window.innerHeight;
  }
  const px = parseFloat(raw);
  return Number.isFinite(px) && px > 0 ? px : window.innerHeight * 0.55;
}

/** Full-bleed hero that scrubs into a Programs-matched notecard on scroll. */
export function LandingHero({
  id,
  slides,
  loopsBeforeAdvance = 1,
  startMode = "fixed",
  catalog,
  onSlideChange,
  flush = false,
  ariaLabel = "Hero",
}: LandingHeroProps) {
  const scrollRootRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const userPausedRef = useRef(false);
  const visibleRef = useRef(false);
  const loopCountRef = useRef(0);
  const indexRef = useRef(0);
  const progressRef = useRef(0);
  const startIndex = useMemo(
    () => pickStartIndex(slides.length, startMode),
    // Start index is fixed for the lifetime of this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaT, setMediaT] = useState(0);
  const [isPhone, setIsPhone] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const scrubbingRef = useRef(false);
  const resumeAfterScrubRef = useRef(false);
  const swipeRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    armed: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const slideCount = slides.length;
  const multi = slides.length > 1;
  const [railPos, setRailPos] = useState(() =>
    multi ? slideCount + startIndex : startIndex,
  );
  const [railInstant, setRailInstant] = useState(false);
  /** Track position with end clones so wrap animates one step, then settles. */
  const [displayPos, setDisplayPos] = useState(() =>
    multi ? startIndex + 1 : 0,
  );
  const [trackInstant, setTrackInstant] = useState(false);
  const prevIndexRef = useRef(index);
  const prevTrackMediaRef = useRef<string | null>(null);
  const loopedSlides = useMemo(
    () => (slideCount > 1 ? [...slides, ...slides, ...slides] : [...slides]),
    [slides, slideCount],
  );
  const trackItems = useMemo(() => {
    if (!multi || slideCount < 2) {
      return slides.map((slide, realIndex) => ({
        slide,
        realIndex,
        key: slide.id,
      }));
    }
    return [
      {
        slide: slides[slideCount - 1],
        realIndex: slideCount - 1,
        key: `${slides[slideCount - 1].id}-clone-start`,
      },
      ...slides.map((slide, realIndex) => ({
        slide,
        realIndex,
        key: slide.id,
      })),
      {
        slide: slides[0],
        realIndex: 0,
        key: `${slides[0].id}-clone-end`,
      },
    ];
  }, [multi, slideCount, slides]);

  indexRef.current = index;
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    onSlideChange?.(index);
  }, [index, onSlideChange]);
  const condensed = progress >= 0.98;

  useEffect(() => {
    if (!multi || slideCount < 2) return;
    const prev = prevIndexRef.current;
    if (prev === index) return;

    if (prev === slideCount - 1 && index === 0) {
      setRailPos(slideCount * 2);
      setDisplayPos(slideCount + 1);
    } else if (prev === 0 && index === slideCount - 1) {
      setRailPos(slideCount - 1);
      setDisplayPos(0);
    } else {
      setRailPos(slideCount + index);
      setDisplayPos(index + 1);
    }
    prevIndexRef.current = index;
  }, [index, multi, slideCount]);

  const settleRailLoop = () => {
    if (!multi || slideCount < 2) return;
    if (railPos >= slideCount * 2) {
      setRailInstant(true);
      setRailPos(slideCount + (railPos % slideCount));
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setRailInstant(false));
      });
      return;
    }
    if (railPos < slideCount) {
      setRailInstant(true);
      setRailPos(slideCount + railPos);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setRailInstant(false));
      });
    }
  };

  const settleTrackLoop = () => {
    if (!multi || slideCount < 2) return;
    if (displayPos === slideCount + 1) {
      const from = videoRefs.current[displayPos];
      const to = videoRefs.current[1];
      setTrackInstant(true);
      setDisplayPos(1);
      if (from && to) {
        try {
          to.currentTime = from.currentTime;
        } catch {
          /* ignore */
        }
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTrackInstant(false));
      });
      return;
    }
    if (displayPos === 0) {
      const from = videoRefs.current[0];
      const to = videoRefs.current[slideCount];
      setTrackInstant(true);
      setDisplayPos(slideCount);
      if (from && to) {
        try {
          to.currentTime = from.currentTime;
        } catch {
          /* ignore */
        }
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTrackInstant(false));
      });
    }
  };

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phoneMq = window.matchMedia("(width < 721px)");
    const compactMq = window.matchMedia("(width < 1025px)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    const syncPhone = () => setIsPhone(phoneMq.matches);
    const syncCompact = () => setIsCompact(compactMq.matches);
    syncMotion();
    syncPhone();
    syncCompact();
    const syncVideo = () => {
      setAllowVideo(!motionMq.matches && !connectionPrefersLite());
    };
    syncVideo();
    motionMq.addEventListener("change", syncMotion);
    motionMq.addEventListener("change", syncVideo);
    phoneMq.addEventListener("change", syncPhone);
    compactMq.addEventListener("change", syncCompact);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      motionMq.removeEventListener("change", syncVideo);
      phoneMq.removeEventListener("change", syncPhone);
      compactMq.removeEventListener("change", syncCompact);
    };
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const bleedW = document.documentElement.clientWidth;
      root.style.setProperty("--bleed-w", `${bleedW}px`);
      const rect = root.getBoundingClientRect();
      // Fixed travel so p does not feed back through the shrinking pin height.
      const travel = Math.max(readHeroTravelPx(root), 1);
      const next = clamp01(-rect.top / travel);
      progressRef.current = next;
      setProgress(next);
      root.style.setProperty("--hero-p", next.toFixed(4));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attachRaf = 0;
    let progressRaf = 0;
    let observer: IntersectionObserver | null = null;
    let active: HTMLVideoElement | null = null;
    let unlockLoop: (() => void) | null = null;
    let observed = false;
    let clipDone = false;

    const activeMedia = trackItems[displayPos]?.slide.mediaSrc ?? null;
    const sameMedia = prevTrackMediaRef.current === activeMedia;
    prevTrackMediaRef.current = activeMedia;

    videoRefs.current.forEach((video, i) => {
      if (!video || i === displayPos) return;
      video.pause();
      if (!sameMedia) {
        try {
          video.currentTime = 0;
        } catch {
          /* ignore seek before ready */
        }
      }
    });

    if (!sameMedia) {
      loopCountRef.current = 0;
      userPausedRef.current = false;
      setMediaT(0);
    }

    const readProgress = (video: HTMLVideoElement) => {
      const duration = readMediaDuration(video);
      return duration > 0 ? clamp01(video.currentTime / duration) : 0;
    };

    const stopProgress = () => {
      if (progressRaf) {
        window.cancelAnimationFrame(progressRaf);
        progressRaf = 0;
      }
    };

    const finishClip = (video: HTMLVideoElement) => {
      if (clipDone || cancelled) return;
      if (indexRef.current !== index) return;
      const duration = readMediaDuration(video);
      if (duration > 0 && video.currentTime < Math.min(0.45, duration * 0.2)) {
        return;
      }
      clipDone = true;
      stopProgress();
      loopCountRef.current += 1;
      if (multi && loopCountRef.current >= loopsBeforeAdvance) {
        loopCountRef.current = 0;
        setMediaT(0);
        setIndex((current) => (current + 1) % slides.length);
        return;
      }
      setMediaT(0);
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      if (unlockLoop) video.removeEventListener("timeupdate", unlockLoop);
      unlockLoop = () => {
        if (video.currentTime < 0.2) {
          clipDone = false;
          if (unlockLoop) video.removeEventListener("timeupdate", unlockLoop);
          unlockLoop = null;
        }
      };
      video.addEventListener("timeupdate", unlockLoop);
      if (!userPausedRef.current && !reduceMotion) {
        void video.play().catch(() => setPlaying(false));
      }
    };

    const pumpProgress = (video: HTMLVideoElement) => {
      stopProgress();
      const tick = () => {
        if (cancelled) return;
        if (scrubbingRef.current) {
          progressRaf = window.requestAnimationFrame(tick);
          return;
        }
        const duration = readMediaDuration(video);
        setMediaT(readProgress(video));
        if (
          duration > 0 &&
          !video.paused &&
          video.currentTime >= Math.max(duration - 0.08, duration * 0.97)
        ) {
          finishClip(video);
          return;
        }
        progressRaf = window.requestAnimationFrame(tick);
      };
      tick();
    };

    const syncPlayback = () => {
      if (!active) return;
      if (reduceMotion || userPausedRef.current) {
        active.pause();
        setPlaying(false);
        return;
      }
      if (observed && !visibleRef.current) {
        active.pause();
        setPlaying(false);
        return;
      }
      void active
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };

    const onPlay = () => {
      setPlaying(true);
      if (active) pumpProgress(active);
    };
    const onPause = () => {
      stopProgress();
      if (scrubbingRef.current) return;
      setPlaying(false);
      if (active) setMediaT(readProgress(active));
    };
    const onReady = () => {
      if (active) setMediaT(readProgress(active));
      syncPlayback();
    };
    const onEnded = () => {
      if (active) finishClip(active);
    };

    const attach = () => {
      if (cancelled) return;
      const next = videoRefs.current[displayPos];
      if (!next) {
        attachRaf = window.requestAnimationFrame(attach);
        return;
      }
      active = next;

      if (!sameMedia) {
        try {
          active.currentTime = 0;
        } catch {
          /* ignore */
        }
      }

      active.addEventListener("play", onPlay);
      active.addEventListener("playing", onPlay);
      active.addEventListener("pause", onPause);
      active.addEventListener("ended", onEnded);
      active.addEventListener("canplay", onReady);
      active.addEventListener("loadeddata", onReady);
      active.addEventListener("loadedmetadata", onReady);
      active.addEventListener("durationchange", onReady);

      observer = new IntersectionObserver(
        ([entry]) => {
          observed = true;
          visibleRef.current =
            entry.isIntersecting && entry.intersectionRatio >= 0.25;
          syncPlayback();
        },
        { threshold: [0, 0.25, 0.5, 1] },
      );
      observer.observe(active);
      setMediaT(readProgress(active));
      if (!active.paused) pumpProgress(active);
      syncPlayback();
    };

    attach();

    return () => {
      cancelled = true;
      stopProgress();
      if (attachRaf) window.cancelAnimationFrame(attachRaf);
      observer?.disconnect();
      if (!active) return;
      if (unlockLoop) active.removeEventListener("timeupdate", unlockLoop);
      active.removeEventListener("play", onPlay);
      active.removeEventListener("playing", onPlay);
      active.removeEventListener("pause", onPause);
      active.removeEventListener("ended", onEnded);
      active.removeEventListener("canplay", onReady);
      active.removeEventListener("loadeddata", onReady);
      active.removeEventListener("loadedmetadata", onReady);
      active.removeEventListener("durationchange", onReady);
    };
  }, [
    displayPos,
    index,
    loopsBeforeAdvance,
    multi,
    reduceMotion,
    slides.length,
    trackItems,
  ]);

  const goTo = (next: number) => {
    if (!slides.length) return;
    const wrapped = (next + slides.length) % slides.length;
    if (wrapped === indexRef.current) return;
    loopCountRef.current = 0;
    userPausedRef.current = false;
    setIndex(wrapped);
  };

  const togglePlayback = () => {
    const video = videoRefs.current[displayPos];
    if (!video || reduceMotion) return;

    if (video.paused) {
      userPausedRef.current = false;
      setPlaying(true);
      void video.play().catch(() => setPlaying(false));
      return;
    }

    userPausedRef.current = true;
    setPlaying(false);
    video.pause();
  };

  const seekToFraction = (fraction: number) => {
    const video = videoRefs.current[displayPos];
    if (!video) return;
    const duration = readMediaDuration(video);
    const next = clamp01(fraction);
    setMediaT(next);
    if (duration <= 0) return;
    try {
      video.currentTime = next * duration;
    } catch {
      /* ignore seek before ready */
    }
  };

  const fractionFromClientX = (el: HTMLElement, clientX: number) => {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return clamp01((clientX - rect.left) / rect.width);
  };

  const onScrubPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.stopPropagation();
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore if the pointer is already released */
    }
    const video = videoRefs.current[displayPos];
    resumeAfterScrubRef.current = Boolean(
      video && !video.paused && !userPausedRef.current && !reduceMotion,
    );
    scrubbingRef.current = true;
    if (video && !video.paused) video.pause();
    seekToFraction(fractionFromClientX(el, e.clientX));
  };

  const onScrubPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current) return;
    seekToFraction(fractionFromClientX(e.currentTarget, e.clientX));
  };

  const endScrub = (e: PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current) return;
    seekToFraction(fractionFromClientX(e.currentTarget, e.clientX));
    scrubbingRef.current = false;
    const video = videoRefs.current[displayPos];
    if (
      video &&
      resumeAfterScrubRef.current &&
      !userPausedRef.current &&
      !reduceMotion
    ) {
      void video.play().catch(() => setPlaying(false));
    }
    resumeAfterScrubRef.current = false;
  };

  const onScrubKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRefs.current[displayPos];
    if (!video) return;
    const duration = readMediaDuration(video);
    if (duration <= 0) return;
    const current = clamp01(video.currentTime / duration);
    const step = 0.05;
    let next = current;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      next = clamp01(current - step);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      next = clamp01(current + step);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = 1;
    } else {
      return;
    }
    e.preventDefault();
    seekToFraction(next);
  };

  const swipeIgnoresTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return true;
    if (target.closest(`.${styles.controls}`)) return true;
    if (target.closest(`.${styles.rail}`)) return true;
    if (target.closest(`.${styles.catalogSlot}`)) return true;
    if (target.closest(`.${styles.mediaHit}`)) return false;
    if (target.closest("a, button")) return true;
    return false;
  };

  const onViewportPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isCompact || !multi) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (swipeIgnoresTarget(e.target)) return;
    swipeRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      armed: true,
    };
  };

  const onViewportPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start || start.pointerId !== e.pointerId || !start.armed) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx)) {
      start.armed = false;
    }
  };

  const onViewportPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.pointerId !== e.pointerId || !start.armed) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 350);
    if (dx < 0) goTo(indexRef.current + 1);
    else goTo(indexRef.current - 1);
  };

  const onViewportPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    swipeRef.current = null;
  };

  const onViewportClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClickRef.current = false;
  };

  if (!slide) return null;

  const field = heroTheme(slide.themeId ?? slide.id);
  const cardStyle = {
    "--hero-p": progress.toFixed(4),
    ...(field
      ? {
          "--theme-wash": field.atmosphere.wash,
          "--theme-depth": field.atmosphere.depth,
          "--theme-heel": field.night.heel,
          "--theme-primary": field.night.primary,
          "--theme-atmosphere": field.atmosphere.css,
          "--theme-streak": field.streak.css,
          "--theme-night": field.night.css,
        }
      : {}),
  } as CSSProperties;

  return (
    <section
      id={id}
      ref={scrollRootRef}
      className={[
        styles.scrollRoot,
        flush ? styles.flush : "",
        reduceMotion ? styles.reduceMotion : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      aria-roledescription={multi ? "carousel" : undefined}
      data-condensed={condensed ? "true" : "false"}
      data-theme={field?.id}
    >
      <div className={styles.sticky}>
        <div className={[styles.card, mountFade.mount].join(" ")} style={cardStyle}>
          <div
            className={styles.viewport}
            onPointerDown={onViewportPointerDown}
            onPointerMove={onViewportPointerMove}
            onPointerUp={onViewportPointerUp}
            onPointerCancel={onViewportPointerCancel}
            onClickCapture={onViewportClickCapture}
          >
            <div
              className={styles.track}
              data-instant={trackInstant ? "true" : "false"}
              style={{ transform: `translate3d(-${displayPos * 100}%, 0, 0)` }}
              onTransitionEnd={(e) => {
                if (e.propertyName !== "transform") return;
                if (e.target !== e.currentTarget) return;
                settleTrackLoop();
              }}
            >
              {trackItems.map((item, i) => {
                const neighborWindow = isCompact ? 0 : 1;
                const mountVideo =
                  allowVideo && Math.abs(i - displayPos) <= neighborWindow;
                const derivedMobile = optVideoSrc(item.slide.mediaSrc);
                const mediaSrc =
                  isCompact && (item.slide.mediaSrcMobile || derivedMobile)
                    ? (item.slide.mediaSrcMobile ?? derivedMobile ?? item.slide.mediaSrc)
                    : item.slide.mediaSrc;
                const mediaPosition = isPhone
                  ? (item.slide.mediaPositionPhone ?? "center 28%")
                  : item.slide.mediaPosition;
                const poster = item.slide.posterSrc;
                return (
                <div
                  key={item.key}
                  className={styles.slide}
                  aria-hidden={item.realIndex !== index || i !== displayPos}
                >
                  {mountVideo ? (
                    <video
                      key={`${item.key}-${mediaSrc}`}
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      className={styles.media}
                      src={mediaSrc}
                      poster={poster}
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden
                      style={
                        mediaPosition
                          ? { objectPosition: mediaPosition }
                          : undefined
                      }
                    />
                  ) : poster ? (
                    <MarketingImage
                      className={styles.media}
                      src={poster}
                      alt=""
                      sizes="100vw"
                      loading={i === displayPos ? "eager" : "lazy"}
                      fetchPriority={i === displayPos ? "high" : "auto"}
                      style={
                        mediaPosition
                          ? { objectPosition: mediaPosition }
                          : undefined
                      }
                    />
                  ) : null}
                </div>
                );
              })}
            </div>

            <div className={styles.scrim} aria-hidden />

            <button
              type="button"
              className={styles.mediaHit}
              tabIndex={-1}
              aria-hidden
              disabled={reduceMotion}
              onClick={togglePlayback}
            />

            <div className={styles.stage}>
              {multi ? (
                <nav
                  className={styles.rail}
                  aria-label="Hero chapters"
                  data-condensed={condensed ? "true" : "false"}
                  data-instant={railInstant ? "true" : "false"}
                  style={
                    {
                      "--rail-index": railPos,
                    } as CSSProperties
                  }
                >
                  <div className={styles.railViewport}>
                    <div
                      className={styles.railTrack}
                      onTransitionEnd={(e) => {
                        if (e.propertyName !== "transform") return;
                        settleRailLoop();
                      }}
                    >
                      {loopedSlides.map((item, i) => {
                        const realIndex = i % slideCount;
                        const offset = i - railPos;
                        const distance = Math.abs(offset);
                        const active = offset === 0;
                        return (
                          <button
                            key={`${item.id}-${i}`}
                            type="button"
                            className={styles.railItem}
                            data-active={active ? "true" : "false"}
                            data-distance={Math.min(distance, 4)}
                            aria-current={active ? "true" : undefined}
                            aria-label={`Show ${item.railLabel}`}
                            style={{ "--rail-arc": offset } as CSSProperties}
                            onClick={() => {
                              if (realIndex === index && i === railPos) return;
                              loopCountRef.current = 0;
                              userPausedRef.current = false;
                              prevIndexRef.current = realIndex;
                              setRailPos(i);
                              setDisplayPos(realIndex + 1);
                              setIndex(realIndex);
                            }}
                          >
                            <span className={styles.railMarkTrack} aria-hidden>
                              <span className={styles.railDot} />
                            </span>
                            <span className={styles.railCard}>
                              <span className={styles.railLabel}>{item.railLabel}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </nav>
              ) : null}

              <div className={styles.copy}>
                <div key={slide.id} className={styles.copyInner}>
                  <div className={styles.copyText}>
                    <h1 className={styles.headline}>{slide.headline}</h1>
                  </div>
                  <div className={styles.ctaWrap} data-slide={slide.id}>
                    <Button
                      href={slide.cta.href}
                      styleVariant="Ghost"
                      className={styles.cta}
                    >
                      {slide.cta.label}
                    </Button>
                    {slide.secondaryCta ? (
                      <span className={styles.ctaSecondarySlot}>
                        <Button
                          href={slide.secondaryCta.href}
                          styleVariant="Ghost"
                          className={styles.ctaSecondary}
                        >
                          {slide.secondaryCta.label}
                        </Button>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {catalog ? (
                <div
                  className={styles.catalogSlot}
                  data-condensed={condensed ? "true" : "false"}
                  aria-hidden={condensed ? true : undefined}
                >
                  {catalog}
                </div>
              ) : null}

              {multi ? (
                <div
                  className={styles.controls}
                  role="group"
                  aria-label="Hero media controls"
                >
                  <button
                    type="button"
                    className={[styles.control, styles.playPause].join(" ")}
                    aria-label={playing ? "Pause video" : "Play video"}
                    disabled={reduceMotion}
                    onClick={togglePlayback}
                  >
                    {playing ? <IconPause /> : <IconPlay />}
                  </button>
                  <button
                    type="button"
                    className={styles.control}
                    aria-label="Previous slide"
                    onClick={() => goTo(index - 1)}
                  >
                    <IconChevronLeft />
                  </button>
                  <div
                    className={styles.progressPill}
                    role="slider"
                    tabIndex={0}
                    aria-label="Video progress"
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(clamp01(mediaT) * 100)}
                    onPointerDown={onScrubPointerDown}
                    onPointerMove={onScrubPointerMove}
                    onPointerUp={endScrub}
                    onPointerCancel={endScrub}
                    onKeyDown={onScrubKeyDown}
                  >
                    <span
                      className={styles.progressFill}
                      style={{ transform: `scaleX(${clamp01(mediaT)})` }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.control}
                    aria-label="Next slide"
                    onClick={() => goTo(index + 1)}
                  >
                    <IconChevronRight />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
