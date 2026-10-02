import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPdp } from "@/components/pdp/CategoryPdp";
import { catalogHref, catalogIdFor, catalogRoute } from "@/content/catalog/routes";
import { catalogPdp } from "@/content/pdp/catalog";
import { PROGRAM_PDPS, PROGRAM_SLUGS } from "@/content/pdp/programs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROGRAM_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = catalogIdFor(slug);
  if (catalogRoute(id) && catalogHref(id) === `/programs/${slug}`) {
    const data = catalogPdp(id);
    if (!data) return {};
    return {
      title: data.metadataTitle,
      description: data.metadataDescription,
    };
  }
  const data = PROGRAM_PDPS[slug];
  if (!data) return {};
  return {
    title: data.metadataTitle,
    description: data.metadataDescription,
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;
  const id = catalogIdFor(slug);
  const route = catalogRoute(id);
  if (route && catalogHref(id) === `/programs/${slug}`) {
    const data = catalogPdp(id);
    if (!data) notFound();
    return <CategoryPdp data={data} />;
  }
  const data = PROGRAM_PDPS[slug];
  if (!data) notFound();
  return <CategoryPdp data={data} />;
}
