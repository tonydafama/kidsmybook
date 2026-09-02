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

  const res = await fetch(COVER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frontPrompt, backPrompt }),
  });

  const payload = (await res.json()) as { frontUrl?: string; backUrl?: string; error?: string };
  if (!res.ok) {
    throw new Error(payload.error ?? `Cover API HTTP ${res.status}`);
  }
  if (!payload.frontUrl || !payload.backUrl) {
    throw new Error("Cover API returned incomplete image URLs");
  }
  return { frontUrl: payload.frontUrl, backUrl: payload.backUrl };
}
