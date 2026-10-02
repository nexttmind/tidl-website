import { symptomsCta } from "@/content/clinical/entry-map";

const openCareCta = symptomsCta();

export const LABS_HREF = "/labs";

export const labsCopy = {
  title: "MD Reviewed Blood Test",
  lede: "A single-use collection device shipped to you. One draw covers hormone, metabolic, and recovery review. Portal results in 72 hours.",
  price: "$199",
  compareAt: "$215",
  cta: openCareCta,
  media: {
    device: "/labs/device.png",
    kit: "/labs/kit.png",
    collection: "/labs/collection.png",
  },
  barrage: ["Answers", "Baseline", "Progress"] as const,
  paymentNote:
    "Payment is collected after a clinician reviews your intake and, if prescribed, the pharmacy is ready to fill. You then pay for the prescription and care.",
  points: [
    {
      title: "Single-use collection",
      body: "A single-use lancet with integrated sharps protection. Collect at home. No clinic visit.",
    },
    {
      title: "Shipped to you",
      body: "Drop shipped to your door. A QR code walks you through collection and the mailbox return.",
    },
    {
      title: "Results in 72 hours",
      body: "Results land in your portal. Your clinician reads them before a plan is prescribed.",
    },
    {
      title: "Bundle with care",
      body: "Add it to any package. Built to sit inside a care plan, not as a standalone errand.",
    },
  ],
} as const;
