"use client";

import { useMemo } from "react";
import { evalDependency } from "@/lib/prescriberx/build-intake-payload";
import {
  FieldType,
  isChipSearch,
  isDisplayOnly,
  isFileType,
} from "@/lib/prescriberx/field-types";
import type { SchemaField } from "@/lib/prescriberx/schema-types";
import styles from "./IntakeFields.module.css";

type Props = {
  field: SchemaField;
  values: Record<string, unknown>;
  onChange: (slug: string, value: unknown) => void;
  onFile: (slug: string, file: File | null) => void;
  error?: string;
};

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 5.2 4.1 7.3 8 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FieldShell({
  field,
  error,
  children,
}: {
  field: SchemaField;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`f-${field.slug}`}>
        {field.label}
        {field.is_required ? <span className={styles.req}>Required</span> : null}
      </label>
      {field.help_text ? <p className={styles.help}>{field.help_text}</p> : null}
      {children}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

function ChoiceCard({
  name,
  label,
  checked,
  type = "radio",
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  type?: "radio" | "checkbox";
  onSelect: () => void;
}) {
  return (
    <label
      className={`${styles.choiceCard} ${checked ? styles.choiceCardSelected : ""}`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onSelect}
      />
      <span className={styles.choiceCardLabel}>{label}</span>
      <span className={styles.choiceMark} aria-hidden>
        <CheckIcon />
      </span>
    </label>
  );
}

function ChoiceChip({
  name,
  label,
  checked,
  type = "checkbox",
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  type?: "radio" | "checkbox";
  onSelect: () => void;
}) {
  return (
    <label
      className={`${styles.choiceChip} ${checked ? styles.choiceChipSelected : ""}`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onSelect}
      />
      {checked ? (
        <span aria-hidden>
          <CheckIcon />
        </span>
      ) : null}
      <span>{label}</span>
    </label>
  );
}

export function IntakeField({ field, values, onChange, onFile, error }: Props) {
  const type = Number(field.field_type);
  const value = values[field.slug];

  if (!evalDependency(field.depends_on, values)) return null;
  if (isDisplayOnly(type)) {
    if (type === FieldType.SECTION_HEADER) {
      return <h3 className={styles.section}>{field.label}</h3>;
    }
    if (type === FieldType.BMI) {
      const height = values.vital_height as
        | { feet?: number; inches?: number; total?: number }
        | number
        | undefined;
      const weight = Number(values.vital_weight);
      let inches = 0;
      if (typeof height === "number") inches = height;
      else if (height && typeof height === "object") {
        inches =
          typeof height.total === "number"
            ? height.total
            : Number(height.feet ?? 0) * 12 + Number(height.inches ?? 0);
      }
      const bmi =
        inches > 0 && weight > 0
          ? ((weight / (inches * inches)) * 703).toFixed(1)
          : "—";
      return (
        <div className={styles.field}>
          <p className={styles.label}>{field.label}</p>
          <p className={styles.bmi}>{bmi}</p>
        </div>
      );
    }
    return null;
  }

  if (type === FieldType.TEXTAREA) {
    return (
      <FieldShell field={field} error={error}>
        <textarea
          id={`f-${field.slug}`}
          className={styles.input}
          rows={4}
          placeholder={field.placeholder ?? ""}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.slug, e.target.value)}
        />
      </FieldShell>
    );
  }

  if (type === FieldType.YES_NO) {
    const opts = [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ];
    return (
      <FieldShell field={field} error={error}>
        <div className={styles.choiceGrid} role="radiogroup" aria-label={field.label}>
          {opts.map((opt) => (
            <ChoiceCard
              key={opt.value}
              name={field.slug}
              label={opt.label}
              checked={String(value ?? "") === opt.value}
              onSelect={() => onChange(field.slug, opt.value)}
            />
          ))}
        </div>
      </FieldShell>
    );
  }

  if (
    type === FieldType.SELECT ||
    type === FieldType.RADIO_GROUP ||
    type === FieldType.RADIO_BUTTONS
  ) {
    const opts = field.options ?? [];
    const useChips =
      opts.length >= 5 && opts.every((o) => String(o.label).length <= 28);
    return (
      <FieldShell field={field} error={error}>
        <div
          className={useChips ? styles.choiceChipRow : styles.choiceGrid}
          role="radiogroup"
          aria-label={field.label}
        >
          {opts.map((opt) =>
            useChips ? (
              <ChoiceChip
                key={opt.value}
                name={field.slug}
                type="radio"
                label={opt.label}
                checked={String(value ?? "") === String(opt.value)}
                onSelect={() => onChange(field.slug, opt.value)}
              />
            ) : (
              <ChoiceCard
                key={opt.value}
                name={field.slug}
                label={opt.label}
                checked={String(value ?? "") === String(opt.value)}
                onSelect={() => onChange(field.slug, opt.value)}
              />
            ),
          )}
        </div>
      </FieldShell>
    );
  }

  if (type === FieldType.CHECKBOX_GROUP || type === FieldType.MULTISELECT) {
    const opts = field.options ?? [];
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const useChips =
      opts.length >= 4 && opts.every((o) => String(o.label).length <= 28);
    return (
      <FieldShell field={field} error={error}>
        <div className={useChips ? styles.choiceChipRow : styles.choiceGrid}>
          {opts.map((opt) => {
            const on = selected.includes(String(opt.value));
            const toggle = () => {
              const next = on
                ? selected.filter((v) => v !== String(opt.value))
                : [...selected, String(opt.value)];
              onChange(field.slug, next);
            };
            return useChips ? (
              <ChoiceChip
                key={opt.value}
                name={field.slug}
                label={opt.label}
                checked={on}
                onSelect={toggle}
              />
            ) : (
              <ChoiceCard
                key={opt.value}
                name={field.slug}
                type="checkbox"
                label={opt.label}
                checked={on}
                onSelect={toggle}
              />
            );
          })}
        </div>
      </FieldShell>
    );
  }

  if (type === FieldType.HEIGHT) {
    const current =
      value && typeof value === "object"
        ? (value as { feet?: number; inches?: number })
        : { feet: 0, inches: 0 };
    return (
      <FieldShell field={field} error={error}>
        <div className={styles.heightRow}>
          <input
            id={`f-${field.slug}`}
            className={styles.input}
            type="number"
            min={0}
            max={8}
            placeholder="Feet"
            value={current.feet ?? ""}
            onChange={(e) =>
              onChange(field.slug, {
                ...current,
                feet: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
          <input
            className={styles.input}
            type="number"
            min={0}
            max={11}
            placeholder="Inches"
            value={current.inches ?? ""}
            onChange={(e) =>
              onChange(field.slug, {
                ...current,
                inches: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>
      </FieldShell>
    );
  }

  if (type === FieldType.ADDRESS) {
    const addr =
      value && typeof value === "object"
        ? (value as Record<string, string>)
        : {};
    const set = (key: string, v: string) =>
      onChange(field.slug, { ...addr, [key]: v });
    return (
      <FieldShell field={field} error={error}>
        <div className={styles.stack}>
          <input
            className={styles.input}
            placeholder="Street"
            value={addr.street ?? addr.line1 ?? ""}
            onChange={(e) => set("street", e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="City"
            value={addr.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
          />
          <div className={styles.heightRow}>
            <input
              className={styles.input}
              placeholder="State (NY)"
              maxLength={2}
              autoComplete="address-level1"
              value={addr.state ?? ""}
              onChange={(e) =>
                set("state", e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())
              }
            />
            <input
              className={styles.input}
              placeholder="ZIP (11201 or 11201-1234)"
              maxLength={10}
              autoComplete="postal-code"
              inputMode="numeric"
              value={addr.zip ?? addr.postal_code ?? ""}
              onChange={(e) => set("zip", e.target.value)}
            />
          </div>
        </div>
      </FieldShell>
    );
  }

  if (isChipSearch(type)) {
    return (
      <ClinicalListField
        field={field}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (isFileType(type)) {
    return (
      <FieldShell field={field} error={error}>
        <input
          id={`f-${field.slug}`}
          className={styles.file}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => onFile(field.slug, e.target.files?.[0] ?? null)}
        />
      </FieldShell>
    );
  }

  const inputType =
    type === FieldType.EMAIL
      ? "email"
      : type === FieldType.PASSWORD
        ? "password"
        : type === FieldType.PHONE
          ? "tel"
          : type === FieldType.DATE || type === FieldType.CALENDAR
            ? "date"
            : type === FieldType.NUMBER ||
                type === FieldType.WEIGHT ||
                type === FieldType.HEART_RATE ||
                type === FieldType.CURRENCY
              ? "number"
              : "text";

  return (
    <FieldShell field={field} error={error}>
      <input
        id={`f-${field.slug}`}
        className={styles.input}
        type={inputType}
        placeholder={field.placeholder ?? ""}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
        value={value == null ? "" : String(value)}
        onChange={(e) =>
          onChange(
            field.slug,
            inputType === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
    </FieldShell>
  );
}

function ClinicalListField({
  field,
  value,
  onChange,
  error,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (slug: string, value: unknown) => void;
  error?: string;
}) {
  const items = useMemo(() => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object" && "name" in item) {
            return String((item as { name: unknown }).name ?? "").trim();
          }
          return String(item ?? "").trim();
        })
        .filter(Boolean);
    }
    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [] as string[];
  }, [value]);

  const isNone = items.length === 1 && items[0].toLowerCase() === "none";
  const textValue = isNone ? "" : items.join(", ");

  return (
    <FieldShell field={field} error={error}>
      <div className={styles.stack}>
        <ChoiceChip
          name={`${field.slug}-none`}
          label="None"
          checked={isNone}
          onSelect={() => {
            if (isNone) onChange(field.slug, []);
            else onChange(field.slug, ["None"]);
          }}
        />
        <input
          id={`f-${field.slug}`}
          className={styles.input}
          type="text"
          disabled={isNone}
          placeholder={
            field.placeholder || "Type entries separated by commas"
          }
          value={textValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw.trim()) {
              onChange(field.slug, []);
              return;
            }
            onChange(
              field.slug,
              raw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            );
          }}
        />
      </div>
    </FieldShell>
  );
}
