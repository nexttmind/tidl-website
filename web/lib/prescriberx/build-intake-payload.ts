import {
  DOCUMENT_TYPE_DEFAULT,
  DOCUMENT_TYPE_MAP,
  INTAKE_CONSENTS,
} from "./consents";
import {
  FieldType,
  isDisplayOnly,
  isFileType,
} from "./field-types";
import type {
  ConsentDef,
  EncounterSchemaData,
  SchemaField,
  SchemaStep,
  UploadedDoc,
} from "./schema-types";

const MAPS_TO_ROUTES: Record<string, [string, string]> = {
  first_name: ["patient", "first_name"],
  last_name: ["patient", "last_name"],
  email: ["patient", "email"],
  mobile_phone: ["patient", "phone"],
  phone: ["patient", "phone"],
  date_of_birth: ["patient", "date_of_birth"],
  gender: ["patient", "gender"],
  race: ["patient", "race"],
  ethnicity: ["patient", "ethnicity"],
  preferred_language: ["patient", "preferred_language"],
  "addresses.primary": ["patient", "address"],
  height_inches: ["vitals", "height_inches"],
  weight_lbs: ["vitals", "weight_lbs"],
  heart_rate_bpm: ["vitals", "heart_rate_bpm"],
  allergies: ["medical_history", "allergies"],
  medications: ["medical_history", "medications"],
  conditions: ["medical_history", "conditions"],
  drivers_license_number: ["identification", "id_number"],
  drivers_license_state_of_issue: ["identification", "id_state"],
};

function indexFields(schema: EncounterSchemaData): Record<string, SchemaField> {
  const out: Record<string, SchemaField> = {};
  for (const step of schema.steps ?? []) {
    for (const field of step.fields ?? []) {
      if (field.slug) out[field.slug] = field;
    }
  }
  return out;
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value as object).every(isEmpty);
  }
  return false;
}

function normalizeValue(type: number, value: unknown): unknown {
  if (type === FieldType.YES_NO) {
    if (value === true || value === "yes" || value === "Yes") return "Yes";
    if (value === false || value === "no" || value === "No") return "No";
  }
  if (type === FieldType.HEIGHT && value && typeof value === "object") {
    const v = value as { feet?: number; inches?: number; total?: number };
    if (typeof v.total === "number") return v.total;
    const feet = Number(v.feet ?? 0);
    const inches = Number(v.inches ?? 0);
    return feet * 12 + inches;
  }
  if (type === FieldType.WEIGHT || type === FieldType.NUMBER) {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (
    type === FieldType.ALLERGY_SEARCH ||
    type === FieldType.MEDICATION_SEARCH ||
    type === FieldType.CONDITION_SEARCH
  ) {
    // API expects string[], e.g. ["Penicillin"] or ["None"] — not { name } objects.
    if (typeof value === "string") {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
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
    return [];
  }
  return value;
}

const US_STATE_NAMES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return US_STATE_NAMES[trimmed.toLowerCase()] ?? trimmed;
}

export function normalizeIntakeAddress(
  value: unknown,
): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const street = String(raw.street ?? raw.line1 ?? raw.street_1 ?? "").trim();
  const street2 = String(raw.street2 ?? raw.line2 ?? raw.street_2 ?? "").trim();
  const city = String(raw.city ?? "").trim();
  const state = normalizeState(String(raw.state ?? ""));
  const zip = String(raw.zip ?? raw.postal_code ?? raw.zip_code ?? "").trim();
  if (!street && !city && !state && !zip) return null;
  return {
    street,
    ...(street2 ? { street2 } : {}),
    city,
    state,
    zip,
    country: "US",
  };
}

function place(
  payload: Record<string, unknown>,
  field: SchemaField,
  type: number,
  value: unknown,
) {
  if (type === FieldType.ADDRESS) {
    const address = normalizeIntakeAddress(value);
    if (!address) return;
    const patient = (payload.patient as Record<string, unknown>) ?? {};
    patient.address = address;
    patient.shipping_address = address;
    patient.billing_same_as_shipping = true;
    payload.patient = patient;
    return;
  }
  if (type === FieldType.BLOOD_PRESSURE && value && typeof value === "object") {
    const vitals = (payload.vitals as Record<string, unknown>) ?? {};
    const bp = value as { systolic?: number; diastolic?: number };
    if (bp.systolic != null) vitals.blood_pressure_systolic = bp.systolic;
    if (bp.diastolic != null) vitals.blood_pressure_diastolic = bp.diastolic;
    payload.vitals = vitals;
    return;
  }

  const mapsTo = field.maps_to ?? "";
  const route = MAPS_TO_ROUTES[mapsTo];
  if (route) {
    const [block, key] = route;
    const bucket = (payload[block] as Record<string, unknown>) ?? {};
    bucket[key] = value;
    payload[block] = bucket;
    if (mapsTo === "drivers_license_number") {
      bucket.id_type = "drivers_license";
    }
    return;
  }

  const answers = (payload.answers as Record<string, unknown>) ?? {};
  answers[field.slug] = value;
  payload.answers = answers;
}

function buildDocuments(files: UploadedDoc[]) {
  return files.map((file) => ({
    type: DOCUMENT_TYPE_MAP[file.slug] ?? DOCUMENT_TYPE_DEFAULT,
    filename: file.filename,
    mime_type: file.mime_type,
    file_base64: file.base64,
  }));
}

function buildConsents(
  accepted: string[],
  defs: readonly ConsentDef[],
  meta: { ip_address?: string; user_agent?: string; source_domain?: string },
) {
  const now = new Date().toISOString();
  return accepted
    .map((key) => defs.find((d) => d.key === key))
    .filter((d): d is ConsentDef => Boolean(d))
    .map((d) => ({
      consent_type: d.type,
      consent_version: d.version,
      consent_text: d.text,
      consented_at: now,
      ip_address: meta.ip_address ?? null,
      user_agent: meta.user_agent ?? null,
      source_domain: meta.source_domain ?? null,
      signature_method: "click",
    }));
}

/** Prefer buildPatientSteps from intake-flow for UI ordering. */
export { filterPatientSteps } from "./intake-flow";

export function evalDependency(
  dep: SchemaField["depends_on"],
  values: Record<string, unknown>,
): boolean {
  if (!dep) return true;
  const slug = dep.field || dep.slug;
  if (!slug) return true;
  const current = values[slug];
  const op = (dep.operator || "equals").toLowerCase();
  const expected = dep.value;
  switch (op) {
    case "equals":
      return String(current) === String(expected);
    case "not_equals":
      return String(current) !== String(expected);
    case "in":
      return Array.isArray(expected)
        ? expected.map(String).includes(String(current))
        : false;
    case "contains":
      if (Array.isArray(current)) return current.map(String).includes(String(expected));
      return String(current ?? "").includes(String(expected ?? ""));
    default:
      return true;
  }
}

export function buildUnifiedIntakePayload(input: {
  schema: EncounterSchemaData;
  values: Record<string, unknown>;
  files?: UploadedDoc[];
  productIds?: string[];
  acceptedConsentKeys?: string[];
  isSandbox?: boolean;
  clientId?: string | null;
  salesOrgId?: string | null;
  meta?: { ip_address?: string; user_agent?: string; source_domain?: string };
}): Record<string, unknown> {
  const fieldIndex = indexFields(input.schema);
  const payload: Record<string, unknown> = {
    encounter_type_id: input.schema.encounter_type.id,
    patient: {},
  };

  for (const [slug, raw] of Object.entries(input.values)) {
    const field = fieldIndex[slug];
    if (!field) {
      const answers = (payload.answers as Record<string, unknown>) ?? {};
      answers[slug] = raw;
      payload.answers = answers;
      continue;
    }
    const type = Number(field.field_type);
    if (isDisplayOnly(type) || isFileType(type)) continue;
    const value = normalizeValue(type, raw);
    if (isEmpty(value)) continue;
    place(payload, field, type, value);
  }

  const docs = buildDocuments(input.files ?? []);
  if (docs.length) payload.documents = docs;

  if (input.productIds?.length) {
    payload.products = input.productIds.map((id) => ({
      product_id: id,
      quantity: 1,
    }));
  }

  const consents = buildConsents(
    input.acceptedConsentKeys ?? [],
    INTAKE_CONSENTS,
    input.meta ?? {},
  );
  if (consents.length) payload.consents = consents;

  if (input.isSandbox) payload.is_sandbox = true;
  if (input.clientId) payload.client_id = input.clientId;
  if (input.salesOrgId) payload.sales_org_id = input.salesOrgId;

  return payload;
}
