import { Fragment } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { WA_QUOTE_EN, WA_QUOTE_HANS, WA_QUOTE_ZH, linkifySegments } from "../lib/contact";

/** Renders FAQ and other prose so wa.me, email, and the studio phone are real anchors. */
export function LinkedText({ text, whatsappText }: { text: string; whatsappText?: string }) {
  const { locale } = useLocale();
  const prefill =
    whatsappText ?? (locale === "en" ? WA_QUOTE_EN : locale === "zh-Hans" ? WA_QUOTE_HANS : WA_QUOTE_ZH);
  const parts = linkifySegments(text, prefill);
  return (
    <>
      {parts.map((part, index) =>
        part.type === "text" ? (
          <Fragment key={index}>{part.text}</Fragment>
        ) : (
          <a
            key={index}
            href={part.href}
            {...(part.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {part.text}
          </a>
        ),
      )}
    </>
  );
}
