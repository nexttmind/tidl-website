import { Button } from "@/components/ui/Button";
import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./ProductNotecard.module.css";

export type ProductNotecardProps = {
  name: string;
  price: string;
  mediaSlot: string;
  badge?: string;
  href?: string;
};

/** Molecule/Product Notecard — glass card for carousel hero */
export function ProductNotecard({
  name,
  price,
  mediaSlot,
  badge,
  href = "#",
}: ProductNotecardProps) {
  return (
    <article className={styles.root}>
      {badge ? <p className={styles.badge}>{badge}</p> : <span className={styles.badgeSpacer} />}
      <h3 className={styles.name}>
        <a href={href}>{name}</a>
      </h3>
      <p className={styles.price}>{price}</p>
      <div className={styles.media}>
        <MediaSlot id={mediaSlot} aspect="4 / 5" tone="dark" label={name} className={styles.mediaFill} />
        <div className={styles.mediaAction}>
          <Button styleVariant="Ghost" href={href} className={styles.ghostCta}>
            Shop
          </Button>
        </div>
      </div>
    </article>
  );
}
