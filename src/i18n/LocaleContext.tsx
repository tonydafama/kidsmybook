import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLocale, LOCALE_HTML_LANG, persistLocale, type Locale } from "./locale";
import { TRANSLATIONS, type Translations } from "./translations";

type LocaleContextValue = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = (next: Locale) => {
    persistLocale(next);
    setLocaleState(next);
  };

  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: TRANSLATIONS[locale],
      setLocale,
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
