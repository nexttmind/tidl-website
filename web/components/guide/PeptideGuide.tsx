"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  peptideGuideCopy,
  peptideGuideEntries,
  type PeptideGuideEntry,
} from "@/content/fixtures/peptide-guide";
import styles from "./PeptideGuide.module.css";

const ENTRIES = peptideGuideEntries();

function PlusMark() {
  return <span className={styles.plus} aria-hidden />;
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
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const buttonId = `${baseId}-btn`;
  const copy = peptideGuideCopy;

  return (
    <article className={styles.item} id={entry.id} data-open={open ? "true" : undefined}>
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
            <PlusMark />
            <span className={styles.titles}>
              <span className={styles.name}>{entry.name}</span>
              <span className={styles.tagline}>{entry.tagline}</span>
            </span>
          </span>
        </button>
        <Link href={entry.href} className={styles.view}>
          {copy.viewStack}
        </Link>
      </div>

      <div
        id={panelId}
        className={styles.panel}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
      >
        <div className={styles.panelInner}>
          <div className={styles.mediaRow}>
            <div className={styles.media}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.vialSrc} alt="" width={220} height={360} />
            </div>
            <Link href={entry.href} className={styles.pdpLink}>
              {copy.viewPdp} {entry.name}
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.notes}</p>
            <div className={styles.notes}>
              {entry.notes.map((note) => (
                <p key={note.chip} className={styles.note}>
                  <span className={styles.noteChip}>{note.chip}</span>
                  <span>{note.title}</span>
                </p>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.startsAt}</p>
            <p className={styles.rowBody}>{copy.price}</p>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.stack}</p>
            <p className={styles.rowBody}>{entry.stack}</p>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.fits}</p>
            <p className={styles.rowBody}>{entry.mood}</p>
          </div>

          <div className={styles.row}>
            <p className={styles.rowLabel}>{copy.rows.care}</p>
            <p className={styles.rowBody}>{copy.care}</p>
          </div>

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
        </div>
      </div>
    </article>
  );
}

export function PeptideGuide() {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      if (!ENTRIES.some((entry) => entry.id === id)) return;
      setOpenId(id);
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const groups = [
    {
      kind: "treatment" as const,
      title: peptideGuideCopy.groups.treatment,
      items: ENTRIES.filter((entry) => entry.kind === "treatment"),
    },
    {
      kind: "program" as const,
      title: peptideGuideCopy.groups.program,
      items: ENTRIES.filter((entry) => entry.kind === "program"),
    },
  ];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>{peptideGuideCopy.title}</h1>
      </header>

      {groups.map((group) => (
        <section
          key={group.kind}
          className={styles.group}
          aria-labelledby={`${group.kind}-guide`}
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
      ))}
    </div>
  );
}
