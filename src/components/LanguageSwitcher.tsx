import { LOCALE_LABELS, LOCALES, type Locale } from "../i18n/locale";
import { useLocale } from "../i18n/LocaleContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher__btn ${locale === code ? "lang-switcher__btn--active" : ""}`}
          aria-pressed={locale === code}
          onClick={() => setLocale(code as Locale)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
