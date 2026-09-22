import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { WaitingReview } from "@/components/care/WaitingReview";
import { isSandboxDemoQuery } from "@/lib/prescriberx/protocol-gate";

export const metadata = {
  title: "TIDL · Waiting for review",
  description: "Waiting for the physician to review your information.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string; encounter?: string; demo?: string }>;
};

export default async function CareWaitingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <CarePortalChrome>
      <WaitingReview
        entrySlug={params.entry || "symptoms"}
        encounterId={params.encounter}
        demoAllowed={isSandboxDemoQuery(params.demo)}
      />
    </CarePortalChrome>
  );
}
