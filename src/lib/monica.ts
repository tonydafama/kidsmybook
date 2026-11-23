import { getScholarlyProfile } from "./bookCover";

export type CoverPromptInput = {
  name: string;
  ageLine: string;
  themeLabel: string;
  themeLabelZh: string;
  themeEmoji: string;
  interests: string;
  personality: string;
  parentView: string;
  bookTopic: string;
  variant: "front" | "back";
};

const COVER_API = "/api/cover-generate";
/**
 * 20s above the worker's 180s Flux budget (worker/fluxImage.ts) so a timeout JSON still arrives.
 * Parent-facing copy says 180 seconds, the illustration budget, not this cushion.
 */
const COVER_CLIENT_TIMEOUT_MS = 200_000;

export class CoverGenerateError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = "upstream") {
    super(message);
    this.name = "CoverGenerateError";
    this.status = status;
    this.code = code;
  }
}

type CoverApiPayload = {
  frontUrl?: string;
  backUrl?: string;
  error?: string;
  code?: string;
};

function isHttpUrl(value: string | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function failureCode(status: number, code: string | undefined): string {
  if (code === "daily_limit" || code === "timeout" || code === "not_configured" || code === "upstream") return code;
  if (status === 429) return "daily_limit";
  if (status === 504) return "timeout";
  if (status === 503) return "not_configured";
  return "upstream";
}

export function buildCoverImagePrompt(input: CoverPromptInput): string {
  const profile = getScholarlyProfile(input.interests || input.bookTopic, input.name);

  if (input.variant === "front") {
    return [
      `FRONT COVER ARTWORK: ${profile.visualSubjectEn}.`,
      "STYLE: High-end collector's monograph book cover, master-level professional illustration.",
      "AESTHETIC: Deep dark obsidian navy, dark charcoal and rich gold/bronze metallic accents, cinematic chiaroscuro studio lighting, razor-sharp textures, museum-quality composition.",
      "CRITICAL: Pure artwork only. Absolutely NO text, NO letters, NO numbers, NO words, NO typography, NO watermarks, NO logos anywhere in the image.",
      "STRICTLY FORBIDDEN: cute cartoons, chibi, anime, babyish drawings, plastic toys, flat clip art.",
    ].join(" ");
  }

  return [
    `BACK COVER ARTWORK: ${profile.visualBackdropEn}.`,
    "STYLE: Elegant companion artwork for scholarly monograph back cover.",
    "AESTHETIC: Subtle dark textured backdrop, refined minimalist technical drawing and blueprint lines on obsidian leather background.",
    "CRITICAL: Pure artwork only. Absolutely NO text, NO letters, NO numbers, NO words, NO typography, NO watermarks, NO logos anywhere in the image.",
    "STRICTLY FORBIDDEN: cute cartoons, chibi, anime, babyish drawings.",
  ].join(" ");
}

export type GeneratedCoverPair = {
  frontUrl: string;
  backUrl: string;
};

export async function generateBookCoverPair(input: {
  name: string;
  ageLine: string;
  themeLabel: string;
  themeLabelZh: string;
  themeEmoji: string;
  interests: string;
  personality: string;
  parentView: string;
  bookTopic: string;
}): Promise<GeneratedCoverPair> {
  const base = { ...input };
  const frontPrompt = buildCoverImagePrompt({ ...base, variant: "front" });
  const backPrompt = buildCoverImagePrompt({ ...base, variant: "back" });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COVER_CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch(COVER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontPrompt, backPrompt }),
      signal: controller.signal,
    });
    const text = await res.text();
    let payload: CoverApiPayload;
    try {
      payload = JSON.parse(text) as CoverApiPayload;
    } catch {
      throw new CoverGenerateError(
        `Cover API returned a non-JSON response (HTTP ${res.status}).`,
        res.status || 502,
        "upstream",
      );
    }
    if (!res.ok) {
      throw new CoverGenerateError(
        payload.error?.trim() || `Cover API HTTP ${res.status}`,
        res.status,
        failureCode(res.status, payload.code),
      );
    }
    if (!isHttpUrl(payload.frontUrl) || !isHttpUrl(payload.backUrl)) {
      throw new CoverGenerateError("Cover API returned incomplete image URLs.", 502, "upstream");
    }
    return { frontUrl: payload.frontUrl, backUrl: payload.backUrl };
  } catch (err) {
    if (err instanceof CoverGenerateError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new CoverGenerateError("The cover request timed out after 180 seconds.", 504, "timeout");
    }
    const message = err instanceof Error && err.message ? err.message : "Cover request failed";
    throw new CoverGenerateError(message, 0, "upstream");
  } finally {
    clearTimeout(timer);
  }
}
