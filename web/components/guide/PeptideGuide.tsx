"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { menuTapStartsBarrage } from "@/components/chrome/MenuBarrage";
import { playMenuBarrage } from "@/components/chrome/menu-barrage-session";
import {
  peptideGuideCopy,
  peptideGuideEntries,
  type PeptideGuideEntry,
} from "@/content/fixtures/peptide-guide";
import { SoldOutTitle } from "@/components/category/SoldOutTitle";
import { MarketingImage } from "@/components/media/MarketingImage";
import { LOCKUP_VIAL_FIT } from "@/components/home/lockup-vial-fit";
import { optEntry } from "@/lib/media/opt-manifest";
import { type SectionId, useTreatmentSection } from "./TreatmentSections";
import styles from "./PeptideGuide.module.css";

function lockupAspect(src: string): number | undefined {
  const entry = optEntry(src);
  if (!entry || entry.width <= 0 || entry.height <= 0) return undefined;
  return entry.width / entry.height;
}

const ENTRIES = peptideGuideEntries();
const COMPACT_QUERY = "(width < 1025px)";
/** Air between the nav pill and the first line of the opened section. */
const HEADER_GAP = 12;

function visibleHeader(): HTMLElement | null {
  for (const node of document.querySelectorAll("header")) {
    if (!(node instanceof HTMLElement)) continue;
    const box = node.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) return node;
  }
  return null;
}

function headerClearance(): number {
  const header = visibleHeader();
  const nav = document.querySelector("[data-section-nav]");
  if (
    header &&
    nav instanceof HTMLElement &&
    getComputedStyle(nav).position === "sticky" &&
    nav.offsetHeight > 0
  ) {
    const top = header.getBoundingClientRect().top;
    const bar = [...header.querySelectorAll("div")].find((node) =>
      [...node.classList].some((name) => name.split("__").pop() === "bar"),
    );
    const stickyTop = Number.parseFloat(getComputedStyle(header).top) || 0;
    const stick =
      header.dataset.pinned === "true" && bar
        ? stickyTop + Math.max(0, bar.getBoundingClientRect().bottom - top)
        : stickyTop + header.getBoundingClientRect().height;
    return stick + nav.offsetHeight + HEADER_GAP;
  }
  if (!header) return 0;
  if (header.dataset.pinned === "true") {
    const bar = [...header.querySelectorAll("div")].find((node) =>
      [...node.classList].some((name) => name.split("__").pop() === "bar"),
    );
    const bottom = bar?.getBoundingClientRect().bottom ?? header.getBoundingClientRect().bottom;
    return bottom + HEADER_GAP;
  }
  return header.getBoundingClientRect().bottom + HEADER_GAP;
}

function scrollAnchor(article: HTMLElement): { node: HTMLElement; trim: number } {
  if (article.parentElement?.firstElementChild === article) {
    const title = article.closest("section")?.querySelector("h2");
    if (title instanceof HTMLElement) {
      const trim = Number.parseFloat(getComputedStyle(title).paddingTop) || 0;
      return { node: title, trim };
    }
  }
  return { node: article, trim: 0 };
}

function onExpandedTap(event: MouseEvent<HTMLElement>, open: boolean, onToggle: () => void) {
  if (!open || !window.matchMedia(COMPACT_QUERY).matches) return;
  const target = event.target;
  if (!(target instanceof Element) || target.closest("a, button")) return;
  onToggle();
}

function scrollSectionUnderHeader(id: string) {
  if (!window.matchMedia(COMPACT_QUERY).matches) return;
  const article = document.getElementById(id);
  if (!(article instanceof HTMLElement)) return;
  const { node, trim } = scrollAnchor(article);
  const top = node.getBoundingClientRect().top + trim + window.scrollY - headerClearance();
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}

function PlusMark() {
  return <span className={styles.plus} aria-hidden />;
}

function rowThumbSrc(entry: PeptideGuideEntry): string {
  return entry.forms[0]?.src || entry.vialSrc;
}

function onViewProduct(
  event: MouseEvent<HTMLAnchorElement>,
  id: string,
  href: string,
  push: (id: string, href: string) => void,
) {
  if (!menuTapStartsBarrage(id, event)) return;
  event.preventDefault();
  event.stopPropagation();
  push(id, href);
}

function GuideShots({ entry }: { entry: PeptideGuideEntry }) {
  const router = useRouter();
  const shots =
    entry.forms.length > 0
      ? entry.forms.map((form, index) => ({
          key: form.form,
          form: form.form,
          src: form.src,
          caption: index === 0 ? entry.name : form.label,
          lead: index === 0,
        }))
      : [
          {
            key: "product",
            form: "product",
            src: entry.vialSrc,
            caption: entry.name,
            lead: true,
          },
        ];

  const penFit = shots.some((shot) => shot.form === "vial-pen" && !shot.lead)
    ? LOCKUP_VIAL_FIT[entry.id]
    : undefined;
  const lead = shots[0];
  const leadEntry = lead ? optEntry(lead.src) : undefined;
  const leadAspect =
    leadEntry && leadEntry.width > 0 && leadEntry.height > 0
      ? leadEntry.width / leadEntry.height
      : undefined;
  const rowStyle = (
    penFit || leadAspect
      ? {
          ...(leadAspect != null ? { "--isolate-aspect": String(leadAspect) } : {}),
          ...(penFit
            ? {
                "--lockup-vial-base": String(penFit[1]),
                "--lockup-vial-span": String(penFit[1] - penFit[0]),
                "--lockup-vial-end": String(penFit[2]),
              }
            : {}),
        }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <ul className={styles.forms} style={rowStyle}>
      {shots.map((shot) => {
        const matchVial = shot.form === "vial-pen" && !shot.lead;
        const aspect = matchVial ? lockupAspect(shot.src) : undefined;
        const fit = matchVial ? LOCKUP_VIAL_FIT[entry.id] : undefined;
        const style = (
          aspect != null || fit
            ? {
                ...(aspect != null ? { "--lockup-aspect": String(aspect) } : {}),
                ...(fit
                  ? {
                      "--lockup-vial-base": String(fit[1]),
                      "--lockup-vial-span": String(fit[1] - fit[0]),
                    }
                  : {}),
              }
            : undefined
        ) as CSSProperties | undefined;
        return (
          <li key={shot.key} className={styles.formItem} style={style}>
            <Link
              href={entry.href}
              className={styles.formLink}
              aria-label={shot.caption}
              onClick={(event) =>
                onViewProduct(event, entry.id, entry.href, (id, href) =>
                  playMenuBarrage(router, id, href),
                )
              }
            >
              <span
                className={styles.formMedia}
                data-form={shot.form}
                data-match-vial={matchVial ? "" : undefined}
              >
                <MarketingImage src={shot.src} alt="" sizes="220px" />
              </span>
            </Link>
            <span className={styles.formName}>{shot.caption}</span>
          </li>
        );
      })}
    </ul>
  );
}

function viewCtaLabel(entry: PeptideGuideEntry): string {
  if (entry.kind === "bundle") return `View ${entry.name} Bundle`;
  if (entry.kind === "treatment") return `View ${entry.name} Treatment`;
  return `View ${entry.name}`;
}

function GuideRow({
  entry,
  open,
  onToggle,
}: {
  entry: PeptideGuideEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const buttonId = `${baseId}-btn`;
  const copy = peptideGuideCopy;

  return (
    <article
      className={styles.item}
      id={entry.id}
      data-open={open ? "true" : undefined}
      onClick={(event) => onExpandedTap(event, open, onToggle)}
      style={
        open
          ? ({
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
            } as CSSProperties)
          : undefined
      }
    >
      <div className={styles.label}>
        <button
          type="button"
          id={buttonId}
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.toggleInner}>
            {rowThumbSrc(entry) ? (
              <span className={styles.thumb}>
                <MarketingImage src={rowThumbSrc(entry)} alt="" sizes="40px" />
              </span>
            ) : (
              <span className={styles.thumb} aria-hidden />
            )}
            <span className={styles.titles}>
              <span className={styles.name}>
                {entry.soldOut ? (
                  <SoldOutTitle>{entry.name}</SoldOutTitle>
                ) : (
                  entry.name
                )}
              </span>
              <span className={styles.tagline}>{entry.tagline}</span>
            </span>
            <PlusMark />
          </span>
        </button>
      </div>

      <div
        id={panelId}
        className={styles.panel}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
      >
        <div className={styles.panelInner}>
          <div className={styles.mediaBlock}>
            <GuideShots entry={entry} />
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.notes}</p>
            <div className={styles.notes}>
              {entry.notes.map((note) => (
                <span key={note.chip} className={styles.noteChip}>
                  {note.chip}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.what}</p>
            <p className={styles.rowBody}>{entry.stack}</p>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.fits}</p>
            <p className={styles.rowBody}>{entry.mood}</p>
          </div>

          {entry.care !== null ? (
            <div className={styles.row}>
              <p className={styles.rowLabel}>{copy.rows.care}</p>
              <p className={styles.rowBody}>{entry.care ?? copy.care}</p>
            </div>
          ) : null}

          {entry.related.length > 0 ? (
            <div className={styles.row}>
              <p className={styles.rowLabel}>{copy.rows.related}</p>
              <ul className={styles.related}>
                {entry.related.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {entry.price ? (
            <div className={styles.row}>
              <p className={styles.rowLabel}>{copy.rows.price}</p>
              <div className={styles.priceBlock}>
                <p className={styles.rowBody}>
                  {entry.price.replace(/^Starting from\s+/i, "")}
                </p>
                <Link
                  href={entry.href}
                  className={styles.priceCta}
                  onClick={(event) =>
                    onViewProduct(event, entry.id, entry.href, (id, href) =>
                      playMenuBarrage(router, id, href),
                    )
                  }
                >
                  {viewCtaLabel(entry)}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function PeptideGuide() {
  const { id: sectionId, index, compact, select } = useTreatmentSection();
  const [openId, setOpenId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);

  useLayoutEffect(() => {
    if (!openId || !window.matchMedia(COMPACT_QUERY).matches) return;
    let stopped = false;
    let parked = window.scrollY;
    const started = performance.now();
    const tick = () => {
      if (stopped) return;
      if (Math.abs(window.scrollY - parked) > 2) return;
      scrollSectionUnderHeader(openId);
      parked = window.scrollY;
      if (performance.now() - started < 440) requestAnimationFrame(tick);
    };
    tick();
    return () => {
      stopped = true;
    };
  }, [openId]);

  useLayoutEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const entry = ENTRIES.find((item) => item.id === hash);
    if (!entry) return;
    setOpenId(entry.id);
    select(`${entry.kind}-guide`);
  }, [select]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!compact || !track) {
      setPanelHeight(undefined);
      return;
    }
    const active = track.children[index];
    if (!(active instanceof HTMLElement)) return;

    const indexChanged = indexRef.current !== index;
    indexRef.current = index;
    let sliding = indexChanged;

    const apply = () => {
      const next = active.getBoundingClientRect().height;
      setPanelHeight((current) => {
        if (sliding && current !== undefined) return Math.max(current, next);
        return next;
      });
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(active);
    const timer = window.setTimeout(
      () => {
        sliding = false;
        apply();
      },
      indexChanged ? 440 : 0,
    );
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [compact, index, openId]);

  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const entry = ENTRIES.find((item) => item.id === id);
      if (!entry) return;
      setOpenId(id);
      select(`${entry.kind}-guide`);
      if (window.matchMedia(COMPACT_QUERY).matches) return;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    window.addEventListener("popstate", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      window.removeEventListener("popstate", applyHash);
    };
  }, [select]);

  const groups = [
    {
      kind: "product" as const,
      title: peptideGuideCopy.groups.product,
      items: ENTRIES.filter((entry) => entry.kind === "product"),
    },
    {
      kind: "bundle" as const,
      title: peptideGuideCopy.groups.bundle,
      items: ENTRIES.filter((entry) => entry.kind === "bundle"),
    },
    {
      kind: "treatment" as const,
      title: peptideGuideCopy.groups.treatment,
      items: ENTRIES.filter((entry) => entry.kind === "treatment"),
    },
    {
      kind: "pain" as const,
      title: peptideGuideCopy.groups.pain,
      items: ENTRIES.filter((entry) => entry.kind === "pain"),
    },
  ];

  const trackStyle: CSSProperties | undefined = compact
    ? ({
        "--section": index,
        height: panelHeight === undefined ? undefined : `${panelHeight}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div className={styles.root}>
      <div ref={trackRef} className={styles.track} data-guide-track="" style={trackStyle}>
        {groups.map((group) => {
          const groupId = `${group.kind}-guide` as SectionId;
          const hidden = compact && groupId !== sectionId;
          return (
            <section
              key={group.kind}
              className={styles.group}
              aria-labelledby={`${group.kind}-guide`}
              inert={hidden}
            >
              <h2 id={`${group.kind}-guide`} className={styles.groupTitle}>
                {group.title}
              </h2>
              <div className={styles.list}>
                {group.items.map((entry) => (
                  <GuideRow
                    key={entry.id}
                    entry={entry}
                    open={openId === entry.id}
                    onToggle={() =>
                      setOpenId((current) => (current === entry.id ? null : entry.id))
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
