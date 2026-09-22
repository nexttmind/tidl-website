import { ALL_TREATMENTS } from "@/content/fixtures/ask-tidl";
import { CATALOG_HREF } from "@/content/fixtures/catalog";
import { PEPTIDE_GUIDE_HREF } from "@/content/fixtures/peptide-guide";
import { LEGAL_ROUTES } from "@/content/legal/entity";

export type FooterHrefLink = {
  label: string;
  href: string;
};

export type FooterLink =
  | FooterHrefLink
  | { label: string; action: "pricing-terms" };

export type FooterColumn = {
  title: string;
  /** Optional category landing href (View all). */
  href?: string;
  links: readonly FooterLink[];
};

/** Site footer catalog — mirrors the Treatments mega menu. */
export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Treatments",
    href: CATALOG_HREF,
    links: ALL_TREATMENTS.map(({ label, href }) => ({ label, href })),
  },
  {
    title: "Company",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Pricing and Terms", action: "pricing-terms" },
      { label: "Peptide Guide", href: PEPTIDE_GUIDE_HREF },
      { label: "Find a Treatment", href: CATALOG_HREF },
      { label: "Careers", href: "/careers" },
    ],
  },
] as const;

export type FooterSocial = {
  id: "instagram" | "tiktok" | "linkedin" | "youtube";
  label: string;
  href: string;
};

export const footerSocials: readonly FooterSocial[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/tidlsport/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@tidlsport",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/tidlsport",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@tidlsport",
  },
] as const;

export const footerLegalLinks: readonly FooterHrefLink[] = [
  { label: "Notice of Privacy Practices", href: LEGAL_ROUTES.npp },
  { label: "Telehealth Consent", href: LEGAL_ROUTES.telehealth },
  { label: "HIPAA Authorization", href: LEGAL_ROUTES.hipaaAuth },
  { label: "Electronic Communications", href: LEGAL_ROUTES.ecomm },
] as const;

export const footerCopy = {
  tagline: "The Longevity Company",
  copyright: "TIDL. The Longevity Company. All rights reserved.",
  legalNav: "Legal",
  compounding:
    "Compounded drugs are not reviewed or approved by the U.S. Food and Drug Administration (FDA) for safety, effectiveness, or quality. All compounded products on this website are prepared by licensed professionals strictly upon the receipt of a valid, individual prescription for an identified patient when commercially available options do not meet their medical needs. Compounded medications are customized to individual needs and are not considered FDA approved generic equivalents of commercially manufactured brand-name drugs.",
  capture: {
    placeholder: "you@email.com",
    submit: "Join",
    success: "You are on the list.",
    label: "Email",
  },
  socialNav: "TIDL on social",
  follow: "Follow",
  credit: "Designed & developed by Sigmaa Studio",
  creditCta: "Get in touch",
  creditEmail: "thomas@sigmaa.io",
} as const;
