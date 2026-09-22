import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { VisitContinue } from "@/components/care/VisitContinue";
import { assertEncounterReadyForVisit } from "@/lib/prescriberx/protocol-gate";

export const metadata = {
  title: "TIDL · Physician visit",
  description: "A video visit with your physician is required for this care path.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string; encounter?: string; demo?: string }>;
};

export default async function CareVisitPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entrySlug = params.entry || "testosterone";
  await assertEncounterReadyForVisit({
    encounterId: params.encounter,
    entrySlug,
    demo: params.demo,
  });

  return (
    <CarePortalChrome>
      <VisitContinue
        entrySlug={entrySlug}
        encounterId={params.encounter}
        demo={params.demo === "1"}
      />
    </CarePortalChrome>
  );
}
