import type { CSSProperties } from "react";
import { optCssImageSet } from "@/lib/media/opt-manifest";

/** Catalog card blooms. lipo-c shares the GLP 1 plate art. */
const CATALOG_BLOOMS: Record<string, string> = {
  tirzepatide: "/landing/catalog/blooms/tirzepatide.webp",
  semaglutide: "/landing/catalog/blooms/semaglutide.webp",
  testosterone: "/landing/catalog/blooms/testosterone.webp",
  "glp-1": "/landing/catalog/blooms/glp-1.webp",
  nad: "/landing/catalog/blooms/nad.webp",
  sermorelin: "/landing/catalog/blooms/sermorelin.webp",
  tesamorelin: "/landing/catalog/blooms/tesamorelin.webp",
  glutathione: "/landing/catalog/blooms/glutathione.webp",
  "methylene-blue": "/landing/catalog/blooms/methylene-blue.webp",
  "at-home-lab": "/landing/catalog/blooms/at-home-lab.webp",
  "pain-relief": "/landing/catalog/blooms/pain-relief.webp",
  "lipo-c": "/landing/catalog/blooms/glp-1.webp",
};

/** Plate + bloom CSS vars from the optimizer, never the camera original. */
export function catalogPlateStyle(id: string): CSSProperties {
  const style: Record<string, string> = {
    "--plate": optCssImageSet(`/landing/catalog/plates/${id}.jpg`, 800),
  };
  const bloom = CATALOG_BLOOMS[id];
  if (bloom) style["--bloom-src"] = optCssImageSet(bloom, 400);
  return style as CSSProperties;
}
