import Link from "next/link";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import type { LegalBlock, LegalDocument } from "@/content/legal/types";
import styles from "./LegalDocument.module.css";

function Blocks({ blocks }: { blocks: readonly LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className={styles.p}>
              {block.text}
            </p>
          );
        }
        if (block.type === "note") {
          return (
            <p key={i} className={styles.note}>
              {block.text}
            </p>
          );
        }
        if (block.type === "address") {
          return (
            <address key={i} className={styles.address}>
              {block.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          );
        }
        const List = block.type === "ol" ? "ol" : "ul";
        return (
          <List key={i} className={styles.list}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>
        );
      })}
    </>
  );
}

type Props = {
  document: LegalDocument;
};

export function LegalDocumentPage({ document }: Props) {
  return (
    <div className={styles.page}>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <SiteHeader pinOnScroll={false} />
      <main id="main" className={styles.main}>
        <p className={styles.meta}>{document.meta}</p>
        <h1 className={styles.title}>{document.title}</h1>
        {document.headerNotice ? (
          <p className={styles.headerNotice}>{document.headerNotice}</p>
        ) : null}
        {document.lede ? <p className={styles.lede}>{document.lede}</p> : null}

        {document.sections.map((section) => (
          <section
            key={`${section.number ?? ""}-${section.title}`}
            className={styles.section}
          >
            <h2 className={styles.sectionTitle}>
              {section.number ? (
                <span className={styles.sectionNumber}>{section.number}</span>
              ) : null}
              {section.title}
            </h2>
            <Blocks blocks={section.blocks} />
            {section.subsections?.map((sub) => (
              <div key={sub.title} className={styles.subsection}>
                <h3 className={styles.subTitle}>{sub.title}</h3>
                <Blocks blocks={sub.blocks} />
              </div>
            ))}
          </section>
        ))}

        {document.related?.length ? (
          <nav className={styles.related} aria-label="Related notices">
            <p className={styles.relatedLabel}>Related</p>
            <ul>
              {document.related.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </main>
      <FooterGlobal />
    </div>
  );
}
