import { getPrescribeRxEnv } from "./env";

export class PrescribeRxError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PrescribeRxError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
) {
  const url = new URL(
    `${baseUrl}/${path.replace(/^\//, "")}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Thin server gateway to PrescribeRx /api/v1. Token never leaves the server. */
export async function prescribeRxFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const env = getPrescribeRxEnv();
  if (!env) {
    throw new PrescribeRxError("PrescribeRx env not configured", 503, null);
  }

  const method = options.method ?? "GET";
  const url = buildUrl(env.baseUrl, path, options.query);
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${env.token}`,
  };
  let body: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }

  if (!res.ok) {
    throw new PrescribeRxError(
      `PrescribeRx ${method} ${path} failed`,
      res.status,
      parsed,
    );
  }

  return parsed as T;
}

export function errorResponse(err: unknown) {
  if (err instanceof PrescribeRxError) {
    return Response.json(
      {
        success: false,
        message: err.message,
        upstream: err.body,
      },
      { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
    );
  }
  console.error(err);
  return Response.json(
    { success: false, message: "Unexpected PrescribeRx proxy error" },
    { status: 500 },
  );
}
