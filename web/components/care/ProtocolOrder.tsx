"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StageSequence } from "@/components/pdp/StageSequence";
import {
  readIntakeHandoff,
  type IntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import type { CareProtocolOrder } from "@/content/fixtures/care-protocol";
import styles from "./ProtocolOrder.module.css";

type Props = {
  protocol: CareProtocolOrder;
  entrySlug: string;
  encounterId?: string;
  /** Server already verified physician acceptance. */
  approved?: boolean;
  demo?: boolean;
};

export function ProtocolOrder({
  protocol,
  entrySlug,
  encounterId,
  approved = false,
  demo = false,
}: Props) {
  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHandoff(readIntakeHandoff());
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

  const checkoutParams = new URLSearchParams({ entry: entrySlug });
  if (resolvedEncounter) checkoutParams.set("encounter", resolvedEncounter);
  if (demo) checkoutParams.set("demo", "1");
  const checkoutHref = `/care/checkout?${checkoutParams.toString()}`;

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

            <div className={styles.payForm}>
              <p className={styles.body}>
                When you are ready, continue to checkout to pay with card or
                HSA/FSA (sandbox records payment in PrescribeRx; no real charge
                until production gateway).
              </p>
              {approved ? (
                <Button href={checkoutHref} className={styles.cta}>
                  Continue to checkout · {protocol.price}
                </Button>
              ) : (
                <p className={styles.body}>
                  Checkout opens after physician approval.
                </p>
              )}
            </div>

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
