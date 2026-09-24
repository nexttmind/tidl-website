import { FieldType, PATIENT_STEP_TYPES } from "./field-types";
import type { SchemaOption, SchemaStep } from "./schema-types";
import type { ClinicalEntry } from "@/content/clinical/entry-map";

export const CARE_CONCERN_QUESTION = "What do you care most about right now?";

const CARE_CONCERN_DESCRIPTION =
  "Share what brought you here. A licensed provider reviews your answers and recommends a care path, if prescribed.";

function concernsStep(
  slug: string,
  notesSlug: string,
  options: readonly SchemaOption[],
): SchemaStep {
  return {
    step_name: CARE_CONCERN_QUESTION,
    step_description: CARE_CONCERN_DESCRIPTION,
    step_type: 2,
    display_order: 0,
    is_required: true,
    fields: [
      {
        slug,
        label: "Select everything that applies",
        field_type: FieldType.CHECKBOX_GROUP,
        is_required: true,
        options: [...options],
      },
      {
        slug: notesSlug,
        label: "Tell us more",
        help_text:
          "Optional. What feels off, and what would better look like for you?",
        field_type: FieldType.TEXTAREA,
        is_required: false,
        placeholder: "A few sentences is enough.",
      },
    ],
  };
}

/** Open / general entry. Health goals across the catalog. */
export const CARE_GOALS_STEP: SchemaStep = concernsStep(
  "tidl_care_goals",
  "tidl_care_goals_notes",
  [
    { label: "Weight and appetite", value: "weight_appetite" },
    { label: "Energy and focus", value: "energy_focus" },
    { label: "Strength and recovery", value: "strength_recovery" },
    { label: "Hormone balance", value: "hormone_balance" },
    { label: "Sexual health", value: "sexual_health" },
    { label: "Skin and hair", value: "skin_hair" },
    { label: "Longevity and healthspan", value: "longevity" },
    { label: "Something else", value: "other" },
  ],
);

/**
 * Peptide treatment entry (recovery, skin, not a lifestyle category).
 * Options map to symptoms those protocols address: repair, sleep, mental, metabolic.
 */
export const PEPTIDE_CONCERNS_STEP: SchemaStep = concernsStep(
  "tidl_peptide_concerns",
  "tidl_peptide_concerns_notes",
  [
    { label: "Recovery between sessions", value: "recovery" },
    { label: "Joints and mobility", value: "joints" },
    { label: "Sleep quality", value: "sleep" },
    { label: "Daytime energy", value: "energy" },
    { label: "Focus and stamina", value: "focus" },
    { label: "Body composition", value: "composition" },
    { label: "Feeling run down", value: "run_down" },
    { label: "Skin and tissue", value: "skin_tissue" },
    { label: "Something else", value: "other" },
  ],
);

export function isOpeningConcernsStep(step: SchemaStep): boolean {
  return (
    step.step_name === CARE_CONCERN_QUESTION ||
    step === CARE_GOALS_STEP ||
    step === PEPTIDE_CONCERNS_STEP
  );
}

/** Peptide assessment that is not a lifestyle category (Athletes). */
export function isPeptideTreatmentEntry(entry: ClinicalEntry): boolean {
  return (
    entry.encounterTypeSlug === "peptide-assessment" && entry.kind !== "program"
  );
}

const PERSONAL_SLUGS = new Set([
  "patient_first_name",
  "patient_last_name",
  "patient_email",
  "patient_phone",
  "patient_date_of_birth",
  "patient_gender",
  "patient_address",
  "first_name",
  "last_name",
  "email",
  "mobile_phone",
  "phone",
  "date_of_birth",
  "gender",
  "addresses.primary",
]);

export function isPersonalInfoStep(step: SchemaStep): boolean {
  const name = (step.step_name || "").toLowerCase();
  if (
    name.includes("personal information") ||
    name.includes("patient information") ||
    name.includes("contact information")
  ) {
    return true;
  }
  const fields = step.fields ?? [];
  if (!fields.length) return false;
  const hits = fields.filter(
    (f) =>
      PERSONAL_SLUGS.has(f.slug) ||
      (typeof f.maps_to === "string" && f.maps_to.startsWith("patient.")),
  ).length;
  return hits >= Math.ceil(fields.length / 2);
}

export function filterPatientSteps(steps: SchemaStep[]): SchemaStep[] {
  return [...steps]
    .filter((s) => PATIENT_STEP_TYPES.has(s.step_type))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * Patient-facing step order:
 * opening concerns first (general and peptide treatment entries),
 * clinical + consent + identity,
 * personal information last (right before account).
 */
export function buildPatientSteps(
  steps: SchemaStep[],
  entry: ClinicalEntry,
): SchemaStep[] {
  const patient = filterPatientSteps(steps);
  const personal = patient.filter(isPersonalInfoStep);
  const clinical = patient.filter((s) => !isPersonalInfoStep(s));
  const ordered = [...clinical, ...personal];
  if (entry.kind === "general") {
    return [CARE_GOALS_STEP, ...ordered];
  }
  if (isPeptideTreatmentEntry(entry)) {
    return [PEPTIDE_CONCERNS_STEP, ...ordered];
  }
  return ordered;
}

export type IntakeHandoff = {
  encounterId: string;
  entrySlug: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  patientChartId?: string;
  userId?: string;
  encounterNumber?: string;
  patientNumber?: string;
};

export function normalizeIntakeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim().toLowerCase();
  return email.includes("@") ? email : undefined;
}

export const INTAKE_HANDOFF_KEY = "tidl_intake_handoff";

function clientWindow(): Window | null {
  if (typeof globalThis === "undefined") return null;
  return (globalThis as { window?: Window }).window ?? null;
}

function writeStore(store: Storage, data: IntakeHandoff) {
  store.setItem(INTAKE_HANDOFF_KEY, JSON.stringify(data));
}

function readStore(store: Storage): IntakeHandoff | null {
  const raw = store.getItem(INTAKE_HANDOFF_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as IntakeHandoff;
}

export function writeIntakeHandoff(data: IntakeHandoff) {
  const win = clientWindow();
  if (!win) return;
  try {
    writeStore(win.sessionStorage, data);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readIntakeHandoff(): IntakeHandoff | null {
  const win = clientWindow();
  if (!win) return null;
  try {
    const fromSession = readStore(win.sessionStorage);
    try {
      win.localStorage.removeItem(INTAKE_HANDOFF_KEY);
    } catch {
      /* ignore quota / private mode */
    }
    return fromSession;
  } catch {
    try {
      win.localStorage.removeItem(INTAKE_HANDOFF_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function clearIntakeHandoff() {
  const win = clientWindow();
  if (!win) return;
  try {
    win.sessionStorage.removeItem(INTAKE_HANDOFF_KEY);
  } catch {
    /* ignore quota / private mode */
  }
  try {
    win.localStorage.removeItem(INTAKE_HANDOFF_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}
