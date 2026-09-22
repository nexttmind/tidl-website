import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { hipaaAuthorization } from "@/content/legal/hipaa-authorization";

export const metadata = {
  title: `TIDL · ${hipaaAuthorization.title}`,
  description: hipaaAuthorization.description,
};

export default function HipaaAuthorizationPage() {
  return <LegalDocumentPage document={hipaaAuthorization} />;
}
