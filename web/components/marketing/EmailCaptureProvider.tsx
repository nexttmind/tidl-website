"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAskTidl } from "@/components/ai/AskTidlProvider";
import {
  CAPTURE_TIMING,
} from "@/content/fixtures/email-capture";
import { EmailCaptureModal } from "./EmailCaptureModal";

const STORAGE_SUBSCRIBED = "tidl.capture.subscribed";
const STORAGE_DISMISSED = "tidl.capture.dismissedAt";
const SESSION_SHOWN = "tidl.capture.sessionShown";

type EmailCaptureContextValue = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  markComplete: () => void;
};

const EmailCaptureContext = createContext<EmailCaptureContextValue | null>(null);

function isExcludedPath(pathname: string) {
  return CAPTURE_TIMING.excludePathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function readSubscribed() {
  try {
    return window.localStorage.getItem(STORAGE_SUBSCRIBED) === "1";
  } catch {
    return false;
  }
}

function readDismissedRecently() {
  try {
    const raw = window.localStorage.getItem(STORAGE_DISMISSED);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    const ms = CAPTURE_TIMING.dismissDays * 24 * 60 * 60 * 1000;
    return Date.now() - at < ms;
  } catch {
    return false;
  }
}

function readSessionShown() {
  try {
    return window.sessionStorage.getItem(SESSION_SHOWN) === "1";
  } catch {
    return false;
  }
}

function markSessionShown() {
  try {
    window.sessionStorage.setItem(SESSION_SHOWN, "1");
  } catch {
    /* ignore */
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(STORAGE_DISMISSED, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function markSubscribed() {
  try {
    window.localStorage.setItem(STORAGE_SUBSCRIBED, "1");
    window.localStorage.removeItem(STORAGE_DISMISSED);
  } catch {
    /* ignore */
  }
}

export function EmailCaptureProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { open: askOpen } = useAskTidl();
  const [open, setOpen] = useState(false);
  const openedRef = useRef(false);
  const startRef = useRef<number>(0);
  const scrollRef = useRef(0);

  const canAutoShow = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (openedRef.current || open) return false;
    if (askOpen) return false;
    if (isExcludedPath(pathname)) return false;
    if (readSubscribed() || readDismissedRecently() || readSessionShown()) {
      return false;
    }
    return true;
  }, [askOpen, open, pathname]);

  const openModal = useCallback(() => {
    openedRef.current = true;
    markSessionShown();
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const onClose = useCallback(
    (reason: "dismiss" | "complete") => {
      if (reason === "complete") {
        markSubscribed();
      } else {
        markDismissed();
      }
      setOpen(false);
    },
    [],
  );

  const maybeOpen = useCallback(() => {
    if (!canAutoShow()) return;
    openModal();
  }, [canAutoShow, openModal]);

  useEffect(() => {
    startRef.current = Date.now();
    scrollRef.current = 0;
  }, [pathname]);

  useEffect(() => {
    if (isExcludedPath(pathname)) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 1;
      const elapsed = Date.now() - startRef.current;
      if (
        elapsed >= CAPTURE_TIMING.minEngageMs &&
        scrollRef.current >= CAPTURE_TIMING.scrollDepth
      ) {
        maybeOpen();
      }
    };

    const fallbackTimer = window.setTimeout(() => {
      maybeOpen();
    }, CAPTURE_TIMING.fallbackMs);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [maybeOpen, pathname]);

  useEffect(() => {
    if (isExcludedPath(pathname)) return;

    const onExitIntent = (event: MouseEvent) => {
      if (event.clientY > 12) return;
      const elapsed = Date.now() - startRef.current;
      if (elapsed < CAPTURE_TIMING.exitIntentMinMs) return;
      maybeOpen();
    };

    document.addEventListener("mouseout", onExitIntent);
    return () => document.removeEventListener("mouseout", onExitIntent);
  }, [maybeOpen, pathname]);

  /* If Ask Tidl was open when engagement fired, retry once it closes. */
  useEffect(() => {
    if (askOpen || isExcludedPath(pathname)) return;
    const elapsed = Date.now() - startRef.current;
    if (
      (elapsed >= CAPTURE_TIMING.fallbackMs) ||
      (elapsed >= CAPTURE_TIMING.minEngageMs &&
        scrollRef.current >= CAPTURE_TIMING.scrollDepth)
    ) {
      maybeOpen();
    }
  }, [askOpen, maybeOpen, pathname]);

  const markComplete = useCallback(() => {
    markSubscribed();
  }, []);

  const value = useMemo(
    () => ({ open, openModal, closeModal, markComplete }),
    [open, openModal, closeModal, markComplete],
  );

  return (
    <EmailCaptureContext.Provider value={value}>
      {children}
      <EmailCaptureModal open={open} onClose={onClose} />
    </EmailCaptureContext.Provider>
  );
}

export function useEmailCapture() {
  const ctx = useContext(EmailCaptureContext);
  if (!ctx) {
    throw new Error("useEmailCapture must be used within EmailCaptureProvider");
  }
  return ctx;
}
