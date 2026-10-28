/**
 * Turn plain contact strings into real anchors.
 * WhatsApp clicks stay <a href="https://wa.me/..."> so src/lib/analytics.ts can record whatsapp_click.
 * Bare wa.me links get the enquiry prefill. A URL that already has ?text= is left as written.
 */

export const STUDIO_WHATSAPP_NUMBER = "85291214157";
export const STUDIO_EMAIL = "kidsmybook@outlook.com";
/** Visible label for wa.me anchors. The href keeps the number for whatsapp_click. */
export const WHATSAPP_LABEL = "@kidsmybook";

/** Primary enquiry prefill. Age and interest blanks, no price. */
export const WA_QUOTE_ZH = "你好，想問小朋友出書計劃報價。年齡：＿＿；興趣：＿＿";
export const WA_QUOTE_HANS = "你好，想问小朋友出书计划报价。年龄：＿＿；兴趣：＿＿";
export const WA_QUOTE_EN =
  "Hello, I'd like a private quote for the children's publishing programme. Age: __; Interest: __";

const ALLOWED_HOSTS = new Set([
  "kidsmybook.com",
  "www.kidsmybook.com",
  "wa.me",
  "hkpl.gov.hk",
  "www.hkpl.gov.hk",
]);

const TOKEN_RE =
  /(https:\/\/[^\s<>"']+|@kidsmybook\b|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi;

export type TextPart =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string; external: boolean };

const URL_STOP = /[\s<>"'（）()。，、；：！？「」『』【】]/u;

/**
 * Separate a URL from the sentence glued to it.
 * Non-ASCII is allowed only inside the query, so Chinese prefill stays,
 * while `https://wa.me/85291214157）或電郵` does not swallow the words after it.
 */
export function splitTrailingPunct(raw: string): { href: string; rest: string } {
  const queryAt = raw.indexOf("?");
  let end = 0;
  for (let i = 0; i < raw.length; ) {
    const ch = raw[i];
    const inQuery = queryAt !== -1 && i > queryAt;
    if (/\s/u.test(ch) || ch === "<" || ch === ">" || ch === '"' || ch === "'") break;
    if (!inQuery && (URL_STOP.test(ch) || (ch.codePointAt(0) ?? 0) > 0x7f)) break;
    end = i + ch.length;
    i += ch.length;
  }
  const trimmed = raw.slice(0, end).replace(/[.,;:]+$/u, "");
  return { href: trimmed, rest: raw.slice(trimmed.length) };
}

export function safeHttpsUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function whatsappHref(text: string, number = STUDIO_WHATSAPP_NUMBER): string {
  const digits = (number || STUDIO_WHATSAPP_NUMBER).replace(/\D/g, "") || STUDIO_WHATSAPP_NUMBER;
  const base = `https://wa.me/${digits}`;
  const trimmed = text.trim();
  if (!trimmed) return base;
  return `${base}?text=${encodeURIComponent(trimmed)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decorateHttps(raw: string, whatsappText: string): TextPart[] {
  const { href, rest } = splitTrailingPunct(raw);
  const safe = safeHttpsUrl(href);
  const parts: TextPart[] = [];
  if (!safe) {
    parts.push({ type: "text", text: raw });
    return parts;
  }
  const url = new URL(safe);
  const host = url.hostname.toLowerCase();
  let target = safe;
  if (host === "wa.me" && !url.searchParams.get("text") && whatsappText.trim()) {
    const digits = url.pathname.replace(/\D/g, "") || STUDIO_WHATSAPP_NUMBER;
    target = whatsappHref(whatsappText, digits);
  }
  const external = host !== "kidsmybook.com" && host !== "www.kidsmybook.com";
  const linkText = host === "wa.me" ? WHATSAPP_LABEL : href;
  parts.push({ type: "link", text: linkText, href: target, external });
  if (rest) parts.push({ type: "text", text: rest });
  return parts;
}

function linkToken(token: string, whatsappText: string): TextPart[] {
  if (/^https:\/\//i.test(token)) {
    const parts = decorateHttps(token, whatsappText);
    const tail = parts[parts.length - 1];
    if (parts.length > 1 && tail?.type === "text") {
      return [...parts.slice(0, -1), ...linkifySegments(tail.text, whatsappText)];
    }
    return parts;
  }
  if (/^@kidsmybook$/i.test(token)) {
    return [{ type: "link", text: WHATSAPP_LABEL, href: whatsappHref(whatsappText), external: true }];
  }
  if (token.includes("@")) {
    return [{ type: "link", text: token, href: `mailto:${token}`, external: false }];
  }
  return [{ type: "text", text: token }];
}

export function linkifySegments(text: string, whatsappText = WA_QUOTE_ZH): TextPart[] {
  const parts: TextPart[] = [];
  const re = new RegExp(TOKEN_RE.source, TOKEN_RE.flags);
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", text: text.slice(last, match.index) });
    parts.push(...linkToken(match[0], whatsappText));
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

export function linkifyHtml(text: string, whatsappText = WA_QUOTE_ZH): string {
  return linkifySegments(text, whatsappText)
    .map((part) => {
      if (part.type === "text") return escapeHtml(part.text);
      const extra = part.external ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${escapeHtml(part.href)}"${extra}>${escapeHtml(part.text)}</a>`;
    })
    .join("");
}
