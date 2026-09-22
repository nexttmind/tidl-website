import { redirect } from "next/navigation";
import { CATALOG_HREF } from "@/content/fixtures/catalog";

export default function ProgramsIndexPage() {
  redirect(CATALOG_HREF);
}
