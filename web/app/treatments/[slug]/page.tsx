import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { catalogHref, catalogIdFor, catalogIdsUnder, catalogRoute } from "@/content/catalog/routes";
import { catalogPdp } from "@/content/pdp/catalog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogIdsUnder("/treatments").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = catalogPdp(catalogIdFor(slug));
  if (!data) return {};
  return {
    title: data.metadataTitle,
    description: data.metadataDescription,
  };
}

export default async function TreatmentPage({ params }: PageProps) {
  const { slug } = await params;
  const id = catalogIdFor(slug);
  const route = catalogRoute(id);
  const href = route ? catalogHref(id) : undefined;
  if (href && href !== `/treatments/${slug}`) redirect(href);
  const data = catalogPdp(id);
  if (!route || href !== `/treatments/${slug}` || !data) notFound();
  return <CategoryPdpLive data={data} />;
}
