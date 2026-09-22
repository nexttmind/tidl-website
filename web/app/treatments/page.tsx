import { redirect } from "next/navigation";
import { CATALOG_HREF } from "@/content/fixtures/catalog";

export default function TreatmentsIndexPage() {
  redirect(CATALOG_HREF);
}
