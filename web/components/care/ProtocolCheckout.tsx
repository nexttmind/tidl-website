"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  readIntakeHandoff,
  type IntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import type { CareProtocolOrder } from "@/content/fixtures/care-protocol";
import {
  resolveTetherRail,
  tetherCheckout,
  usdtAmount,
  type TetherRailId,
} from "@/content/fixtures/tether-checkout";
import {
  fetchCheckoutConfig,
  recordProtocolPayment,
  type CheckoutConfig,
  type ProtocolPayMethod,
} from "@/lib/prescriberx/browse-api";
import styles from "./ProtocolOrder.module.css";

type AcceptDispatchResponse = {
  opaqueData?: { dataDescriptor?: string; dataValue?: string };
  messages?: { message?: { code?: string; text?: string }[] };
};

declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
            zip?: string;
          };
        },
        callback: (response: AcceptDispatchResponse) => void,
      ) => void;
    };
  }
}

function loadAcceptJsScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Could not load the payment library. Try again."));
    document.body.appendChild(script);
  });
}

function parseExpiry(raw: string): { month: number; year: number } | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return null;
  const month = Number.parseInt(digits.slice(0, 2), 10);
  let year = Number.parseInt(digits.slice(2), 10);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12 || year < 2024) return null;
  return { month, year };
}

function inferCardBrand(cardNumber: string): string {
  const d = cardNumber.replace(/\D/g, "");
  if (d.startsWith("4")) return "Visa";
  if (d.startsWith("5")) return "Mastercard";
  if (d.startsWith("34") || d.startsWith("37")) return "Amex";
  if (d.startsWith("6")) return "Discover";
  return "Visa";
}

type PayMethod = "card" | "tether";
type SandboxPayMethod = ProtocolPayMethod;

type Props = {
  protocol: CareProtocolOrder;
  entrySlug: string;
  encounterId?: string;
  approved?: boolean;
  demo?: boolean;
  sandboxPayment?: boolean;
  prxCollector?: boolean;
};

function TetherMark() {
  return (
    <svg
      className={styles.tetherMark}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
    >
      <polygon points="16 3 28 10 28 22 16 29 4 22 4 10" />
      <path
        d="M10.5 12.4h11v2.3h-4.4v7.3h-2.2v-7.3h-4.4z"
        fill="var(--surface-page)"
      />
    </svg>
  );
}

export function ProtocolCheckout({
  protocol,
  entrySlug,
  encounterId,
  approved = false,
  demo = false,
  sandboxPayment = false,
  prxCollector = false,
}: Props) {
  const router = useRouter();
  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(
    null,
  );
  const [cardNumber, setCardNumber] = useState(
    demo ? "4242 4242 4242 4242" : "",
  );
  const [expiry, setExpiry] = useState(demo ? "12 / 28" : "");
  const [cvc, setCvc] = useState(demo ? "123" : "");
  const [zip, setZip] = useState(demo ? "90405" : "");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [sandboxPayMethod, setSandboxPayMethod] =
    useState<SandboxPayMethod>("card");
  const [collectorPayMethod, setCollectorPayMethod] =
    useState<SandboxPayMethod>("card");
  const [tetherRail, setTetherRail] = useState<TetherRailId>("tron");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const h = readIntakeHandoff();
    setHandoff(h);
    if (h?.firstName) setFirstName(h.firstName);
    if (h?.lastName) setLastName(h.lastName);
  }, []);

  useEffect(() => {
    if (!prxCollector) return;
    void fetchCheckoutConfig().then(setCheckoutConfig);
  }, [prxCollector]);

  const resolvedEncounter = encounterId || handoff?.encounterId || "";
  const rail = resolveTetherRail(tetherRail);
  const tetherTotal = usdtAmount(protocol.price);

  const backParams = new URLSearchParams({ entry: entrySlug });
  if (resolvedEncounter) backParams.set("encounter", resolvedEncounter);
  if (demo) backParams.set("demo", "1");
  const protocolHref = `/care/protocol?${backParams.toString()}`;

  const confirmationHref = `/care/confirmation?${new URLSearchParams({
    entry: entrySlug,
    ...(resolvedEncounter ? { encounter: resolvedEncounter } : {}),
    ...(payMethod === "tether" ? { pay: "tether" } : {}),
    ...(demo ? { demo: "1" } : {}),
  }).toString()}`;

  const onDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!approved) {
      setError("This protocol is not available until a physician accepts your request.");
      return;
    }
    setSubmitting(true);
    router.push(confirmationHref);
  };

  const tokenizeWithAcceptJs = async (
    accept: NonNullable<CheckoutConfig["accept_js"]>,
  ): Promise<{ data_descriptor: string; data_value: string }> => {
    await loadAcceptJsScript(accept.script_url);
    if (!window.Accept?.dispatchData) {
      throw new Error("Payment library did not initialize.");
    }
    const parsed = parseExpiry(expiry);
    if (!parsed) {
      throw new Error("Enter a valid expiry (MM / YY).");
    }
    const cardDigits = cardNumber.replace(/\D/g, "");
    if (cardDigits.length < 13) {
      throw new Error("Enter a valid card number.");
    }
    if (!cvc.trim()) {
      throw new Error("Enter the card security code.");
    }

    return new Promise((resolve, reject) => {
      window.Accept!.dispatchData(
        {
          authData: {
            clientKey: accept.client_key,
            apiLoginID: accept.api_login_id,
          },
          cardData: {
            cardNumber: cardDigits,
            month: String(parsed.month).padStart(2, "0"),
            year: String(parsed.year),
            cardCode: cvc.trim(),
            zip: zip.trim() || undefined,
          },
        },
        (response) => {
          const descriptor = response.opaqueData?.dataDescriptor;
          const value = response.opaqueData?.dataValue;
          if (descriptor && value) {
            resolve({ data_descriptor: descriptor, data_value: value });
            return;
          }
          const msg =
            response.messages?.message?.[0]?.text ??
            "Card could not be tokenized. Check your details.";
          reject(new Error(msg));
        },
      );
    });
  };

  const onPrxCollectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!approved) {
      setError("This protocol is not available until a physician accepts your request.");
      return;
    }
    if (!resolvedEncounter) {
      setError("Missing encounter. Return to your account and open checkout again.");
      return;
    }
    const accept = checkoutConfig?.accept_js;
    if (!accept) {
      setError("Payment is not configured yet. Try again later.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter the name on your card.");
      return;
    }
    if (!billingStreet.trim() || !billingCity.trim() || !billingState.trim()) {
      setError("Enter your billing address.");
      return;
    }
    if (!zip.trim()) {
      setError("Enter your billing ZIP.");
      return;
    }

    setSubmitting(true);
    try {
      const opaque = await tokenizeWithAcceptJs(accept);
      const cardDigits = cardNumber.replace(/\D/g, "");
      const parsed = parseExpiry(expiry);
      if (!parsed) throw new Error("Enter a valid expiry (MM / YY).");

      await recordProtocolPayment({
        entrySlug,
        encounterId: resolvedEncounter,
        payMethod: collectorPayMethod,
        priceLabel: protocol.price,
        opaque_data: opaque,
        card_brand: inferCardBrand(cardDigits),
        last_four: cardDigits.slice(-4),
        exp_month: parsed.month,
        exp_year: parsed.year,
        billing_address: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          street: billingStreet.trim(),
          city: billingCity.trim(),
          state: billingState.trim().slice(0, 2).toUpperCase(),
          zip: zip.trim(),
        },
      });
      const params = new URLSearchParams({
        entry: entrySlug,
        encounter: resolvedEncounter,
        ...(collectorPayMethod === "hsa_fsa" ? { pay: "hsa_fsa" } : {}),
      });
      router.push(`/care/confirmation?${params.toString()}`);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete payment. Try again.",
      );
    }
  };

  const onSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!approved) {
      setError("This protocol is not available until a physician accepts your request.");
      return;
    }
    if (!resolvedEncounter) {
      setError("Missing encounter. Return to your account and open checkout again.");
      return;
    }
    setSubmitting(true);
    try {
      await recordProtocolPayment({
        entrySlug,
        encounterId: resolvedEncounter,
        payMethod: sandboxPayMethod,
        priceLabel: protocol.price,
      });
      const params = new URLSearchParams({
        entry: entrySlug,
        encounter: resolvedEncounter,
        ...(sandboxPayMethod === "hsa_fsa" ? { pay: "hsa_fsa" } : {}),
      });
      router.push(`/care/confirmation?${params.toString()}`);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error
          ? err.message
          : "Could not record payment in PrescribeRx. Try again.",
      );
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(rail.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy the address. Select it and copy it yourself.");
    }
  };

  return (
    <div className={styles.root}>
      <section
        className={`layout-constrain ${styles.checkoutSection}`}
        aria-labelledby="checkout-title"
      >
        <p className={styles.eyebrow}>Checkout</p>
        <h1 id="checkout-title" className={styles.title}>
          Complete your order
        </h1>
        <p className={styles.body}>
          Physician-approved protocol ·{" "}
          <Link href={protocolHref} className={styles.inlineLink}>
            Review protocol
          </Link>
        </p>

        <div className={styles.lineItem}>
          <div className={styles.lineThumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={protocol.gallery[0]?.src} alt="" />
          </div>
          <div className={styles.lineCopy}>
            <p className={styles.lineName}>{protocol.stackName}</p>
            <p className={styles.lineMeta}>{protocol.stackMeta}</p>
          </div>
          <p className={styles.linePrice}>{protocol.price}</p>
        </div>

        {demo ? (
          <form className={styles.payForm} onSubmit={onDemoSubmit} noValidate>
            <div className={styles.payMethods}>
              <p className={styles.label} id="pay-method-label">
                Pay with
              </p>
              <div
                className={styles.methodRow}
                role="radiogroup"
                aria-labelledby="pay-method-label"
              >
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={payMethod === "card"}
                  data-on={payMethod === "card" ? "true" : "false"}
                  onClick={() => setPayMethod("card")}
                >
                  {tetherCheckout.cardLabel}
                </button>
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={payMethod === "tether"}
                  data-on={payMethod === "tether" ? "true" : "false"}
                  onClick={() => setPayMethod("tether")}
                >
                  <TetherMark />
                  {tetherCheckout.methodLabel}
                  <span className={styles.methodMeta}>
                    {tetherCheckout.methodMeta}
                  </span>
                </button>
              </div>
            </div>
            {payMethod === "card" ? (
              <>
                <label className={styles.field}>
                  <span className={styles.label}>Card number</span>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </label>
                <div className={styles.fieldRow}>
                  <label className={styles.field}>
                    <span className={styles.label}>Expiry</span>
                    <input
                      className={styles.input}
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>CVC</span>
                    <input
                      className={styles.input}
                      autoComplete="cc-csc"
                      placeholder="•••"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                    />
                  </label>
                </div>
                <label className={styles.field}>
                  <span className={styles.label}>ZIP</span>
                  <input
                    className={styles.input}
                    autoComplete="postal-code"
                    placeholder="90405"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <div className={styles.tetherPanel}>
                <div className={styles.tetherAmount}>
                  <span className={styles.label}>Amount due</span>
                  <p className={styles.tetherTotal}>{tetherTotal}</p>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Send to</span>
                  <div className={styles.addressRow}>
                    <p className={styles.address}>{rail.address}</p>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => void copyAddress()}
                    >
                      {copied ? tetherCheckout.copiedLabel : tetherCheckout.copyLabel}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error ? <p className={styles.error}>{error}</p> : null}
            <Button type="submit" className={styles.cta} disabled={submitting}>
              {submitting
                ? "Placing order…"
                : `Complete purchase · ${
                    payMethod === "tether" ? tetherTotal : protocol.price
                  }`}
            </Button>
            <p className={styles.disclaimer}>{protocol.paymentDisclaimer}</p>
          </form>
        ) : prxCollector ? (
          <form
            className={styles.payForm}
            onSubmit={(e) => void onPrxCollectorSubmit(e)}
            noValidate
            data-prx-collector="true"
          >
            <p className={styles.body}>
              Secure checkout — your card is vaulted and charged through
              PrescribeRx (Authorize.net). TIDL never stores your card number.
            </p>
            <div className={styles.payMethods}>
              <p className={styles.label} id="collector-pay-method-label">
                Pay with
              </p>
              <div
                className={styles.methodRow}
                role="radiogroup"
                aria-labelledby="collector-pay-method-label"
              >
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={collectorPayMethod === "card"}
                  data-on={collectorPayMethod === "card" ? "true" : "false"}
                  onClick={() => setCollectorPayMethod("card")}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={collectorPayMethod === "hsa_fsa"}
                  data-on={collectorPayMethod === "hsa_fsa" ? "true" : "false"}
                  onClick={() => setCollectorPayMethod("hsa_fsa")}
                >
                  HSA / FSA
                </button>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>First name</span>
                <input
                  className={styles.input}
                  autoComplete="cc-given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Last name</span>
                <input
                  className={styles.input}
                  autoComplete="cc-family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Card number</span>
              <input
                className={styles.input}
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>Expiry</span>
                <input
                  className={styles.input}
                  autoComplete="cc-exp"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>CVC</span>
                <input
                  className={styles.input}
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Street address</span>
              <input
                className={styles.input}
                autoComplete="billing street-address"
                value={billingStreet}
                onChange={(e) => setBillingStreet(e.target.value)}
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>City</span>
                <input
                  className={styles.input}
                  autoComplete="billing address-level2"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>State</span>
                <input
                  className={styles.input}
                  autoComplete="billing address-level1"
                  placeholder="CA"
                  maxLength={2}
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>ZIP</span>
              <input
                className={styles.input}
                autoComplete="billing postal-code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <Button type="submit" className={styles.cta} disabled={submitting}>
              {submitting
                ? "Processing payment…"
                : `Complete purchase · ${protocol.price}`}
            </Button>
            <p className={styles.disclaimer}>{protocol.paymentDisclaimer}</p>
          </form>
        ) : sandboxPayment ? (
          <form
            className={styles.payForm}
            onSubmit={(e) => void onSandboxSubmit(e)}
            noValidate
            data-sandbox-payment="true"
          >
            <p className={styles.body}>
              Sandbox payment — no real charge on your card. PrescribeRx records
              the transaction for reconciliation.
            </p>
            <div className={styles.payMethods}>
              <p className={styles.label} id="sandbox-pay-method-label">
                Pay with
              </p>
              <div
                className={styles.methodRow}
                role="radiogroup"
                aria-labelledby="sandbox-pay-method-label"
              >
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={sandboxPayMethod === "card"}
                  data-on={sandboxPayMethod === "card" ? "true" : "false"}
                  onClick={() => setSandboxPayMethod("card")}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={styles.methodChip}
                  role="radio"
                  aria-checked={sandboxPayMethod === "hsa_fsa"}
                  data-on={sandboxPayMethod === "hsa_fsa" ? "true" : "false"}
                  onClick={() => setSandboxPayMethod("hsa_fsa")}
                >
                  HSA / FSA
                </button>
              </div>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Card number</span>
              <input
                className={styles.input}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="Test card (sandbox — not charged)"
                readOnly
                aria-readonly="true"
              />
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <Button type="submit" className={styles.cta} disabled={submitting}>
              {submitting
                ? "Recording in PrescribeRx…"
                : `Complete purchase · ${protocol.price}`}
            </Button>
            <p className={styles.disclaimer}>{protocol.paymentDisclaimer}</p>
          </form>
        ) : (
          <div className={styles.payForm}>
            <p className={styles.body}>
              Payment is not connected on TIDL yet. When checkout is available,
              you will complete your order here after physician approval.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
