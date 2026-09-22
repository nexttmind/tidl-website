"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAskTidl } from "@/components/ai/AskTidlProvider";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  resolveAccountHome,
  type AccountHomeData,
  type AccountOrder,
  type TrackingEvent,
} from "@/content/fixtures/care-account-home";
import type { ValueFieldCard } from "@/content/fixtures/value-fields";
import { CATALOG_HREF } from "@/content/fixtures/catalog";
import { intakeHref } from "@/content/clinical/entry-map";
import { mapAccountHome } from "@/lib/prescriberx/map-account-home";
import styles from "./AccountHome.module.css";

type Props = {
  entrySlug: string;
  demo?: boolean;
};

const TASKS = [
  { href: "#current", label: "Track order", detail: "Live shipment" },
  { href: "#orders", label: "Past orders", detail: "Reorder a protocol" },
  { href: "#care", label: "Care team", detail: "Clinician and pharmacy" },
  { href: "#browse", label: "Browse related", detail: "Stacks beside this one" },
] as const;

function VialPlate({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={className ?? styles.thumb}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </div>
  );
}

function TrackingList({ events }: { events: readonly TrackingEvent[] }) {
  return (
    <ol className={styles.track} aria-label="Shipment progress">
      {events.map((event) => (
        <li
          key={`${event.label}-${event.at}`}
          className={styles.trackStep}
          data-done={event.done ? "true" : "false"}
          data-current={event.current ? "true" : "false"}
        >
          <span className={styles.trackMark} aria-hidden />
          <div>
            <p className={styles.trackLabel}>{event.label}</p>
            <p className={styles.trackAt}>{event.at}</p>
            {event.detail ? (
              <p className={styles.trackDetail}>{event.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function reorderHref(order: AccountOrder, demo: boolean): string {
  if (demo) return `/care/protocol?entry=${order.entrySlug}&demo=1`;
  return intakeHref(order.entrySlug);
}

function OrderActions({
  order,
  subscribed,
  onSubscribe,
  demo,
}: {
  order: AccountOrder;
  subscribed: boolean;
  onSubscribe: () => void;
  demo: boolean;
}) {
  return (
    <div className={styles.orderActions}>
      <Button href={reorderHref(order, demo)}>
        {demo ? "Reorder" : "Start a new intake"}
      </Button>
      {!subscribed ? (
        <Button styleVariant="Secondary" onClick={onSubscribe}>
          Convert to monthly
        </Button>
      ) : null}
    </div>
  );
}

function RelatedCard({ item }: { item: ValueFieldCard }) {
  return (
    <article className={styles.relatedCard}>
      <a href={item.href} className={styles.relatedMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cardSrc} alt="" />
      </a>
      <div className={styles.relatedBody}>
        <h3 className={styles.relatedTitle}>
          <a href={item.href}>{item.pill}</a>
        </h3>
        <p className={styles.relatedLede}>{item.title}</p>
        <Button href={item.href} styleVariant="Secondary" className={styles.relatedCta}>
          View stack
        </Button>
      </div>
    </article>
  );
}

async function fetchPatientJson(path: string): Promise<{
  unauthorized?: boolean;
  data: unknown;
}> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 401) return { unauthorized: true, data: null };
  if (!res.ok) return { data: null };
  try {
    const json = (await res.json()) as { data?: unknown };
    return { data: json.data ?? null };
  } catch {
    return { data: null };
  }
}

export function AccountHome({ entrySlug, demo = false }: Props) {
  const { openModal } = useAskTidl();
  const router = useRouter();
  const fixtureHome = useMemo(() => resolveAccountHome(entrySlug), [entrySlug]);
  const [home, setHome] = useState<AccountHomeData | null>(
    demo ? fixtureHome : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [openPastId, setOpenPastId] = useState<string | null>(null);
  const [cadenceNote, setCadenceNote] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setHome(fixtureHome);
      return;
    }
    let cancelled = false;
    void (async () => {
      const [dashboard, orders, encounters, prescriptions] = await Promise.all([
        fetchPatientJson("/api/prescriberx/patient/dashboard"),
        fetchPatientJson("/api/prescriberx/patient/orders"),
        fetchPatientJson("/api/prescriberx/patient/encounters"),
        fetchPatientJson("/api/prescriberx/patient/prescriptions"),
      ]);
      if (cancelled) return;
      if (
        dashboard.unauthorized ||
        orders.unauthorized ||
        encounters.unauthorized ||
        prescriptions.unauthorized
      ) {
        router.replace("/care/account?mode=login");
        return;
      }
      try {
        setHome(
          mapAccountHome({
            entrySlug,
            dashboard: dashboard.data,
            orders: orders.data,
            encounters: encounters.data,
            prescriptions: prescriptions.data,
          }),
        );
        setLoadError(null);
      } catch {
        setLoadError("Unable to load your account right now.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo, entrySlug, fixtureHome, router]);

  if (!home) {
    return (
      <div className={styles.root}>
        <section className={styles.intro}>
          <div className="layout-container">
            <h1 className={styles.eyebrow}>Your account</h1>
            <p className={styles.sectionLede}>
              {loadError || "Loading your care…"}
            </p>
          </div>
        </section>
      </div>
    );
  }

  const current = home.currentOrder;
  const currentSubscribed = current ? subscribedIds.has(current.id) : false;

  const subscribe = (orderId: string) => {
    setSubscribedIds((prev) => new Set(prev).add(orderId));
  };

  return (
    <div className={styles.root}>
      <section className={styles.intro} aria-labelledby="account-home-title">
        <div className="layout-container">
          <h1 id="account-home-title" className={styles.eyebrow}>
            Your account
          </h1>
          <ul className={styles.goalRow} aria-label="Your goals">
            {home.goals.map((goal) => (
              <li key={goal} className={styles.goalChip}>
                {goal}
              </li>
            ))}
          </ul>
          <nav className={styles.tasks} aria-label="Account shortcuts">
            {TASKS.map((task) => (
              <a key={task.href} href={task.href} className={styles.task}>
                <span className={styles.taskLabel}>{task.label}</span>
                <span className={styles.taskDetail}>{task.detail}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <ScrollReveal>
        <section
          id="current"
          className={styles.section}
          aria-labelledby="current-title"
        >
          <div className="layout-container">
            <p className={styles.sectionEyebrow}>Current order</p>
            <h2 id="current-title" className={styles.sectionTitle}>
              {current
                ? current.statusLabel
                : home.pendingEncounter
                  ? home.pendingEncounter.statusLabel
                  : "No order yet"}
            </h2>
            <p className={styles.sectionLede}>
              {current?.eta
                ? `Arriving ${current.eta.toLowerCase()}. Tracking stays on this page.`
                : home.pendingEncounter
                  ? "A physician is still reviewing your information. Payment opens after they accept."
                  : "When a physician accepts a protocol, your order will land here."}
            </p>

            {home.pendingEncounter && !current ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>Waiting for physician review</p>
                <p className={styles.emptyBody}>
                  Status: {home.pendingEncounter.statusLabel}. You cannot open
                  checkout until this request is accepted.
                </p>
                <Button
                  href={`/care/waiting?entry=${encodeURIComponent(home.pendingEncounter.entrySlug)}&encounter=${encodeURIComponent(home.pendingEncounter.encounterId)}`}
                >
                  View review status
                </Button>
              </div>
            ) : null}

            {current ? (
            <article className={styles.orderCard}>
              <header className={styles.orderHead}>
                <VialPlate src={current.vialSrc} />
                <div className={styles.orderMeta}>
                  <p className={styles.orderId}>{current.id}</p>
                  <h3 className={styles.orderName}>{current.stackName}</h3>
                  <p className={styles.orderSub}>
                    Placed {current.placedOn} · {current.total} ·{" "}
                    {currentSubscribed
                      ? "Monthly cadence"
                      : "Single purchase"}
                  </p>
                </div>
              </header>

              {currentSubscribed ? (
                <div className={styles.subscribeNote} role="status">
                  <p className={styles.subscribeKicker}>Monthly cadence</p>
                  <p className={styles.subscribeBody}>
                    Next shipment on 19 September, if prescribed. Your clinician
                    can pause or change this.
                  </p>
                  {cadenceNote ? (
                    <p className={styles.subscribeBody}>{cadenceNote}</p>
                  ) : null}
                  <div className={styles.orderActions}>
                    <Button
                      styleVariant="Secondary"
                      onClick={() =>
                        setCadenceNote(
                          "Next pen skipped. Following shipment holds at 19 October, if prescribed.",
                        )
                      }
                    >
                      Skip next
                    </Button>
                    <Button
                      styleVariant="Secondary"
                      onClick={() =>
                        setCadenceNote(
                          "Monthly cadence paused. Message your care team to resume.",
                        )
                      }
                    >
                      Pause
                    </Button>
                  </div>
                </div>
              ) : null}

              {current.tracking ? (
                <div className={styles.trackWrap}>
                  <dl className={styles.trackFacts}>
                    <div>
                      <dt>Carrier</dt>
                      <dd>{current.tracking.carrier}</dd>
                    </div>
                    <div>
                      <dt>Tracking</dt>
                      <dd>{current.tracking.number}</dd>
                    </div>
                    <div>
                      <dt>Ships to</dt>
                      <dd>{current.tracking.shipTo}</dd>
                    </div>
                  </dl>
                  <TrackingList events={current.tracking.events} />
                </div>
              ) : null}

              <p className={styles.inProtocol}>In this protocol</p>
              <ul className={styles.agentList}>
                {current.agents.map((agent) => (
                  <li key={agent.name} className={styles.agentRow}>
                    <VialPlate src={agent.vialSrc} className={styles.agentVial} />
                    <span>{agent.name}</span>
                    <span className={styles.agentDose}>{agent.dosage}</span>
                  </li>
                ))}
              </ul>

              <OrderActions
                order={current}
                subscribed={currentSubscribed}
                onSubscribe={() => subscribe(current.id)}
                demo={demo}
              />
            </article>
            ) : !home.pendingEncounter ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>Nothing to pay for yet</p>
                <p className={styles.emptyBody}>
                  Finish intake if you have not, then wait for physician review.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="care" className={styles.section} aria-labelledby="care-title">
          <div className="layout-container">
            <p className={styles.sectionEyebrow}>Your care</p>
            <h2 id="care-title" className={styles.sectionTitle}>
              Clinicians on this protocol
            </h2>
            <div className={styles.careGrid}>
              <div className={styles.panel}>
                <p className={styles.panelEyebrow}>Care team</p>
                <ul className={styles.teamList}>
                  {home.careTeam.map((member) => (
                    <li key={member.id} className={styles.teamRow}>
                      <div
                        className={styles.avatar}
                        aria-hidden
                      >
                        {member.imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.imageSrc} alt="" />
                        ) : (
                          member.name.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <p className={styles.teamName}>{member.name}</p>
                        <p className={styles.teamRole}>{member.role}</p>
                        <p className={styles.teamStatus}>{member.status}</p>
                      </div>
                    </li>
                  ))}
                  <li className={styles.teamRow}>
                    <div className={`${styles.avatar} ${styles.avatarMuted}`} aria-hidden>
                      {home.pharmacy.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className={styles.teamName}>{home.pharmacy.name}</p>
                      <p className={styles.teamRole}>{home.pharmacy.detail}</p>
                      <p className={styles.teamStatus}>{home.pharmacy.status}</p>
                    </div>
                  </li>
                </ul>
                <Button
                  styleVariant="Secondary"
                  onClick={() =>
                    openModal("I have a question for my care team about my protocol.")
                  }
                >
                  Message your care team
                </Button>
              </div>

              <div className={styles.panel}>
                <p className={styles.panelEyebrow}>{home.surveyTitle}</p>
                <p className={styles.panelLede}>{home.surveyLede}</p>
                <p className={styles.panelEyebrow}>Goals</p>
                <ul className={styles.goalRow}>
                  {home.goals.map((goal) => (
                    <li key={`survey-${goal}`} className={styles.goalChip}>
                      {goal}
                    </li>
                  ))}
                </ul>
                <dl className={styles.survey}>
                  {home.surveyRows.map((row) => (
                    <div key={row.label} className={styles.surveyRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section
          id="orders"
          className={styles.section}
          aria-labelledby="orders-title"
        >
          <div className="layout-container">
            <p className={styles.sectionEyebrow}>Order history</p>
            <h2 id="orders-title" className={styles.sectionTitle}>
              Past protocols
            </h2>
            <p className={styles.sectionLede}>
              Reorder the same stack, or convert a one time purchase to a
              monthly cadence if your clinician keeps it in protocol.
            </p>
            {home.pastOrders.length === 0 ? (
              <p className={styles.emptyBody}>No past protocols yet.</p>
            ) : null}
            <ul className={styles.pastList}>
              {home.pastOrders.map((order) => {
                const open = openPastId === order.id;
                const subscribed = subscribedIds.has(order.id);
                return (
                  <li key={order.id} className={styles.pastRow}>
                    <div className={styles.pastMain}>
                      <VialPlate src={order.vialSrc} />
                      <div>
                        <p className={styles.orderId}>{order.id}</p>
                        <h3 className={styles.orderName}>{order.stackName}</h3>
                        <p className={styles.orderSub}>
                          {order.placedOn} · {order.total} · {order.statusLabel}
                          {subscribed ? " · Monthly cadence" : ""}
                        </p>
                      </div>
                    </div>
                    <div className={styles.pastActions}>
                      <Button href={reorderHref(order, demo)}>
                        {demo ? "Reorder" : "Start a new intake"}
                      </Button>
                      {!subscribed ? (
                        <Button
                          styleVariant="Secondary"
                          onClick={() => subscribe(order.id)}
                        >
                          Convert to monthly
                        </Button>
                      ) : (
                        <p className={styles.subscribedMark}>Monthly</p>
                      )}
                      <Button
                        styleVariant="Tertiary"
                        onClick={() =>
                          setOpenPastId(open ? null : order.id)
                        }
                      >
                        {open ? "Hide tracking" : "Tracking"}
                      </Button>
                    </div>
                    {open && order.tracking ? (
                      <div className={styles.pastTrack}>
                        <dl className={styles.trackFacts}>
                          <div>
                            <dt>Carrier</dt>
                            <dd>{order.tracking.carrier}</dd>
                          </div>
                          <div>
                            <dt>Tracking</dt>
                            <dd>{order.tracking.number}</dd>
                          </div>
                          <div>
                            <dt>Shipped to</dt>
                            <dd>{order.tracking.shipTo}</dd>
                          </div>
                        </dl>
                        <TrackingList events={order.tracking.events} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section
          id="browse"
          className={styles.section}
          aria-labelledby="browse-title"
        >
          <div className="layout-container">
            <p className={styles.sectionEyebrow}>Related stacks</p>
            <h2 id="browse-title" className={styles.sectionTitle}>
              Beside what you already take
            </h2>
            <p className={styles.sectionLede}>
              Goal framed stacks that sit next to this protocol. A physician
              reviews anything new before it is prescribed.
            </p>
            <div className={styles.relatedGrid}>
              {home.related.map((item) => (
                <RelatedCard key={item.id} item={item} />
              ))}
            </div>
            <p className={styles.browseAll}>
              <Button href={CATALOG_HREF} styleVariant="Secondary">
                Browse all stacks
              </Button>
            </p>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
