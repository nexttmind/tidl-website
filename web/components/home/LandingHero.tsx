"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { MarketingImage } from "@/components/media/MarketingImage";
import { menuTapStartsBarrage } from "@/components/chrome/MenuBarrage";
import { playMenuBarrage } from "@/components/chrome/menu-barrage-session";
import { Button } from "@/components/ui/Button";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import { peptideGuideChips } from "@/content/fixtures/peptide-guide";
import { shopCatalogItem } from "./shop-catalog";
import { connectionPrefersLite } from "@/lib/media/connection";
import { optImgSrc, optVideoSrc } from "@/lib/media/opt-manifest";
import styles from "./LandingHero.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

type HeroMediaBand = "pending" | "compact" | "desktop";

function subscribeHeroBand(onChange: () => void) {
  const mq = window.matchMedia("(width < 1025px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readHeroBand(): HeroMediaBand {
  return window.matchMedia("(width < 1025px)").matches ? "compact" : "desktop";
}

/** SSR and the first paint ship one poster. Desktop mounts neighbors after idle. */
function useHeroMediaBand(): HeroMediaBand {
  return useSyncExternalStore(subscribeHeroBand, readHeroBand, () => "pending");
}

export type HeroSlide = {
  id: string;
  /** Treatment name for the left chapter rail. */
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
  /** Keep the clip playing while any of these elements are on screen, even if the hero is below the fold. */
  playWhileVisibleId?: string | readonly string[];
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

const PHONE_HEADLINE: Record<string, string> = {
  focus: "Stay sharp",
  "body-composition": "Get lean and strong",
  "mens-peak-performance": "Keep your edge",
  longevity: "Live longer and better",
  "rest-rebuild": "Show up ready",
  "energy-lift": "Clear and calm",
  "repair-mobility": "Recover quickly",
  "womens-total-balance": "Rediscover balance",
};

function viewCtaLabel(id: string, name: string) {
  const kind = shopCatalogItem(id)?.kind;
  if (kind === "treatment") return `View ${name} Treatments`;
  if (kind === "bundle") return `View ${name} Bundle`;
  return `View ${name}`;
}

const inkCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;

function sampleVideoInk(video: HTMLVideoElement, el: HTMLElement): string | null {
  if (!inkCanvas || !video.videoWidth || !video.videoHeight) return null;
  const view = video.getBoundingClientRect();
  const target = el.getBoundingClientRect();
  if (view.width < 1 || target.width < 1) return null;
  const pos = getComputedStyle(video).objectPosition.split(/\s+/);
  const axis = (token: string | undefined, fallback: number) => {
    if (!token || token === "center") return 0.5;
    if (token === "left" || token === "top") return 0;
    if (token === "right" || token === "bottom") return 1;
    if (token.endsWith("%")) return Number.parseFloat(token) / 100;
    return fallback;
  };
  const px = axis(pos[0], 0.5);
  const py = axis(pos[1], 0.5);
  const scale = Math.max(view.width / video.videoWidth, view.height / video.videoHeight);
  const offsetX = (video.videoWidth * scale - view.width) * px;
  const offsetY = (video.videoHeight * scale - view.height) * py;
  const x = target.left + target.width / 2 - view.left;
  const y = target.top + target.height / 2 - view.top;
  const sx = (x + offsetX) / scale;
  const sy = (y + offsetY) / scale;
  const ctx = inkCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  inkCanvas.width = 8;
  inkCanvas.height = 8;
  try {
    ctx.drawImage(video, sx - 16, sy - 16, 32, 32, 0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let g = 0;
    let b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const avg = [r / n, g / n, b / n];
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const luminance = 0.2126 * lin(avg[0]) + 0.7152 * lin(avg[1]) + 0.0722 * lin(avg[2]);
    const cap = 0.14;
    const factor = luminance > cap ? Math.sqrt(cap / luminance) : 1;
    const q = (channel: number) => Math.round((channel * factor) / 8) * 8;
    return `rgb(${q(avg[0])} ${q(avg[1])} ${q(avg[2])})`;
  } catch {
    return null;
  }
}

function HeroGoodFor({ id }: { id: string }) {
  const chips = peptideGuideChips(id);
  if (chips.length === 0) return null;
  return (
    <ul className={styles.goodFor} aria-label="Good for">
      {chips.map((chip) => (
        <li key={chip}>{chip}</li>
      ))}
    </ul>
  );
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
  playWhileVisibleId,
  ariaLabel = "Hero",
}: LandingHeroProps) {
  const router = useRouter();
  const scrollRootRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const userPausedRef = useRef(false);
  const visibleRef = useRef(false);
  const loopCountRef = useRef(0);
  const indexRef = useRef(0);
  const progressRef = useRef(0);
  const mediaFillRef = useRef<HTMLSpanElement>(null);
  const mediaPillRef = useRef<HTMLDivElement>(null);
  const startIndex = useMemo(
    () => pickStartIndex(slides.length, startMode),
    // Start index is fixed for the lifetime of this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const mediaBand = useHeroMediaBand();
  const [armNeighbors, setArmNeighbors] = useState(false);
  const scrubbingRef = useRef(false);
  const resumeAfterScrubRef = useRef(false);
  const swipeRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    armed: boolean;
  } | null>(null);
  const viewPillRef = useRef<HTMLAnchorElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [viewInk, setViewInk] = useState("rgb(26 34 42)");
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

  const paintMediaT = (value: number) => {
    const next = clamp01(value);
    const fill = mediaFillRef.current;
    if (fill) {
      fill.style.width = `${next * 100}%`;
      fill.style.transform = "none";
    }
    const pill = mediaPillRef.current;
    if (!pill) return;
    const now = String(Math.round(next * 100));
    if (pill.getAttribute("aria-valuenow") !== now) {
      pill.setAttribute("aria-valuenow", now);
    }
  };
  const paintMediaTRef = useRef(paintMediaT);
  paintMediaTRef.current = paintMediaT;

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
    if (mediaBand !== "desktop") return;
    const arm = () => setArmNeighbors(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(arm, { timeout: 1600 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(arm, 1600);
    return () => window.clearTimeout(timer);
  }, [mediaBand]);

  useEffect(() => {
    if (mediaBand !== "compact" || !allowVideo || slides.length < 2) return;
    const next = slides[(index + 1) % slides.length];
    const src = next ? optVideoSrc(next.mediaSrc, 1080) : undefined;
    if (!src) return;
    let video: HTMLVideoElement | null = null;
    const timer = window.setTimeout(() => {
      video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      video.load();
    }, 800);
    return () => {
      window.clearTimeout(timer);
      if (!video) return;
      video.removeAttribute("src");
      video.load();
    };
  }, [allowVideo, index, mediaBand, slides]);

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
      setCondensed(next >= 0.98);
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
    let beaconObserver: IntersectionObserver | null = null;
    let active: HTMLVideoElement | null = null;
    let unlockLoop: (() => void) | null = null;
    let observed = false;
    let clipDone = false;

    const activeMedia = trackItems[displayPos]?.slide.mediaSrc ?? null;
    const sameMedia = prevTrackMediaRef.current === activeMedia;
    prevTrackMediaRef.current = activeMedia;

    // Index updates before the track position. Wait for the next slide
    // instead of finishing the clip that just ended a second time.
    if (trackItems[displayPos]?.realIndex !== index) return;

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
      paintMediaTRef.current(0);
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
        paintMediaTRef.current(0);
        setIndex((current) => (current + 1) % slides.length);
        return;
      }
      paintMediaTRef.current(0);
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
        const duration = video.duration;
        paintMediaTRef.current(readProgress(video));
        // Seekable end grows while a clip buffers. Using it as duration
        // advances the hero before the file has played.
        if (
          Number.isFinite(duration) &&
          duration > 0 &&
          !video.paused &&
          video.currentTime >= Math.max(0, duration - 0.08)
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
      if (active) paintMediaTRef.current(readProgress(active));
    };
    const onReady = () => {
      if (active) paintMediaTRef.current(readProgress(active));
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

      let videoVisible = false;
      let beaconVisible = false;
      const applyVisibility = () => {
        observed = true;
        visibleRef.current = videoVisible || beaconVisible;
        syncPlayback();
      };

      observer = new IntersectionObserver(
        ([entry]) => {
          videoVisible =
            entry.isIntersecting && entry.intersectionRatio >= 0.25;
          applyVisibility();
        },
        { threshold: [0, 0.25, 0.5, 1] },
      );
      observer.observe(active);

      const beaconIds = !playWhileVisibleId
        ? []
        : typeof playWhileVisibleId === "string"
          ? [playWhileVisibleId]
          : [...playWhileVisibleId];
      const beacons = beaconIds
        .map((beaconId) => document.getElementById(beaconId))
        .filter((el): el is HTMLElement => Boolean(el));
      const visibleBeacons = new Set<Element>();
      for (const beacon of beacons) {
        const rect = beacon.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          visibleBeacons.add(beacon);
        }
      }
      beaconVisible = visibleBeacons.size > 0;
      beaconObserver = beacons.length
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) visibleBeacons.add(entry.target);
                else visibleBeacons.delete(entry.target);
              }
              beaconVisible = visibleBeacons.size > 0;
              applyVisibility();
            },
            { threshold: 0 },
          )
        : null;
      if (beaconObserver) {
        for (const beacon of beacons) beaconObserver.observe(beacon);
      }

      paintMediaTRef.current(readProgress(active));
      if (!active.paused) pumpProgress(active);
      syncPlayback();
    };

    attach();

    return () => {
      cancelled = true;
      stopProgress();
      if (attachRaf) window.cancelAnimationFrame(attachRaf);
      observer?.disconnect();
      beaconObserver?.disconnect();
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
    playWhileVisibleId,
    slides.length,
    trackItems,
    index,
  ]);

  useLayoutEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const compact = window.matchMedia("(width < 1025px)");
    let follow = 0;

    const visibleTileBottom = (panel: Element) => {
      let bottom = -Infinity;
      for (const tile of panel.querySelectorAll<HTMLElement>('[class*="bloomCard"]')) {
        const box = tile.getBoundingClientRect();
        if (box.width < 1 || box.height < 1) continue;
        let visibleBottom = box.bottom;
        let visibleTop = box.top;
        let node = tile.parentElement;
        while (node && node !== document.body) {
          const overflow = getComputedStyle(node).overflowY;
          if (overflow === "hidden" || overflow === "clip") {
            const clip = node.getBoundingClientRect();
            visibleBottom = Math.min(visibleBottom, clip.bottom);
            visibleTop = Math.max(visibleTop, clip.top);
          }
          node = node.parentElement;
        }
        if (visibleBottom - visibleTop < 40) continue;
        if (visibleBottom > bottom) bottom = visibleBottom;
      }
      return bottom;
    };

    const sync = () => {
      if (!compact.matches) {
        copy.style.removeProperty("--hero-copy-center");
        return;
      }
      const copyBox = copy.getBoundingClientRect();
      const video = copy.closest("section")?.querySelector("video");
      const videoTop = video?.getBoundingClientRect().top ?? copyBox.top;
      const cta = copy.querySelector("a");
      if (!cta) return;
      const ctaTop = cta.getBoundingClientRect().top;
      const tileFloor = videoTop - window.innerHeight;
      let tileEdge = -Infinity;
      const panels = document.querySelectorAll(
        '[class*="mobileLoadPanel"], [class*="desktopLoadMega"]',
      );
      for (const panel of panels) {
        if (panel instanceof HTMLElement && panel.dataset.collapsed === "true") continue;
        const tileBottom = visibleTileBottom(panel);
        if (tileBottom > tileFloor && tileBottom < ctaTop) {
          tileEdge = Math.max(tileEdge, tileBottom);
        }
      }
      const menuOpen = tileEdge > -Infinity;
      const topEdge = menuOpen ? tileEdge : videoTop;
      const ratio = menuOpen ? 0.4 : 0.5;
      const center = topEdge + (ctaTop - topEdge) * ratio - copyBox.top;
      const next = `${Math.round(center)}px`;
      if (copy.style.getPropertyValue("--hero-copy-center") !== next) {
        copy.style.setProperty("--hero-copy-center", next);
      }
    };

    const followFor = () => {
      window.cancelAnimationFrame(follow);
      const start = performance.now();
      const step = (now: number) => {
        sync();
        if (now - start < 700) follow = window.requestAnimationFrame(step);
      };
      follow = window.requestAnimationFrame(step);
    };

    const mo = new MutationObserver(followFor);
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-mobile-open", "data-open", "data-collapsed"],
    });
    const watch = new ResizeObserver(sync);
    watch.observe(copy);
    watch.observe(document.body);

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", followFor, { passive: true });
    compact.addEventListener("change", sync);
    return () => {
      window.cancelAnimationFrame(follow);
      mo.disconnect();
      watch.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", followFor);
      compact.removeEventListener("change", sync);
      copy.style.removeProperty("--hero-copy-center");
    };
  }, []);

  const goTo = (next: number) => {
    if (!slides.length) return;
    const wrapped = (next + slides.length) % slides.length;
    if (wrapped === indexRef.current) return;
    loopCountRef.current = 0;
    userPausedRef.current = false;
    setIndex(wrapped);
  };

  useEffect(() => {
    if (!isCompact) return;
    let timer = 0;
    const tick = () => {
      const video = videoRefs.current[displayPos];
      const pill = viewPillRef.current;
      if (!video || !pill) return;
      const next = sampleVideoInk(video, pill);
      if (next) setViewInk((prev) => (prev === next ? prev : next));
    };
    tick();
    timer = window.setInterval(tick, 280);
    return () => window.clearInterval(timer);
  }, [displayPos, isCompact, index]);

  const onMediaHitClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!slide || suppressClickRef.current) return;
    if (!isCompact) {
      togglePlayback();
      return;
    }
    if (!menuTapStartsBarrage(slide.id, event)) {
      router.push(slide.cta.href);
      return;
    }
    playMenuBarrage(router, slide.id, slide.cta.href);
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
    paintMediaT(next);
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
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore if the pointer is already released */
    }
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
                const delta = i - displayPos;
                const mountMedia =
                  mediaBand === "compact" ||
                  delta === 0 ||
                  (mediaBand === "desktop" && armNeighbors && delta === 1);
                const mountVideo = allowVideo && mountMedia;
                const mediaSrc =
                  optVideoSrc(item.slide.mediaSrc, 1080) ??
                  (isCompact ? item.slide.mediaSrcMobile : undefined);
                const mediaPosition = isPhone
                  ? (item.slide.mediaPositionPhone ?? "center 28%")
                  : item.slide.mediaPosition;
                const poster = item.slide.posterSrc
                  ? optImgSrc(item.slide.posterSrc, 1600)
                  : undefined;
                const posterSrc = item.slide.posterSrc;
                return (
                <div
                  key={item.key}
                  className={styles.slide}
                  aria-hidden={item.realIndex !== index || i !== displayPos}
                >
                  {mountMedia && mountVideo && mediaSrc ? (
                    <video
                      key={`${item.key}-${mediaSrc}`}
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      className={styles.media}
                      data-landing-hero-video={i === displayPos ? "true" : undefined}
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
                  ) : mountMedia && posterSrc ? (
                    <MarketingImage
                      className={styles.media}
                      src={posterSrc}
                      alt=""
                      sizes="100vw"
                      loading={i === displayPos ? "eager" : "lazy"}
                      fetchPriority={i === displayPos ? "high" : "low"}
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
              disabled={reduceMotion && !isCompact}
              onClick={onMediaHitClick}
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

              <div className={styles.copy} ref={copyRef}>
                <div key={slide.id} className={styles.copyInner}>
                  <div className={styles.copyGroup}>
                    {isCompact ? <span className={styles.copyShade} aria-hidden /> : null}
                    <div className={styles.copyText}>
                      <h1 className={styles.headline}>
                        {(isPhone ? (PHONE_HEADLINE[slide.id] ?? slide.headline) : slide.headline)
                          .split("\n")
                          .map((line, i) => (
                          <span key={i}>
                            {i > 0 ? <br /> : null}
                            {line}
                          </span>
                        ))}
                      </h1>
                    </div>
                    {isCompact ? <HeroGoodFor id={slide.id} /> : null}
                  </div>
                  <div className={styles.ctaBlock}>
                    {isCompact ? (
                      <a
                        ref={viewPillRef}
                        href={slide.cta.href}
                        className={styles.viewPill}
                        style={{ color: viewInk }}
                        onClick={(event) => {
                          if (!menuTapStartsBarrage(slide.id, event)) return;
                          event.preventDefault();
                          playMenuBarrage(router, slide.id, slide.cta.href);
                        }}
                      >
                        {viewCtaLabel(slide.id, slide.railLabel)}
                      </a>
                    ) : null}
                    <div className={styles.ctaWrap} data-slide={slide.id}>
                      <Button
                        href={slide.cta.href}
                        styleVariant="Ghost"
                        className={styles.cta}
                        onClick={(event) => {
                          if (!menuTapStartsBarrage(slide.id, event)) return;
                          const next = new URL(slide.cta.href, window.location.origin);
                          const stays =
                            next.origin === window.location.origin &&
                            next.pathname === window.location.pathname &&
                            next.search === window.location.search;
                          if (stays) return;
                          event.preventDefault();
                          playMenuBarrage(router, slide.id, slide.cta.href);
                        }}
                      >
                        {slide.id === "mens-peak-performance" ||
                        slide.id === "womens-total-balance" ? (
                          <span className={styles.ctaLabel}>
                            {slide.id === "womens-total-balance"
                              ? "Shop Women's Total"
                              : "Shop Men's Peak"}{" "}
                            <span className={styles.ctaRest}>
                              {slide.id === "womens-total-balance"
                                ? "Balance Treatments"
                                : "Performance Treatments"}
                            </span>
                          </span>
                        ) : (
                          slide.cta.label
                        )}
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
                    ref={mediaPillRef}
                    className={styles.progressPill}
                    role="slider"
                    tabIndex={0}
                    aria-label="Video progress"
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={0}
                    onPointerDown={onScrubPointerDown}
                    onPointerMove={onScrubPointerMove}
                    onPointerUp={endScrub}
                    onPointerCancel={endScrub}
                    onKeyDown={onScrubKeyDown}
                  >
                    <span ref={mediaFillRef} className={styles.progressFill} />
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
