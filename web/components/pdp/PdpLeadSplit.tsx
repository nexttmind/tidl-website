import { Button } from "@/components/ui/Button";
import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./PdpLeadSplit.module.css";

type LeadMedia = {
  id: string;
  label?: string;
  swatch?: string;
  note?: string;
  src?: string;
  videoSrc?: string;
  poster?: string;
};

type PdpLeadSplitProps = {
  title: string;
  body: string;
  cta: { label: string; href: string };
  media: LeadMedia;
  lift?: boolean;
};

/** Good Life mid-page lead: copy left, lifestyle plate right. */
export function PdpLeadSplit({ title, body, cta, media, lift = false }: PdpLeadSplitProps) {
  const titleLines = title.split("\n");

  return (
    <section className={styles.root} aria-labelledby="lead-title">
      <div className={styles.copy}>
        <div className={styles.pin}>
          <h2 id="lead-title" className={styles.title}>
            {titleLines.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={styles.body}>{body}</p>
          <Button href={cta.href} className={styles.cta}>
            {cta.label}
          </Button>
        </div>
      </div>
      <div className={styles.mediaCol}>
        <MediaSlot
          id={media.id}
          fill
          label={media.label ?? title}
          swatch={media.swatch}
          note={media.note}
          src={media.src}
          videoSrc={media.videoSrc}
          poster={media.poster}
          lift={lift}
          className={styles.media}
        />
      </div>
    </section>
  );
}
