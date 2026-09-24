import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { ProtocolCheckout } from "@/components/care/ProtocolCheckout";
import { resolveCareProtocol } from "@/content/fixtures/care-protocol";
import { getPrescribeRxEnv } from "@/lib/prescriberx/env";
import { assertEncounterReadyForProtocol } from "@/lib/prescriberx/protocol-gate";
import { isPrxCollectorPaymentsEnabled } from "@/lib/prescriberx/prx-collector-config";
import { isSandboxDemoQuery } from "@/lib/prescriberx/sandbox-demo";

export const metadata = {
  title: "TIDL · Checkout",
  description: "Complete payment for your physician-approved protocol.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string; encounter?: string; demo?: string }>;
};

export default async function CareCheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entrySlug = params.entry || "executives";
  await assertEncounterReadyForProtocol({
    encounterId: params.encounter,
    entrySlug,
    demo: params.demo,
  });
  const protocol = resolveCareProtocol(entrySlug);
  const prxEnv = getPrescribeRxEnv();
  const prxCollector = isPrxCollectorPaymentsEnabled();
  const sandboxPayment = prxEnv?.sandbox === true && !prxCollector;

  return (
    <CarePortalChrome>
      <ProtocolCheckout
        protocol={protocol}
        entrySlug={entrySlug}
        encounterId={params.encounter}
        approved
        demo={isSandboxDemoQuery(params.demo)}
        sandboxPayment={sandboxPayment}
        prxCollector={prxCollector}
      />
    </CarePortalChrome>
  );
}
