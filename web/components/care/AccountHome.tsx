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
import { intakeHref, resolveClinicalEntry } from "@/content/clinical/entry-map";
import { unwrapEncounterStatus } from "@/lib/prescriberx/encounter-status";
import {
  applyLiveEncounterStatus,
  isOrderUuid,
  mapAccountHome,
  mergeOrderTracking,
} from "@/lib/prescriberx/map-account-home";
import { nextWaitPollMs } from "@/lib/prescriberx/waiting-poll";
import { PatientCareActions } from "./PatientCareActions";
import styles from "./AccountHome.module.css";

type Props = {
  entrySlug: string;
  demo?: boolean;
};

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

function TrackingFacts({
  tracking,
}: {
  tracking: NonNullable<AccountOrder["tracking"]>;
}) {
  return (
    <div className={styles.trackWrap}>
      <dl className={styles.trackFacts}>
        {tracking.carrier ? (
          <div>
            <dt>Carrier</dt>
            <dd>{tracking.carrier}</dd>
          </div>
        ) : null}
        {tracking.number ? (
          <div>
            <dt>Tracking</dt>
            <dd>{tracking.number}</dd>
          </div>
        ) : null}
        {tracking.shipTo ? (
          <div>
            <dt>Ships to</dt>
            <dd>{tracking.shipTo}</dd>
          </div>
        ) : null}
      </dl>
      {tracking.events.length ? (
        <TrackingList events={tracking.events} />
      ) : null}
    </div>
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
      {demo && !subscribed ? (
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
  ok: boolean;
  data: unknown;
}> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 401) return { unauthorized: true, ok: false, data: null };
  if (!res.ok) return { ok: false, data: null };
  try {
    const json = (await res.json()) as { data?: unknown };
    return { ok: true, data: json.data ?? null };
  } catch {
    return { ok: false, data: null };
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
  const [reloadKey, setReloadKey] = useState(0);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    if (demo) {
      setHome(fixtureHome);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoadError(null);
      const snapshot = await fetchPatientJson(
        "/api/prescriberx/patient/snapshot",
      );
      if (cancelled) return;
      if (snapshot.unauthorized) {
        router.replace("/care/account?mode=login");
        return;
      }
      if (!snapshot.ok) {
        setLoadError("Unable to load your account right now.");
        return;
      }
      const snap =
        snapshot.data && typeof snapshot.data === "object"
          ? (snapshot.data as Record<string, unknown>)
          : {};
      setSnapshot(snap);
      try {
        let mapped = mapAccountHome({
          entrySlug,
          dashboard: snap.dashboard,
          orders: snap.orders,
          encounters: snap.encounters,
          prescriptions: snap.prescriptions,
          chart: snap.chart,
          vitals: snap.vitals,
          vitalGoals: snap.vitalGoals,
          allergies: snap.allergies,
          medications: snap.medications,
          conditions: snap.conditions,
          approvals: snap.approvals,
          communicationPreferences: snap.communicationPreferences,
          paymentMethods: snap.paymentMethods,
          vitalTrends: snap.vitalTrends,
          profile: snap.profile,
          conversations: snap.conversations,
          conversationMessages: snap.conversationMessages,
          settings: snap.settings,
        });
        const currentId = mapped.currentOrder?.id;
        if (currentId && isOrderUuid(currentId)) {
          const tracking = await fetchPatientJson(
            `/api/prescriberx/patient/orders/${encodeURIComponent(currentId)}/tracking`,
          );
          if (cancelled) return;
          if (tracking.unauthorized) {
            router.replace("/care/account?mode=login");
            return;
          }
          if (tracking.ok && mapped.currentOrder) {
            mapped = {
              ...mapped,
              currentOrder: mergeOrderTracking(
                mapped.currentOrder,
                tracking.data,
              ),
            };
          }
        }
        setHome(mapped);
        setLoadError(null);
      } catch {
        setLoadError("Unable to load your account right now.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo, entrySlug, fixtureHome, router, reloadKey]);

  useEffect(() => {
    if (demo || !home?.pendingEncounter || home.currentOrder) return;
    const encounterId = home.pendingEncounter.encounterId;
    const visitGate = resolveClinicalEntry(entrySlug).visitGateDefault;
    let cancelled = false;
    let timer: number | null = null;
    let step = 0;

    const poll = async () => {
      if (cancelled || document.visibilityState === "hidden") return;
      const res = await fetch(
        `/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/status`,
        { headers: { Accept: "application/json" }, credentials: "include" },
      );
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/care/account?mode=login");
        return;
      }
      if (res.ok) {
        const json: unknown = await res.json();
        const live = unwrapEncounterStatus(json);
        if (live) {
          setHome((prev) =>
            prev ? applyLiveEncounterStatus(prev, live, visitGate) : prev,
          );
        }
      }
      step += 1;
      timer = window.setTimeout(() => {
        void poll();
      }, nextWaitPollMs(step));
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    void poll();
    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [demo, entrySlug, home?.currentOrder, home?.pendingEncounter?.encounterId, router]);

  if (!home) {
    return (
      <div className={styles.root}>
        <section className={styles.intro}>
          <div className="layout-container">
            <h1 className={styles.eyebrow}>Your account</h1>
            <p className={styles.sectionLede}>
              {loadError || "Loading your care…"}
            </p>
            {loadError ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>Account unavailable</p>
                <p className={styles.emptyBody}>{loadError}</p>
                <Button
                  styleVariant="Secondary"
                  onClick={() => setReloadKey((n) => n + 1)}
                >
                  Retry
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  const current = home.currentOrder;
  const currentSubscribed = current ? subscribedIds.has(current.id) : false;
  const showTrack = Boolean(current);
  const showPast = home.pastOrders.length > 0;
  const tasks = [
    ...(showTrack
      ? [{ href: "#current", label: "Track order", detail: "Live shipment" }]
      : []),
    ...(showPast
      ? [{ href: "#orders", label: "Past orders", detail: "Reorder a protocol" }]
      : []),
    { href: "#care", label: "Care team", detail: "Clinician and pharmacy" },
    ...(home.threads.length
      ? [{ href: "#messages", label: "Messages", detail: "From your care team" }]
      : []),
    { href: "#browse", label: "Browse related", detail: "Stacks beside this one" },
  ];

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
          {home.goals.length ? (
            <ul className={styles.goalRow} aria-label="Your goals">
              {home.goals.map((goal) => (
                <li key={goal} className={styles.goalChip}>
                  {goal}
                </li>
              ))}
            </ul>
          ) : null}
          <nav className={styles.tasks} aria-label="Account shortcuts">
            {tasks.map((task) => (
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
                : home.pendingEncounter?.next === "protocol"
                  ? "Your physician accepted this request. Review the protocol to continue."
                  : home.pendingEncounter?.next === "visit"
                    ? "This care path needs a live visit before payment."
                    : home.pendingEncounter
                      ? "A physician is still reviewing your information. Payment opens after they accept."
                      : "When a physician accepts a protocol, your order will land here."}
            </p>

            {home.pendingEncounter && !current ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>
                  {home.pendingEncounter.next === "protocol"
                    ? "Ready for your protocol"
                    : home.pendingEncounter.next === "visit"
                      ? "A visit is next"
                      : "Waiting for physician review"}
                </p>
                <p className={styles.emptyBody}>
                  Status: {home.pendingEncounter.statusLabel}.
                  {home.pendingEncounter.next === "wait"
                    ? " You cannot open checkout until this request is accepted."
                    : home.pendingEncounter.next === "visit"
                      ? " Book a time, then your physician can continue."
                      : " Checkout opens after you review the protocol."}
                </p>
                {home.pendingEncounter.next === "protocol" ? (
                  <Button
                    href={`/care/protocol?entry=${encodeURIComponent(home.pendingEncounter.entrySlug)}&encounter=${encodeURIComponent(home.pendingEncounter.encounterId)}`}
                  >
                    Continue to protocol
                  </Button>
                ) : home.pendingEncounter.next === "visit" ? (
                  <Button
                    href={`/care/visit?entry=${encodeURIComponent(home.pendingEncounter.entrySlug)}&encounter=${encodeURIComponent(home.pendingEncounter.encounterId)}`}
                  >
                    Book your visit
                  </Button>
                ) : (
                  <Button
                    href={`/care/waiting?entry=${encodeURIComponent(home.pendingEncounter.entrySlug)}&encounter=${encodeURIComponent(home.pendingEncounter.encounterId)}`}
                  >
                    View review status
                  </Button>
                )}
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
                    Placed {current.placedOn} · {current.total}
                    {demo
                      ? currentSubscribed
                        ? " · Monthly cadence"
                        : " · Single purchase"
                      : current.purchaseType === "subscription"
                        ? " · Subscription"
                        : ""}
                  </p>
                </div>
              </header>

              {demo && currentSubscribed ? (
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
                <TrackingFacts tracking={current.tracking} />
              ) : null}

              {current.agents.length ? (
                <>
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
                </>
              ) : null}

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

            {!demo && home.prescriptions.length ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>Prescriptions</p>
                <ul className={styles.agentList}>
                  {home.prescriptions.map((rx) => (
                    <li key={rx.id} className={styles.agentRow}>
                      <span>{rx.name}</span>
                      {rx.dosage ? (
                        <span className={styles.agentDose}>{rx.dosage}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </ScrollReveal>

      {!demo && snapshot ? (
        <PatientCareActions
          snapshot={snapshot}
          onChanged={() => setReloadKey((n) => n + 1)}
        />
      ) : null}

      {!demo && home.threads.length ? (
        <ScrollReveal>
          <section
            id="messages"
            className={styles.section}
            aria-labelledby="messages-title"
          >
            <div className="layout-container">
              <p className={styles.sectionEyebrow}>Messages</p>
              <h2 id="messages-title" className={styles.sectionTitle}>
                From your care team
              </h2>
              <ul className={styles.pastList}>
                {home.threads.map((thread) => (
                  <li key={thread.id} className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>{thread.title}</p>
                    <p className={styles.emptyBody}>{thread.preview}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </ScrollReveal>
      ) : null}

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
                {home.careTeam.length || home.pharmacy ? (
                  <ul className={styles.teamList}>
                    {home.careTeam.map((member) => (
                      <li key={member.id} className={styles.teamRow}>
                        <div className={styles.avatar} aria-hidden>
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
                    {home.pharmacy ? (
                      <li className={styles.teamRow}>
                        <div
                          className={`${styles.avatar} ${styles.avatarMuted}`}
                          aria-hidden
                        >
                          {home.pharmacy.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className={styles.teamName}>{home.pharmacy.name}</p>
                          {home.pharmacy.detail ? (
                            <p className={styles.teamRole}>{home.pharmacy.detail}</p>
                          ) : null}
                          {home.pharmacy.status ? (
                            <p className={styles.teamStatus}>
                              {home.pharmacy.status}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className={styles.emptyBody}>
                    Care team appears after physician review.
                  </p>
                )}
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
                {home.goals.length ? (
                  <>
                    <p className={styles.panelEyebrow}>Goals</p>
                    <ul className={styles.goalRow}>
                      {home.goals.map((goal) => (
                        <li key={`survey-${goal}`} className={styles.goalChip}>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {home.surveyRows.length ? (
                  <dl className={styles.survey}>
                    {home.surveyRows.map((row, index) => (
                      <div key={`${row.label}-${index}`} className={styles.surveyRow}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className={styles.emptyBody}>
                    Survey answers appear here when your chart includes them.
                  </p>
                )}
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
              {demo
                ? "Reorder the same stack, or convert a one time purchase to a monthly cadence if your clinician keeps it in protocol."
                : "Start a new intake to reorder. A physician reviews anything new."}
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
                          {demo && subscribed ? " · Monthly cadence" : ""}
                        </p>
                      </div>
                    </div>
                    <div className={styles.pastActions}>
                      <Button href={reorderHref(order, demo)}>
                        {demo ? "Reorder" : "Start a new intake"}
                      </Button>
                      {demo && !subscribed ? (
                        <Button
                          styleVariant="Secondary"
                          onClick={() => subscribe(order.id)}
                        >
                          Convert to monthly
                        </Button>
                      ) : null}
                      {demo && subscribed ? (
                        <p className={styles.subscribedMark}>Monthly</p>
                      ) : null}
                      {order.tracking ? (
                        <Button
                          styleVariant="Tertiary"
                          onClick={() =>
                            setOpenPastId(open ? null : order.id)
                          }
                        >
                          {open ? "Hide tracking" : "Tracking"}
                        </Button>
                      ) : null}
                    </div>
                    {open && order.tracking ? (
                      <div className={styles.pastTrack}>
                        <TrackingFacts tracking={order.tracking} />
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
