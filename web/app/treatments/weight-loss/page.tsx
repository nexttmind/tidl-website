import { notFound } from "next/navigation";
import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { catalogPdp } from "@/content/pdp/catalog";

const data = catalogPdp("weight-loss");

export const metadata = {
  title: data?.metadataTitle ?? "TIDL · Weight Loss",
  description: data?.metadataDescription,
};

export default function WeightLossPage() {
  if (!data) notFound();
  return <CategoryPdpLive data={data} />;
}
