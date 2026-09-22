import { listWelcomeEmail, renderEmailText, renderMarketingEmail } from "@/lib/emails";
import { Resend } from "resend";

const DEFAULT_FROM = "TIDL <onboarding@resend.dev>";
const DEFAULT_SITE = "https://tidlll.com";

export async function sendWelcomeEmail(email: string): Promise<{
  sent: boolean;
  skipped?: string;
  error?: string;
  id?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, skipped: "RESEND_API_KEY is not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT_SITE;
  const spec = listWelcomeEmail(siteUrl);
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send(
    {
      from,
      to: email,
      subject: spec.subject,
      tags: [
        { name: "category", value: "welcome" },
        { name: "source", value: "capture-modal" },
      ],
      html: renderMarketingEmail(spec),
      text: renderEmailText(spec),
    },
    { idempotencyKey: `welcome-lead/${email}` },
  );

  if (error) {
    return { sent: false, error: error.message };
  }

  return { sent: true, id: data?.id };
}
