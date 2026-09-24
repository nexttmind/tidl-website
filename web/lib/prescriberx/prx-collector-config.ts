/** Launch path: PrescribeRx is merchant of record (Authorize.net via PRX vault). */

import { getPrescribeRxEnv, isDemoPrescribeRxBase } from "./env";

export type PrxAcceptJsConfig = {
  apiLoginId: string;
  clientKey: string;
  acceptJsUrl: string;
  gatewayProvider: "authorize_net";
};

export function hasPrxAcceptJsCredentials(): boolean {
  const login = process.env.PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID?.trim();
  const key = process.env.PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY?.trim();
  return Boolean(login && key);
}

/** True when TIDL checkout should vault/charge through PrescribeRx (not record-only). */
export function isPrxCollectorPaymentsEnabled(): boolean {
  const flag = process.env.PRESCRIBERX_COLLECTOR_PAYMENTS?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return hasPrxAcceptJsCredentials();
  return hasPrxAcceptJsCredentials();
}

export function getPrxAcceptJsConfig(): PrxAcceptJsConfig | null {
  if (!isPrxCollectorPaymentsEnabled()) return null;
  const apiLoginId = process.env.PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID?.trim();
  const clientKey = process.env.PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY?.trim();
  if (!apiLoginId || !clientKey) return null;

  const env = getPrescribeRxEnv();
  const sandboxHost = env ? isDemoPrescribeRxBase(env.baseUrl) : true;
  const acceptJsUrl = sandboxHost
    ? "https://jstest.authorize.net/v1/Accept.js"
    : "https://js.authorize.net/v1/Accept.js";

  return {
    apiLoginId,
    clientKey,
    acceptJsUrl,
    gatewayProvider: "authorize_net",
  };
}
