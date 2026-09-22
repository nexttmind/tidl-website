import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { normalizeEmail, normalizePhone } from "@/lib/leads/validate";
import { sendWelcomeEmail } from "@/lib/leads/welcome-email";

export const dynamic = "force-dynamic";

type CreateBody = {
  email?: string;
  source?: string;
  path?: string;
};

type UpdateBody = {
  id?: string;
  phone?: string;
  smsConsent?: boolean;
};

export async function POST(request: Request) {
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : null;
  if (!email) {
    return Response.json(
      { success: false, message: "A valid email is required" },
      { status: 422 },
    );
  }

  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, 64)
      : "capture-modal";
  const path =
    typeof body.path === "string" ? body.path.trim().slice(0, 512) : null;

  try {
    const db = getDb();
    const existing = await db.query.leads.findFirst({
      where: eq(leads.email, email),
    });

    if (existing) {
      let welcome = { sent: false as boolean, skipped: "already subscribed" as string | undefined };
      if (!existing.welcomeEmailSentAt) {
        const result = await sendWelcomeEmail(email);
        if (result.sent) {
          await db
            .update(leads)
            .set({ welcomeEmailSentAt: new Date(), updatedAt: new Date() })
            .where(eq(leads.id, existing.id));
        }
        welcome = {
          sent: result.sent,
          skipped: result.skipped ?? result.error,
        };
      }

      return Response.json({
        success: true,
        data: {
          id: existing.id,
          email: existing.email,
          created: false,
          welcomeEmailSent: Boolean(existing.welcomeEmailSentAt) || welcome.sent,
        },
      });
    }

    const [created] = await db
      .insert(leads)
      .values({
        email,
        source,
        path,
      })
      .returning();

    const welcome = await sendWelcomeEmail(email);
    if (welcome.sent) {
      await db
        .update(leads)
        .set({ welcomeEmailSentAt: new Date(), updatedAt: new Date() })
        .where(eq(leads.id, created.id));
    } else if (welcome.error || welcome.skipped) {
      console.warn("[leads] welcome email not sent", welcome.error ?? welcome.skipped);
    }

    return Response.json({
      success: true,
      data: {
        id: created.id,
        email: created.email,
        created: true,
        welcomeEmailSent: welcome.sent,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lead capture failed";
    console.error("[leads] POST failed", err);
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return Response.json({ success: false, message }, { status });
  }
}

export async function PATCH(request: Request) {
  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.id || typeof body.id !== "string") {
    return Response.json(
      { success: false, message: "id is required" },
      { status: 422 },
    );
  }

  if (typeof body.phone !== "string") {
    return Response.json(
      { success: false, message: "phone is required" },
      { status: 422 },
    );
  }

  const phone = normalizePhone(body.phone);
  if (!phone) {
    return Response.json(
      { success: false, message: "Enter a valid US phone number" },
      { status: 422 },
    );
  }

  if (body.smsConsent !== true) {
    return Response.json(
      { success: false, message: "SMS consent is required to save a phone number" },
      { status: 422 },
    );
  }

  try {
    const db = getDb();
    const [updated] = await db
      .update(leads)
      .set({
        phone,
        smsConsent: true,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, body.id))
      .returning();

    if (!updated) {
      return Response.json(
        { success: false, message: "Lead not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: {
        id: updated.id,
        phone: updated.phone,
        smsConsent: updated.smsConsent,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lead update failed";
    console.error("[leads] PATCH failed", err);
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return Response.json({ success: false, message }, { status });
  }
}

/** List leads for ops. Requires LEADS_ADMIN_SECRET header. */
export async function GET(request: Request) {
  const secret = process.env.LEADS_ADMIN_SECRET;
  if (!secret) {
    return Response.json(
      { success: false, message: "LEADS_ADMIN_SECRET is not configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-leads-admin-secret");
  if (!provided || provided !== secret) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = await db.select().from(leads).orderBy(asc(leads.createdAt));
    return Response.json({ success: true, data: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list leads";
    console.error("[leads] GET failed", err);
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return Response.json({ success: false, message }, { status });
  }
}
