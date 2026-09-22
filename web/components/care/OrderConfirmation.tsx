"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CareMoment } from "@/components/care/CareMoment";
import {
  resolveClinicalEntry,
  type ClinicalEntry,
} from "@/content/clinical/entry-map";
import { resolveCareProtocol } from "@/content/fixtures/care-protocol";
import { usdtAmount } from "@/content/fixtures/tether-checkout";
import {
  readIntakeHandoff,
  type IntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import styles from "./OrderConfirmation.module.css";

type Props = {
  entrySlug: string;
  encounterId?: string;
  payMethod?: string;
};

export function OrderConfirmation({
  entrySlug,
  encounterId,
  payMethod,
}: Props) {
  const entry: ClinicalEntry = useMemo(
    () => resolveClinicalEntry(entrySlug),
    [entrySlug],
  );
  const protocol = useMemo(
    () => resolveCareProtocol(entrySlug),
    [entrySlug],
  );
  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);

  useEffect(() => {
    setHandoff(readIntakeHandoff());
  }, []);

  const firstName = handoff?.firstName?.trim();
  const resolvedEncounter = encounterId || handoff?.encounterId || "";

  return (
    <CareMoment
      eyebrow="Order confirmed"
      title={firstName ? `${firstName}, you are set.` : "You are set."}
      lede="Your physician approved protocol is with the pharmacy. Shipping updates follow once the order is released."
      mediaSrc={protocol.hero.image}
    >
      <p className={styles.stackName}>{protocol.stackName}</p>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Care path</dt>
          <dd>{entry.label}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Total</dt>
          <dd>
            {payMethod === "tether"
              ? usdtAmount(protocol.price)
              : protocol.price}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Paid with</dt>
          <dd>{payMethod === "tether" ? "Tether" : "Card"}</dd>
        </div>
        {resolvedEncounter ? (
          <div className={styles.fact}>
            <dt>Encounter</dt>
            <dd>{resolvedEncounter.slice(0, 8)}</dd>
          </div>
        ) : null}
        <div className={styles.fact}>
          <dt>Pharmacy</dt>
          <dd>{protocol.pharmacy.name}</dd>
        </div>
      </dl>

      <p className={styles.sectionEyebrow}>In your protocol</p>
      <ul className={styles.agentList}>
        {protocol.agents.map((agent) => (
          <li key={agent.id} className={styles.agentRow}>
            <div>
              <p className={styles.agentName}>{agent.name}</p>
              <p className={styles.agentDesc}>{agent.description}</p>
            </div>
            <p className={styles.agentDose}>{agent.dosage}</p>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button
          href={`/care/home?entry=${entry.slug}`}
          className={styles.cta}
        >
          Your account
        </Button>
        <Button
          href={`/care/protocol?entry=${entry.slug}`}
          styleVariant="Secondary"
        >
          View protocol
        </Button>
      </div>
    </CareMoment>
  );
}
