import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./HowItWorks.module.css";

type Step = {
  title: string;
  body: string;
};

type HowMedia = {
  id: string;
  label?: string;
  swatch?: string;
  note?: string;
  src?: string;
  videoSrc?: string;
  poster?: string;
};

export function HowItWorks({
  title,
  steps,
  media,
}: {
  title: string;
  steps: readonly Step[];
  media?: HowMedia;
}) {
  return (
    <section className={styles.root} aria-labelledby="how-title" id="how">
      <div className={styles.copy}>
        <div className={styles.inner}>
          <h2 id="how-title" className={styles.title}>
            {title}
          </h2>
          <ol className={styles.list}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.item}>
                <span className={styles.index} aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.itemCopy}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.body}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {media ? (
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
            className={styles.media}
          />
        </div>
      ) : null}
    </section>
  );
}
