import { Button } from "@/components/ui/Button";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import {
  CLINICAL_ENTRIES,
  intakeHref,
  symptomsIntakeHref,
} from "@/content/clinical/entry-map";
import {
  CATALOG_PRICE,
  catalogNotecardCopy,
} from "@/content/fixtures/catalog";
import type { ValueFieldCard } from "@/content/fixtures/value-fields";
import styles from "./CatalogNotecard.module.css";

function intakeForItem(item: ValueFieldCard): string {
  const entry = CLINICAL_ENTRIES.find((row) => row.sourceHref === item.href);
  return entry ? intakeHref(entry.slug) : symptomsIntakeHref();
}

type CatalogNotecardProps = {
  item: ValueFieldCard;
};

export function CatalogNotecard({ item }: CatalogNotecardProps) {
  const headingId = `${item.id}-note`;
  const copy = catalogNotecardCopy(item.id);
  const plate = shopPlate(item.id);

  return (
    <article
      className={`${styles.card} ${shop.bloomHost}`}
      aria-labelledby={headingId}
      data-bloom={item.id}
      style={bloomStyle(plate.bloom)}
    >
      <div className={styles.media}>
        <ShopBloomPair vialSrc={plate.vialSrc} bloomSrc={plate.bloomSrc} />
      </div>
      <div className={styles.body}>
        <h3 id={headingId} className={styles.kicker}>
          <span className={styles.kickerIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.iconSrc} alt="" width={28} height={28} />
          </span>
          {item.pill}
        </h3>
        <p className={styles.lede}>{copy.body}</p>
        <p className={styles.price}>{CATALOG_PRICE}</p>
        <div className={styles.actions}>
          <Button href={intakeForItem(item)} className={styles.cta}>
            Get Started
          </Button>
        </div>
      </div>
    </article>
  );
}
