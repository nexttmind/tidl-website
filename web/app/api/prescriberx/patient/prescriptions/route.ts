import { patientGetProxy } from "@/lib/prescriberx/patient-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return patientGetProxy(request, "/me/patient/prescriptions");
}
