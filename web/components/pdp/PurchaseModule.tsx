"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { MarketingImage } from "@/components/media/MarketingImage";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { shopCatalogItem } from "@/components/home/shop-catalog";
import { bloomStyle } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import { optEntry } from "@/lib/media/opt-manifest";
import { CATALOG_VIAL_REV } from "@/content/fixtures/catalog";
import {
  MONTHLY_CANCEL_COPY,
  PAYMENT_AFTER_REVIEW,
  defaultLaunchForm,
  defaultLaunchMolecule,
  formCopy,
  LAUNCH_PER_KIT_PRICE,
  formatUsd,
  launchFormLabel,
  launchFormsFor,
  launchMoleculesFor,
  launchPage,
  launchMonthsFor,
  launchPageExists,
  launchSku,
  moleculeCopy,
  orderAddOns,
  planCardSku,
  planSaveLabel,
  purchaseHref,
  retestUnitPrice,
  type LaunchBilling,
  type LaunchForm,
  type LaunchMolecule,
} from "@/content/pdp/launch-pricing";
import {
  whatsIncluded,
} from "@/content/pdp/whats-included";
import { usePdpForm } from "./PdpFormContext";
import styles from "./PurchaseModule.module.css";

export type PurchaseModuleProps = {
  catalogId: string;
  ctaHref: string;
  onFormChange?: (form: LaunchForm) => void;
};

const BLOOD_PANEL_SRC = `/landing/shop/catalog/kits/blood-panel.png?v=${CATALOG_VIAL_REV}`;

function formThumb(catalogId: string, form: LaunchForm): string | null {
  const catalog = shopCatalogItem(catalogId);
  if (form === "vial") return catalog?.vialSrc ?? null;
  if (form === "vial-pen") return catalog?.penLockupSrc ?? catalog?.vialSrc ?? null;
  if (form === "capsule") return catalog?.pillSrc ?? null;
  if (form === "kit") return BLOOD_PANEL_SRC;
  return null;
}

function formLabel(catalogId: string, form: LaunchForm): string {
  return launchFormLabel(catalogId, form);
}

function formHint(form: LaunchForm): string {
  return formCopy(form).hint;
}

const ADDON_FRAME: Record<"panel" | "b12" | "lipo-c" | "methylene-blue", string> = {
  panel: `/landing/shop/catalog/addon-frames/blood-panel.png?v=${CATALOG_VIAL_REV}`,
  b12: `/landing/shop/catalog/addon-frames/b12.png?v=${CATALOG_VIAL_REV}`,
  "lipo-c": `/landing/shop/catalog/addon-frames/lipo-c.png?v=${CATALOG_VIAL_REV}`,
  "methylene-blue": `/landing/shop/catalog/addon-frames/methylene-blue.png?v=${CATALOG_VIAL_REV}`,
};

function addOnThumb(id: "panel" | "b12" | "lipo-c" | "methylene-blue"): string {
  return ADDON_FRAME[id];
}

const FIELD_STOPS = [0, 0.24038, 0.47596, 0.64426, 0.81734, 1] as const;

function fieldChannel(value: string): [number, number, number] | null {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!hex) return null;
  const n = Number.parseInt(hex[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Field wash at the button, from the same six stops as the catalog gradient. */
function fieldInk(colors: readonly [number, number, number][], t: number): string {
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < FIELD_STOPS.length - 2 && x > FIELD_STOPS[i + 1]) i += 1;
  const span = FIELD_STOPS[i + 1] - FIELD_STOPS[i];
  const u = span === 0 ? 0 : (x - FIELD_STOPS[i]) / span;
  const from = colors[i];
  const to = colors[i + 1];
  const mixed = from.map((channel, k) => Math.round(channel + ((to?.[k] ?? channel) - channel) * u));
  return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`;
}

function FormThumb({
  catalogId,
  form,
}: {
  catalogId: string;
  form: LaunchForm;
}) {
  const catalog = shopCatalogItem(catalogId);
  if (form === "vial" && catalog) {
    return (
      <span className={`${styles.thumb} ${styles.thumbBloom}`} aria-hidden>
        <span
          className={`${shop.bloomFrame} ${shop.bloomSeated}`}
          data-bloom={catalog.id}
          data-kind={catalog.kind}
          style={bloomStyle(catalog.bloom)}
        >
          <ShopBloomPair vialSrc={catalog.vialSrc} bloomSrc={catalog.bloomSrc} alt="" />
        </span>
      </span>
    );
  }
  const thumb = formThumb(catalogId, form);
  if (!thumb) return null;
  const lockup =
    form === "vial-pen"
      ? (catalog?.lockupVial ?? { x: 0.5, y: 0.64 })
      : undefined;
  const lockupEntry = form === "vial-pen" ? optEntry(thumb) : undefined;
  const lockupWide =
    lockupEntry != null && lockupEntry.width / lockupEntry.height >= 0.85;
  return (
    <span
      className={form === "vial-pen" ? `${styles.thumb} ${styles.thumbLockupSeat}` : styles.thumb}
      data-lockup-wide={lockupWide ? "" : undefined}
      style={
        lockup && !lockupWide
          ? ({
              "--lockup-vial-x": String(lockup.x),
              "--lockup-vial-y": String(lockup.y),
            } as CSSProperties)
          : undefined
      }
      aria-hidden
    >
      <MarketingImage
        className={form === "vial-pen" ? styles.thumbLockup : styles.thumbImg}
        src={thumb}
        alt=""
        sizes={form === "vial-pen" ? "220px" : "120px"}
      />
    </span>
  );
}

export function PurchaseModule({
  catalogId,
  ctaHref,
  onFormChange,
}: PurchaseModuleProps) {
  const consentId = useId();
  const includedId = useId();
  const addOnId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pdpForm = usePdpForm();
  const page = launchPage(catalogId);
  const molecules = page?.kind === "bundle" ? [] : launchMoleculesFor(catalogId);
  const bundleComponents = page?.kind === "bundle" ? page.components : [];
  const [molecule, setMoleculeState] = useState<LaunchMolecule | undefined>(() =>
    defaultLaunchMolecule(catalogId),
  );
  const forms = launchFormsFor(catalogId, molecule);
  const showForm = page?.formControl !== false && forms.length > 1;
  const [form, setLocalForm] = useState<LaunchForm>(() =>
    defaultLaunchForm(catalogId, defaultLaunchMolecule(catalogId)),
  );
  const extras = orderAddOns(catalogId, form);
  const setMolecule = (next: LaunchMolecule) => {
    setMoleculeState(next);
    if (pdpForm?.catalogId === catalogId) pdpForm.setMolecule(next);
    const nextForms = launchFormsFor(catalogId, next);
    setLocalForm((current) =>
      nextForms.includes(current) ? current : defaultLaunchForm(catalogId, next),
    );
  };
  const setForm = (next: LaunchForm) => {
    setLocalForm(next);
    if (pdpForm?.catalogId === catalogId) pdpForm.setForm(next);
    onFormChange?.(next);
  };
  const singleRefill = form === "kit";
  const monthsList = singleRefill ? [1] : launchMonthsFor(catalogId, form, molecule);
  const [months, setMonths] = useState(() => {
    const opening = defaultLaunchForm(catalogId, defaultLaunchMolecule(catalogId));
    const available = launchMonthsFor(catalogId, opening, defaultLaunchMolecule(catalogId));
    if (opening === "kit") return 1;
    return available.includes(3) ? 3 : (available[0] ?? 1);
  });
  const [billing, setBilling] = useState<LaunchBilling>("monthly");
  const [panelOn, setPanelOn] = useState(false);
  const [b12On, setB12On] = useState(false);
  const [lipoOn, setLipoOn] = useState(false);
  const [methyleneOn, setMethyleneOn] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (pdpForm?.catalogId === catalogId) {
      pdpForm.setForm(form);
      if (molecule) pdpForm.setMolecule(molecule);
    }
  }, [catalogId, form, molecule, pdpForm]);

  useEffect(() => {
    const nextMolecule = defaultLaunchMolecule(catalogId);
    setMoleculeState(nextMolecule);
    setLocalForm(defaultLaunchForm(catalogId, nextMolecule));
    setB12On(false);
    setLipoOn(false);
  }, [catalogId]);

  useEffect(() => {
    if (!window.matchMedia("(width < 1025px)").matches) return;
    const molecule = defaultLaunchMolecule(catalogId);
    const opening = defaultLaunchForm(catalogId, molecule);
    if (opening === "kit") return;
    const available = launchMonthsFor(catalogId, opening, molecule);
    if (available.includes(1)) setMonths(1);
  }, [catalogId]);

  useEffect(() => {
    if (form === "kit") {
      setMonths(1);
      return;
    }
    const available = launchMonthsFor(catalogId, form, molecule);
    const narrow = window.matchMedia("(width < 1025px)").matches;
    setMonths((current) => {
      if (available.includes(current)) return current;
      if (narrow && available.includes(1)) return 1;
      return available.includes(3) ? 3 : (available[0] ?? 1);
    });
  }, [catalogId, form, molecule]);

  useEffect(() => {
    if (months < 3) {
      setBilling("one_time");
      setConsent(false);
      return;
    }
    if (!window.matchMedia("(width < 1025px)").matches) return;
    setBilling("monthly");
    setConsent(false);
  }, [months]);

  const sku = useMemo(
    () =>
      launchSku(catalogId, form, months, billing, molecule) ??
      planCardSku(catalogId, form, months, molecule),
    [billing, catalogId, form, molecule, months],
  );
  const monthlySku = useMemo(
    () =>
      months >= 3 ? launchSku(catalogId, form, months, "monthly", molecule) : undefined,
    [catalogId, form, molecule, months],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const narrow = window.matchMedia("(width < 1025px)");
    const paint = () => {
      const face = root.querySelector<HTMLElement>("[data-assessment]");
      const link = face?.closest<HTMLElement>("a,button");
      if (!face || !link) return;
      if (!narrow.matches) {
        link.style.removeProperty("color");
        link.style.removeProperty("-webkit-text-fill-color");
        face.style.removeProperty("color");
        face.style.removeProperty("-webkit-text-fill-color");
        return;
      }
      const field = root.closest("section")?.querySelector<HTMLElement>("[data-catalog-field]");
      if (!field) return;
      const source = getComputedStyle(field);
      const colors = [1, 2, 3, 4, 5, 6].map((i) =>
        fieldChannel(source.getPropertyValue(`--tile-${i}`)),
      );
      if (colors.some((channel) => channel == null)) return;
      const fieldBox = field.getBoundingClientRect();
      const buttonBox = link.getBoundingClientRect();
      const y =
        fieldBox.height > 0
          ? (buttonBox.top + buttonBox.height / 2 - fieldBox.top) / fieldBox.height
          : 0.5;
      const ink = fieldInk(colors as [number, number, number][], y);
      for (const node of [link, face]) {
        node.style.color = ink;
        node.style.setProperty("-webkit-text-fill-color", ink);
      }
    };
    paint();
    narrow.addEventListener("change", paint);
    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      narrow.removeEventListener("change", paint);
      window.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
    };
  }, []);

  if (!launchPageExists(catalogId) || !sku || sku.price_one_time == null) {
    return null;
  }

  const panelPrice = sku.testing_add_on_1_month;
  const included = whatsIncluded(catalogId, form, sku);
  const showPanelControl = months === 1 && panelPrice != null;
  const addOnPanel = showPanelControl && panelOn;
  const monthlyLive = monthlySku?.monthly_installment != null;
  const usingMonthly = billing === "monthly" && monthlyLive;
  const offered = new Set(extras.map((item) => item.id));
  const b12Selected = b12On && offered.has("b12");
  const lipoSelected = lipoOn && offered.has("lipo-c");
  const methyleneSelected = methyleneOn && offered.has("methylene-blue");
  const extraMonthly = extras.reduce((sum, item) => {
    const on =
      item.id === "b12" ? b12Selected : item.id === "lipo-c" ? lipoSelected : methyleneSelected;
    return on ? sum + item.monthly : 0;
  }, 0);
  const chargeToday =
    (usingMonthly ? (sku.monthly_installment ?? 0) : sku.price_one_time) +
    (addOnPanel ? panelPrice : 0) +
    (usingMonthly ? extraMonthly : extraMonthly * months);
  const future: string[] = [];
  if (usingMonthly && sku.monthly_installment != null && sku.monthly_billing_total != null) {
    future.push(
      `${months} months at ${formatUsd(sku.monthly_installment)} per month. ${formatUsd(sku.monthly_billing_total)} total.`,
    );
  }
  if (form === "kit") {
    if (sku.retest_kits > 0 && sku.price_one_time != null) {
      future.push(
        `Each retest is ${formatUsd(sku.price_one_time)}, billed the week it ships.`,
      );
    }
    if (sku.retest_kits > 0 && sku.total_spend_over_pack != null) {
      future.push(`Total ${formatUsd(sku.total_spend_over_pack)}.`);
    }
  } else if (sku.retest_kits > 0) {
    const unit = retestUnitPrice(sku);
    future.push(
      `${sku.retest_kits} retest${sku.retest_kits === 1 ? "" : "s"} billed at ${unit == null ? "" : formatUsd(unit)} when ${sku.retest_kits === 1 ? "it ships" : "they ship"}.`,
    );
  }
  if (addOnPanel) {
    future.push("Baseline panel results in your portal in about 72 hours.");
  }

  const href = purchaseHref(ctaHref, sku, {
    panel: addOnPanel,
    b12: b12Selected,
    lipoC: lipoSelected,
    methylene: methyleneSelected,
    form,
    molecule,
  });
  const buttonOn = !usingMonthly || consent;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-purchase=""
      data-catalog-tokens={catalogId || undefined}
    >
      {bundleComponents.length > 0 ? (
        <fieldset className={styles.block} data-bundle-molecules="">
          <legend className={styles.label}>Molecules</legend>
          <div className={styles.formCards}>
            {bundleComponents.map((id) => {
              const item = shopCatalogItem(id);
              if (!item) return null;
              return (
                <div key={id} className={`${styles.form} ${styles.formStatic}`}>
                  <span className={styles.formFace}>
                    <FormThumb catalogId={id} form="vial" />
                    <span className={styles.formTileTitle} data-form-title="">
                      {item.label}
                    </span>
                  </span>
                  <span className={styles.formHint} data-form-hint="" />
                </div>
              );
            })}
          </div>
        </fieldset>
      ) : molecules.length > 1 ? (
        <fieldset className={styles.block}>
          <legend className={styles.label}>Molecule</legend>
          <div className={styles.formCards} role="group">
            {molecules.map((option) => {
              const on = molecule === option;
              const copy = moleculeCopy(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={on ? styles.formOn : styles.form}
                  aria-label={copy.label}
                  aria-pressed={on}
                  onClick={() => setMolecule(option)}
                >
                  <span className={styles.formFace}>
                    <FormThumb catalogId={option} form={form} />
                    <span className={styles.formTileTitle} data-form-title="">
                      {copy.label}
                    </span>
                  </span>
                  <span className={styles.formHint} data-form-hint="">
                    {copy.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {showForm ? (
        <fieldset className={styles.block}>
          <legend className={styles.label}>Form</legend>
          <div className={styles.formCards} role="group">
            {forms.map((option) => {
              const on = form === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={on ? styles.formOn : styles.form}
                  aria-label={formLabel(catalogId, option)}
                  aria-pressed={on}
                  onClick={() => setForm(option)}
                >
                  <span className={styles.formFace}>
                    <FormThumb catalogId={catalogId} form={option} />
                    <span className={styles.formTileTitle} data-form-title="">
                      {formLabel(catalogId, option)}
                    </span>
                  </span>
                  <span className={styles.formHint} data-form-hint="">
                    {formHint(option)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className={styles.block}>
        <legend className={styles.label}>Plan</legend>
        {singleRefill ? (
          <div className={styles.plans} data-single="">
            <div className={styles.planOn}>
              <span className={styles.planMo}>
                {formatUsd(sku.price_one_time)} / refill
              </span>
            </div>
          </div>
        ) : null}
        {singleRefill ? null : (
        <div className={styles.plans}>
          {monthsList.map((term) => {
            const card = planCardSku(catalogId, form, term, molecule);
            if (!card || card.price_one_time == null || card.per_month == null) {
              return null;
            }
            const on = months === term;
            const monthly = term >= 3 ? launchSku(catalogId, form, term, "monthly", molecule) : undefined;
            const mo = monthly?.monthly_installment ?? null;
            const oneMonthPrice = planCardSku(catalogId, form, 1, molecule)?.price_one_time;
            const includedPanel = card.baseline_kit_priced_in ? LAUNCH_PER_KIT_PRICE : 0;
            const save = planSaveLabel(
              oneMonthPrice,
              term,
              card.price_one_time,
              includedPanel,
            );
            return (
              <button
                key={term}
                type="button"
                className={on ? styles.planOn : styles.plan}
                aria-pressed={on}
                onClick={() => setMonths(term)}
              >
                <span className={styles.planTerm}>
                  {card.plan_label ?? `${term} month${term === 1 ? "" : "s"}`}
                </span>
                <span className={styles.planMo}>
                  {mo != null ? `${formatUsd(mo)} /mo` : formatUsd(card.price_one_time)}
                </span>
                {save ? (
                  <span className={styles.planSave} data-save="">
                    {save}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        )}
      </fieldset>

      {monthlyLive ? (
        <fieldset className={styles.block}>
          <legend className={styles.label}>Billing</legend>
          <div className={styles.segments} role="group">
            <button
              type="button"
              className={billing === "monthly" ? styles.segmentOn : styles.segment}
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              <span className={styles.tileFace}>Pay monthly</span>
            </button>
            <button
              type="button"
              className={billing === "one_time" ? styles.segmentOn : styles.segment}
              aria-pressed={billing === "one_time"}
              onClick={() => setBilling("one_time")}
            >
              <span className={styles.tileFace}>Pay up front</span>
            </button>
          </div>
          {usingMonthly &&
          monthlySku?.monthly_installment != null &&
          monthlySku.monthly_billing_total != null ? (
            <div className={styles.monthlyBox}>
              <p>
                {months} months at {formatUsd(monthlySku.monthly_installment)} per month.{" "}
                {formatUsd(monthlySku.monthly_billing_total)} total.
              </p>
              <p>{MONTHLY_CANCEL_COPY}</p>
              <label className={styles.consent} htmlFor={consentId}>
                <input
                  id={consentId}
                  type="checkbox"
                  className={styles.check}
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I agree to a recurring monthly charge for this term. I can cancel before the
                  next charge.
                </span>
              </label>
            </div>
          ) : monthlySku?.monthly_billing_total != null && sku.price_one_time != null ? (
            <p className={styles.hint}>
              Pay up front saves{" "}
              {formatUsd(monthlySku.monthly_billing_total - sku.price_one_time)} versus monthly
              billing on this term.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <fieldset
        className={`${styles.addonBlock} ${styles.includedBlock}`}
        aria-labelledby={includedId}
      >
        <p id={includedId} className={styles.label}>
          What's included
        </p>
        <div className={`${styles.addons} ${styles.includedList}`} role="list">
          {included.rows.map((row) => (
            <div key={row.id} className={styles.addon} role="listitem">
              <span className={`${styles.addonThumb} ${styles.tileThumb}`} aria-hidden>
                <MarketingImage
                  className={
                    row.cover
                      ? `${styles.addonFrame} ${styles.addonCover}`
                      : row.contain
                        ? `${styles.addonFrame} ${styles.addonContain}`
                        : styles.addonFrame
                  }
                  src={row.thumb}
                  alt=""
                  sizes="48px"
                />
              </span>
              <span>
                <span className={styles.panelTitle}>{row.title}</span>
                <span className={styles.hint}>{row.detail}</span>
              </span>
            </div>
          ))}
        </div>
        <p className={styles.includedShip}>{included.shipping}</p>
      </fieldset>

      {showPanelControl || extras.length > 0 ? (
        <fieldset
          className={`${styles.addonBlock} ${styles.includedBlock}`}
          aria-labelledby={addOnId}
        >
          <p id={addOnId} className={styles.label}>
            Add to this order
          </p>
          <div className={styles.addons}>
            {showPanelControl && panelPrice != null ? (
              <label className={styles.addon}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={panelOn}
                  onChange={(event) => setPanelOn(event.target.checked)}
                />
                <span className={`${styles.addonThumb} ${styles.tileThumb}`} aria-hidden>
                  <MarketingImage
                    className={styles.addonFrame}
                    src={addOnThumb("panel")}
                    alt=""
                    sizes="48px"
                  />
                </span>
                <span>
                  <span className={styles.panelTitle}>
                    Baseline blood panel · {formatUsd(panelPrice)}
                  </span>
                  <span className={styles.hint}>
                    Results in your portal in about 72 hours and a provider message reviewing
                    them.
                  </span>
                </span>
              </label>
            ) : null}
            {extras.map((item) => {
              const on =
                item.id === "b12" ? b12Selected : item.id === "lipo-c" ? lipoSelected : methyleneSelected;
              const setOn =
                item.id === "b12" ? setB12On : item.id === "lipo-c" ? setLipoOn : setMethyleneOn;
              const src = addOnThumb(item.id);
              return (
                <label key={item.id} className={styles.addon}>
                  <input
                    type="checkbox"
                    className={styles.check}
                    checked={on}
                    onChange={(event) => setOn(event.target.checked)}
                  />
                  {src ? (
                    <span className={`${styles.addonThumb} ${styles.tileThumb}`} aria-hidden>
                      <MarketingImage
                        className={styles.addonFrame}
                        src={src}
                        alt=""
                        sizes="48px"
                      />
                    </span>
                  ) : null}
                  <span>
                    <span className={styles.panelTitle}>
                      {item.label} · {formatUsd(item.monthly)} a month
                    </span>
                    <span className={styles.hint}>
                      Added to each month of this order after clinical review.
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className={`${styles.summary} ${styles.summaryTile}`} aria-live="polite">
        <p className={styles.summaryLabel}>Charge today</p>
        <p className={styles.summaryPrice}>{formatUsd(chargeToday)}</p>
        {future.map((line) => (
          <p key={line} className={styles.future}>
            {line}
          </p>
        ))}
        <p className={styles.note}>{PAYMENT_AFTER_REVIEW}</p>
      </div>

      <Button href={href} className={styles.cta} disabled={!buttonOn}>
        <span className={styles.tileFace} data-assessment="">
          Start your assessment
        </span>
      </Button>
      {!buttonOn ? (
        <p className={styles.hint}>Tick the monthly billing consent to continue.</p>
      ) : null}
    </div>
  );
}
