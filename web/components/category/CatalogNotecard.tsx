import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { shopCatalogItem } from "@/components/home/shop-catalog";
import { bloomStyle } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import { catalogHref, catalogRoute } from "@/content/catalog/routes";
import { intakeHref, symptomsIntakeHref } from "@/content/clinical/entry-map";
import { catalogPriceLine } from "@/content/pdp/launch-pricing";
import { CATALOG_NOTECARD_BODY } from "@/content/pdp/catalog";
import styles from "./CatalogNotecard.module.css";

const CROSS_ICON = "/landing/section-2/icons/cross.svg";

function intakeForId(id: string): string {
  const route = catalogRoute(id);
  if (!route || id === "at-home-lab") return catalogHref(id);
  if (id === "pain-relief") return "/pain-relief";
  return intakeHref(route.entrySlug) || symptomsIntakeHref();
}

type CatalogNotecardProps = {
  id: string;
  label: string;
};

export function CatalogNotecard({ id, label }: CatalogNotecardProps) {
  const headingId = `${id}-note`;
  const item = shopCatalogItem(id);
  if (!item) return null;
  const body = CATALOG_NOTECARD_BODY[id] ?? item.label;
  const href = catalogHref(id);
  const price = catalogPriceLine(id);

  return (
    <article
      className={`${styles.card} ${shop.bloomHost}`}
      aria-labelledby={headingId}
      data-bloom={id}
      data-kind={item.kind}
      style={bloomStyle(item.bloom)}
    >
      <div className={styles.media}>
        <ShopBloomPair
          vialSrc={item.vialSrc}
          bloomSrc={item.bloomSrc}
          sizes="(width < 721px) 78vw, (width < 1025px) 70vw, 640px"
          vialSizes="(width < 721px) 72vw, (width < 1025px) 46vw, 400px"
        />
      </div>
      <div className={styles.body}>
        <h3 id={headingId} className={styles.kicker}>
          <span className={styles.kickerIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CROSS_ICON} alt="" width={28} height={28} />
          </span>
          {label}
        </h3>
        <p className={styles.lede}>{body}</p>
        {price ? <p className={styles.price}>{price}</p> : null}
        <div className={styles.actions}>
          <Button href={intakeForId(id)} className={styles.cta}>
            {id === "pain-relief"
              ? "Shop Pain Relief"
              : id === "at-home-lab"
                ? "Order kit"
                : "Get started"}
          </Button>
          <Link href={href} className={styles.view}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
