import Link from "next/link";
import { TidlLogoLockup } from "@/components/brand/TidlLogoLockup";
import {
  footerColumns as defaultColumns,
  footerCopy,
  footerLegalLinks,
  type FooterColumn,
  type FooterLink,
} from "@/content/fixtures/footer";
import { FooterActionLink } from "./FooterActionLink";
import { FooterEmailCapture } from "./FooterEmailCapture";
import { FooterSocials } from "./FooterSocials";
import styles from "./FooterGlobal.module.css";

type FooterGlobalProps = {
  columns?: readonly FooterColumn[];
  tagline?: string;
};

const SPLIT_AFTER = 7;

function ColumnList({ links }: { links: readonly FooterLink[] }) {
  return (
    <ul className={styles.list}>
      {links.map((link) => (
        <li key={"action" in link ? link.action + link.label : link.href + link.label}>
          {"action" in link ? (
            <FooterActionLink label={link.label} />
          ) : (
            <Link href={link.href}>{link.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function ColumnHeading({ title, href }: { title: string; href?: string }) {
  return (
    <h2 className={styles.columnTitle}>
      {href ? <Link href={href}>{title}</Link> : title}
    </h2>
  );
}

function FooterNav({ columns }: { columns: readonly FooterColumn[] }) {
  return (
    <nav className={styles.columns} aria-label="Footer">
      {columns.flatMap((col) => {
        if (col.links.length <= SPLIT_AFTER) {
          return [
            <div key={col.title} className={styles.column}>
              <ColumnHeading title={col.title} href={col.href} />
              <ColumnList links={col.links} />
            </div>,
          ];
        }

        const left = col.links.filter((_, index) => index % 2 === 0);
        const right = col.links.filter((_, index) => index % 2 === 1);
        return [
          <div key={col.title} className={styles.columnWide}>
            <ColumnHeading title={col.title} href={col.href} />
            <div className={styles.split}>
              <ColumnList links={left} />
              <ColumnList links={right} />
            </div>
          </div>,
        ];
      })}
      <div className={styles.column}>
        <h2 className={styles.columnTitle}>{footerCopy.follow}</h2>
        <FooterSocials />
        <div className={styles.credit}>
          <p>{footerCopy.credit}</p>
          <a href={`mailto:${footerCopy.creditEmail}`}>{footerCopy.creditCta}</a>
        </div>
      </div>
    </nav>
  );
}

/** Pattern/Footer Global — brand bar, equal catalog columns, legal. */
export function FooterGlobal({
  columns = defaultColumns,
  tagline = footerCopy.tagline,
}: FooterGlobalProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={`layout-bleed ${styles.root}`}>
      <div className={styles.inner}>
        <div className={styles.brandBar}>
          <div className={styles.brand}>
            <TidlLogoLockup href="/" className={styles.logo} compact />
            <p className={styles.tagline}>{tagline}</p>
          </div>
          <FooterEmailCapture />
        </div>

        <FooterNav columns={columns} />

        <div className={styles.bottom}>
          <div className={styles.legal}>
            <nav className={styles.legalNav} aria-label={footerCopy.legalNav}>
              {footerLegalLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className={styles.copyright}>
              © {year} {footerCopy.copyright}
            </p>
          </div>
          <p className={styles.disclaimer}>{footerCopy.compounding}</p>
        </div>
      </div>
    </footer>
  );
}
