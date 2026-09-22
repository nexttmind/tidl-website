import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY, LEGAL_ROUTES } from "./entity";
import type { LegalDocument } from "./types";

export const noticeOfPrivacyPractices: LegalDocument = {
  slug: "notice-of-privacy-practices",
  title: "Notice of Privacy Practices",
  description:
    "How TIDL Health Inc may use and disclose your health information, and how you can get access to it.",
  meta: `TIDL-NPP-022 · Effective ${LEGAL_EFFECTIVE_DATE} · Adapted from the HHS February 2026 model notice for covered health care providers`,
  headerNotice:
    "THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.",
  lede: `This Notice of Privacy Practices (the "Notice") applies to ${LEGAL_ENTITY.name} ("${LEGAL_ENTITY.shortName}," "we," "us"), our licensed healthcare providers, and the workforce and business associates who help us deliver telehealth care through the ${LEGAL_ENTITY.shortName} platform. It describes how we may use and disclose your protected health information ("medical information") and your rights regarding that information.`,
  sections: [
    {
      title: "Who this Notice covers",
      blocks: [
        {
          type: "p",
          text: `This Notice covers health information created or received by ${LEGAL_ENTITY.name} and its providers in connection with your care, including intake questionnaires, photographs you submit, clinical messages, visit notes, prescriptions, laboratory orders and results, billing records, and related documentation stored in your electronic medical record.`,
        },
        {
          type: "p",
          text: "We share information with pharmacies, laboratories, and technology vendors only as needed to treat you, operate the practice, and as otherwise described in this Notice. Those vendors that handle medical information on our behalf do so under written business associate agreements that require them to protect it.",
        },
      ],
    },
    {
      title: "Your rights",
      blocks: [
        {
          type: "p",
          text: "When it comes to your health information, you have certain rights. This section explains your rights and some of our responsibilities to help you.",
        },
      ],
      subsections: [
        {
          title: "Get an electronic or paper copy of your medical record",
          blocks: [
            {
              type: "ul",
              items: [
                "You can ask to see or get an electronic or paper copy of your medical record and other health information we have about you. Ask us how to do this, including through your patient account when that access is available.",
                "We will provide a copy or a summary of your health information, usually within 30 days of your request. We may charge a reasonable, cost-based fee.",
              ],
            },
          ],
        },
        {
          title: "Ask us to correct your medical record",
          blocks: [
            {
              type: "ul",
              items: [
                "You can ask us to correct health information about you that you think is incorrect or incomplete. Ask us how to do this.",
                "We may say no to your request, but we will tell you why in writing within 60 days.",
              ],
            },
          ],
        },
        {
          title: "Request confidential communications",
          blocks: [
            {
              type: "ul",
              items: [
                "You can ask us to contact you in a specific way (for example, home, office, or cell phone) or to send mail to a different address.",
                "We will say yes to all reasonable requests.",
              ],
            },
          ],
        },
        {
          title: "Ask us to limit what we use or share",
          blocks: [
            {
              type: "ul",
              items: [
                "You can ask us not to use or share certain health information for treatment, payment, or our operations. We are not required to agree to your request, and we may say no if it could affect your care. If we agree, we may still share this information if you need emergency treatment.",
                "If you pay for a service or health care item out of pocket in full, you can ask us not to share that information for the purpose of payment or our operations with your health insurer. We will say yes unless a law requires us to share that information.",
              ],
            },
          ],
        },
        {
          title: "Get a list of those with whom we have shared information",
          blocks: [
            {
              type: "ul",
              items: [
                "You can ask for a list (accounting) of the times we have shared your health information for six years prior to the date you ask, who we shared it with, and why.",
                "We will include all the disclosures except for those about treatment, payment, and health care operations, and certain other disclosures (such as any you asked us to make). We will provide one accounting a year for free but will charge a reasonable, cost-based fee if you ask for another one within 12 months.",
              ],
            },
          ],
        },
        {
          title: "Get a copy of this privacy notice",
          blocks: [
            {
              type: "p",
              text: "You can ask for a paper copy of this notice at any time, even if you have agreed to receive the notice electronically. We will provide you with a paper copy promptly.",
            },
          ],
        },
        {
          title: "Choose someone to act for you",
          blocks: [
            {
              type: "ul",
              items: [
                "If someone has authority to act as your personal representative, such as if someone has your medical power of attorney or if someone is your legal guardian, that person can exercise your rights and make choices about your health information.",
                "We will make sure the person has this authority and can act for you before we take any action.",
                `If you want a spouse, family member, caregiver, or other person who is not your legal representative to receive information about your care, you must complete a separate HIPAA authorization. You do not need to sign that authorization to receive treatment.`,
              ],
            },
          ],
        },
        {
          title: "File a complaint if you feel your rights are violated",
          blocks: [
            {
              type: "ul",
              items: [
                `You can complain if you feel we have violated your rights by contacting the ${LEGAL_ENTITY.privacyOfficerTitle} using the information at the end of this Notice.`,
                "You can file a complaint with the U.S. Department of Health and Human Services Office for Civil Rights by sending a letter to 200 Independence Avenue, S.W., Washington, D.C. 20201, calling 1-877-696-6775, or visiting https://www.hhs.gov/hipaa/filing-a-complaint/index.html.",
                "We will not retaliate against you for filing a complaint.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Your choices",
      blocks: [
        {
          type: "p",
          text: "For certain health information, you can tell us your choices about what we share. If you have a clear preference for how we share your information in the situations described below, talk to us. Tell us what you want us to do, and we will follow your instructions.",
        },
      ],
      subsections: [
        {
          title: "In these cases, you have both the right and choice to tell us to",
          blocks: [
            {
              type: "ul",
              items: [
                "Share information with your family, close friends, or others involved in your care or payment for your care",
                "Share information in a disaster relief situation",
              ],
            },
            {
              type: "p",
              text: "If you are not able to tell us your preference, for example if you are unconscious, we may go ahead and share your information if we believe it is in your best interest. We may also share your information when needed to lessen a serious and imminent threat to health or safety.",
            },
          ],
        },
        {
          title: "In these cases we never share your information unless you give us written permission",
          blocks: [
            {
              type: "ul",
              items: [
                "Marketing purposes",
                "Sale of your information",
                "Most sharing of psychotherapy notes",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Our uses and disclosures",
      blocks: [
        {
          type: "p",
          text: "We typically use or share your health information in the following ways.",
        },
      ],
      subsections: [
        {
          title: "Treat you",
          blocks: [
            {
              type: "p",
              text: "We can use your health information and share it with other professionals who are treating you, including pharmacists who dispense prescribed medications and laboratories that perform ordered tests. Example: A clinician reviewing your intake shares relevant history with the pharmacy that will fill your prescription.",
            },
          ],
        },
        {
          title: "Run our organization",
          blocks: [
            {
              type: "p",
              text: "We can use and share your health information to run our practice, improve your care, and contact you when necessary. Example: We use health information about you to manage your treatment, quality review, and customer support.",
            },
          ],
        },
        {
          title: "Bill for your services",
          blocks: [
            {
              type: "p",
              text: "We can use and share your health information to bill and collect payment. Care through the Platform is generally cash-pay and is not billed to insurance unless we expressly tell you otherwise. Example: We use your contact and order information to process payment and send receipts.",
            },
          ],
        },
        {
          title: "Help with public health and safety issues",
          blocks: [
            {
              type: "p",
              text: "We can share health information about you for certain situations such as:",
            },
            {
              type: "ul",
              items: [
                "Preventing disease",
                "Helping with product recalls",
                "Reporting adverse reactions to medications",
                "Reporting suspected abuse, neglect, or domestic violence",
                "Preventing or reducing a serious threat to anyone's health or safety",
              ],
            },
          ],
        },
        {
          title: "Do research",
          blocks: [
            {
              type: "p",
              text: "We can use or share your information for health research when permitted by law.",
            },
          ],
        },
        {
          title: "Comply with the law",
          blocks: [
            {
              type: "p",
              text: "We will share information about you if state or federal laws require it, including with the Department of Health and Human Services if it wants to see that we are complying with federal privacy law.",
            },
          ],
        },
        {
          title: "Address workers' compensation, law enforcement, and other government requests",
          blocks: [
            {
              type: "p",
              text: "We can use or share health information about you:",
            },
            {
              type: "ul",
              items: [
                "For workers' compensation claims",
                "For law enforcement purposes or with a law enforcement official",
                "With health oversight agencies for activities authorized by law",
                "For special government functions such as military, national security, and presidential protective services",
              ],
            },
          ],
        },
        {
          title: "Respond to lawsuits and legal actions",
          blocks: [
            {
              type: "p",
              text: "We can share health information about you in response to a court or administrative order, or in response to a subpoena.",
            },
          ],
        },
        {
          title: "Substance use disorder records",
          blocks: [
            {
              type: "p",
              text: "To the extent that we have your substance use disorder patient records, subject to 42 CFR Part 2, we will not share that information for investigations or legal proceedings against you without (1) your written consent or (2) a court order and a subpoena. In all cases, if we have substance use disorder patient records about you, we cannot use or share information in those records in civil, criminal, administrative, or legislative investigations or proceedings against you without (1) your consent or (2) a court order and a subpoena.",
            },
          ],
        },
      ],
    },
    {
      title: "Our responsibilities",
      blocks: [
        {
          type: "ul",
          items: [
            "We are required by law to maintain the privacy and security of your protected health information.",
            "We will let you know promptly if a breach occurs that may have compromised the privacy or security of your information.",
            "We must follow the duties and privacy practices described in this notice and give you a copy of it.",
            "We will not use or share your information other than as described in this notice unless you tell us we can in writing. If you tell us we can, you may change your mind at any time. Let us know in writing if you change your mind.",
          ],
        },
        {
          type: "p",
          text: "For more information see: https://www.hhs.gov/ocr/privacy/hipaa/understanding/consumers/noticepp.html.",
        },
      ],
    },
    {
      title: "Changes to the terms of this Notice",
      blocks: [
        {
          type: "p",
          text: "We can change the terms of this notice, and the changes will apply to all information we have about you. The new notice will be available upon request, in our office, and on our website.",
        },
      ],
    },
    {
      title: "California privacy",
      blocks: [
        {
          type: "p",
          text: "If you are a California resident, the California Confidentiality of Medical Information Act may provide additional limits on how we disclose your medical information. Where California law is more protective than HIPAA, we will follow California law.",
        },
      ],
    },
    {
      title: "How to reach us",
      blocks: [
        {
          type: "p",
          text: `Questions, complaints, record requests, restriction requests, and written authorizations or revocations should be sent to the ${LEGAL_ENTITY.privacyOfficerTitle}:`,
        },
        {
          type: "address",
          lines: [
            ...LEGAL_ENTITY.addressLines,
            LEGAL_ENTITY.privacyEmail,
          ],
        },
        {
          type: "p",
          text: `You may also contact support at ${LEGAL_ENTITY.supportEmail}.`,
        },
      ],
    },
  ],
  related: [
    { label: "Telehealth consent", href: LEGAL_ROUTES.telehealth },
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
