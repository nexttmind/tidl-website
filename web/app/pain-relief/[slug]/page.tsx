import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPdp } from "@/components/pdp/CategoryPdp";
import {
  PAIN_RELIEF_PDPS,
  PAIN_RELIEF_SLUGS,
} from "@/content/pdp/pain-relief";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PAIN_RELIEF_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = PAIN_RELIEF_PDPS[slug];
  if (!data) return {};
  return {
    title: data.metadataTitle,
    description: data.metadataDescription,
  };
}

export default async function PainReliefProductPage({ params }: PageProps) {
  const { slug } = await params;
  const data = PAIN_RELIEF_PDPS[slug];
  if (!data) notFound();
  return <CategoryPdp data={data} />;
}
