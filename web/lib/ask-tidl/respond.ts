import {
  answerAskTidl,
  type AskAnswer,
  type CatalogLink,
} from "@/content/fixtures/ask-tidl";

export type AskTidlMode = "marketing" | "clinical";

export type AskTidlRequest = {
  query: string;
  mode?: AskTidlMode;
  context?: {
    path?: string;
    encounter_type_id?: string | null;
    step_slug?: string | null;
    entry_slug?: string | null;
    entry_kind?: "stack" | "treatment" | "program" | null;
  };
};

export type AskTidlResponse = AskAnswer & {
  source: "fixture" | "llm";
  mode: AskTidlMode;
};

type LlmPayload = {
  paragraphs?: string[];
  treatments?: CatalogLink[];
  programs?: CatalogLink[];
  disclaimer?: string;
};

export async function respondAskTidl(
  input: AskTidlRequest,
): Promise<AskTidlResponse> {
  const query = input.query?.trim() ?? "";
  const mode: AskTidlMode =
    input.mode ??
    ((process.env.ASK_TIDL_MODE_DEFAULT as AskTidlMode | undefined) ||
      "marketing");

  if (!query) {
    return {
      ...answerAskTidl(""),
      source: "fixture",
      mode,
    };
  }

  const llmUrl = process.env.ASK_TIDL_LLM_URL;
  const llmKey = process.env.ASK_TIDL_LLM_KEY;

  if (!llmUrl) {
    return {
      ...answerAskTidl(query),
      source: "fixture",
      mode,
    };
  }

  const res = await fetch(llmUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(llmKey ? { Authorization: `Bearer ${llmKey}` } : {}),
    },
    body: JSON.stringify({
      query,
      mode,
      model: process.env.ASK_TIDL_MODEL || undefined,
      context: input.context ?? {},
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    // Fail soft to fixture so intake UI is never blocked by LLM outage.
    return {
      ...answerAskTidl(query),
      source: "fixture",
      mode,
    };
  }

  const data = (await res.json()) as LlmPayload;
  const fallback = answerAskTidl(query);

  return {
    paragraphs: data.paragraphs?.length ? data.paragraphs : fallback.paragraphs,
    treatments: data.treatments?.length ? data.treatments : fallback.treatments,
    programs: data.programs?.length ? data.programs : fallback.programs,
    disclaimer: data.disclaimer || fallback.disclaimer,
    source: "llm",
    mode,
  };
}
