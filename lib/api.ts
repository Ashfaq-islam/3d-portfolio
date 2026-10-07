// Small typed API helper shared by client components.
// Client-safe: no server-only imports, no secrets, only NEXT_PUBLIC_ env vars.

// NOTE: Next.js only inlines NEXT_PUBLIC_ variables when they are written as a
// literal property access like this. `process.env["NEXT_PUBLIC_API_URL"]` or a
// computed name would NOT be bundled and would be undefined in the browser.
const RAW_API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "";

// Strip trailing slashes so `${API_URL}${path}` never produces "//".
export const API_URL: string = RAW_API_URL.replace(/\/+$/, "");

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // `details` carries per-field validation errors (400s), `status` the HTTP
  // status so callers can tell a 400 apart from a 429.
  details?: ApiFieldError[];
  status?: number;
}

export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

// Type guard: the server (or Render's proxy) can return anything, so we check
// the shape before trusting it. This keeps the only `data` type assertion in
// one contained place below and avoids `any`.
function isApiPayload(value: unknown): value is { success: boolean } {
  if (typeof value !== "object" || value === null) return false;
  if (!("success" in value)) return false;
  return typeof value.success === "boolean";
}

// Friendly fallback messages when the body is not usable JSON (HTML/text from
// Render's proxy, or a JSON body that doesn't match our error shape).
function fallbackErrorForStatus(status: number): string {
  if (status === 429) return "Too many requests. Please try again later.";
  if (status === 502 || status === 503 || status === 504) {
    return "The server is waking up or temporarily unavailable. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}

/**
 * Fetch a backend endpoint and always resolve to an ApiResponse.
 * It NEVER throws: network failures, timeouts and bad payloads are converted
 * into `{ success: false, error }` so callers only need one error path.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  // Missing env var: fail fast without making a request.
  if (!API_URL) {
    return { success: false, error: "API URL is not configured." };
  }

  const { timeoutMs = 60000, body, headers: callerHeaders, ...rest } = options;
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  // Build headers from the caller's instead of spreading `options` after our
  // headers, so a caller-provided header is merged, never wiped out.
  const headers = new Headers(callerHeaders);
  headers.set("Accept", "application/json");
  // Only add Content-Type when there is a body AND the caller didn't set one.
  // A body-less GET with Content-Type triggers an unnecessary CORS preflight.
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Timeout via AbortController: the Render free tier sleeps when idle and the
  // first request can take close to a minute to wake it up, so the default is
  // 60s rather than fetch's 300s (or "forever" in some browsers).
  let timedOut = false;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, {
      ...rest,
      body,
      headers,
      signal: controller.signal,
    });

    // Read as text first so a 502/503 HTML page from Render's proxy doesn't
    // blow up JSON.parse inside res.json().
    let parsed: unknown;
    try {
      parsed = JSON.parse(await res.text()) as unknown;
    } catch {
      return {
        success: false,
        status: res.status,
        error: fallbackErrorForStatus(res.status),
      };
    }

    // Validate before trusting: the response must at least look like ours.
    if (!isApiPayload(parsed)) {
      return {
        success: false,
        status: res.status,
        error: fallbackErrorForStatus(res.status),
      };
    }

    // The single place `data` is asserted (via the ApiPayload type predicate).
    const payload = parsed as ApiResponse<T>;
    return {
      ...payload,
      // Never report success for an HTTP error, even if the body says so.
      success: res.ok ? payload.success : false,
      status: res.status,
    };
  } catch {
    if (timedOut) {
      return {
        success: false,
        error: "The server is taking too long to respond. Please try again.",
      };
    }
    // Network down, CORS blocked, DNS failure, or an aborted request.
    return { success: false, error: "Network error. Please try again." };
  } finally {
    // Always release the timer, otherwise it keeps the process/tick alive.
    clearTimeout(timer);
  }
}
