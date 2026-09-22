import { painReliefGroups } from "@/content/fixtures/pain-relief";
import styles from "./DayRail.module.css";

function PlusMark() {
  return (
    <svg viewBox="0 0 6 6" width="10" height="10" aria-hidden>
      <path
        d="M2.57143 3.42857H0V2.57143H2.57143V0H3.42857V2.57143H6V3.42857H3.42857V6H2.57143V3.42857Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DayRail() {
  return (
    <nav className={styles.root} aria-label="The day">
      <div className={`layout-container ${styles.card}`}>
        <p className={styles.kicker}>The day</p>
        <ol className={styles.beats}>
          {painReliefGroups.map((group) => (
            <li key={group.id} className={styles.beat}>
              <a
                className={styles.link}
                href={`#${group.id}`}
                aria-label={`${group.nav}. ${group.when}`}
              >
                <span className={styles.node} aria-hidden>
                  <PlusMark />
                </span>
                <span className={styles.beatLabel}>{group.beat}</span>
                <span className={styles.name}>{group.nav}</span>
                <span className={styles.when}>{group.when}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
