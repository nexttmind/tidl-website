/** PrescribeRx demo admin deep links (sandbox ops). Not used in patient UI. */

import type { PrescribeRxEnv } from "./env";

export const TIDL_SANDBOX_SALES_ORG_ID = "019f3d35-afc4-72f8-b055-6c86c27ac1b3";
export const TIDL_SANDBOX_ORG_NUMBER = "ORG-7144184834";

const DEMO_ADMIN_ORIGIN = "https://demo.prescribe-rx.com";

export function adminEncounterManageUrl(encounterUuid: string): string {
  return `${DEMO_ADMIN_ORIGIN}/admin/encounter/${encodeURIComponent(encounterUuid)}`;
}

export function adminEncountersForSalesOrg(salesOrgId: string): string {
  const q = new URLSearchParams({
    sales_organization_id: salesOrgId,
    per_page: "25",
  });
  return `${DEMO_ADMIN_ORIGIN}/admin/encounter/encounters?${q}`;
}

export function adminOrganizationEditUrl(salesOrgId: string): string {
  return `${DEMO_ADMIN_ORIGIN}/admin/organization/${encodeURIComponent(salesOrgId)}/edit`;
}

export function adminWebhooksCreateUrl(): string {
  return `${DEMO_ADMIN_ORIGIN}/admin/system/webhooks/create`;
}

/** Dev-only hints on `/api/prescriberx/health` when a sales org is pinned. */
export function buildSandboxAdminHints(
  env: PrescribeRxEnv,
): Record<string, string> | null {
  if (process.env.NODE_ENV === "production") return null;
  if (!env.salesOrgId?.trim()) return null;
  const id = env.salesOrgId.trim();
  return {
    encountersFiltered: adminEncountersForSalesOrg(id),
    organizationEdit: adminOrganizationEditUrl(id),
    webhooksCreate: adminWebhooksCreateUrl(),
  };
}
