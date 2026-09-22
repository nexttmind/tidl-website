import type { ReactNode } from "react";
import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./ImageHeader.module.css";

type ImageHeaderProps = {
  mediaSlot: string;
  alt?: string;
  /** Optional slot kept for API stability; prefer SiteHeader as a sibling above. */
  children?: ReactNode;
};

/** Full-bleed image header band. */
export function ImageHeader({ mediaSlot, alt = "TIDL", children }: ImageHeaderProps) {
  return (
    <div className={styles.root}>
      {children}
      <MediaSlot
        id={mediaSlot}
        aspect="21 / 9"
        tone="dark"
        label={alt}
        className={styles.media}
      />
    </div>
  );
}
