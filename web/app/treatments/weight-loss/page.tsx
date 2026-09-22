import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { weightLossPdp } from "@/content/fixtures/weight-loss-pdp";
import type { CategoryPdpData } from "@/content/pdp/types";

export const metadata = {
  title: "TIDL · Weight Loss",
  description:
    "Physician guided GLP 1 weight loss care. Available if prescribed after clinical review.",
};

export default function WeightLossPage() {
  return (
    <CategoryPdpLive data={weightLossPdp as unknown as CategoryPdpData} />
  );
}
