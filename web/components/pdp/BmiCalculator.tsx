"use client";

import { FormEvent, useMemo, useState } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import styles from "./BmiCalculator.module.css";

type BmiCalculatorProps = {
  title: string;
  body: string;
  disclaimer: string;
  /** Category lifestyle still. Falls back to the default transformation plate. */
  mediaSrc?: string;
};

function computeBmi(feet: number, inches: number, pounds: number) {
  const totalInches = feet * 12 + inches;
  if (totalInches <= 0 || pounds <= 0) return null;
  const value = (pounds / (totalInches * totalInches)) * 703;
  return Math.round(value * 10) / 10;
}

function categoryFor(bmi: number | null) {
  if (bmi == null) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy Weight";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}

/** Progressive widths match the reference chart (shortest → longest). */
const BANDS = [
  { category: "Underweight", range: "< 18.5", width: "52%" },
  { category: "Healthy Weight", range: "18.5–24.9", width: "64%" },
  { category: "Overweight", range: "25–29.9", width: "76%" },
  { category: "Obesity", range: "30+", width: "88%" },
] as const;

export function BmiCalculator({ title, body, disclaimer, mediaSrc }: BmiCalculatorProps) {
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [pounds, setPounds] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const activeCategory = useMemo(() => categoryFor(bmi), [bmi]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBmi(
      computeBmi(Number(feet) || 0, Number(inches) || 0, Number(pounds) || 0),
    );
  }

  return (
    <section className={styles.root} aria-labelledby="bmi-title">
      <div className={styles.bg} aria-hidden>
        <MarketingImage
          className={styles.bgPhoto}
          src={mediaSrc ?? "/landing/category/hero-transformation.png"}
          alt=""
          sizes="100vw"
        />
      </div>
      <div className={styles.frame}>
        <div className={styles.stage}>
          <form className={styles.card} onSubmit={onSubmit}>
            <div className={styles.cardIntro}>
              <h2 id="bmi-title" className={styles.title}>
                {title}
              </h2>
              <p className={styles.body}>{body}</p>
            </div>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="bmi-feet">
                  Height
                </label>
                <div className={styles.row}>
                  <input
                    id="bmi-feet"
                    className={styles.input}
                    inputMode="numeric"
                    placeholder="Feet"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    required
                  />
                  <input
                    id="bmi-inches"
                    className={styles.input}
                    inputMode="numeric"
                    placeholder="Inches"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    required
                    aria-label="Inches"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="bmi-pounds">
                  Weight
                </label>
                <input
                  id="bmi-pounds"
                  className={styles.input}
                  inputMode="numeric"
                  placeholder="Pounds"
                  value={pounds}
                  onChange={(e) => setPounds(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className={styles.submit}>
              Calculate
            </Button>
            <p className={styles.disclaimer}>{disclaimer}</p>
          </form>
          <div className={styles.results} aria-live="polite">
            <p className={styles.resultsLabel}>Your BMI</p>
            <p className={styles.resultsValue}>{bmi == null ? "0" : bmi}</p>
            <ul className={styles.bands}>
              {BANDS.map((band) => (
                <li
                  key={band.category}
                  className={[
                    styles.band,
                    activeCategory === band.category ? styles.bandActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span
                    className={styles.bar}
                    style={{ width: band.width }}
                    aria-hidden
                  >
                    <span className={styles.barLabel}>{band.category}</span>
                  </span>
                  <span className={styles.range}>{band.range}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
