import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY } from "./entity";
import type { LegalDocument } from "./types";

/**
 * Consult-only. Do not link from marketing, footer, or unauthenticated routes.
 * Execute in addition to telehealth consent when a patient is evaluated for
 * or prescribed a controlled substance.
 */
export const controlledSubstanceAgreement: LegalDocument = {
  slug: "controlled-substance-agreement",
  title: "Telehealth Controlled Substance Patient-Provider Agreement",
  description:
    "Terms that apply when a TIDL Health Inc provider evaluates you for or prescribes a controlled substance.",
  meta: `TIDL-AGMT-CSA-022 · v2.2 · Effective ${LEGAL_EFFECTIVE_DATE} · Adapted from PRX-AGMT-CSA-022`,
  lede: `This agreement should be executed in addition to, not instead of, the general Telehealth Consent whenever a patient is being evaluated for or prescribed a controlled substance (including Schedule III medications).`,
  sections: [
    {
      number: "1",
      title: "Purpose",
      blocks: [
        {
          type: "p",
          text: `Certain medications a ${LEGAL_ENTITY.name} Provider may prescribe are classified as controlled substances under the federal Controlled Substances Act. Because controlled substances carry a risk of misuse, diversion, and harm, you agree to the following terms as a condition of receiving prescriptions for controlled substances from a ${LEGAL_ENTITY.name} Provider.`,
        },
      ],
    },
    {
      number: "2",
      title: "Single provider and pharmacy",
      blocks: [
        {
          type: "ul",
          items: [
            `You will obtain prescriptions for this controlled substance only from ${LEGAL_ENTITY.name} Providers, unless you notify your Provider in advance and in writing.`,
            `You agree to inform your ${LEGAL_ENTITY.name} Provider of any other controlled substance prescribed to you by any other clinician.`,
            `You will fill your prescriptions only at the pharmacy(ies) designated by ${LEGAL_ENTITY.name}, unless otherwise approved.`,
          ],
        },
      ],
    },
    {
      number: "3",
      title: "Lawful use",
      blocks: [
        {
          type: "ul",
          items: [
            "You will use the medication exactly as prescribed.",
            "You will not share, sell, trade, or give your medication to any other person under any circumstance.",
            "You understand that diversion of a controlled substance is a federal crime.",
          ],
        },
      ],
    },
    {
      number: "4",
      title: "Safekeeping",
      blocks: [
        {
          type: "ul",
          items: [
            "You will store the medication securely, away from children, visitors, and unauthorized persons.",
            "You will not request early refills due to lost, stolen, damaged, or spilled medication except in documented, verifiable circumstances; lost or stolen medication will generally not be replaced.",
          ],
        },
      ],
    },
    {
      number: "5",
      title: "Monitoring",
      blocks: [
        {
          type: "ul",
          items: [
            "You consent to laboratory monitoring at the frequency determined clinically appropriate by your Provider.",
            'You consent to review of your prescription history through state Prescription Drug Monitoring Programs ("PDMP"), where lawful.',
            "You agree to respond to reasonable requests from your Provider for follow-up information.",
          ],
        },
      ],
    },
    {
      number: "6",
      title: "Disclosure of other providers and substances",
      blocks: [
        {
          type: "ul",
          items: [
            "You will disclose all other healthcare providers you see and all other prescription and non-prescription substances you are taking, including other controlled substances, related therapies, supplements, and recreational substances.",
            "You understand that failure to disclose this information may result in clinical harm and termination of the provider-patient relationship.",
          ],
        },
      ],
    },
    {
      number: "7",
      title: "Grounds for discontinuation",
      blocks: [
        {
          type: "p",
          text: `You understand that your ${LEGAL_ENTITY.name} Provider may modify, taper, or discontinue controlled substance therapy at any time based on clinical judgment, including if you:`,
        },
        {
          type: "ul",
          items: [
            "Violate any term of this Agreement;",
            "Fail to complete required laboratory monitoring or follow-up;",
            "Are found to be obtaining controlled substances from other sources without disclosure;",
            "Show evidence of misuse, diversion, or harm;",
            "Are determined by the Provider to be at risk in continuing therapy.",
          ],
        },
      ],
    },
    {
      number: "8",
      title: "Acknowledgment",
      blocks: [
        {
          type: "p",
          text: "You have read and understand this Agreement and agree to its terms when you sign it during a consultation that involves a controlled substance.",
        },
        {
          type: "note",
          text: "This agreement is presented and signed in the clinical consult flow when a controlled substance is being considered. It is not an intake checkbox for every visit.",
        },
      ],
    },
  ],
};
