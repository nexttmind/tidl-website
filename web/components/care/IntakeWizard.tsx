"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IntakeField } from "@/components/care/IntakeFields";
import {
  resolveClinicalEntry,
  type ClinicalEntry,
} from "@/content/clinical/entry-map";
import { INTAKE_CONSENTS } from "@/lib/prescriberx/consents";
import {
  evalDependency,
  normalizeIntakeAddress,
} from "@/lib/prescriberx/build-intake-payload";
import {
  buildPatientSteps,
  isOpeningConcernsStep,
  writeIntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import { FieldType, isDisplayOnly, isFileType } from "@/lib/prescriberx/field-types";
import { resolveProductIdsForEntry } from "@/lib/prescriberx/product-map";
import type {
  EncounterSchemaData,
  SchemaField,
  SchemaStep,
  UploadedDoc,
} from "@/lib/prescriberx/schema-types";
import styles from "./IntakeWizard.module.css";

type Props = {
  entrySlug: string;
};

const MAX_RAW_BYTES = 12 * 1024 * 1024;
const MAX_ENCODED_BYTES = 6 * 1024 * 1024;
const IMAGE_MAX_EDGE = 1600;

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

function compressImage(file: File): Promise<{ dataUrl: string; mime: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(
        1,
        IMAGE_MAX_EDGE / Math.max(img.width || 1, img.height || 1),
      );
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not prepare the photo"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      resolve({
        dataUrl,
        mime: "image/jpeg",
        filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that photo"));
    };
    img.src = objectUrl;
  });
}

async function fileToUploaded(slug: string, file: File): Promise<UploadedDoc> {
  if (file.size > MAX_RAW_BYTES) {
    throw new Error("That photo is too large. Use a smaller ID photo, then try again.");
  }

  let filename = file.name;
  let mime = file.type || "application/octet-stream";
  let dataUrl: string;

  if (file.type.startsWith("image/")) {
    const compressed = await compressImage(file);
    filename = compressed.filename;
    mime = compressed.mime;
    dataUrl = compressed.dataUrl;
  } else {
    dataUrl = await readFileAsDataUrl(file);
  }

  const base64 = dataUrlToBase64(dataUrl);
  if (base64.length > MAX_ENCODED_BYTES) {
    throw new Error("That photo is still too large after shrink. Take a closer, smaller photo.");
  }

  return { slug, filename, mime_type: mime, base64 };
}

function visibleFields(
  step: SchemaStep,
  values: Record<string, unknown>,
): SchemaField[] {
  return (step.fields ?? []).filter((f) => evalDependency(f.depends_on, values));
}

function validateStep(
  step: SchemaStep,
  values: Record<string, unknown>,
  files: Record<string, File | null>,
  consents: string[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step.step_type === 4) {
    for (const c of INTAKE_CONSENTS) {
      if (c.required && !consents.includes(c.key)) {
        errors[c.key] = "Required";
      }
    }
    return errors;
  }

  for (const field of visibleFields(step, values)) {
    const type = Number(field.field_type);
    if (isDisplayOnly(type) || !field.is_required) continue;
    if (isFileType(type)) {
      if (!files[field.slug]) errors[field.slug] = "Upload required";
      continue;
    }
    const value = values[field.slug];
    if (type === FieldType.ADDRESS) {
      const addr = normalizeIntakeAddress(value);
      if (!addr || !addr.street || !addr.city || !addr.zip || !/^[A-Z]{2}$/.test(addr.state)) {
        errors[field.slug] =
          "Enter street, city, 2-letter state, and ZIP.";
      }
      continue;
    }
    const empty =
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        !Array.isArray(value) &&
        Object.values(value as object).every((v) => v === "" || v == null));
    if (empty) errors[field.slug] = "Required";
  }
  return errors;
}

function formatIntakeError(json: {
  message?: string;
  upstream?: { message?: string; errors?: unknown };
}): string {
  const errors = json.upstream?.errors;
  if (errors && typeof errors === "object") {
    const lines = Object.values(errors as Record<string, unknown>)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .map((v) => String(v))
      .filter(Boolean);
    if (lines.length) return lines.join(" ");
  }
  return (
    (typeof json.upstream?.message === "string" && json.upstream.message) ||
    json.message ||
    "Submit failed"
  );
}

export function IntakeWizard({ entrySlug }: Props) {
  const router = useRouter();
  const entry: ClinicalEntry = useMemo(
    () => resolveClinicalEntry(entrySlug),
    [entrySlug],
  );

  const [schema, setSchema] = useState<EncounterSchemaData | null>(null);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [consents, setConsents] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSchema(null);
    setProductIds([]);
    setStepIndex(0);
    setValues({});
    setFiles({});
    setConsents([]);

    void (async () => {
      try {
        const [schemaRes, resolvedProducts] = await Promise.all([
          fetch(
            `/api/prescriberx/encounter-types/${encodeURIComponent(entry.encounterTypeId)}/schema`,
            { headers: { Accept: "application/json" } },
          ),
          resolveProductIdsForEntry(entry),
        ]);
        const json = (await schemaRes.json()) as {
          data?: EncounterSchemaData;
          message?: string;
        };
        if (!schemaRes.ok) {
          throw new Error(json.message || `Schema failed (${schemaRes.status})`);
        }
        const data = json.data;
        if (!data?.steps) throw new Error("Schema missing steps");
        if (!cancelled) {
          setSchema(data);
          setProductIds(resolvedProducts);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entry]);

  const steps = useMemo(
    () => (schema ? buildPatientSteps(schema.steps, entry) : []),
    [schema, entry],
  );
  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  const setValue = useCallback((slug: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [slug]: value }));
  }, []);

  const setFile = useCallback((slug: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [slug]: file }));
  }, []);

  const goNext = async () => {
    if (!step || !schema) return;
    const nextErrors = validateStep(step, values, files, consents);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (!isLast) {
      setStepIndex((i) => i + 1);
      setSubmitError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const uploaded: UploadedDoc[] = [];
      for (const [slug, file] of Object.entries(files)) {
        if (file) uploaded.push(await fileToUploaded(slug, file));
      }

      const res = await fetch("/api/prescriberx/intake", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encounter_type_id: entry.encounterTypeId,
          values,
          consents,
          files: uploaded,
          products: productIds,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: {
          encounter_id?: string;
          encounter_number?: string;
          patient_chart_id?: string;
          user_id?: string;
          id?: string;
        };
        message?: string;
        upstream?: { message?: string; errors?: unknown };
      };

      if (!res.ok) {
        throw new Error(formatIntakeError(json));
      }

      const data = (json.data ??
        (json as unknown as Record<string, unknown>)) as {
        encounter_id?: string;
        encounter_number?: string;
        patient_chart_id?: string;
        user_id?: string;
        id?: string;
      };
      const encounterId = data.encounter_id || data.id || "";
      const patientChartId =
        typeof data.patient_chart_id === "string" ? data.patient_chart_id : "";
      const encounterNumber =
        typeof data.encounter_number === "string" ? data.encounter_number : "";
      const userId = typeof data.user_id === "string" ? data.user_id : "";
      writeIntakeHandoff({
        encounterId,
        entrySlug: entry.slug,
        email: String(values.patient_email ?? values.email ?? ""),
        firstName: String(values.patient_first_name ?? values.first_name ?? ""),
        lastName: String(values.patient_last_name ?? values.last_name ?? ""),
        phone: String(values.patient_phone ?? values.phone ?? ""),
        ...(patientChartId ? { patientChartId } : {}),
        ...(encounterNumber ? { encounterNumber } : {}),
        ...(userId ? { userId } : {}),
      });
      const params = new URLSearchParams();
      if (encounterId) params.set("encounter", encounterId);
      params.set("entry", entry.slug);
      router.push(`/care/account?${params.toString()}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <p className={styles.status}>Loading your clinical questions…</p>
      </div>
    );
  }

  if (loadError || !schema || !step) {
    return (
      <div className={styles.root}>
        <div className={styles.statusBlock}>
          <p className={styles.statusError}>
            {loadError || "No patient steps in this encounter type."}
          </p>
          <p className={styles.meta}>
            {entry.label} · {entry.encounterTypeSlug}
          </p>
        </div>
      </div>
    );
  }

  const fields = visibleFields(step, values);
  const canContinue =
    Object.keys(validateStep(step, values, files, consents)).length === 0;
  const continueLabel = submitting
    ? "Submitting…"
    : isLast
      ? "Continue to account"
      : "Continue";

  const footHint =
    step.step_type === 4
      ? "Required before your information can be submitted."
      : step.step_type === 5
        ? "You can go back to edit any answer before submitting."
        : isOpeningConcernsStep(step)
          ? "A licensed provider recommends a care path from your answers, if prescribed."
          : entry.purpose;

  const goBack = () => {
    if (submitting) return;
    if (stepIndex > 0) {
      setStepIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const ref = document.referrer;
        if (ref) {
          const url = new URL(ref);
          if (
            url.origin === window.location.origin &&
            !url.pathname.startsWith("/care/")
          ) {
            router.back();
            return;
          }
        }
      } catch {
        /* fall through to mapped source */
      }
    }
    router.push(entry.sourceHref);
  };

  return (
    <div className={styles.root} key={stepIndex}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          disabled={submitting}
          aria-label={
            stepIndex === 0
              ? `Back to ${entry.label}`
              : "Previous step"
          }
          onClick={goBack}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M11.25 4.5 6.75 9l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={styles.segments}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={stepIndex + 1}
          aria-label={`Intake progress, step ${stepIndex + 1} of ${steps.length}`}
        >
          {steps.map((s, i) => {
            const state =
              i < stepIndex
                ? styles.segmentDone
                : i === stepIndex
                  ? styles.segmentCurrent
                  : "";
            return (
              <span
                key={s.step_name + String(i)}
                className={`${styles.segment} ${state}`.trim()}
              >
                <span className={styles.segmentFill} />
              </span>
            );
          })}
        </div>

        <span aria-hidden />
      </div>

      <div className={styles.content}>
        <h2 className={styles.stepTitle}>{step.step_name}</h2>
        {step.step_description ? (
          <p className={styles.stepLede}>{step.step_description}</p>
        ) : null}

        {step.step_type === 5 ? (
          <div className={styles.review}>
            <p className={styles.note}>
              Review your answers, then submit for physician review.
            </p>
            <ul className={styles.reviewList}>
              {Object.entries(values)
                .filter(([, v]) => v !== "" && v != null)
                .slice(0, 24)
                .map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {step.step_type === 4 ? (
          <div className={styles.consents}>
            {INTAKE_CONSENTS.map((c) => (
              <div key={c.key} className={styles.consent}>
                <label className={styles.consentLabelRow}>
                  <input
                    type="checkbox"
                    checked={consents.includes(c.key)}
                    onChange={(e) => {
                      setConsents((prev) =>
                        e.target.checked
                          ? [...prev, c.key]
                          : prev.filter((k) => k !== c.key),
                      );
                    }}
                  />
                  <span>
                    <span className={styles.consentLabel}>{c.label}</span>
                    <span className={styles.consentText}>{c.text}</span>
                    {errors[c.key] ? (
                      <span className={styles.fieldError}>{errors[c.key]}</span>
                    ) : null}
                  </span>
                </label>
                {c.documentHref ? (
                  <Link
                    href={c.documentHref}
                    className={styles.consentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.documentLabel ?? "Read the full document"}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : step.step_type !== 5 ? (
          <div className={styles.fields}>
            {fields.map((field) => (
              <IntakeField
                key={field.slug}
                field={field}
                values={values}
                onChange={setValue}
                onFile={setFile}
                error={errors[field.slug]}
              />
            ))}
          </div>
        ) : null}

        {step.step_type !== 4 &&
        step.step_type !== 5 &&
        fields.length === 0 ? (
          <p className={styles.note}>No questions on this step. Continue.</p>
        ) : null}

        {submitError ? (
          <p className={styles.statusError}>{submitError}</p>
        ) : null}
      </div>

      <div className={styles.footer}>
        <div className={styles.actionsRow}>
          <Button
            styleVariant="Ghost"
            className={`${styles.continueBtn} ${canContinue ? styles.continueBtnReady : ""}`}
            disabled={submitting || !canContinue}
            onClick={() => void goNext()}
          >
            {continueLabel}
          </Button>
        </div>
        <p className={styles.footHint}>{footHint}</p>
      </div>
    </div>
  );
}
