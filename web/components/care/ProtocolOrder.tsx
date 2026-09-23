"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StageSequence } from "@/components/pdp/StageSequence";
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
import styles from "./ProtocolOrder.module.css";

type PayMethod = "card" | "tether";

type Props = {
  protocol: CareProtocolOrder;
  entrySlug: string;
  encounterId?: string;
  /** Server already verified physician acceptance. */
  approved?: boolean;
  demo?: boolean;
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

export function ProtocolOrder({
  protocol,
  entrySlug,
  encounterId,
  approved = false,
  demo = false,
}: Props) {
  const router = useRouter();
  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);
  const [cardNumber, setCardNumber] = useState(
    demo ? "4242 4242 4242 4242" : "",
  );
  const [expiry, setExpiry] = useState(demo ? "12 / 28" : "");
  const [cvc, setCvc] = useState(demo ? "123" : "");
  const [zip, setZip] = useState(demo ? "90405" : "");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [tetherRail, setTetherRail] = useState<TetherRailId>("tron");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copyResetRef = useRef<number | null>(null);

  useEffect(() => {
    setHandoff(readIntakeHandoff());
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      video.pause();
      return;
    }
    void video.play()
      .then(() => setVideoPlaying(true))
      .catch(() => {
        setVideoPlaying(false);
      });
  }, [protocol.hero.video]);

  const firstName = handoff?.firstName?.trim() || "there";
  const resolvedEncounter = encounterId || handoff?.encounterId || "";

  const rail = resolveTetherRail(tetherRail);
  const tetherTotal = usdtAmount(protocol.price);
  const confirmationHref = `/care/confirmation?${new URLSearchParams({
    entry: entrySlug,
    ...(resolvedEncounter ? { encounter: resolvedEncounter } : {}),
    ...(payMethod === "tether" ? { pay: "tether" } : {}),
    ...(demo ? { demo: "1" } : {}),
  }).toString()}`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!approved) {
      setError("This protocol is not available until a physician accepts your request.");
      return;
    }
    setSubmitting(true);
    router.push(confirmationHref);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(rail.address);
      setCopied(true);
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
      copyResetRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy the address. Select it and copy it yourself.");
    }
  };

  const selectPayMethod = (method: PayMethod) => {
    setPayMethod(method);
    setError(null);
    setCopied(false);
  };

  return (
    <div className={styles.root}>
      <section className={`layout-bleed ${styles.split}`} id="buy" aria-labelledby="protocol-greeting">
        <div className={styles.mediaCol}>
          <div className={styles.mediaStage}>
            {protocol.hero.video ? (
              <video
                ref={videoRef}
                className={styles.video}
                data-playing={videoPlaying ? "true" : "false"}
                muted
                loop
                playsInline
                poster={protocol.hero.image}
              >
                <source src={protocol.hero.video} type="video/mp4" />
              </video>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.media} src={protocol.hero.image} alt="" />
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.copy}>
            <p className={styles.stock}>{protocol.statusLabel}</p>
            <p className={styles.eyebrow}>{protocol.greetingEyebrow}</p>
            <h1 id="protocol-greeting" className={styles.title}>
              Good to see you, {firstName}.
            </h1>
            <hr className={styles.rule} />
            <p className={styles.stackName}>{protocol.stackName}</p>
            <p className={styles.stackMeta}>{protocol.stackMeta}</p>
            <div className={styles.priceRow}>
              <p className={styles.price}>{protocol.price}</p>
            </div>
            <p className={styles.body}>
              Your physician approved this protocol for you, if prescribed.
              Review what is in the pen, then place your order.
            </p>

            <div className={styles.lineItem}>
              <div className={styles.lineThumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={protocol.gallery[0]?.src} alt="" />
              </div>
              <div className={styles.lineCopy}>
                <p className={styles.lineName}>{protocol.stackName}</p>
                <p className={styles.lineMeta}>Physician approved protocol</p>
              </div>
              <p className={styles.linePrice}>{protocol.price}</p>
            </div>

            {demo ? (
            <form className={styles.payForm} onSubmit={onSubmit} noValidate>
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
                    onClick={() => selectPayMethod("card")}
                  >
                    {tetherCheckout.cardLabel}
                  </button>
                  <button
                    type="button"
                    className={styles.methodChip}
                    role="radio"
                    aria-checked={payMethod === "tether"}
                    data-on={payMethod === "tether" ? "true" : "false"}
                    onClick={() => selectPayMethod("tether")}
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
                    <p className={styles.tetherNote}>
                      {tetherCheckout.amountNote}
                    </p>
                  </div>
                  <div className={styles.payMethods}>
                    <p className={styles.label} id="tether-network-label">
                      Network
                    </p>
                    <div
                      className={styles.methodRow}
                      role="radiogroup"
                      aria-labelledby="tether-network-label"
                    >
                      {tetherCheckout.rails.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={styles.methodChip}
                          role="radio"
                          aria-checked={tetherRail === option.id}
                          data-on={tetherRail === option.id ? "true" : "false"}
                          onClick={() => {
                            setTetherRail(option.id);
                            setCopied(false);
                          }}
                        >
                          {option.label}
                          <span className={styles.methodMeta}>{option.token}</span>
                        </button>
                      ))}
                    </div>
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
                        {copied
                          ? tetherCheckout.copiedLabel
                          : tetherCheckout.copyLabel}
                      </button>
                    </div>
                  </div>
                  <p className={styles.tetherNote}>{tetherCheckout.sendNote}</p>
                </div>
              )}

              {error ? <p className={styles.error}>{error}</p> : null}

              <Button
                type="submit"
                className={styles.cta}
                disabled={submitting}
              >
                {submitting
                  ? "Placing order…"
                  : `Complete purchase · ${
                      payMethod === "tether" ? tetherTotal : protocol.price
                    }`}
              </Button>
              <p className={styles.disclaimer}>{protocol.paymentDisclaimer}</p>
            </form>
            ) : (
              <div className={styles.payForm}>
                <p className={styles.body}>
                  Payment is not connected on TIDL yet. When checkout is
                  available, you will complete your order here after physician
                  approval.
                </p>
              </div>
            )}

            <div className={styles.team}>
              <p className={styles.sectionEyebrow}>Your care team</p>
              {protocol.careTeam.map((member) => (
                <div key={member.id} className={styles.teamRow}>
                  <div className={styles.avatar}>
                    {member.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.imageSrc}
                        alt=""
                        width={44}
                        height={44}
                      />
                    ) : (
                      <span aria-hidden>
                        {member.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={styles.teamName}>{member.name}</p>
                    <p className={styles.teamRole}>{member.role}</p>
                    <p className={styles.teamStatus}>{member.status}</p>
                  </div>
                </div>
              ))}
              <div className={styles.teamRow}>
                <div className={`${styles.avatar} ${styles.avatarMuted}`} aria-hidden>
                  Rx
                </div>
                <div>
                  <p className={styles.teamName}>{protocol.pharmacy.name}</p>
                  <p className={styles.teamRole}>{protocol.pharmacy.detail}</p>
                  <p className={styles.teamStatus}>{protocol.pharmacy.status}</p>
                </div>
              </div>
            </div>

            <div className={styles.summary}>
              <button
                type="button"
                className={styles.summaryToggle}
                aria-expanded={summaryOpen}
                onClick={() => setSummaryOpen((v) => !v)}
              >
                <span>
                  <span className={styles.sectionEyebrow}>Clinical summary</span>
                  <span className={styles.summaryTitle}>
                    {protocol.clinicalSummary.title}
                  </span>
                </span>
                <span className={styles.summaryChevron} aria-hidden>
                  {summaryOpen ? "−" : "+"}
                </span>
              </button>
              {summaryOpen ? (
                <div className={styles.summaryBody}>
                  <dl className={styles.summaryList}>
                    {protocol.clinicalSummary.rows.map((row) => (
                      <div key={row.label} className={styles.summaryRow}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className={styles.sectionEyebrow}>History flags</p>
                  <ul className={styles.chipRow}>
                    {protocol.historyFlags.map((flag) => (
                      <li key={flag} className={styles.chipOutline}>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className={`layout-bleed section-bg ${styles.agents}`} aria-labelledby="agents-title">
          <div className={styles.agentsIntro}>
            <div className={styles.agentsPin}>
              <p className={styles.sectionEyebrow}>In this pen and program</p>
              <h2 id="agents-title" className={styles.sectionTitle}>
                Approved for you
              </h2>
              <p className={styles.sectionLede}>
                Your physician approved these agents for this protocol.
              </p>
              <ul className={styles.chipRow}>
                {protocol.goals.map((goal) => (
                  <li key={goal} className={styles.chip}>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.agentsListCol}>
            <ul className={styles.agentList}>
              {protocol.agents.map((agent) => (
                <li key={agent.id} className={styles.agentRow}>
                  <div className={styles.agentMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={agent.image} alt={agent.imageAlt} />
                  </div>
                  <div className={styles.agentCopy}>
                    <div className={styles.agentTop}>
                      <h3 className={styles.agentName}>{agent.name}</h3>
                      <span className={styles.agentType}>{agent.type}</span>
                    </div>
                    <p className={styles.agentDesc}>{agent.description}</p>
                    <p className={styles.agentDose}>{agent.dosage}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </ScrollReveal>

      <StageSequence
        id="order-to-pen"
        headline={protocol.fulfillmentHeadline}
        subtitle={protocol.fulfillmentSubtitle}
        stages={protocol.fulfillmentSteps}
        collage={protocol.fulfillmentCollage}
        themeId={protocol.fulfillmentThemeId}
      />
    </div>
  );
}
