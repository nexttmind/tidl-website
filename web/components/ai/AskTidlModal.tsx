"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  ASK_COPY,
  SUGGESTED_QUESTIONS,
  answerAskTidl,
  type AskAnswer,
  type CatalogLink,
} from "@/content/fixtures/ask-tidl";
import { AskAiIcon } from "./AskAiIcon";
import styles from "./AskTidlModal.module.css";

const RECENT_KEY = "tidl.ask.recent";
const RECENT_LIMIT = 6;

type AskTidlModalProps = {
  open: boolean;
  onClose: () => void;
  seedQuery?: string;
};

type ViewState = "idle" | "loading" | "answer";

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

function writeRecents(items: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_LIMIT)));
  } catch {
    /* ignore quota */
  }
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 2.2c.28 2.9 1.72 4.34 4.62 4.62C12.72 9.1 11.28 10.54 11 13.44c-.28-2.9-1.72-4.34-4.62-4.62C9.28 6.54 10.72 5.1 11 2.2Z"
        fill="currentColor"
      />
      <path
        d="M16.6 13.1c.16 1.55.92 2.31 2.47 2.47-1.55.16-2.31.92-2.47 2.47-.16-1.55-.92-2.31-2.47-2.47 1.55-.16 2.31-.92 2.47-2.47Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M5.2 14.2c.13 1.28.75 1.9 2.03 2.03-1.28.13-1.9.75-2.03 2.03-.13-1.28-.75-1.9-2.03-2.03 1.28-.13 1.9-.75 2.03-2.03Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 14.25V3.75M9 3.75L4.5 8.25M9 3.75l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3.5L10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4.2V7l1.9 1.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3.5L5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatalogGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: readonly CatalogLink[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className={styles.linkGroup}>
      <p className={styles.linkGroupLabel}>{title}</p>
      <ul className={styles.linkList}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className={styles.linkRow} onClick={onNavigate}>
              <span className={styles.linkText}>
                <span className={styles.linkTitle}>{item.label}</span>
                <span className={styles.linkBlurb}>{item.blurb}</span>
              </span>
              <span className={styles.linkChevron} aria-hidden>
                <IconChevron />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AskTidlModalContent({
  onClose,
  onExited,
  phase,
  seedQuery,
}: {
  onClose: () => void;
  onExited: () => void;
  phase: "in" | "out";
  seedQuery?: string;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const seed = seedQuery?.trim() ?? "";

  const [query, setQuery] = useState(seed);
  const [recents, setRecents] = useState<string[]>(() => {
    const existing = readRecents();
    if (!seed) return existing;
    const next = [seed, ...existing.filter((item) => item !== seed)].slice(0, RECENT_LIMIT);
    writeRecents(next);
    return next;
  });
  const [view, setView] = useState<ViewState>(seed ? "loading" : "idle");
  const [activeQuestion, setActiveQuestion] = useState(seed);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [highlight, setHighlight] = useState(-1);

  const suggestionItems = SUGGESTED_QUESTIONS;
  const idleRows = [
    ...suggestionItems.map((text) => ({ kind: "suggest" as const, text })),
    ...recents.map((text) => ({ kind: "recent" as const, text })),
  ];

  const remember = useCallback((text: string) => {
    setRecents((prev) => {
      const next = [text, ...prev.filter((item) => item !== text)].slice(0, RECENT_LIMIT);
      writeRecents(next);
      return next;
    });
  }, []);

  const resetConversation = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setView("idle");
    setAnswer(null);
    setActiveQuestion("");
    setQuery("");
    setHighlight(-1);
  }, []);

  const runAsk = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setActiveQuestion(text);
      setQuery(text);
      setView("loading");
      setAnswer(null);
      setHighlight(-1);
      remember(text);

      const path =
        typeof window !== "undefined" ? window.location.pathname : "/";
      const mode = path.startsWith("/care") ? "clinical" : "marketing";

      void (async () => {
        try {
          const res = await fetch("/api/ask-tidl", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: text,
              mode,
              context: { path },
            }),
          });
          if (res.ok) {
            const json = (await res.json()) as {
              data?: AskAnswer;
            };
            if (json.data) {
              setAnswer(json.data);
              setView("answer");
              return;
            }
          }
        } catch {
          // Fall through to fixture.
        }
        setAnswer(answerAskTidl(text));
        setView("answer");
      })();
    },
    [remember],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (seed) {
      const path =
        typeof window !== "undefined" ? window.location.pathname : "/";
      const mode = path.startsWith("/care") ? "clinical" : "marketing";
      void (async () => {
        try {
          const res = await fetch("/api/ask-tidl", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: seed,
              mode,
              context: { path },
            }),
          });
          if (res.ok) {
            const json = (await res.json()) as { data?: AskAnswer };
            if (json.data) {
              setAnswer(json.data);
              setView("answer");
              return;
            }
          }
        } catch {
          // Fall through.
        }
        setAnswer(answerAskTidl(seed));
        setView("answer");
      })();
    }

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [seed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const focusable = node.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    node.addEventListener("keydown", onTab);
    return () => node.removeEventListener("keydown", onTab);
  }, [view, answer]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    runAsk(query);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (view !== "idle") return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, idleRows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, -1));
    } else if (event.key === "Enter" && highlight >= 0 && idleRows[highlight]) {
      event.preventDefault();
      runAsk(idleRows[highlight].text);
    }
  };

  return (
    <div
      className={styles.root}
      data-phase={phase}
      role="presentation"
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (phase === "out") onExited();
      }}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close Ask TIDL"
        onClick={onClose}
      />
      <div
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.headerCopy}>
              <h2 id={titleId} className={styles.title}>
                <span className={styles.mark} aria-hidden>
                  <AskAiIcon className={styles.markIcon} />
                </span>
                {ASK_COPY.title}
              </h2>
              <p className={styles.subtitle}>{ASK_COPY.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.shortcut}>{ASK_COPY.shortcutHint}</span>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <IconClose />
            </button>
          </div>
        </header>

        <form className={styles.composer} onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="ask-tidl-q">
            Ask a question
          </label>
          <input
            ref={inputRef}
            id="ask-tidl-q"
            className={styles.input}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlight(-1);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={ASK_COPY.placeholder}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="submit"
            className={styles.send}
            aria-label="Ask"
            disabled={!query.trim() || view === "loading"}
          >
            <IconArrowUp />
          </button>
        </form>

        <div className={styles.body}>
          {view === "idle" ? (
            <>
              <section className={styles.section} aria-label={ASK_COPY.suggestionsLabel}>
                <p className={styles.sectionLabel}>{ASK_COPY.suggestionsLabel}</p>
                <ul className={styles.rowList} role="listbox">
                  {suggestionItems.map((text, index) => {
                    const active = highlight === index;
                    return (
                      <li key={text} role="option" aria-selected={active}>
                        <button
                          type="button"
                          className={[styles.row, active ? styles.rowActive : ""]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => runAsk(text)}
                          onMouseEnter={() => setHighlight(index)}
                        >
                          <span className={styles.rowIcon} aria-hidden>
                            <IconSpark className={styles.rowSpark} />
                          </span>
                          <span className={styles.rowLabel}>{text}</span>
                          <IconChevron className={styles.rowChevron} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className={styles.section} aria-label={ASK_COPY.recentLabel}>
                <p className={styles.sectionLabel}>{ASK_COPY.recentLabel}</p>
                {recents.length === 0 ? (
                  <p className={styles.emptyRecent}>{ASK_COPY.recentEmpty}</p>
                ) : (
                  <ul className={styles.rowList} role="listbox">
                    {recents.map((text, index) => {
                      const rowIndex = suggestionItems.length + index;
                      const active = highlight === rowIndex;
                      return (
                        <li key={`${text}-${index}`} role="option" aria-selected={active}>
                          <button
                            type="button"
                            className={[styles.row, styles.rowRecent, active ? styles.rowActive : ""]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => runAsk(text)}
                            onMouseEnter={() => setHighlight(rowIndex)}
                          >
                            <span className={styles.rowIcon} aria-hidden>
                              <IconClock />
                            </span>
                            <span className={styles.rowLabel}>{text}</span>
                            <IconChevron className={styles.rowChevron} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          ) : null}

          {view === "loading" ? (
            <div className={styles.loading} role="status" aria-live="polite">
              <span className={styles.loadingRule} aria-hidden />
              <p className={styles.loadingText}>{ASK_COPY.loadingLabel}</p>
              <p className={styles.loadingQuery}>{activeQuestion}</p>
            </div>
          ) : null}

          {view === "answer" && answer ? (
            <div className={styles.answer} aria-live="polite">
              <button type="button" className={styles.back} onClick={resetConversation}>
                <IconBack />
                {ASK_COPY.askAgain}
              </button>
              <p className={styles.questionEcho}>{activeQuestion}</p>
              <div className={styles.answerCard}>
                <p className={styles.answerLabel}>{ASK_COPY.answerLabel}</p>
                {answer.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className={styles.answerBody}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <CatalogGroup
                title={ASK_COPY.exploreTreatments}
                items={answer.treatments}
                onNavigate={onClose}
              />
              <CatalogGroup
                title={ASK_COPY.explorePrograms}
                items={answer.programs}
                onNavigate={onClose}
              />
            </div>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <p className={styles.disclaimer}>
            {view === "answer" && answer ? answer.disclaimer : ASK_COPY.disclaimer}
          </p>
        </footer>
      </div>
    </div>
  );
}

export function AskTidlModal({ open, onClose, seedQuery }: AskTidlModalProps) {
  const [shown, setShown] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const seedHold = useRef(seedQuery);

  useEffect(() => {
    if (open) {
      seedHold.current = seedQuery;
      setShown(true);
      setPhase("in");
      return;
    }
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(false);
      return;
    }
    setPhase("out");
  }, [open, seedQuery, shown]);

  if (!shown) return null;

  return (
    <AskTidlModalContent
      key={seedHold.current?.trim() || "idle"}
      phase={phase}
      onClose={onClose}
      onExited={() => setShown(false)}
      seedQuery={seedHold.current}
    />
  );
}
