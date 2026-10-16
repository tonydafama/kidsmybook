/**
 * Per-route HTML head injection for the Vite shell.
 * Used by the build-time prerender, the Cloudflare Worker, and the client
 * so the first HTML response and the hydrated page agree.
 *
 * Static documents are zh-Hant (html lang). English / 简体 stay on the
 * in-page language switcher. There are no separate language URLs, so we
 * do not emit hreflang.
 */

export const SITE_ORIGIN = "https://kidsmybook.com";

/**
 * Public profiles verified in this repo and on the live homepage JSON-LD.
 * WhatsApp and the GitHub repository only. No Google Business Profile,
 * Xiaohongshu, LinkedIn, or WeChat official URL was found — do not invent sameAs.
 */
export const ORGANIZATION_SAME_AS = [
  "https://wa.me/85291214157",
  "https://github.com/tonydafama/kidsmybook",
] as const;
export const DEFAULT_OG_PATH = "/og-default.png";
export const ROUTE_MARKER = "kmb-route";

export const DEFAULT_OG = {
  url: `${SITE_ORIGIN}${DEFAULT_OG_PATH}`,
  width: 1200,
  height: 630,
  alt: "Kidsmybook 兒童成就出版",
} as const;

export type OgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type RouteDocument = {
  path: string;
  title: string;
  description: string;
  ogDescription?: string;
  ogType: "website" | "article";
  ogImage: OgImage;
  /** home keeps the Organization/Course graph. page replaces it. */
  mode: "home" | "page";
  jsonLdId?: string;
  jsonLd?: unknown;
  /** Crawlable markup placed inside #root. React replaces it after load. */
  snapshotHtml?: string;
};

/** Visible homepage FAQ (zh-Hant). Must match `zhHant.faq.items` in translations.ts. */
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "Kidsmybook 係咩？",
    a: "香港兒童成就出版工作室。我哋用 12 個月導師制出版計劃，將小朋友真正嘅興趣同生活故事，變成有 ISBN 嘅正式出版物，並有大學教授參與審閱，再配發布會、展覽、媒體同升學 Portfolio。",
  },
  {
    q: "適合幾歲？",
    a: "大概 3 至 18 歲。計劃以興趣為本、導師帶領，書裏面保留小朋友自己嘅聲音。",
  },
  {
    q: "係咪自己出書／self-publishing？",
    a: "唔係。呢個係 12 個月導師帶領嘅出版計劃：正式出版（ISBN）、大學教授審閱、發布會同公關——唔係 DIY 模板，亦唔係自費出書工具。",
  },
  {
    q: "書可唔可以喺實體書店上架？",
    a: "可以。完成嘅書係正式出版物，家庭拎得到實體書，亦會喺實體書店平台上架，作為升學履歷亮點。",
  },
  {
    q: "Kidsmybook 點樣幫小朋友考入香港好學校？",
    a: "香港頂尖國際學校同私立學校，每年收到好多份一模一樣嘅 Portfolio（鋼琴、游水、奧數）。Kidsmybook 幫家庭做出一本由小朋友親自參與、大學教授審閱嘅正式出版實體書，證明熱情、專注同學術潛力，令面試官更容易記住。",
  },
  {
    q: "呢個計劃適合高才通（Top Talent Pass）家庭嗎？",
    a: "適合。好多剛搬到香港嘅高才通家庭，唔清楚本地學校想睇咩，往往只係盲目幫子女報興趣班。12 個月出版計劃提供一個有教授參與、ISBN 註冊、實體書店上架嘅成果，用來填補履歷空白。",
  },
  {
    q: "成個出版計劃需要幾耐時間？",
    a: "完整計劃為期 12 個月，分為 5 個階段：首月諮詢評估、第 2-5 個月專屬課程（專業導師與教授指導）、第 6-7 個月出版研討與教授審閱、第 8-10 個月親子排版設計，最後第 12 個月正式印刷並於實體書店平台上架。",
  },
  {
    q: "收費點樣計？",
    a: "完整 12 個月方案按小朋友題材同配套私人報價，網站唔公開價目。歡迎 WhatsApp（https://wa.me/85291214157）或電郵 kidsmybook@outlook.com。",
  },
  {
    q: "小朋友出書同普通興趣班有咩分別？",
    a: "興趣班多數換一張證書；我哋做嘅係 12 個月導師制出版：由真實興趣出發，經創作、教授審閱、正式 ISBN 出版，再可配發布會、展覽、媒體同升學作品集。成果係一本面試官記得住、可以引用嘅正式出版物，唔係再多一張一樣嘅證書。",
  },
  {
    q: "同自己搵印刷店／自費出書有咩分別？",
    a: "自費印刷通常得本紀念冊，唔一定有導師帶領、學術審閱、ISBN 註冊流程同書店上架路徑。Kidsmybook 係導師制出版計劃，重點係小朋友親身參與、教授審閱、正式出版同升學可用嘅作品集包裝——唔係 DIY 模板或者純代印。",
  },
  {
    q: "香港申請 ISBN 係點？你哋會處理嗎？",
    a: "香港書刊註冊組可為在港營運嘅出版者編配 ISBN（申請本身一般唔收費；細節以香港公共圖書館／書刊註冊組為準）。家庭唔使自己摸索成個出版流程；喺計劃裏面我哋會按正式出版要求處理書號同出版相關安排。想知個案點行，WhatsApp 我哋講你小朋友題材就得。",
  },
  {
    q: "書會用中文定英文？可唔可以雙語？",
    a: "常見係中文、英文或者中英雙語，視乎小朋友學校語境同目標學校。語言喺諮詢階段一齊定，唔會一刀切。",
  },
  {
    q: "幼稚園細路都合適嗎？會唔會太早？",
    a: "大約 3 歲起都可以用興趣帶動（例如圖畫、觀察、口述故事），由導師同家長一齊把關深度同表達方式。重點係保留小朋友自己嘅聲音，而唔係叫佢寫「大人作文」。是否適合，要睇興趣穩定度同家庭目標——歡迎用 WhatsApp 做免費初步了解（報價仍然私人）。",
  },
  {
    q: "可唔可以只報發布會／展覽／PR，唔報成個 12 個月？",
    a: "可以。Author Programme 可以全案，亦可以單項諮詢 Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。適合已經有成品、想加強曝光或升學包裝嘅家庭。",
  },
  {
    q: "會唔會保證入到某間學校？",
    a: "唔會。我哋係出版工作室，唔係升學中介，亦唔保證取錄。一本有 ISBN、教授參與嘅正式出版物，可以令作品集更有說服力、面試更好講故事；最終取錄由學校決定。",
  },
  {
    q: "點樣開始？第一次諮詢要準備咩？",
    a: "WhatsApp https://wa.me/85291214157 或者電郵 kidsmybook@outlook.com，簡單講：（1）小朋友年齡同階段（幼稚園／小學／中學）；（2）而家學校／目標學校類型；（3）佢最感興趣嘅一件事；（4）你最想解決嘅作品集／面試問題。我哋會先了解再私人報價，網站唔放價目表。",
  },
  {
    q: "資優／特別興趣嘅小朋友適唔適合？",
    a: "適合。好多家庭唔想只靠跳級或者再堆班，而想用一本專題式出版展現深度。出版過程本身亦係項目式學習（研究、表達、修改、完成），對資優同有持續興趣嘅小朋友都好有價值。",
  },
  {
    q: "實體書店上架係必須嗎？係咩意思？",
    a: "計劃目標包括正式印刷，並喺實體書店平台上架路徑（例如三聯／商務／中華等渠道相關安排，視題材同出版配套）。對家長嚟講，重點係「睇得見、搜得到」嘅正式出版成果，升學履歷更好引用——詳情喺諮詢按個案說明。",
  },
];

export const HOME_TITLE_ZH = "Kidsmybook｜兒童成就出版｜小朋友出書・ISBN・升學作品集";

export const HOME_DESCRIPTION_ZH =
  "香港兒童成就出版工作室。12 個月導師制，將小朋友真實興趣做成有 ISBN 嘅正式出版物（可有大學教授審閱），再配發布會、展覽、媒體同升學作品集。私人報價：WhatsApp。";

const SERVICE_OG: Record<string, { file: string; width: number; height: number }> = {
  "author-programme": { file: "/services/service-author-programme.png", width: 1376, height: 768 },
  "book-launch": { file: "/services/service-book-launch.png", width: 1376, height: 768 },
  exhibition: { file: "/services/service-exhibition.png", width: 1376, height: 768 },
  "media-pr": { file: "/services/service-media-pr.png", width: 1376, height: 768 },
  "live-streaming": { file: "/services/service-live-streaming.png", width: 1376, height: 768 },
  "portfolio-package": { file: "/services/service-portfolio-package.png", width: 1376, height: 768 },
};

const HILARY_OG: OgImage = {
  url: `${SITE_ORIGIN}/featured/hilary-launch.png`,
  width: 571,
  height: 1024,
  alt: "Hilary 新書發布會",
};

export function normalizeRoutePath(pathname: string): string {
  let path = pathname || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep the raw path */
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

export function markerComment(path: string): string {
  return `<!-- ${ROUTE_MARKER}:${path} -->`;
}

/** Asset path of the prerendered document, or null when this URL is not an HTML route. */
export function prerenderAssetPath(pathname: string): string | null {
  const path = normalizeRoutePath(pathname);
  if (path.startsWith("/api/") || path.startsWith("/assets/") || path.startsWith("/admin")) return null;
  if (path === "/intake" || path === "/intake-form") return null;
  const last = path.split("/").pop() || "";
  if (last.includes(".")) return null;
  return path === "/" ? "/index.html" : `${path}/index.html`;
}

export function canonicalUrl(path: string): string {
  const normalized = normalizeRoutePath(path);
  return normalized === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${normalized}`;
}

export function ogImageForPath(pathname: string): OgImage {
  const path = normalizeRoutePath(pathname);
  const service = path.match(/^\/services\/([^/]+)$/);
  if (service && SERVICE_OG[service[1]]) {
    const img = SERVICE_OG[service[1]];
    return { url: `${SITE_ORIGIN}${img.file}`, width: img.width, height: img.height, alt: "Kidsmybook" };
  }
  if (path === "/services") {
    const img = SERVICE_OG["author-programme"];
    return {
      url: `${SITE_ORIGIN}${img.file}`,
      width: img.width,
      height: img.height,
      alt: "Kidsmybook Author Programme",
    };
  }
  if (path === "/case-studies" || path.startsWith("/case-studies/")) return HILARY_OG;
  return { ...DEFAULT_OG };
}

export function homeFaqJsonLd(): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_ORIGIN}/#faq`,
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbList(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqPageEntity(items: { q: string; a: string }[], id: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertMeta(html: string, attr: "name" | "property", key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  const re = new RegExp(`<meta\\s+${attr}="${escapeRegExp(key)}"\\s+content="[^"]*"\\s*/?>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function jsonLdScript(id: string, data: unknown): string {
  const body = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json" id="${id}">\n${body}\n    </script>`;
}

function stripScript(html: string, id: string): string {
  const re = new RegExp(`\\n?\\s*<script type="application/ld\\+json" id="${id}">[\\s\\S]*?</script>`, "g");
  return html.replace(re, "");
}

function upsertScript(html: string, id: string, data: unknown): string {
  const script = jsonLdScript(id, data);
  if (html.includes(`id="${id}"`)) return stripScript(html, id).replace("</head>", `    ${script}\n  </head>`);
  return html.replace("</head>", `    ${script}\n  </head>`);
}

export function applyDocument(shell: string, spec: RouteDocument): string {
  const path = normalizeRoutePath(spec.path);
  const canonical = canonicalUrl(path);
  const title = spec.title.replace(/\s+/g, " ").trim();
  const description = spec.description.replace(/\s+/g, " ").trim();
  const ogDescription = (spec.ogDescription ?? description).replace(/\s+/g, " ").trim();
  let html = shell.split("https://kidsmybook.com/og-default.svg").join(DEFAULT_OG.url);
  html = html.split("/og-default.svg").join(DEFAULT_OG_PATH);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = upsertMeta(html, "name", "description", description);
  html = upsertMeta(html, "property", "og:type", spec.ogType);
  html = upsertMeta(html, "property", "og:site_name", "Kidsmybook");
  html = upsertMeta(html, "property", "og:url", canonical);
  html = upsertMeta(html, "property", "og:title", title);
  html = upsertMeta(html, "property", "og:description", ogDescription);
  html = upsertMeta(html, "property", "og:image", spec.ogImage.url);
  html = upsertMeta(html, "property", "og:image:width", String(spec.ogImage.width));
  html = upsertMeta(html, "property", "og:image:height", String(spec.ogImage.height));
  html = upsertMeta(html, "property", "og:image:alt", spec.ogImage.alt);
  html = upsertMeta(html, "property", "og:locale", "zh_HK");
  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:title", title);
  html = upsertMeta(html, "name", "twitter:description", ogDescription);
  html = upsertMeta(html, "name", "twitter:image", spec.ogImage.url);

  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(html)) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonicalTag);
  } else {
    html = html.replace("</head>", `    ${canonicalTag}\n  </head>`);
  }

  // No separate language URLs exist. Drop any hreflang a previous template added.
  html = html.replace(/\n?\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi, "");

  const marker = markerComment(path);
  if (html.includes(`${ROUTE_MARKER}:`)) {
    html = html.replace(new RegExp(`<!--\\s*${ROUTE_MARKER}:[^>]*-->`), marker);
  } else {
    html = html.replace("<head>", `<head>\n    ${marker}`);
  }

  if (spec.mode === "home") {
    html = upsertScript(html, "kidsmybook-faq-ld", homeFaqJsonLd());
  } else {
    html = stripScript(html, "kidsmybook-home-ld");
    html = stripScript(html, "kidsmybook-faq-ld");
    if (spec.jsonLd) {
      html = upsertScript(html, spec.jsonLdId || "kidsmybook-page-ld", spec.jsonLd);
    }
  }

  if (spec.snapshotHtml) {
    const next = html.replace(
      /<div id="root">\s*<\/div>/,
      `<div id="root">\n${spec.snapshotHtml}\n    </div>`,
    );
    if (next === html) throw new Error(`prerender: #root placeholder missing for ${path}`);
    html = next;
  }

  return html;
}
