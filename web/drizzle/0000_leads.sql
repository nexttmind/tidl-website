CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "sms_consent" boolean DEFAULT false NOT NULL,
  "source" text DEFAULT 'capture-modal' NOT NULL,
  "path" text,
  "welcome_email_sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "leads_email_unique" UNIQUE("email")
);
