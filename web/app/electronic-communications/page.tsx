import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { electronicCommunicationsConsent } from "@/content/legal/electronic-communications";

export const metadata = {
  title: `TIDL · ${electronicCommunicationsConsent.title}`,
  description: electronicCommunicationsConsent.description,
};

export default function ElectronicCommunicationsPage() {
  return <LegalDocumentPage document={electronicCommunicationsConsent} />;
}
