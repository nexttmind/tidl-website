import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { noticeOfPrivacyPractices } from "@/content/legal/privacy-practices";

export const metadata = {
  title: `TIDL · ${noticeOfPrivacyPractices.title}`,
  description: noticeOfPrivacyPractices.description,
};

export default function NoticeOfPrivacyPracticesPage() {
  return <LegalDocumentPage document={noticeOfPrivacyPractices} />;
}
