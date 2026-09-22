import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { PROGRAM_PDPS, PROGRAM_SLUGS } from "@/content/pdp/programs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROGRAM_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = PROGRAM_PDPS[slug];
  if (!data) return {};
  return {
    title: data.metadataTitle,
    description: data.metadataDescription,
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;
  const data = PROGRAM_PDPS[slug];
  if (!data) notFound();
  return <CategoryPdpLive data={data} />;
}
