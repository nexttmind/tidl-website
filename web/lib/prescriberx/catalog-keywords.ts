/**
 * Curated ThemeId → sandbox catalog name keywords.
 * Longest / most specific keywords first. Consumer titles stay goal-framed;
 * keywords are ops-only for matching PrescribeRx catalog rows.
 */

import type { ThemeId } from "@/content/brand/peptide-identity";

export const CATALOG_KEYWORDS: Partial<
  Record<ThemeId, readonly string[]>
> = {
  "weight-loss": ["tirzepatide", "semaglutide", "glp"],
  transformation: ["tirzepatide", "semaglutide", "glp"],
  "mens-health": ["testosterone cypionate", "testosterone 200", "testosterone"],
  // Sandbox has no sildenafil/tadalafil; sexual path uses PT-141 / oxytocin peptides.
  "sexual-health": ["pt-141", "pt141", "oxytocin", "sildenafil", "tadalafil"],
  // Sandbox has no estradiol/progesterone; closest hormone row is DHEA cream.
  "womens-balance": ["dhea", "estradiol", "progesterone", "biest", "estriol"],
  "recovery-performance": ["bpc-157", "bpc", "tb-500"],
  "skin-hair": ["ghk-cu", "ghk", "bpc-157"],
  athlete: ["tb-500", "bpc-157", "bpc"],
  executive: ["nad+", "nad ", "mots-c"],
  creative: ["nad+", "nad ", "semax"],
  legacy: ["tesamorelin", "sermorelin", "nad+"],
  parents: ["bpc-157", "nad+", "nad "],
  traveler: ["nad+", "nad ", "bpc-157"],
};
