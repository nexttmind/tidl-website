import { notFound } from "next/navigation";
import { CategoryPdp } from "@/components/pdp/CategoryPdp";
import { catalogPdp } from "@/content/pdp/catalog";

const data = catalogPdp("weight-loss");

export const metadata = {
  title: data?.metadataTitle ?? "TIDL · Weight Loss",
  description: data?.metadataDescription,
};

export default function WeightLossPage() {
  if (!data) notFound();
  return <CategoryPdp data={data} />;
}
