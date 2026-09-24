import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  triggerPasswordForgot,
  verifyPatientLogin,
} from "./auth-password-setup";

describe("auth-password-setup", () => {
  it("verifyPatientLogin rejects short passwords without calling fetch", async () => {
    const ok = await verifyPatientLogin(
      "https://demo.prescribe-rx.com/api/v1",
      "a@b.co",
      "short",
    );
    assert.equal(ok, false);
  });

  it("triggerPasswordForgot returns false on network throw", async () => {
    const ok = await triggerPasswordForgot("http://127.0.0.1:1", "a@b.co");
    assert.equal(ok, false);
  });
});
