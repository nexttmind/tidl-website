import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY, LEGAL_ROUTES } from "./entity";
import type { LegalDocument } from "./types";

export const electronicCommunicationsConsent: LegalDocument = {
  slug: "electronic-communications",
  title: "Consent for Electronic Communications",
  description:
    "How TIDL Health Inc may email, text, or call you about care, billing, and optional marketing, and how to opt out.",
  meta: `TIDL-CONSENT-ECOMM-022 · v2.2 · Effective ${LEGAL_EFFECTIVE_DATE} · Adapted from PRX-CONSENT-ECOMM-022`,
  lede: `By accepting this Consent during intake, you consent to receive electronic communications from ${LEGAL_ENTITY.name}, its Providers, and its Business Associates at the email address, mobile telephone number, and any other contact information you provide.`,
  sections: [
    {
      number: "1",
      title: "Scope",
      blocks: [
        {
          type: "p",
          text: "Communications may include:",
        },
        {
          type: "ul",
          items: [
            "Treatment-related communications (appointment reminders, clinical messages, lab results, prescription status, shipping notifications)",
            "Administrative and billing communications (invoices, payment confirmations, account notices)",
            "Marketing communications (new services, promotions, educational content)",
          ],
        },
      ],
    },
    {
      number: "2",
      title: "Automated messages",
      blocks: [
        {
          type: "p",
          text: "Some messages may be sent using automated dialing systems, prerecorded voice, or SMS text. Standard message and data rates may apply. Your consent is not a condition of purchase or treatment.",
        },
      ],
    },
    {
      number: "3",
      title: "Opt-out",
      blocks: [
        {
          type: "p",
          text: `You may opt out of marketing communications at any time by replying STOP to SMS messages, clicking unsubscribe in emails, or contacting ${LEGAL_ENTITY.supportEmail}. Opting out of marketing does not stop treatment-related communications required to deliver care.`,
        },
        {
          type: "note",
          text: "Acceptance is captured during intake with timestamp, document version, IP address, and user agent when you check the optional communications box. Signature blocks are not completed on this public page.",
        },
      ],
    },
  ],
  related: [
    { label: "Notice of Privacy Practices", href: LEGAL_ROUTES.npp },
    { label: "Telehealth consent", href: LEGAL_ROUTES.telehealth },
  ],
};
