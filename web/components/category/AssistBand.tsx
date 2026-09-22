import { Button } from "@/components/ui/Button";
import styles from "./AssistBand.module.css";

type AssistBandProps = {
  title: string;
  body: string;
  cta: string;
  ctaHref?: string;
};

export function AssistBand({ title, body, cta, ctaHref }: AssistBandProps) {
  return (
    <section className={styles.root} aria-labelledby="assist-title">
      <div className={styles.inner}>
        <h2 id="assist-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.body}>{body}</p>
        <div className={styles.cta}>
          <Button styleVariant="Ghost" href={ctaHref}>
            {cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
