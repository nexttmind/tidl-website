import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  hasPrxAcceptJsCredentials,
  isPrxCollectorPaymentsEnabled,
} from "./prx-collector-config";

describe("prx-collector-config", () => {
  afterEach(() => {
    delete process.env.PRESCRIBERX_COLLECTOR_PAYMENTS;
    delete process.env.PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID;
    delete process.env.PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY;
  });

  it("is disabled without Accept.js credentials", () => {
    process.env.PRESCRIBERX_COLLECTOR_PAYMENTS = "true";
    assert.equal(hasPrxAcceptJsCredentials(), false);
    assert.equal(isPrxCollectorPaymentsEnabled(), false);
  });

  it("enables when flag true and credentials present", () => {
    process.env.PRESCRIBERX_COLLECTOR_PAYMENTS = "true";
    process.env.PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID = "login";
    process.env.PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY = "key";
    assert.equal(isPrxCollectorPaymentsEnabled(), true);
  });
});
