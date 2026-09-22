import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { telehealthConsent } from "@/content/legal/telehealth-consent";

export const metadata = {
  title: `TIDL · ${telehealthConsent.title}`,
  description: telehealthConsent.description,
};

export default function TelehealthConsentPage() {
  return <LegalDocumentPage document={telehealthConsent} />;
}
