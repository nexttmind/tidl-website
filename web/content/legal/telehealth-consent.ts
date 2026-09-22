import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY, LEGAL_ROUTES } from "./entity";
import type { LegalDocument } from "./types";

export const telehealthConsent: LegalDocument = {
  slug: "telehealth-consent",
  title: "Informed Consent for Telehealth Services and Treatment",
  description:
    "Read how TIDL Health Inc delivers telehealth, including benefits, risks, emergencies, and your rights.",
  meta: `TIDL-CONSENT-TELE-022 · v2.2 · Effective ${LEGAL_EFFECTIVE_DATE} · Adapted from PRX-CONSENT-TELE-022`,
  lede: `This Informed Consent for Telehealth Services & Treatment ("Consent") is entered into between you ("Patient," "you," "your") and the licensed healthcare provider(s) ("Provider," "Clinician") who furnish services to you through the ${LEGAL_ENTITY.shortName} telehealth platform (the "Platform"), operated by ${LEGAL_ENTITY.name} ("${LEGAL_ENTITY.shortName}," "we," "us"). By accepting this Consent during intake, you acknowledge that you have read, understood, and agreed to its terms, and that you consent to receive healthcare services via telehealth.`,
  sections: [
    {
      number: "2",
      title: "What Telehealth Is",
      blocks: [
        {
          type: "p",
          text: '"Telehealth" means the delivery of healthcare services using electronic communications, information technology, or other means between a Provider and a Patient who are not in the same physical location. Telehealth on the Platform may include, but is not limited to:',
        },
        {
          type: "ul",
          items: [
            "Secure exchange of medical history, intake questionnaires, and clinical documentation;",
            'Asynchronous ("store-and-forward") review of your information, photographs, or lab results by a Provider;',
            "Synchronous (live) audio-only or audio-video consultations;",
            "Electronic prescribing of medications, where clinically appropriate and legally permitted;",
            "Ordering and review of laboratory testing;",
            "Ongoing clinical monitoring, messaging, and follow-up care.",
          ],
        },
      ],
    },
    {
      number: "3",
      title: "Expected Benefits",
      blocks: [
        {
          type: "p",
          text: "Telehealth may offer you the following benefits:",
        },
        {
          type: "ul",
          items: [
            "Improved access to clinicians, particularly for specialty care that may not be locally available;",
            "Reduced travel time, cost, and time away from work;",
            "More efficient clinical evaluation, follow-up, and medication management;",
            "Convenient, secure communication with your care team.",
          ],
        },
      ],
    },
    {
      number: "4",
      title: "Potential Risks and Limitations",
      blocks: [
        {
          type: "p",
          text: "You understand and accept that telehealth has inherent limitations and risks, including but not limited to:",
        },
        {
          type: "ul",
          items: [
            "Information quality limitations. The Provider will not be physically present and must rely on information you provide (self-reported history, photographs, measurements, lab results). Incomplete or inaccurate information may affect clinical judgment and treatment decisions.",
            "No hands-on physical examination. Certain conditions cannot be fully evaluated without an in-person examination. Your Provider may determine that telehealth is not appropriate for your condition and may refer you to in-person care.",
            "Technology failures. Internet outages, equipment malfunction, audio/video quality issues, or platform downtime could disrupt or delay care.",
            "Security and privacy risks. Although the Platform uses industry-standard safeguards (including encryption in transit and at rest, access controls, and audit logging) designed to comply with HIPAA, no electronic transmission or storage system is 100% secure. There is a residual risk of unauthorized access, interception, or disclosure.",
            "Delayed response. Telehealth is not appropriate for emergencies. Clinical responses may be delayed relative to in-person care.",
            "Prescribing limitations. Certain medications (including, but not limited to, controlled substances) are subject to state and federal restrictions that may prohibit or limit prescribing via telehealth. Your Provider may require in-person evaluation, additional documentation, or laboratory testing before prescribing.",
            "Adverse reactions. Any medication or treatment, whether prescribed in person or via telehealth, may cause side effects or adverse reactions. You agree to promptly report any concerning symptoms.",
          ],
        },
      ],
    },
    {
      number: "5",
      title: "Emergencies. Telehealth Is NOT for Emergency Care",
      blocks: [
        {
          type: "p",
          text: "If you are experiencing a medical or psychiatric emergency, do not use the Platform. Call 911 or go to your nearest emergency department immediately.",
        },
        {
          type: "p",
          text: "Examples of emergencies include, but are not limited to: chest pain, difficulty breathing, severe allergic reaction, stroke symptoms, severe bleeding, suicidal or homicidal ideation, or any condition you reasonably believe is life-threatening.",
        },
        {
          type: "p",
          text: `You acknowledge that the Platform and its Providers are not an emergency service, are not available 24/7 on a real-time basis, and cannot provide emergency care.`,
        },
      ],
    },
    {
      number: "6",
      title: "Your Rights",
      blocks: [
        {
          type: "ul",
          items: [
            "Voluntary participation. Your participation in telehealth is voluntary. You may withhold or withdraw consent at any time without affecting your right to future care or treatment.",
            "Alternatives. In-person care is an alternative to telehealth. You have the right to decline telehealth and seek in-person evaluation at any time.",
            "Provider discretion. The Provider may determine at any point that telehealth is not appropriate for your condition and may decline to provide services via telehealth or refer you elsewhere.",
            "Questions. You have the right to ask questions about your condition, proposed treatment, risks, benefits, and alternatives at any time.",
            "Access to records. You have the right to access your medical records as described in the Notice of Privacy Practices.",
          ],
        },
      ],
    },
    {
      number: "7",
      title: "Clinician Licensure and Scope",
      blocks: [
        {
          type: "p",
          text: `Services are furnished by licensed healthcare professionals. Your Provider must be licensed in the state where you are physically located at the time of the encounter. By providing your location, you represent that the location is accurate, and you agree to notify ${LEGAL_ENTITY.name} promptly if your state of residence changes, as this may affect which Providers can lawfully treat you.`,
        },
      ],
    },
    {
      number: "8",
      title: "Recording, Documentation, and Medical Records",
      blocks: [
        {
          type: "p",
          text: "Clinical encounters, messages, questionnaires, photographs, and related information you submit will be documented in your electronic medical record. The Platform may retain a record of asynchronous messages, submitted questionnaires, uploaded images, and the clinical decisions associated with your care. Live audio or video sessions are not recorded unless you are given separate notice and provide separate consent. You agree not to record any session without the Provider's advance written consent.",
        },
      ],
    },
    {
      number: "9",
      title: "Confidentiality and HIPAA",
      blocks: [
        {
          type: "p",
          text: `${LEGAL_ENTITY.name} maintains administrative, technical, and physical safeguards designed to protect your Protected Health Information ("PHI") consistent with the Health Insurance Portability and Accountability Act ("HIPAA") and its implementing regulations. The handling of your PHI is further described in the ${LEGAL_ENTITY.shortName} Notice of Privacy Practices, which you should read. Sharing of your PHI with persons other than your care team, payers, and others permitted or required by law requires a separate written authorization (see the Authorization for Disclosure of Protected Health Information).`,
        },
      ],
    },
    {
      number: "10",
      title: "Financial Responsibility",
      blocks: [
        {
          type: "p",
          text: "You acknowledge that you are financially responsible for all services furnished to you, including consultations, medications, laboratory testing, and any other services, consistent with the fee schedule and/or subscription terms presented at the point of sale. Unless expressly stated otherwise, services are provided on a cash-pay basis and are not billed to insurance. Fees are disclosed before services are furnished and before any charges are incurred.",
        },
      ],
    },
    {
      number: "11",
      title: "Prescribing and Medication Shipment",
      blocks: [
        {
          type: "p",
          text: "If your Provider determines that medication is clinically appropriate and lawful to prescribe via telehealth, the prescription will be transmitted to a licensed pharmacy. You acknowledge that:",
        },
        {
          type: "ul",
          items: [
            "Medications may be compounded preparations subject to the FDA compounding disclosures presented to you before you order, which you have reviewed and acknowledged.",
            "Shipping, handling, and delivery are subject to carrier logistics and may be delayed by factors beyond the Provider's or Platform's control.",
            "You are responsible for providing an accurate, secure shipping address and for receiving and storing medications per the included instructions.",
            "Once shipped, medications are generally non-returnable for safety reasons except as required by law.",
          ],
        },
      ],
    },
    {
      number: "12",
      title: "No Guarantee of Results",
      blocks: [
        {
          type: "p",
          text: "Medicine is not an exact science. No Provider can guarantee any particular outcome, cure, or result from any evaluation, recommendation, prescription, or treatment. By accepting this Consent, you acknowledge that you have not been promised or guaranteed any specific result.",
        },
      ],
    },
    {
      number: "13",
      title: "Acknowledgment",
      blocks: [
        {
          type: "p",
          text: "By accepting this Consent during clinical intake, you acknowledge that:",
        },
        {
          type: "ul",
          items: [
            "You are 18 years of age or older and have the legal capacity to consent to your own medical care.",
            "You have read this Consent in its entirety, understand its contents, and have had the opportunity to ask questions, all of which have been answered to your satisfaction.",
            "You understand the benefits, risks, limitations, and alternatives to telehealth.",
            `You voluntarily consent to receive telehealth services from ${LEGAL_ENTITY.name} Providers.`,
            "You understand that you may withdraw this consent at any time, in writing, without affecting your right to future care.",
            "The information you have provided, and will provide, is true, accurate, and complete to the best of your knowledge.",
          ],
        },
        {
          type: "note",
          text: "Acceptance is captured during intake with timestamp, document version, IP address, and user agent, and stored with your clinical record. Signature blocks are not completed on this public page.",
        },
      ],
    },
  ],
  related: [
    { label: "Notice of Privacy Practices", href: LEGAL_ROUTES.npp },
    {
      label: "Authorization to disclose health information",
      href: LEGAL_ROUTES.hipaaAuth,
    },
    {
      label: "Consent for electronic communications",
      href: LEGAL_ROUTES.ecomm,
    },
  ],
};
