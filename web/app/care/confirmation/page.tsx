import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { OrderConfirmation } from "@/components/care/OrderConfirmation";
import { assertEncounterReadyForProtocol } from "@/lib/prescriberx/protocol-gate";

export const metadata = {
  title: "TIDL · Order confirmation",
  description: "Your order is confirmed after physician review.",
};

type PageProps = {
  searchParams: Promise<{
    entry?: string;
    encounter?: string;
    pay?: string;
    demo?: string;
  }>;
};

export default async function CareConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entrySlug = params.entry || "executives";
  await assertEncounterReadyForProtocol({
    encounterId: params.encounter,
    entrySlug,
    demo: params.demo,
  });

  return (
    <CarePortalChrome>
      <OrderConfirmation
        entrySlug={entrySlug}
        encounterId={params.encounter}
        payMethod={params.pay}
      />
    </CarePortalChrome>
  );
}
