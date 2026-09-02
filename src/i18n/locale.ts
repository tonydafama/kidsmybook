export type Locale = "zh-Hant" | "zh-Hans" | "en";

export const LOCALES: Locale[] = ["zh-Hant", "zh-Hans", "en"];

export const LOCALE_STORAGE_KEY = "kidsmybook-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-Hant": "繁",
  "zh-Hans": "简",
  en: "EN",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  "zh-Hant": "zh-Hant",
  "zh-Hans": "zh-Hans",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Map browser / Accept-Language tags to site locale. */
export function detectLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  }

  const langs =
    typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? [...navigator.languages]
        : [navigator.language]
      : [];

  for (const raw of langs) {
    const tag = raw.toLowerCase();
    if (tag.startsWith("zh")) {
      if (tag.includes("cn") || tag.includes("sg") || tag.includes("hans")) return "zh-Hans";
      if (tag.includes("tw") || tag.includes("hk") || tag.includes("mo") || tag.includes("hant")) return "zh-Hant";
      return "zh-Hant";
    }
    if (tag.startsWith("en")) return "en";
  }

  return "zh-Hant";
}

export function persistLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
