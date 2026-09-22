import styles from "./SiteHeader.module.css";

type CatalogItemIconProps = {
  id: string;
};

/** Shared Figma cross. One mark for every catalog item. */
export function CatalogItemIcon({ id }: CatalogItemIconProps) {
  return <span className={styles.itemIcon} data-id={id} aria-hidden />;
}
