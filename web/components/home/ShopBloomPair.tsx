"use client";

import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./LandingShop.module.css";

export {
  SHOP_PLATES,
  bloomStyle,
  bloomSeatScale,
  shopPlate,
  type ShopPlate,
} from "./shop-plates";

export function ShopBloomPair({
  vialSrc,
  bloomSrc,
  sway = false,
  alt = "",
  loading = "lazy",
  active = true,
}: {
  vialSrc: string;
  bloomSrc: string;
  sway?: boolean;
  alt?: string;
  loading?: "eager" | "lazy";
  /** When false, keep layout but do not fetch or decode the bitmaps. */
  active?: boolean;
}) {
  return (
    <div className={styles.pair}>
      <div className={styles.bloomStage} data-bloom-stage="">
        <div className={styles.bloomSlot}>
          <div className={styles.bloomPair}>
            {active ? (
              <MarketingImage
                className={styles.bloom}
                src={bloomSrc}
                alt=""
                sizes="(width < 721px) 70vw, (width < 1025px) 40vw, 320px"
                loading={loading}
              />
            ) : null}
            {active && sway ? (
              <MarketingImage
                className={`${styles.bloom} ${styles.bloomSway}`}
                src={bloomSrc}
                alt=""
                sizes="(width < 721px) 70vw, (width < 1025px) 40vw, 320px"
                loading={loading}
                style={{ filter: "url(#tidl-shop-bloom-sway)" }}
              />
            ) : null}
          </div>
        </div>
      </div>
      {active ? (
        <MarketingImage
          className={styles.vial}
          src={vialSrc}
          alt={alt}
          width={1024}
          height={1024}
          sizes="(width < 721px) 50vw, (width < 1025px) 28vw, 240px"
          loading={loading}
          dataBloomVial
        />
      ) : null}
    </div>
  );
}
