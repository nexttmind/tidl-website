import { Resend } from "resend";

const DEFAULT_FROM = "TIDL <onboarding@resend.dev>";

type Application = {
  name: string;
  email: string;
  phone: string;
  resume: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

export async function sendCareerApplication(app: Application): Promise<{
  sent: boolean;
  skipped?: string;
  error?: string;
  id?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, skipped: "RESEND_API_KEY is not configured" };
  }

  const to = process.env.CAREERS_TO_EMAIL?.trim();
  if (!to) {
    return { sent: false, skipped: "CAREERS_TO_EMAIL is not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: app.email,
    subject: `Career application from ${app.name}`,
    tags: [
      { name: "category", value: "careers" },
    ],
    html: applicationHtml(app),
    text: applicationText(app),
    attachments: [
      {
        filename: app.resume.filename,
        content: app.resume.content,
        contentType: app.resume.contentType,
      },
    ],
  });

  if (error) {
    return { sent: false, error: error.message };
  }

  return { sent: true, id: data?.id };
}

function applicationHtml(app: Application) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f0;font-family:Inter,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(26,26,26,0.08);">
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#405774;font-weight:600;">TIDL Careers</p>
              <h1 style="margin:0 0 14px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:24px;line-height:1.2;font-weight:500;letter-spacing:-0.02em;">New application</h1>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.55;"><strong>Name:</strong> ${escapeHtml(app.name)}</p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.55;"><strong>Email:</strong> ${escapeHtml(app.email)}</p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.55;"><strong>Phone:</strong> ${escapeHtml(app.phone)}</p>
              <p style="margin:0;font-size:15px;line-height:1.55;"><strong>Resume:</strong> ${escapeHtml(app.resume.filename)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function applicationText(app: Application) {
  return `New career application

Name: ${app.name}
Email: ${app.email}
Phone: ${app.phone}
Resume: ${app.resume.filename}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
