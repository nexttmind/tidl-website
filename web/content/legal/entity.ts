/** Legal entity, contact, and public routes for HIPAA and telehealth notices. */

export const LEGAL_ENTITY = {
  name: "TIDL Health Inc",
  shortName: "TIDL",
  addressLines: [
    "TIDL Health Inc",
    "1967 Del Amo Blvd",
    "Torrance, CA 90501",
  ],
  privacyEmail: "privacy@tidl.com",
  supportEmail: "support@tidl.com",
  privacyOfficerTitle: "Privacy Officer",
} as const;

export const LEGAL_ROUTES = {
  npp: "/notice-of-privacy-practices",
  telehealth: "/telehealth-consent",
  hipaaAuth: "/hipaa-authorization",
  ecomm: "/electronic-communications",
} as const;

export const LEGAL_EFFECTIVE_DATE = "August 13, 2026";
