const ALLOWED_HOSTS = new Set([
  "kidsmybook.com",
  "www.kidsmybook.com",
  "wa.me",
  "hkpl.gov.hk",
  "www.hkpl.gov.hk",
]);

/** Drop sentence punctuation that was typed against a URL, keeping `.html`. */
export function splitTrailingPunct(raw: string): { href: string; rest: string } {
  const href = raw.replace(/[。，、,.;:）)]+$/u, "");
  return { href, rest: raw.slice(href.length) };
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
