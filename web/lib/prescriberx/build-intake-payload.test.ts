import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildUnifiedIntakePayload } from "./build-intake-payload";
import type { EncounterSchemaData } from "./schema-types";

const minimalSchema: EncounterSchemaData = {
  encounter_type: { id: "019d0000-0000-7000-8000-000000000001", name: "Test", slug: "test" },
  steps: [],
};

describe("buildUnifiedIntakePayload tenancy", () => {
  it("prefers sales_org_id over client_id when both inputs are provided", () => {
    const payload = buildUnifiedIntakePayload({
      schema: minimalSchema,
      values: {},
      salesOrgId: "019f3d35-afc4-72f8-b055-6c86c27ac1b3",
      clientId: "019c94dd-8292-7112-9e5b-c458125e8d33",
    });
    assert.equal(payload.sales_org_id, "019f3d35-afc4-72f8-b055-6c86c27ac1b3");
    assert.equal("client_id" in payload, false);
  });

  it("sets client_id when only clientId is provided", () => {
    const payload = buildUnifiedIntakePayload({
      schema: minimalSchema,
      values: {},
      clientId: "019c94dd-8292-7112-9e5b-c458125e8d33",
    });
    assert.equal(payload.client_id, "019c94dd-8292-7112-9e5b-c458125e8d33");
    assert.equal("sales_org_id" in payload, false);
  });
});
