import type { UploadedDoc } from "./schema-types";

/** Matches IntakeWizard client cap (6 MB encoded). */
export const MAX_INTAKE_ENCODED_BYTES = 6 * 1024 * 1024;

export function validateIntakeFiles(
  files: unknown,
): { ok: true; files: UploadedDoc[] } | { ok: false; message: string } {
  if (files === undefined || files === null) {
    return { ok: true, files: [] };
  }
  if (!Array.isArray(files)) {
    return { ok: false, message: "Invalid request." };
  }

  const parsed: UploadedDoc[] = [];
  for (const item of files) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: "Invalid request." };
    }
    const row = item as Record<string, unknown>;
    const slug = typeof row.slug === "string" ? row.slug.trim() : "";
    const base64 = typeof row.base64 === "string" ? row.base64 : "";
    const filename =
      typeof row.filename === "string" ? row.filename.trim() : "";
    const mime_type =
      typeof row.mime_type === "string" ? row.mime_type.trim() : "";

    if (!slug || !base64) {
      return { ok: false, message: "Invalid request." };
    }
    if (base64.length > MAX_INTAKE_ENCODED_BYTES) {
      return {
        ok: false,
        message:
          "The intake request was too large to read. Use a smaller ID photo, then submit again.",
      };
    }

    parsed.push({
      slug,
      base64,
      filename: filename || "upload",
      mime_type: mime_type || "application/octet-stream",
    });
  }

  return { ok: true, files: parsed };
}
