import { IntakeSplitShell } from "@/components/care/IntakeSplitShell";
import { IntakeWizard } from "@/components/care/IntakeWizard";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";

export const metadata = {
  title: "TIDL · Clinical intake",
  description:
    "Share your information for physician review. Available if prescribed after clinical review.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string }>;
};

export default async function CareIntakePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entry = resolveClinicalEntry(params.entry);

  return (
    <IntakeSplitShell entry={entry}>
      <IntakeWizard entrySlug={entry.slug} />
    </IntakeSplitShell>
  );
}
