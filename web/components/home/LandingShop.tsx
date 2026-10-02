"use client";

import { ShopVialRail } from "./ShopVialRail";
import { SHOP_CATALOG } from "./shop-catalog";
import styles from "./LandingShop.module.css";

export function LandingShop() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.notecard}>
          <ShopVialRail items={SHOP_CATALOG} />
        </div>
      </div>
    </section>
  );
}
