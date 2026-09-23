"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CareMoment } from "@/components/care/CareMoment";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import styles from "./VisitContinue.module.css";

type Props = {
  entrySlug: string;
  encounterId?: string;
  demo?: boolean;
};

export function VisitContinue({ entrySlug, encounterId, demo = false }: Props) {
  const router = useRouter();
  const entry = resolveClinicalEntry(entrySlug);

  const continueToProtocol = () => {
    const params = new URLSearchParams();
    params.set("entry", entry.slug);
    if (encounterId) params.set("encounter", encounterId);
    if (demo) params.set("demo", "1");
    router.push(`/care/protocol?${params.toString()}`);
  };

  return (
    <CareMoment
      eyebrow="Physician visit"
      title="A video visit is required"
      lede={
        demo
          ? "Based on the care path under review, your physician needs a live visit before prescribing or dispensing. Schedule and join here, then return for your protocol."
          : "Based on the care path under review, your physician needs a live visit before prescribing or dispensing. Visit scheduling is not open on TIDL yet."
      }
      mediaSrc={entry.brandPoster ?? entry.brandImage}
    >
      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>Care path</dt>
          <dd>{entry.label}</dd>
        </div>
      </dl>
      {demo ? (
        <>
          <p className={styles.note}>
            Scheduling binds to PrescribeRx in a later pass. For this
            walkthrough, continue after the visit would complete.
          </p>
          <Button onClick={continueToProtocol} className={styles.cta}>
            Continue to protocol
          </Button>
        </>
      ) : (
        <p className={styles.note}>
          When scheduling is available, you will book and join your visit here.
          Until then, check back on this page or your account home for updates.
          There is no estimated wait time on this screen.
        </p>
      )}
    </CareMoment>
  );
}
