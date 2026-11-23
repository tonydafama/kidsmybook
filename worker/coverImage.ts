/**
 * Academic cover art via Cloudflare Workers AI.
 * FLUX.1 Schnell on Workers AI is fixed at 1024×1024 and rejects width/height.
 * FLUX.2 Klein 4B accepts a portrait size (256–1920) and runs a fixed 4-step pass.
 * https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/
 */
export const COVER_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
export const COVER_WIDTH = 768;
export const COVER_HEIGHT = 1344;
/** One Klein call. Fast model; parents are not held for the old 90s Monica budget. */
export const COVER_ATTEMPT_TIMEOUT_MS = 45_000;
/** Whole wait. A quick failure can retry inside time the first call did not use. */
export const COVER_OVERALL_BUDGET_MS = 45_000;
export const COVER_RETRY_BACKOFF_MS = 1_000;
export const COVER_MIN_ATTEMPT_MS = 15_000;
export const COVER_MAX_ATTEMPTS = 2;
/** Preview links stay valid long enough to send to the studio. */
export const COVER_IMAGE_TTL_SECONDS = 60 * 60 * 24 * 30;

const COVER_ID_RE = /^[A-Za-z0-9_-]{8,80}$/;
const PERMANENT_AI_RE =
  /quota|billing|unauthorized|forbidden|invalid|not configured|unevaluated|bad input|401|402|403/i;

export type CoverAi = {
  run: (model: string, inputs: unknown) => Promise<unknown>;
};

export type StoredCover = {
  bytes: Uint8Array;
  contentType: string;
};

export type CoverImageStore = {
  put: (id: string, image: StoredCover, ttlSeconds: number) => Promise<void>;
  get: (id: string) => Promise<StoredCover | null>;
};

export type KvLike = {
  put: (
    key: string,
    value: ArrayBuffer,
    options?: { expirationTtl?: number; metadata?: { contentType: string } },
  ) => Promise<void>;
  getWithMetadata: (
    key: string,
    options: { type: "arrayBuffer" },
  ) => Promise<{ value: ArrayBuffer | null; metadata: { contentType?: string } | null }>;
};

type CoverTiming = {
  attemptTimeoutMs: number;
  overallBudgetMs: number;
  backoffMs: number;
  minAttemptMs: number;
  maxAttempts: number;
};

const DEFAULT_TIMING: CoverTiming = {
  attemptTimeoutMs: COVER_ATTEMPT_TIMEOUT_MS,
  overallBudgetMs: COVER_OVERALL_BUDGET_MS,
  backoffMs: COVER_RETRY_BACKOFF_MS,
  minAttemptMs: COVER_MIN_ATTEMPT_MS,
  maxAttempts: COVER_MAX_ATTEMPTS,
};

function coverKey(id: string): string {
  return `cover-img:${id}`;
}

export function kvCoverStore(kv: KvLike): CoverImageStore {
  return {
    async put(id, image, ttlSeconds) {
      const copy = image.bytes.buffer.slice(image.bytes.byteOffset, image.bytes.byteOffset + image.bytes.byteLength) as ArrayBuffer;
      await kv.put(coverKey(id), copy, {
        expirationTtl: ttlSeconds,
        metadata: { contentType: image.contentType },
      });
    },
    async get(id) {
      const stored = await kv.getWithMetadata(coverKey(id), { type: "arrayBuffer" });
      if (!stored.value) return null;
      const bytes = new Uint8Array(stored.value);
      return { bytes, contentType: stored.metadata?.contentType || imageContentType(bytes) };
    },
  };
}

export function imageContentType(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

export function coverImageIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/cover-image\/([A-Za-z0-9_-]{8,80})$/);
  if (!match || !COVER_ID_RE.test(match[1])) return null;
  return match[1];
}

function decodeBase64(value: string): Uint8Array {
  const cleaned = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").replace(/\s/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function artworkBytes(result: unknown): Promise<Uint8Array> {
  if (result instanceof Uint8Array) return result;
  if (result instanceof ArrayBuffer) return new Uint8Array(result);
  if (typeof ReadableStream !== "undefined" && result instanceof ReadableStream) {
    const buf = await new Response(result as ReadableStream<Uint8Array>).arrayBuffer();
    return new Uint8Array(buf);
  }
  if (typeof result === "string") return decodeBase64(result);
  if (result && typeof result === "object" && "image" in result) {
    const image = (result as { image?: unknown }).image;
    if (typeof image === "string") return decodeBase64(image);
    if (image instanceof Uint8Array) return image;
    if (image instanceof ArrayBuffer) return new Uint8Array(image);
  }
  throw new Error("Workers AI returned no image");
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

function isRetryableAiError(err: unknown): boolean {
  if (isAbortError(err) || err instanceof TypeError) return true;
  if (!(err instanceof Error)) return true;
  if (PERMANENT_AI_RE.test(err.message)) return false;
  return true;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function runKleinOnce(prompt: string, timeoutMs: number, ai: CoverAi): Promise<Uint8Array> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("width", String(COVER_WIDTH));
  form.append("height", String(COVER_HEIGHT));
  const formResponse = new Response(form);
  const contentType = formResponse.headers.get("content-type");
  if (!formResponse.body || !contentType) throw new Error("Could not encode the cover prompt");
  const result = await withTimeout(
    ai.run(COVER_MODEL, {
      multipart: { body: formResponse.body, contentType },
    }),
    timeoutMs,
  );
  const bytes = await artworkBytes(result);
  if (!bytes.byteLength) throw new Error("Workers AI returned no image");
  return bytes;
}

export async function generateStoredCover(options: {
  prompt: string;
  ai: CoverAi;
  store: CoverImageStore;
  origin: string;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  newId?: () => string;
  config?: Partial<CoverTiming>;
}): Promise<{ frontUrl: string; backUrl: string; id: string }> {
  const prompt = options.prompt.trim();
  if (!prompt) throw new Error("frontPrompt is required.");
  const cfg: CoverTiming = { ...DEFAULT_TIMING, ...options.config };
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? defaultSleep;
  const started = now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    if (attempt > 1) {
      const remaining = cfg.overallBudgetMs - (now() - started);
      if (remaining < cfg.backoffMs + cfg.minAttemptMs) break;
      await sleep(cfg.backoffMs);
      if (cfg.overallBudgetMs - (now() - started) < cfg.minAttemptMs) break;
    }
    const remaining = cfg.overallBudgetMs - (now() - started);
    const timeoutMs = Math.min(cfg.attemptTimeoutMs, Math.max(0, remaining));
    if (timeoutMs < (attempt === 1 ? 1 : cfg.minAttemptMs)) break;
    try {
      const bytes = await runKleinOnce(prompt, timeoutMs, options.ai);
      const id = (options.newId ?? (() => crypto.randomUUID()))();
      if (!COVER_ID_RE.test(id)) throw new Error("Could not store the cover image");
      const contentType = imageContentType(bytes);
      await options.store.put(id, { bytes, contentType }, COVER_IMAGE_TTL_SECONDS);
      const origin = options.origin.replace(/\/$/, "");
      const url = `${origin}/api/cover-image/${id}`;
      return { frontUrl: url, backUrl: url, id };
    } catch (err) {
      lastError = err;
      if (attempt >= cfg.maxAttempts || !isRetryableAiError(err)) throw err;
      const detail = err instanceof Error ? err.message.slice(0, 180) : "unknown";
      console.warn(`Workers AI cover transient failure (attempt ${attempt}/${cfg.maxAttempts}), retrying: ${detail}`);
    }
  }
  if (lastError) throw lastError;
  throw new Error("Cover generation failed");
}

export async function loadCoverImage(store: CoverImageStore, id: string): Promise<StoredCover | null> {
  if (!COVER_ID_RE.test(id)) return null;
  return store.get(id);
}

export function coverImageHttpResponse(image: StoredCover | null, method: string): Response {
  if (!image) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const headers = {
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
  };
  if (method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(image.bytes, { status: 200, headers });
}
