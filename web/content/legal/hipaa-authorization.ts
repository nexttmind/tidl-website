import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY, LEGAL_ROUTES } from "./entity";
import type { LegalDocument } from "./types";

export const hipaaAuthorization: LegalDocument = {
  slug: "hipaa-authorization",
  title: "Authorization for Use and Disclosure of Protected Health Information",
  description:
    "How to authorize TIDL Health Inc to share your health information with people you designate. Signing is voluntary and is not required to receive care.",
  meta: `TIDL-AUTH-PHI-022 · v2.2 · Effective ${LEGAL_EFFECTIVE_DATE} · Adapted from PRX-AUTH-PHI-022`,
  lede: `This Authorization is required under the HIPAA Privacy Rule (45 C.F.R. § 164.508) when ${LEGAL_ENTITY.name} or its Providers use or disclose your Protected Health Information ("PHI") for purposes that are not already permitted without authorization (such as treatment, payment, or healthcare operations). You do not need to sign this form to receive treatment from ${LEGAL_ENTITY.name}. Signing is voluntary.`,
  sections: [
    {
      number: "1",
      title: "Purpose of this Authorization",
      blocks: [
        {
          type: "p",
          text: `If you want a friend, spouse, family member, caregiver, employer, attorney, or any other person or entity to be able to receive information about your care from ${LEGAL_ENTITY.name}, you must designate them through this Authorization. Complete the Authorization in your patient account, or send a written request to ${LEGAL_ENTITY.privacyEmail}.`,
        },
      ],
    },
    {
      number: "2",
      title: "Patient information we will confirm",
      blocks: [
        {
          type: "p",
          text: "When you complete this Authorization, we confirm your full legal name, date of birth, and email on file before any disclosure is made.",
        },
      ],
    },
    {
      number: "3",
      title: "Persons or entities authorized to receive PHI",
      blocks: [
        {
          type: "p",
          text: `You authorize ${LEGAL_ENTITY.name}, its Providers, and its Business Associates to disclose your PHI to the person(s) or entity(ies) you name, including each person's relationship to you and a phone number or email for contact.`,
        },
      ],
    },
    {
      number: "4",
      title: "Specific information authorized for disclosure",
      blocks: [
        {
          type: "p",
          text: "You may authorize release of any of the following categories:",
        },
        {
          type: "ul",
          items: [
            "Demographic information (name, date of birth, contact info)",
            "Appointment scheduling, status, and reminders",
            "Billing, payment, and account status information",
            "Clinical progress, diagnoses, and treatment plans",
            "Prescriptions and medication information",
            "Laboratory results",
            `Complete medical record on file with ${LEGAL_ENTITY.name}`,
            "Other information you describe in writing",
          ],
        },
        {
          type: "p",
          text: "Disclosure of the following sensitive categories requires specific, separate authorization under federal and/or state law, and is made only if you specifically authorize it:",
        },
        {
          type: "ul",
          items: [
            "Mental or behavioral health information",
            "Substance use disorder records (42 C.F.R. Part 2)",
            "HIV/AIDS status or testing",
            "Genetic testing information",
            "Sexually transmitted infection information",
            "Reproductive health information",
          ],
        },
      ],
    },
    {
      number: "5",
      title: "Purpose of disclosure",
      blocks: [
        {
          type: "p",
          text: "You will choose a purpose when you sign, which may be:",
        },
        {
          type: "ul",
          items: [
            "At your request, for personal reasons (no further explanation required)",
            "To coordinate care with another healthcare provider",
            "For legal or insurance purposes",
            "Another purpose you describe in writing",
          ],
        },
      ],
    },
    {
      number: "6",
      title: "Expiration",
      blocks: [
        {
          type: "p",
          text: "This Authorization will expire on the earliest of:",
        },
        {
          type: "ul",
          items: [
            "The date you revoke it in writing;",
            "One (1) year from the date of signature; or",
            "A specific date or event you name when you sign.",
          ],
        },
      ],
    },
    {
      number: "7",
      title: "Right to revoke",
      blocks: [
        {
          type: "p",
          text: `You have the right to revoke this Authorization at any time by submitting a written revocation to ${LEGAL_ENTITY.name} at ${LEGAL_ENTITY.privacyEmail} or through the Platform's patient portal. Revocation will be effective upon receipt, except to the extent that ${LEGAL_ENTITY.name} has already relied on this Authorization before receiving the revocation.`,
        },
      ],
    },
    {
      number: "8",
      title: "Redisclosure warning",
      blocks: [
        {
          type: "p",
          text: "Once your PHI is disclosed to the person(s) or entity(ies) you identify, it may no longer be protected by HIPAA and may be subject to redisclosure by the recipient.",
        },
      ],
    },
    {
      number: "9",
      title: "Conditions of treatment",
      blocks: [
        {
          type: "p",
          text: `${LEGAL_ENTITY.name} will not condition your treatment, payment, enrollment, or eligibility for benefits on whether you sign this Authorization, except as permitted by 45 C.F.R. § 164.508(b)(4).`,
        },
      ],
    },
    {
      number: "10",
      title: "Copy",
      blocks: [
        {
          type: "p",
          text: "You are entitled to a copy of any Authorization you sign.",
        },
        {
          type: "note",
          text: "This page is the public text of the Authorization. Designating recipients and capturing a signature happens in your patient account or by written request. Do not send PHI to this website.",
        },
      ],
    },
  ],
  related: [
    { label: "Notice of Privacy Practices", href: LEGAL_ROUTES.npp },
    { label: "Telehealth consent", href: LEGAL_ROUTES.telehealth },
  ],
};
