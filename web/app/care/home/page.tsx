import { AccountHome } from "@/components/care/AccountHome";
import { CarePortalChrome } from "@/components/care/CarePortalChrome";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";

export const metadata = {
  title: "TIDL · Your account",
  description:
    "Track orders, review your protocol, and manage care from your TIDL account.",
};

type PageProps = {
  searchParams: Promise<{ entry?: string; demo?: string }>;
};

export default async function CareHomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const entry = resolveClinicalEntry(params.entry);

  return (
    <CarePortalChrome>
      <AccountHome entrySlug={entry.slug} demo={params.demo === "1"} />
    </CarePortalChrome>
  );
}
