"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import styles from "./AccountHome.module.css";

type ChartItem = { id: string; label: string; detail: string };
type ApprovalItem = {
  id: string;
  name: string;
  total: number;
  label: string;
};
type ThreadItem = { id: string; title: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function rowsOf(value: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of keys) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function chartItems(value: unknown, keys: readonly string[], nameKeys: readonly string[]): ChartItem[] {
  const out: ChartItem[] = [];
  for (const item of rowsOf(value, keys)) {
    const rec = asRecord(item);
    if (!rec) continue;
    const id = str(rec.id) || str(rec.uuid);
    let label = "";
    for (const key of nameKeys) {
      label = str(rec[key]);
      if (label) break;
    }
    if (!id || !label) continue;
    const detail = [str(rec.dose), str(rec.reaction), str(rec.status)]
      .filter(Boolean)
      .join(" · ");
    out.push({ id, label, detail });
  }
  return out;
}

async function postAction(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/prescriberx/patient/actions", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    data?: { id?: string; valid?: boolean; message?: string; discount_amount?: number };
  };
  if (!res.ok) return json.message || "That didn't go through. Try again.";
  return null;
}

export function PatientCareActions({
  snapshot,
  onChanged,
}: {
  snapshot: Record<string, unknown>;
  onChanged: () => void;
}) {
  const model = useMemo(() => {
    const approvals: ApprovalItem[] = [];
    for (const item of rowsOf(snapshot.approvals, ["approvals", "items"])) {
      const rec = asRecord(item);
      if (!rec) continue;
      const id = str(rec.approval_id) || str(rec.id);
      const name = str(rec.product_name) || str(rec.name);
      const total = typeof rec.total_price === "number" ? rec.total_price : Number(rec.total_price);
      if (!id || !name || !Number.isFinite(total)) continue;
      approvals.push({
        id,
        name,
        total,
        label: `$${total.toFixed(2)}`,
      });
    }
    const threads: ThreadItem[] = [];
    for (const item of rowsOf(snapshot.conversations, ["conversations", "items"])) {
      const rec = asRecord(item);
      if (!rec) continue;
      const id = str(rec.id) || str(rec.conversation_id);
      if (!id) continue;
      threads.push({
        id,
        title: str(rec.title) || str(rec.subject) || "Care conversation",
      });
    }
    const prefs = asRecord(snapshot.communicationPreferences);
    const channels = asRecord(prefs?.channels) ?? {};
    const encounters = rowsOf(snapshot.encounters, ["encounters", "items"]);
    const firstEncounter = asRecord(encounters[0]);
    return {
      approvals,
      allergies: chartItems(snapshot.allergies, ["allergies"], ["allergy_name", "allergen", "name", "label"]),
      medications: chartItems(snapshot.medications, ["medications"], ["medication_name", "name", "medication"]),
      conditions: chartItems(snapshot.conditions, ["conditions"], ["condition_name", "condition", "name"]),
      threads,
      encounterId: str(firstEncounter?.id) || str(firstEncounter?.encounter_id),
      prefs: prefs
        ? {
            global: prefs.global_enabled === true,
            email: channels.email === true,
            sms: channels.sms === true,
            inApp: channels.in_app === true,
          }
        : { global: true, email: true, sms: false, inApp: true },
    };
  }, [snapshot]);

  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [allergen, setAllergen] = useState("");
  const [medName, setMedName] = useState("");
  const [condition, setCondition] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(model.threads[0]?.id ?? "");
  const [prefs, setPrefs] = useState(model.prefs);
  const [exportId, setExportId] = useState<string | null>(null);

  const run = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true);
    setNote(null);
    const err = await postAction(body);
    setBusy(false);
    if (err) {
      setNote(err);
      return false;
    }
    setNote(ok);
    onChanged();
    return true;
  };

  return (
    <ScrollReveal>
      <section id="actions" className={styles.section} aria-labelledby="actions-title">
        <div className="layout-container">
          <p className={styles.sectionEyebrow}>Your record</p>
          <h2 id="actions-title" className={styles.sectionTitle}>
            Update what your physician sees
          </h2>
          {note ? <p className={styles.actionNote}>{note}</p> : null}

          {model.approvals.length ? (
            <div className={styles.emptyCard}>
              <p className={styles.emptyTitle}>Items waiting for your decision</p>
              <ul className={styles.agentList}>
                {model.approvals.map((item) => (
                  <li key={item.id} className={styles.agentRow}>
                    <span>{item.name}</span>
                    <span className={styles.agentDose}>{item.label}</span>
                    <Button
                      styleVariant="Secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          {
                            action: "accept_approval",
                            approval_id: item.id,
                            acknowledged_total: item.total,
                            idempotency_key: crypto.randomUUID(),
                          },
                          `${item.name} accepted. PrescribeRx charges the card on file.`,
                        )
                      }
                    >
                      Accept and pay
                    </Button>
                    <Button
                      styleVariant="Tertiary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          { action: "decline_approval", approval_id: item.id },
                          `${item.name} declined. It will not ship.`,
                        )
                      }
                    >
                      Decline
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.careGrid}>
            <ChartEditor
              title="Allergies"
              items={model.allergies}
              placeholder="Allergen"
              value={allergen}
              onChange={setAllergen}
              busy={busy}
              onAdd={() =>
                void run(
                  { action: "add_allergy", allergen },
                  "Allergy added.",
                ).then((ok) => {
                  if (ok) setAllergen("");
                })
              }
              onRemove={(id) =>
                void run({ action: "remove_allergy", id }, "Allergy removed.")
              }
            />
            <ChartEditor
              title="Medications"
              items={model.medications}
              placeholder="Medication name"
              value={medName}
              onChange={setMedName}
              busy={busy}
              onAdd={() =>
                void run(
                  { action: "add_medication", name: medName },
                  "Medication added.",
                ).then((ok) => {
                  if (ok) setMedName("");
                })
              }
              onRemove={(id) =>
                void run({ action: "remove_medication", id }, "Medication removed.")
              }
            />
            <ChartEditor
              title="Conditions"
              items={model.conditions}
              placeholder="Condition"
              value={condition}
              onChange={setCondition}
              busy={busy}
              onAdd={() =>
                void run(
                  { action: "add_condition", condition, status: "active" },
                  "Condition added.",
                ).then((ok) => {
                  if (ok) setCondition("");
                })
              }
              onRemove={(id) =>
                void run({ action: "remove_condition", id }, "Condition removed.")
              }
            />
          </div>

          <div className={styles.careGrid}>
            <form
              className={styles.panel}
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  { action: "record_weight", weight_lbs: Number(weight) },
                  "Weight saved.",
                );
              }}
            >
              <p className={styles.panelEyebrow}>Weight</p>
              <label className={styles.actionField}>
                <span>Pounds</span>
                <input
                  value={weight}
                  inputMode="decimal"
                  onChange={(e) => setWeight(e.target.value)}
                />
              </label>
              <Button type="submit" styleVariant="Secondary" disabled={busy}>
                Save weight
              </Button>
            </form>
            <form
              className={styles.panel}
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  { action: "update_goals", target_weight_lbs: Number(goal) },
                  "Goal saved.",
                );
              }}
            >
              <p className={styles.panelEyebrow}>Weight goal</p>
              <label className={styles.actionField}>
                <span>Target pounds</span>
                <input
                  value={goal}
                  inputMode="decimal"
                  onChange={(e) => setGoal(e.target.value)}
                />
              </label>
              <Button type="submit" styleVariant="Secondary" disabled={busy}>
                Save goal
              </Button>
            </form>
            <form
              className={styles.panel}
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  {
                    action: "update_preferences",
                    global_enabled: prefs.global,
                    channels: {
                      email: prefs.email,
                      sms: prefs.sms,
                      in_app: prefs.inApp,
                    },
                  },
                  "Notification settings saved.",
                );
              }}
            >
              <p className={styles.panelEyebrow}>Notifications</p>
              {(
                [
                  ["global", "All notifications"],
                  ["email", "Email"],
                  ["sms", "SMS"],
                  ["inApp", "In app"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={styles.actionCheck}>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              ))}
              <Button type="submit" styleVariant="Secondary" disabled={busy}>
                Save notifications
              </Button>
            </form>
          </div>

          <form
            className={styles.panel}
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                setBusy(true);
                setNote(null);
                let id = threadId;
                if (!id && model.encounterId) {
                  const open = await fetch("/api/prescriberx/patient/actions", {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      action: "open_conversation",
                      encounter_id: model.encounterId,
                    }),
                  });
                  const opened = (await open.json().catch(() => ({}))) as {
                    message?: string;
                    data?: { id?: string };
                  };
                  if (!open.ok) {
                    setBusy(false);
                    setNote(opened.message || "Could not open a conversation.");
                    return;
                  }
                  id = opened.data?.id || "";
                }
                if (!id) {
                  setBusy(false);
                  setNote("No conversation is open yet.");
                  return;
                }
                const err = await postAction({
                  action: "send_message",
                  conversation_id: id,
                  content: message,
                });
                setBusy(false);
                if (err) {
                  setNote(err);
                  return;
                }
                setMessage("");
                setThreadId(id);
                setNote("Message sent.");
                onChanged();
              })();
            }}
          >
            <p className={styles.panelEyebrow}>Message your care team</p>
            {model.threads.length ? (
              <label className={styles.actionField}>
                <span>Conversation</span>
                <select
                  value={threadId}
                  onChange={(e) => setThreadId(e.target.value)}
                >
                  {model.threads.map((thread) => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className={styles.emptyBody}>
                This starts the conversation on your latest encounter.
              </p>
            )}
            <label className={styles.actionField}>
              <span>Message</span>
              <textarea
                value={message}
                maxLength={5000}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={busy || !message.trim()}>
              Send
            </Button>
          </form>

          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Your records</p>
            <p className={styles.emptyBody}>
              Request a copy of the chart PrescribeRx holds for you.
            </p>
            <Button
              styleVariant="Secondary"
              disabled={busy}
              onClick={() =>
                void (async () => {
                  setBusy(true);
                  const res = await fetch("/api/prescriberx/patient/actions", {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ action: "request_export" }),
                  });
                  const json = (await res.json().catch(() => ({}))) as {
                    message?: string;
                    data?: { id?: string; ready?: boolean };
                  };
                  setBusy(false);
                  if (!res.ok || !json.data?.id) {
                    setNote(json.message || "Could not request your records.");
                    return;
                  }
                  setExportId(json.data.id);
                  setNote(
                    json.data.ready
                      ? "Your records are ready."
                      : "Request received. Check again in a moment.",
                  );
                })()
              }
            >
              Request my records
            </Button>
            {exportId ? (
              <p className={styles.emptyBody}>
                <a href={`/api/prescriberx/patient/export/${exportId}/download`}>
                  Download records
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

function ChartEditor({
  title,
  items,
  placeholder,
  value,
  onChange,
  busy,
  onAdd,
  onRemove,
}: {
  title: string;
  items: ChartItem[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <form
      className={styles.panel}
      onSubmit={(e) => {
        e.preventDefault();
        onAdd();
      }}
    >
      <p className={styles.panelEyebrow}>{title}</p>
      {items.length ? (
        <ul className={styles.agentList}>
          {items.map((item) => (
            <li key={item.id} className={styles.agentRow}>
              <span>{item.label}</span>
              {item.detail ? (
                <span className={styles.agentDose}>{item.detail}</span>
              ) : null}
              <Button
                styleVariant="Tertiary"
                disabled={busy}
                onClick={() => onRemove(item.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyBody}>None on file.</p>
      )}
      <label className={styles.actionField}>
        <span>Add</span>
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <Button type="submit" styleVariant="Secondary" disabled={busy || !value.trim()}>
        Add
      </Button>
    </form>
  );
}
