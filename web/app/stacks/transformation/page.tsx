import { notFound } from "next/navigation";
import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { catalogPdp } from "@/content/pdp/catalog";

const data = catalogPdp("appetite-balance");

export const metadata = {
  title: data?.metadataTitle ?? "TIDL · Appetite Balance",
  description: data?.metadataDescription,
};

export default function TransformationStackPage() {
  if (!data) notFound();
  return <CategoryPdpLive data={data} />;
}
