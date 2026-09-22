#!/usr/bin/env node
/**
 * Fails if the 2024 Foundations kit re-enters consumer code.
 * Live language is Inter, Space Mono, cool bone. This file is excluded
 * from the scan so the needles can be written in the clear.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const skipDirs = new Set(["node_modules", ".next"]);
const skipFiles = new Set(["scripts/check-visual-residue.mjs"]);
const skipPrefixes = ["emails/export/"];

const needles = [
  "Source Serif",
  "Source_Serif",
  "source-serif",
  "Questrial",
  "questrial",
  "Canela",
  "Sohne",
  "F5F2ED",
  "f5f2ed",
  "--font-serif",
  "--font-questrial",
  "--peptide-gold",
  "--peptide-direction",
  "--peptide-category",
  "--peptide-petal",
];

const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(root, full);
    if (skipFiles.has(rel) || skipPrefixes.some((p) => rel.startsWith(p))) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (skipDirs.has(name) || name.startsWith(".")) continue;
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|css|html)$/.test(name)) continue;
    const text = readFileSync(full, "utf8");
    for (const needle of needles) {
      if (text.includes(needle)) {
        hits.push(`${rel}: ${needle}`);
      }
    }
  }
}

walk(root);

if (hits.length) {
  console.error("Foundations residue in consumer code:");
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}

console.log("No Foundations residue in web/");
