import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { ProtocolOrder } from "@/components/care/ProtocolOrder";
import { resolveCareProtocol } from "@/content/fixtures/care-protocol";
import { assertEncounterReadyForProtocol } from "@/lib/prescriberx/protocol-gate";

export const metadata = {
  title: "TIDL · Your care protocol",
  description:
    "Review your physician approved protocol and place your order.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string; encounter?: string; demo?: string }>;
};

export default async function CareProtocolPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entrySlug = params.entry || "executives";
  await assertEncounterReadyForProtocol({
    encounterId: params.encounter,
    entrySlug,
    demo: params.demo,
  });
  const protocol = resolveCareProtocol(entrySlug);

  return (
    <CarePortalChrome>
      <ProtocolOrder
        protocol={protocol}
        entrySlug={entrySlug}
        encounterId={params.encounter}
        approved
        demo={params.demo === "1"}
      />
    </CarePortalChrome>
  );
}
