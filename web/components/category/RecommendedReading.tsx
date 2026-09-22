import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./RecommendedReading.module.css";

type ReadingMedia = {
  id: string;
  label?: string;
  swatch?: string;
  note?: string;
  src?: string;
};

type ReadingItem = {
  id: string;
  title: string;
  meta: string;
  mediaSlot?: string;
  media?: ReadingMedia;
};

export function RecommendedReading({
  title,
  items,
}: {
  title: string;
  items: readonly ReadingItem[];
}) {
  return (
    <section className={styles.root} aria-labelledby="reading-title">
      <div className="layout-container">
        <h2 id="reading-title" className={styles.title}>
          {title}
        </h2>
        <ul className={styles.list}>
          {items.map((item) => {
            const mediaId = item.media?.id ?? item.mediaSlot ?? item.id;
            return (
              <li key={item.id} className={styles.item}>
                <a href={`#${item.id}`} className={styles.link}>
                  <MediaSlot
                    id={mediaId}
                    aspect="16 / 9"
                    label={item.media?.label ?? item.title}
                    swatch={item.media?.swatch}
                    note={item.media?.note}
                    src={item.media?.src}
                  />
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.meta}>{item.meta}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
