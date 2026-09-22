export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "ol"; items: readonly string[] }
  | { type: "note"; text: string }
  | { type: "address"; lines: readonly string[] };

export type LegalSubsection = {
  title: string;
  blocks: readonly LegalBlock[];
};

export type LegalSection = {
  number?: string;
  title: string;
  blocks: readonly LegalBlock[];
  subsections?: readonly LegalSubsection[];
};

export type LegalRelated = {
  label: string;
  href: string;
};

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  meta: string;
  headerNotice?: string;
  lede?: string;
  sections: readonly LegalSection[];
  related?: readonly LegalRelated[];
};
