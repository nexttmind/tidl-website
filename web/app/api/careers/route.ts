import { normalizeEmail, normalizePhone } from "@/lib/leads/validate";
import { sendCareerApplication } from "@/lib/careers/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);

function safeFilename(raw: string) {
  const base = raw.replace(/^.*[/\\]/, "").replace(/[^\w.]+/g, "_").slice(0, 120);
  return base || "resume.pdf";
}

function fileExt(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { success: false, message: "Invalid form body" },
      { status: 400 },
    );
  }

  const nameRaw = form.get("name");
  const emailRaw = form.get("email");
  const phoneRaw = form.get("phone");
  const resumeRaw = form.get("resume");

  const name =
    typeof nameRaw === "string" ? nameRaw.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 80) {
    return Response.json(
      { success: false, message: "Enter your name" },
      { status: 422 },
    );
  }

  const email = typeof emailRaw === "string" ? normalizeEmail(emailRaw) : null;
  if (!email) {
    return Response.json(
      { success: false, message: "A valid email is required" },
      { status: 422 },
    );
  }

  const phone = typeof phoneRaw === "string" ? normalizePhone(phoneRaw) : null;
  if (!phone) {
    return Response.json(
      { success: false, message: "Enter a valid US phone number" },
      { status: 422 },
    );
  }

  if (!(resumeRaw instanceof File) || resumeRaw.size === 0) {
    return Response.json(
      { success: false, message: "Upload a resume" },
      { status: 422 },
    );
  }

  if (resumeRaw.size > MAX_BYTES) {
    return Response.json(
      { success: false, message: "Resume must be four megabytes or less" },
      { status: 422 },
    );
  }

  const filename = safeFilename(resumeRaw.name);
  const ext = fileExt(filename);
  const type = resumeRaw.type || "";
  if (!ALLOWED_EXT.has(ext) && !ALLOWED_TYPES.has(type)) {
    return Response.json(
      { success: false, message: "Upload a PDF or Word document" },
      { status: 422 },
    );
  }

  const content = Buffer.from(await resumeRaw.arrayBuffer());
  const contentType = ALLOWED_TYPES.has(type)
    ? type
    : ext === "pdf"
      ? "application/pdf"
      : ext === "doc"
        ? "application/msword"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  try {
    const result = await sendCareerApplication({
      name,
      email,
      phone,
      resume: { filename, content, contentType },
    });

    if (!result.sent) {
      console.error("[careers] notify failed", result.error ?? result.skipped);
      const status = result.skipped ? 503 : 500;
      return Response.json(
        {
          success: false,
          message: "Could not send your application just now. Try again in a moment.",
        },
        { status },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Application failed";
    console.error("[careers] POST failed", err);
    return Response.json({ success: false, message }, { status: 500 });
  }
}
