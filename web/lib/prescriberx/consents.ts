import { LEGAL_ROUTES } from "@/content/legal/entity";
import type { ConsentDef } from "./schema-types";

/** TIDL consent copy stamped into consents[] on unified intake. */
export const INTAKE_CONSENTS: readonly ConsentDef[] = [
  {
    key: "telehealth",
    type: 6,
    version: "2.2",
    required: true,
    label: "I consent to a telehealth consultation",
    text:
      "I have read the Informed Consent for Telehealth Services and Treatment (v2.2), understand its benefits, risks, limitations, and alternatives, and voluntarily consent to receive telehealth services from TIDL Health Inc providers.",
    documentHref: LEGAL_ROUTES.telehealth,
    documentLabel: "Read the telehealth consent",
  },
  {
    key: "hipaa",
    type: 1,
    version: "2.2",
    required: true,
    label: "I acknowledge the Notice of Privacy Practices",
    text:
      "I acknowledge receipt of the Notice of Privacy Practices describing how my protected health information may be used and disclosed.",
    documentHref: LEGAL_ROUTES.npp,
    documentLabel: "Read the Notice of Privacy Practices",
  },
  {
    key: "sms",
    type: 3,
    version: "2.2",
    required: false,
    label: "I agree to receive electronic communications (optional)",
    text:
      "I consent to receive treatment, administrative, and marketing messages by email, phone, and SMS at the contact information I provide. Message and data rates may apply. Consent is not a condition of purchase or treatment. Reply STOP to opt out of marketing.",
    documentHref: LEGAL_ROUTES.ecomm,
    documentLabel: "Read the electronic communications consent",
  },
] as const;

export const DOCUMENT_TYPE_MAP: Record<string, string> = {
  id_front: "government_id_front",
  id_back: "government_id_back",
  passport: "government_id_passport",
  selfie: "selfie_with_id",
  selfie_photo: "selfie_with_id",
  body_photo: "body_picture",
  lab_result: "lab_result_pdf",
  upload_your_most_recent_lab_results_dated_within_past_60_days: "lab_result_pdf",
  insurance_front: "insurance_card_front",
  insurance_back: "insurance_card_back",
};

export const DOCUMENT_TYPE_DEFAULT = "other_document";
