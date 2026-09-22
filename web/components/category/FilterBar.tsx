import { Button } from "@/components/ui/Button";
import styles from "./FilterBar.module.css";

/** DS-STUB: Filter Panel organism not in DS yet — trigger only */
export function FilterBar() {
  return (
    <div className={`layout-container ${styles.root}`} data-ds-stub="true">
      <Button styleVariant="Secondary" aria-haspopup="dialog">
        Filter
      </Button>
    </div>
  );
}
