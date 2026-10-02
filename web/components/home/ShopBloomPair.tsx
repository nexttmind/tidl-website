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

const LOCKUP_BLOOM_SIZES =
  "(width < 721px) 70vw, (width < 1025px) 40vw, 320px";
const LOCKUP_VIAL_SIZES =
  "(width < 721px) 50vw, (width < 1025px) 28vw, 240px";

export function ShopBloomPair({
  vialSrc,
  bloomSrc,
  showBloom = true,
  sway = false,
  alt = "",
  loading = "lazy",
  fetchPriority,
  active = true,
  sizes = LOCKUP_BLOOM_SIZES,
  vialSizes = LOCKUP_VIAL_SIZES,
  vialClassName,
}: {
  vialSrc: string;
  bloomSrc: string;
  showBloom?: boolean;
  sway?: boolean;
  alt?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** When false, keep layout but do not fetch or decode the bitmaps. */
  active?: boolean;
  sizes?: string;
  vialSizes?: string;
  vialClassName?: string;
}) {
  return (
    <div className={styles.pair}>
      <div className={styles.bloomStage} data-bloom-stage="">
        <div className={styles.bloomSlot}>
          <div className={styles.bloomPair}>
            {active && showBloom ? (
              <MarketingImage
                className={styles.bloom}
                src={bloomSrc}
                alt=""
                sizes={sizes}
                loading={loading}
                fetchPriority={fetchPriority}
              />
            ) : null}
            {active && sway && showBloom ? (
              <MarketingImage
                className={`${styles.bloom} ${styles.bloomSway}`}
                src={bloomSrc}
                alt=""
                sizes={sizes}
                loading={loading}
                fetchPriority={fetchPriority}
                style={{ filter: "url(#tidl-shop-bloom-sway)" }}
              />
            ) : null}
          </div>
        </div>
      </div>
      {active ? (
        <MarketingImage
          className={vialClassName ? `${styles.vial} ${vialClassName}` : styles.vial}
          src={vialSrc}
          alt={alt}
          width={1024}
          height={1024}
          sizes={vialSizes}
          loading={loading}
          fetchPriority={fetchPriority}
          dataBloomVial
        />
      ) : null}
    </div>
  );
}
