import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import {
  HEALTH_GOAL_PDPS,
  HEALTH_GOAL_SLUGS,
} from "@/content/pdp/health-goals";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return HEALTH_GOAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = HEALTH_GOAL_PDPS[slug];
  if (!data) return {};
  return {
    title: data.metadataTitle,
    description: data.metadataDescription,
  };
}

export default async function HealthGoalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = HEALTH_GOAL_PDPS[slug];
  if (!data) notFound();
  return <CategoryPdpLive data={data} />;
}
