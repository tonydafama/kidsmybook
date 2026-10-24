/**
 * WhatsApp inquiry clicks → existing GA4 property (gtag in index.html).
 * Does not call gtag('config'); page_view stays on the current measurement ID.
 * The prefilled `text` query is never sent — it can contain a child's name.
 */

const WHATSAPP_HOSTS = new Set([
  "wa.me",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "chat.whatsapp.com",
  "www.whatsapp.com",
]);

const SECTION_LOCATIONS = ["phases", "stages", "path"] as const;

export type CtaLocationMarkers = {
  explicit?: string | null;
  classes: ReadonlySet<string>;
  ids: ReadonlySet<string>;
  pathname: string;
  inLandingHero: boolean;
};

type GtagFn = (command: "event", eventName: string, params?: Record<string, string>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

function parseHttpUrl(href: string): URL | null {
  try {
    const url = new URL(href, "https://kidsmybook.com");
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

export function isWhatsappHref(href: string): boolean {
  const url = parseHttpUrl(href);
  if (!url) return false;
  return WHATSAPP_HOSTS.has(url.hostname.toLowerCase());
}

/** Public wa.me / WhatsApp URL with query and hash removed. */
export function publicWhatsappLink(href: string): string {
  const url = parseHttpUrl(href);
  if (!url || !WHATSAPP_HOSTS.has(url.hostname.toLowerCase())) return "https://wa.me/";
  const path = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
  return `https://${url.hostname.toLowerCase()}${path}`;
}

export function analyticsPagePath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function resolveCtaLocation(markers: CtaLocationMarkers): string {
  const explicit = markers.explicit?.trim();
  if (explicit) return explicit.slice(0, 100);
  if (markers.classes.has("floating-wa")) return "floating";
  if (markers.classes.has("top-nav")) return "header";
  if (markers.classes.has("site-footer")) return "footer";
  if (markers.classes.has("share-wa")) return "blog_share";
  if (markers.classes.has("wa-btn") || markers.ids.has("ai-book-lab")) return "ai_book";
  if (markers.classes.has("final-cta")) return "page_cta";
  if (markers.classes.has("hero")) return "hero";
  if (markers.classes.has("faq-a") || markers.classes.has("faq-item") || markers.ids.has("faq")) return "faq";
  if (markers.classes.has("blog-post")) {
    return markers.classes.has("cta-row") ? "blog_cta" : "blog_inline";
  }
  const pathname = analyticsPagePath(markers.pathname);
  if (pathname === "/blog") return "blog_index";
  if (markers.inLandingHero) return "landing_hero";
  for (const id of SECTION_LOCATIONS) {
    if (markers.ids.has(id)) return id;
  }
  if (markers.classes.has("landing")) return "landing";
  if (pathname.startsWith("/services/")) return "service";
  if (pathname.startsWith("/case-studies")) return "case_study";
  return "inline";
}

export function ctaLocationFromElement(el: Element, pathname: string): string {
  const classes = new Set<string>();
  const ids = new Set<string>();
  let explicit: string | null = null;
  let node: Element | null = el;
  while (node) {
    for (const cls of node.classList) classes.add(cls);
    if (node.id) ids.add(node.id);
    if (!explicit && node.hasAttribute("data-cta-location")) {
      explicit = node.getAttribute("data-cta-location");
    }
    node = node.parentElement;
  }
  const main = el.closest("main.landing");
  const section = el.closest("section");
  const inLandingHero = Boolean(
    main &&
      section &&
      section.parentElement === main &&
      main.querySelector(":scope > section") === section,
  );
  return resolveCtaLocation({ explicit, classes, ids, pathname, inLandingHero });
}

export function trackWhatsappClick(href: string, ctaLocation: string): void {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", "whatsapp_click", {
      link_url: publicWhatsappLink(href).slice(0, 100),
      page_path: analyticsPagePath(window.location.pathname || "/").slice(0, 100),
      cta_location: (ctaLocation || "inline").slice(0, 100),
      transport_type: "beacon",
    });
  } catch {
    // Analytics must not block the WhatsApp handoff.
  }
}

function eventElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

function onWhatsappActivate(event: MouseEvent): void {
  if (event.defaultPrevented) return;
  if (event.type === "auxclick") {
    if (event.button !== 1) return;
  } else if (event.button !== 0) {
    return;
  }
  const el = eventElement(event.target);
  if (!el) return;
  const anchor = el.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  const href = anchor.href;
  if (!isWhatsappHref(href)) return;
  trackWhatsappClick(href, ctaLocationFromElement(anchor, window.location.pathname || "/"));
}

const INSTALLED = "__kidsmybookWhatsappTracking";

/** Capture-phase listener so every wa.me / WhatsApp anchor is covered once. */
export function installWhatsappClickTracking(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const host = window as Window & { [INSTALLED]?: boolean };
  if (host[INSTALLED]) return;
  host[INSTALLED] = true;
  document.addEventListener("click", onWhatsappActivate, true);
  document.addEventListener("auxclick", onWhatsappActivate, true);
}
