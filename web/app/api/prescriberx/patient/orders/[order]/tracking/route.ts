import { GENERIC_VALIDATION, authJson } from "@/lib/prescriberx/auth-errors";
import { patientGetProxy } from "@/lib/prescriberx/patient-proxy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ order: string }> };

export async function GET(request: Request, { params }: Params) {
  const { order } = await params;
  const id = order.trim();
  if (!id || id.includes("/") || id.includes("..")) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "validation" },
      422,
    );
  }
  return patientGetProxy(
    request,
    `/me/patient/orders/${encodeURIComponent(id)}/tracking`,
  );
}
