const MONICA_FLUX_URL = "https://openapi.monica.im/v1/image/gen/flux";

/**
 * Per-attempt cap for one Monica Flux call.
 * Waiting on fetch is not Workers CPU time (paid default is 30s CPU; HTTP duration
 * is unbounded while the browser stays connected), so this 180s wait does not need a higher cpu_ms.
 */
export const FLUX_ATTEMPT_TIMEOUT_MS = 180_000;

/**
 * Whole generateFluxImage wait. A retry spends time the failed call did not use.
 * The browser waits 200s (COVER_CLIENT_TIMEOUT_MS) so this 180s budget can still return JSON.
 */
export const FLUX_OVERALL_BUDGET_MS = 180_000;

/** One to two seconds. Long enough to let a gateway 504 clear, short enough to stay in budget. */
export const FLUX_RETRY_BACKOFF_MS = 1_500;

/** Flux usually needs at least ~15s. Don't start a retry that cannot finish inside the budget. */
export const FLUX_MIN_ATTEMPT_MS = 20_000;

/** Initial call plus up to two retries. */
export const FLUX_MAX_ATTEMPTS = 3;

const PERMANENT_FLUX_RE =
  /invalid[_\s-]?api[_\s-]?key|\bunauthori[sz]ed\b|\bauthentication\b|\bforbidden\b|\bpermission\b|\bquota\b|\binsufficient\b|\bbilling\b|\bcredits?\b|\bpayment\b|\bbalance\b|api[_\s-]?key[_\s-]?expired|\bdaily[_\s-]?limit\b|\brate[_\s-]?limit\b/i;

type MonicaFluxResponse = {
  data?: { url?: string }[];
  error?: { code?: string; message?: string };
};

export class FluxRequestError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = "FluxRequestError";
    this.status = status;
    this.retryable = retryable;
  }
}

export type FluxFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type FluxRetryConfig = {
  attemptTimeoutMs: number;
  overallBudgetMs: number;
  backoffMs: number;
  minAttemptMs: number;
  maxAttempts: number;
};

export type FluxGenerateOverrides = {
  fetch?: FluxFetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  config?: Partial<FluxRetryConfig>;
  onAttempt?: (info: { attempt: number; timeoutMs: number }) => void;
};

const DEFAULT_CONFIG: FluxRetryConfig = {
  attemptTimeoutMs: FLUX_ATTEMPT_TIMEOUT_MS,
  overallBudgetMs: FLUX_OVERALL_BUDGET_MS,
  backoffMs: FLUX_RETRY_BACKOFF_MS,
  minAttemptMs: FLUX_MIN_ATTEMPT_MS,
  maxAttempts: FLUX_MAX_ATTEMPTS,
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

function isPermanentFluxError(payload: MonicaFluxResponse): boolean {
  const blob = `${payload.error?.code ?? ""} ${payload.error?.message ?? ""}`;
  return PERMANENT_FLUX_RE.test(blob);
}

function isRetryableHttp(status: number, parsed: MonicaFluxResponse | null): boolean {
  if (status === 401 || status === 402 || status === 403 || status === 429) return false;
  if (parsed && isPermanentFluxError(parsed)) return false;
  if (status === 502 || status === 503 || status === 504) return true;
  if (!parsed && status >= 500 && status <= 599) return true;
  return false;
}

function isRetryableFluxError(err: unknown): boolean {
  if (err instanceof FluxRequestError) return err.retryable;
  if (isAbortError(err)) return true;
  if (err instanceof TypeError) return true;
  return false;
}

async function fetchFluxOnce(prompt: string, apiKey: string, timeoutMs: number, fetchImpl: FluxFetch): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(MONICA_FLUX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model: "flux_dev",
        num_outputs: 1,
        size: "768x1344",
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    let payload: MonicaFluxResponse | null = null;
    try {
      payload = JSON.parse(text) as MonicaFluxResponse;
    } catch {
      payload = null;
    }

    if (!payload) {
      throw new FluxRequestError(
        `Monica API returned unexpected response (${res.status}): ${text.slice(0, 100)}`,
        res.status,
        isRetryableHttp(res.status, null),
      );
    }

    if (!res.ok) {
      const msg = payload.error?.message ?? `Monica API HTTP ${res.status}`;
      throw new FluxRequestError(msg, res.status, isRetryableHttp(res.status, payload));
    }

    const url = payload.data?.[0]?.url;
    if (!url) throw new FluxRequestError("Monica API returned no image URL", res.status, false);
    return url;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateFluxImage(
  prompt: string,
  apiKey: string,
  overrides?: FluxGenerateOverrides,
): Promise<string> {
  const cfg: FluxRetryConfig = { ...DEFAULT_CONFIG, ...overrides?.config };
  const now = overrides?.now ?? (() => Date.now());
  const sleep = overrides?.sleep ?? defaultSleep;
  const fetchImpl = overrides?.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const started = now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    if (attempt > 1) {
      const remaining = cfg.overallBudgetMs - (now() - started);
      if (remaining < cfg.backoffMs + cfg.minAttemptMs) break;
      await sleep(cfg.backoffMs);
      const afterBackoff = cfg.overallBudgetMs - (now() - started);
      if (afterBackoff < cfg.minAttemptMs) break;
    }

    const remaining = cfg.overallBudgetMs - (now() - started);
    const timeoutMs = Math.min(cfg.attemptTimeoutMs, Math.max(0, remaining));
    if (timeoutMs < (attempt === 1 ? 1 : cfg.minAttemptMs)) break;
    overrides?.onAttempt?.({ attempt, timeoutMs });

    try {
      return await fetchFluxOnce(prompt, apiKey, timeoutMs, fetchImpl);
    } catch (err) {
      lastError = err;
      const retry = attempt < cfg.maxAttempts && isRetryableFluxError(err);
      if (!retry) throw err;
      const detail = err instanceof Error ? err.message.slice(0, 180) : "unknown";
      console.warn(`Monica Flux transient failure (attempt ${attempt}/${cfg.maxAttempts}), retrying: ${detail}`);
    }
  }

  if (lastError) throw lastError;
  throw new Error("Cover generation failed");
}
