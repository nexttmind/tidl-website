"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { careersPage } from "@/content/fixtures/careers";
import styles from "./CareersForm.module.css";

export function CareersForm() {
  const copy = careersPage;
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const resumeId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    if (!resume) {
      setError("Upload a resume");
      return;
    }

    const body = new FormData();
    body.set("name", name);
    body.set("email", email);
    body.set("phone", phone);
    body.set("resume", resume);

    setBusy(true);
    try {
      const res = await fetch("/api/careers", { method: "POST", body });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !json.success) {
        setError(json.message || "Could not send your application");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not send your application");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className={styles.success}>{copy.success}</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={nameId}>
          {copy.fields.name.label}
        </label>
        <input
          id={nameId}
          className={styles.input}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          placeholder={copy.fields.name.placeholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={emailId}>
          {copy.fields.email.label}
        </label>
        <input
          id={emailId}
          className={styles.input}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={copy.fields.email.placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={phoneId}>
          {copy.fields.phone.label}
        </label>
        <input
          id={phoneId}
          className={styles.input}
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder={copy.fields.phone.placeholder}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label} id={`${resumeId}-label`}>
          {copy.fields.resume.label}
        </span>
        <label className={styles.file} htmlFor={resumeId}>
          <input
            id={resumeId}
            aria-labelledby={`${resumeId}-label`}
            className={styles.fileInput}
            name="resume"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
          />
          <span className={styles.fileName}>
            {resume ? resume.name : copy.fields.resume.empty}
          </span>
        </label>
        <p className={styles.help}>{copy.fields.resume.help}</p>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <Button type="submit" disabled={busy} className={styles.submit}>
        {busy ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
