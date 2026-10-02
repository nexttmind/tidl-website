import styles from "./PhoneTileTitle.module.css";

const PHONE_TILE_TITLE: Readonly<Record<string, string>> = {
  "at-home-lab": "Blood Test Kit",
  "womens-total-balance": "Women's Balance",
};

export function PhoneTileTitle({ id, label }: { id: string; label: string }) {
  const phone = PHONE_TILE_TITLE[id];
  if (!phone) return label;
  return (
    <>
      <span className={styles.full}>{label}</span>
      <span className={phone.length > 14 ? styles.phoneTight : styles.phone}>
        {phone}
      </span>
    </>
  );
}
