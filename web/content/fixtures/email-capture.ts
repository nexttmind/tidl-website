/**
 * Email capture modal copy.
 *
 * Precedents baked into structure (see EmailCaptureProvider for timing):
 * - Klaviyo two-step email then SMS (reduces email friction 40–60% vs phone-required)
 * - MERIT / high-converting Klaviyo forms: image + clear incentive + short value line
 * - Incentive is access framed, not outcome framed (compliance)
 */

export const CAPTURE_COPY = {
  stepEmail: {
    eyebrow: "Early access",
    title: "Be first when new stacks open",
    body: "Drop your email for practitioner notes and early access. No spam.",
    placeholder: "you@email.com",
    submit: "Get early access",
    dismiss: "No thanks",
  },
  stepPhone: {
    eyebrow: "Optional",
    title: "Want a text when it opens?",
    body: "Add your number for first word on protocol openings. Skip anytime.",
    placeholder: "(555) 555-0123",
    submit: "Text me first",
    skip: "Email is enough",
    consent:
      "By continuing, you agree to receive recurring marketing texts from TIDL. Msg and data rates may apply. Reply STOP to opt out. Consent is not a condition of purchase.",
  },
  success: {
    title: "You are on the list",
    body: "Check your inbox for a welcome note. We will write when something worth opening ships.",
    close: "Continue browsing",
  },
  errors: {
    email: "Enter a valid email address",
    phone: "Enter a valid US phone number",
    consent: "Confirm text consent to continue",
    generic: "Something went wrong. Try again.",
    storage: "Lead storage is not configured yet.",
  },
  media: {
    src: "/landing/category/hero-athlete.png",
    alt: "Athlete driving a sled in training",
    logoSrc: "/brand/tidl-wordmark.svg",
    logoAlt: "TIDL",
  },
  a11y: {
    dialogLabel: "Join the TIDL list",
    close: "Close",
  },
} as const;

/**
 * Timing strategy (industry consensus, 2025–2026):
 * - Never on page load (Google interstitial risk + bounce; Visisto: page-load 1.9% CR)
 * - Engaged: scroll ≥45% AND time ≥7s
 * - Fallback: time ≥7s
 * - Exit intent desktop after ≥7s
 * - Once per session; suppress 14 days after dismiss; permanent after subscribe
 * - Skip /care/* clinical routes
 */
export const CAPTURE_TIMING = {
  minEngageMs: 7_000,
  scrollDepth: 0.45,
  fallbackMs: 7_000,
  exitIntentMinMs: 7_000,
  dismissDays: 14,
  excludePathPrefixes: ["/care", "/brand"] as const,
} as const;
