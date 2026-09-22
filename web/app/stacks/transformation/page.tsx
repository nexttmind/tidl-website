import { CategoryPdpLive } from "@/components/pdp/CategoryPdpLive";
import { transformationPdp } from "@/content/fixtures/transformation-pdp";

export const metadata = {
  title: transformationPdp.metadataTitle,
  description: transformationPdp.metadataDescription,
};

export default function TransformationStackPage() {
  return <CategoryPdpLive data={transformationPdp} />;
}
