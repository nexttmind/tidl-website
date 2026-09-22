import { AccountWizard } from "@/components/care/AccountWizard";
import { IntakeSplitShell } from "@/components/care/IntakeSplitShell";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";

export const metadata = {
  title: "TIDL · Account",
  description: "Log in or create your TIDL account to continue care.",
};

type PageProps = {
  searchParams: Promise<{
    entry?: string;
    encounter?: string;
    mode?: string;
    next?: string;
  }>;
};

export default async function CareAccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entry = resolveClinicalEntry(params.entry);
  const initialMode = params.mode === "login" ? "login" : "create";

  return (
    <IntakeSplitShell entry={entry}>
      <AccountWizard
        entrySlug={entry.slug}
        encounterId={params.encounter}
        initialMode={initialMode}
        nextPath={params.next}
      />
    </IntakeSplitShell>
  );
}
