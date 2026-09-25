"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CareMoment } from "@/components/care/CareMoment";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import type { AvailableSlot, VideoRoomInfo } from "@/lib/prescriberx/scheduling";
import styles from "./VisitContinue.module.css";

type Props = {
  entrySlug: string;
  encounterId?: string;
  demo?: boolean;
};

type SlotsResponse = {
  already_scheduled?: boolean;
  slots?: AvailableSlot[];
  scheduled_at?: string | null;
};

function formatWhen(slot: AvailableSlot): string {
  if (slot.display_time) return slot.display_time;
  if (slot.display_start) return slot.display_start;
  try {
    return new Date(slot.start).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return slot.start;
  }
}

export function VisitBooking({ entrySlug, encounterId, demo = false }: Props) {
  const router = useRouter();
  const entry = resolveClinicalEntry(entrySlug);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [booked, setBooked] = useState(false);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [videoRoom, setVideoRoom] = useState<VideoRoomInfo | null>(null);

  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/New_York";

  const loadVideoRoom = useCallback(async () => {
    if (!encounterId) return;
    const res = await fetch(
      `/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/video-room`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const json = (await res.json()) as { data?: VideoRoomInfo };
    if (json.data?.join_url) setVideoRoom(json.data);
  }, [encounterId]);

  const loadSlots = useCallback(async () => {
    if (demo || !encounterId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        encounter_id: encounterId,
        entry: entry.slug,
        timezone,
      });
      const res = await fetch(
        `/api/prescriberx/scheduling/slots?${params}`,
        { credentials: "include" },
      );
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: SlotsResponse;
      };
      if (!res.ok) {
        setError(json.message ?? "Could not load visit times.");
        setSlots([]);
        return;
      }
      const data = json.data;
      if (data?.already_scheduled) {
        setBooked(true);
        setSlots([]);
        await loadVideoRoom();
        return;
      }
      setSlots(data?.slots ?? []);
      if ((data?.slots ?? []).length === 0) {
        setError(
          "No open visit times right now. Check back later or contact support.",
        );
      }
    } catch {
      setError("Could not load visit times. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [demo, encounterId, entry.slug, loadVideoRoom, timezone]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const bookSlot = async () => {
    if (!encounterId || !selectedStart) return;
    setBooking(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/prescriberx/encounters/${encodeURIComponent(encounterId)}/schedule`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entry: entry.slug,
            scheduled_start: selectedStart,
            patient_timezone: timezone,
          }),
        },
      );
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { video_room?: VideoRoomInfo | null };
      };
      if (!res.ok) {
        setError(json.message ?? "Could not book that time.");
        return;
      }
      setBooked(true);
      const room = json.data?.video_room;
      if (room?.join_url) setVideoRoom(room);
      else await loadVideoRoom();
    } catch {
      setError("Could not book that time. Try again.");
    } finally {
      setBooking(false);
    }
  };

  const continueToProtocol = () => {
    const params = new URLSearchParams();
    params.set("entry", entry.slug);
    if (encounterId) params.set("encounter", encounterId);
    if (demo) params.set("demo", "1");
    router.push(`/care/protocol?${params.toString()}`);
  };

  if (demo) {
    return (
      <CareMoment
        eyebrow="Physician visit"
        title="A video visit is required"
        lede="For this care path, book a live visit before your protocol. Demo mode skips PrescribeRx scheduling."
        mediaSrc={entry.brandPoster ?? entry.brandImage}
      >
        <p className={styles.note}>
          In production, the patient picks a time here. PrescribeRx saves the
          appointment and shows it in admin under Appointments and Calendar View.
        </p>
        <Button onClick={continueToProtocol} className={styles.cta}>
          Continue to protocol (demo)
        </Button>
      </CareMoment>
    );
  }

  return (
    <CareMoment
      eyebrow="Physician visit"
      title={booked ? "Your visit is scheduled" : "Book your video visit"}
      lede={
        booked
          ? "Your appointment is saved in PrescribeRx. Join from the link below when it is time. After your visit, you will continue to your treatment protocol."
          : "Your clinician approved the next step. Choose a time for your live video visit. We save the booking in PrescribeRx so your care team sees it on their calendar."
      }
      mediaSrc={entry.brandPoster ?? entry.brandImage}
    >
      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>Care path</dt>
          <dd>{entry.label}</dd>
        </div>
      </dl>

      {loading ? (
        <p className={styles.note}>Loading available times…</p>
      ) : null}

      {error ? <p className={styles.note}>{error}</p> : null}

      {!booked && !loading && slots.length > 0 ? (
        <ul className={styles.slotList}>
          {slots.slice(0, 12).map((slot) => {
            const active = selectedStart === slot.start;
            return (
              <li key={slot.start}>
                <button
                  type="button"
                  className={styles.slotButton}
                  data-active={active ? "true" : "false"}
                  onClick={() => setSelectedStart(slot.start)}
                >
                  {formatWhen(slot)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!booked && !loading && slots.length > 0 ? (
        <Button
          className={styles.cta}
          disabled={!selectedStart || booking}
          onClick={() => void bookSlot()}
        >
          {booking ? "Booking…" : "Confirm visit time"}
        </Button>
      ) : null}

      {booked ? (
        <>
          {videoRoom?.join_url ? (
            <p className={styles.note}>
              <a
                href={videoRoom.join_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join your video visit
              </a>
              {videoRoom.can_join_now
                ? " — you can join now."
                : " — the join link opens shortly before your visit."}
            </p>
          ) : (
            <p className={styles.note}>
              Your visit is on the calendar. A join link will appear here when
              PrescribeRx provisions the video room.
            </p>
          )}
          <p className={styles.note}>
            After your clinician completes the visit, this page will advance to
            your protocol automatically when you return, or open your account
            home for updates.
          </p>
        </>
      ) : null}
    </CareMoment>
  );
}
