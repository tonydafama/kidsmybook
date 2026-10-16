/**
 * Write one HTML file per known route into dist/, using the Vite shell.
 * Cloudflare Worker serves these files for every visitor (not only crawler UAs).
 *
 * Run after `vite build`: node --experimental-strip-types scripts/prerender-routes.ts
 */
import fs from "node:fs";
import path from "node:path";
import {
  SITE_ORIGIN,
  applyDocument,
  canonicalUrl,
  escapeHtml,
  ogImageForPath,
  HOME_FAQ,
} from "../src/seo/meta.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const SHELL_PATH = path.join(DIST, "index.html");

const PRICE_LEAK = /HK\$?\s*3,?800|HKD\s*3,?800|priceRange":\s*"HKD 3800|Entry packages start from HKD/i;

type MdBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "ul"; items: string[] };

type ServiceCopy = {
  slug: string;
  title: string;
  desc: string;
  detail: string;
  audience: string[];
  process: string[];
};

const SERVICES: ServiceCopy[] = [
  {
    slug: "author-programme",
    title: "Author Programme",
    desc: "由興趣出發，1 對 1 指導完成正式出版成果。",
    detail: "包含出版指導、雙語支援、線上音頻整合與 ISBN 出版選項。",
    audience: ["孩子有明確興趣主題", "家庭希望建立長期成果", "需要雙語學習輸出"],
    process: ["Discovery 訪談", "內容創作引導", "編輯與設計", "成書與交付"],
  },
  {
    slug: "book-launch",
    title: "Book Launch Event",
    desc: "為孩子作品打造有儀式感的新書發布會。",
    detail: "涵蓋場地策劃、流程設計、嘉賓邀請、現場佈置與攝影紀錄。",
    audience: ["孩子準備公開發表作品", "家庭重視儀式感與社交影響", "需要完整活動執行"],
    process: ["活動定位", "流程與嘉賓規劃", "現場執行", "活動後回顧素材交付"],
  },
  {
    slug: "exhibition",
    title: "Exhibition",
    desc: "讓創作被看見，從作品到空間完整呈現。",
    detail: "支援攝影展/插畫展、展板設計、場地協調與開幕活動規劃。",
    audience: ["孩子有系列作品", "希望成果被更多人看見", "需要展覽型履歷亮點"],
    process: ["展覽主題策展", "展板與空間設計", "場地協調", "開幕與導覽"],
  },
  {
    slug: "media-pr",
    title: "Media & PR",
    desc: "把孩子故事轉化成可被報導的內容。",
    detail: "包括新聞稿、媒體邀請、報導協調與線上傳播策略。",
    audience: ["希望建立外部公信力", "需要媒體曝光", "準備學校/升學作品敘事"],
    process: ["媒體角度定位", "新聞稿與素材包", "媒體邀請溝通", "報導追蹤整理"],
  },
  {
    slug: "live-streaming",
    title: "Live Streaming",
    desc: "活動當日即時直播與線上互動，擴大影響力。",
    detail: "提供直播導播、即時分享、互動監看與永久記錄素材。",
    audience: ["有外地親友需要線上參與", "重視活動擴散", "需要可重播紀錄"],
    process: ["直播規劃", "現場導播", "線上互動監看", "回放與剪輯交付"],
  },
  {
    slug: "portfolio-package",
    title: "Portfolio Package",
    desc: "把完整成果整理成升學可用的作品集。",
    detail: "整合出版、活動、媒體素材，支援多格式輸出。",
    audience: ["有升學申請需求", "需要完整成就證據", "希望統一對外展示素材"],
    process: ["素材整合", "敘事與版面編排", "多格式輸出", "申請版本微調"],
  },
];

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseFrontMatter(md: string): { title: string; description: string; date: string; body: string } {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: "", description: "", date: "", body: md };
  const fm = match[1];
  const body = match[2];
  const pick = (key: string) => {
    const quoted = fm.match(new RegExp(`^${key}:\\s*"(.*)"\\s*$`, "m"));
    if (quoted) return quoted[1].replace(/\\"/g, '"');
    const bare = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
    return bare?.[1]?.replace(/^["']|["']$/g, "") ?? "";
  };
  return { title: pick("title"), description: pick("description"), date: pick("date"), body };
}

function parseMarkdownBlocks(md: string): MdBlock[] {
  const withoutFm = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const chunks = withoutFm
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const out: MdBlock[] = [];
  for (const chunk of chunks) {
    if (/^###\s+/.test(chunk)) {
      out.push({ kind: "h3", text: chunk.replace(/^###\s+/, "").trim() });
      continue;
    }
    if (/^##\s+/.test(chunk)) {
      out.push({ kind: "h2", text: chunk.replace(/^##\s+/, "").trim() });
      continue;
    }
    if (/^>\s?/.test(chunk)) {
      out.push({
        kind: "quote",
        text: chunk
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join(" ")
          .trim(),
      });
      continue;
    }
    if (/^[-*]\s+/m.test(chunk) && chunk.split("\n").every((line) => !line.trim() || /^[-*]\s+/.test(line.trim()))) {
      out.push({
        kind: "ul",
        items: chunk
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.replace(/^[-*]\s+/, "")),
      });
      continue;
    }
    out.push({ kind: "p", text: chunk.replace(/^\*([\s\S]+)\*$/, "$1").trim() });
  }
  return out;
}

function blocksToHtml(blocks: MdBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "h2") return `      <h2>${inline(block.text)}</h2>`;
      if (block.kind === "h3") return `      <h3>${inline(block.text)}</h3>`;
      if (block.kind === "quote") return `      <blockquote>${inline(block.text)}</blockquote>`;
      if (block.kind === "ul") {
        const items = block.items.map((item) => `        <li>${inline(item)}</li>`).join("\n");
        return `      <ul>\n${items}\n      </ul>`;
      }
      return `      <p>${inline(block.text)}</p>`;
    })
    .join("\n");
}

function questionFaqs(blocks: MdBlock[]): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const heading = blocks[i];
    if (heading.kind !== "h2" || !/[?？]/.test(heading.text)) continue;
    const next = blocks[i + 1];
    if (!next || (next.kind !== "p" && next.kind !== "quote")) continue;
    faqs.push({ q: heading.text, a: next.text });
  }
  return faqs;
}

function navHtml(): string {
  return `      <nav>
        <a href="${SITE_ORIGIN}/">首頁</a>
        <a href="${SITE_ORIGIN}/services">服務</a>
        <a href="${SITE_ORIGIN}/blog">文章</a>
        <a href="${SITE_ORIGIN}/case-studies">個案</a>
      </nav>`;
}

function pageWrap(inner: string): string {
  return `      <main>\n${inner}\n${navHtml()}\n      </main>`;
}

function orgRef() {
  return { "@type": "Organization", name: "Kidsmybook", url: SITE_ORIGIN };
}

function assertCopy(source: string, label: string, text: string) {
  if (!source.includes(text)) {
    throw new Error(`prerender copy drift (${label}): missing ${text.slice(0, 48)}`);
  }
}

function loadBlogPosts(): RouteDocument[] {
  const blogDir = path.join(ROOT, "blog");
  const files = fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".md") && !name.endsWith(".en.md") && !name.endsWith(".hans.md"));
  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const fm = parseFrontMatter(raw);
    const headline = fm.title || slug;
    const description = fm.description || headline;
    const date = fm.date || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`blog ${slug} is missing a YYYY-MM-DD date in front matter`);
    }
    const blocks = parseMarkdownBlocks(raw);
    const faqs = questionFaqs(blocks);
    const routePath = `/blog/${slug}`;
    const url = canonicalUrl(routePath);
    const og = ogImageForPath(routePath);
    const posting = {
      "@type": ["BlogPosting", "Article"],
      headline,
      description,
      datePublished: date,
      dateModified: date,
      inLanguage: "zh-Hant",
      mainEntityOfPage: url,
      url,
      image: og.url,
      author: orgRef(),
      publisher: orgRef(),
      isPartOf: { "@type": "Blog", name: "Kidsmybook", url: `${SITE_ORIGIN}/blog` },
    };
    const jsonLd = faqs.length
      ? {
          "@context": "https://schema.org",
          "@graph": [
            posting,
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ],
        }
      : { "@context": "https://schema.org", ...posting };

    const title = headline.includes("Kidsmybook") ? headline : `${headline} | Kidsmybook`;
    return {
      path: routePath,
      title,
      description,
      ogType: "article",
      ogImage: { ...og, alt: headline },
      mode: "page",
      jsonLdId: "kidsmybook-blog-post-ld",
      jsonLd,
      snapshotHtml: pageWrap(
        `        <article>\n          <h1>${inline(headline)}</h1>\n          <p><time datetime="${date}">${date}</time></p>\n${blocksToHtml(blocks)}\n        </article>`,
      ),
    };
  });
}

function serviceRoutes(): RouteDocument[] {
  const index: RouteDocument = {
    path: "/services",
    title: "Services｜Kidsmybook 6 大兒童成就服務",
    description: "Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
    ogType: "website",
    ogImage: ogImageForPath("/services"),
    mode: "page",
    jsonLdId: "kidsmybook-services-ld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Kidsmybook 服務",
      description: "六項合成一條全案，亦可單項諮詢。私人報價。",
      url: canonicalUrl("/services"),
      isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: SERVICES.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: canonicalUrl(`/services/${item.slug}`),
          name: item.title,
        })),
      },
    },
    snapshotHtml: pageWrap(
      `        <h1>服務</h1>\n        <p>六項合成一條全案，亦可單項諮詢。私人報價。</p>\n        <ul>\n${SERVICES.map(
        (item) =>
          `          <li><a href="${canonicalUrl(`/services/${item.slug}`)}">${escapeHtml(item.title)}</a> — ${escapeHtml(item.desc)}</li>`,
      ).join("\n")}\n        </ul>`,
    ),
  };

  const details = SERVICES.map((item): RouteDocument => {
    const routePath = `/services/${item.slug}`;
    const description = `${item.desc} ${item.detail}`;
    return {
      path: routePath,
      title: `${item.title}｜Kidsmybook Services`,
      description,
      ogType: "website",
      ogImage: { ...ogImageForPath(routePath), alt: item.title },
      mode: "page",
      jsonLdId: "kidsmybook-service-ld",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: item.title,
        serviceType: item.title,
        description,
        url: canonicalUrl(routePath),
        provider: orgRef(),
        areaServed: "Hong Kong",
      },
      snapshotHtml: pageWrap(
        `        <h1>${escapeHtml(item.title)}</h1>\n        <p>${escapeHtml(item.desc)}</p>\n        <p>${escapeHtml(item.detail)}</p>\n        <p>私人報價。WhatsApp +852 9121 4157。</p>`,
      ),
    };
  });

  return [index, ...details];
}

function staticRoutes(posts: RouteDocument[]): RouteDocument[] {
  const blogIndex: RouteDocument = {
    path: "/blog",
    title: "香港升學・子女教育・真人真事出版｜Kidsmybook",
    description: "大陸家長嚟港嘅升學觀察，同埋「一本書點樣變成子女升學亮點」嘅真實經驗。",
    ogType: "website",
    ogImage: ogImageForPath("/blog"),
    mode: "page",
    jsonLdId: "kidsmybook-blog-index-ld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "香港升學・子女教育・真人真事出版",
      description: "大陸家長嚟港嘅升學觀察，同埋「一本書點樣變成子女升學亮點」嘅真實經驗。",
      url: canonicalUrl("/blog"),
      isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: posts.map((post, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: canonicalUrl(post.path),
          name: post.title.replace(/ \| Kidsmybook$/, ""),
        })),
      },
    },
    snapshotHtml: pageWrap(
      `        <h1>香港升學・子女教育・真人真事出版</h1>\n        <p>大陸家長嚟港嘅升學觀察，同埋「一本書點樣變成子女升學亮點」嘅真實經驗。</p>\n        <ul>\n${posts
        .map((post) => `          <li><a href="${canonicalUrl(post.path)}">${escapeHtml(post.title)}</a></li>`)
        .join("\n")}\n        </ul>`,
    ),
  };

  const caseIndex: RouteDocument = {
    path: "/case-studies",
    title: "Case Studies｜Kidsmybook 兒童案例",
    description: "查看兒童成就出版與活動案例，了解從興趣到被世界看見的完整旅程。",
    ogType: "website",
    ogImage: ogImageForPath("/case-studies"),
    mode: "page",
    jsonLdId: "kidsmybook-case-index-ld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Kidsmybook 個案",
      url: canonicalUrl("/case-studies"),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Hilary《蝴蝶雙語圖鑑》",
            url: canonicalUrl("/case-studies/hilary-butterfly-guide"),
          },
        ],
      },
    },
    snapshotHtml: pageWrap(
      `        <h1>個案</h1>\n        <p>查看兒童成就出版與活動案例，了解從興趣到被世界看見的完整旅程。</p>\n        <p><a href="${canonicalUrl("/case-studies/hilary-butterfly-guide")}">Hilary《蝴蝶雙語圖鑑》</a></p>`,
    ),
  };

  const hilary: RouteDocument = {
    path: "/case-studies/hilary-butterfly-guide",
    title: "Hilary蝴蝶圖鑑案例｜Kidsmybook",
    description: "8 歲孩子從興趣出發完成雙語出版，並延伸發布會、展覽與媒體曝光。",
    ogType: "article",
    ogImage: ogImageForPath("/case-studies/hilary-butterfly-guide"),
    mode: "page",
    jsonLdId: "kidsmybook-case-study-ld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hilary《蝴蝶雙語圖鑑》",
      description: "8 歲孩子從興趣出發完成雙語出版，並延伸發布會、展覽與媒體曝光。",
      image: ogImageForPath("/case-studies/hilary-butterfly-guide").url,
      mainEntityOfPage: canonicalUrl("/case-studies/hilary-butterfly-guide"),
      url: canonicalUrl("/case-studies/hilary-butterfly-guide"),
      author: orgRef(),
      publisher: orgRef(),
    },
    snapshotHtml: pageWrap(
      `        <article>\n          <h1>Hilary《蝴蝶雙語圖鑑》</h1>\n          <p>Age at publication: 8 · Duration: 1 year</p>\n          <p>孩子由日常觀察蝴蝶出發，逐步建立研究習慣，完成圖像與文字內容，最終成功出版並公開發表。</p>\n          <p>過程中克服了資料整理與口語表達挑戰，學會用作品向世界分享自己的興趣與成長。</p>\n        </article>`,
    ),
  };

  const home: RouteDocument = {
    path: "/",
    title: "Kidsmybook｜兒童成就出版",
    description:
      "Hong Kong child-achievement publishing studio. A 12-month mentored programme that turns a child's real interest into a formally published ISBN book with university professors — then launch, exhibition, media, and an admissions-ready portfolio.",
    ogDescription:
      "12-month child achievement publishing in Hong Kong — ISBN book, professor review, bookstore listing, admissions portfolio.",
    ogType: "website",
    ogImage: ogImageForPath("/"),
    mode: "home",
  };

  return [home, blogIndex, caseIndex, hilary];
}

function outputFile(routePath: string): string {
  if (routePath === "/") return path.join(DIST, "index.html");
  return path.join(DIST, routePath.slice(1), "index.html");
}

function assertDocument(html: string, route: RouteDocument) {
  const canonical = canonicalUrl(route.path);
  if (!html.includes(`<title>${escapeHtml(route.title)}</title>`)) {
    throw new Error(`${route.path} title missing`);
  }
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
    throw new Error(`${route.path} canonical missing: ${canonical}`);
  }
  if (!html.includes(`property="og:url" content="${canonical}"`)) {
    throw new Error(`${route.path} og:url missing`);
  }
  if (!html.includes('property="og:image" content="')) {
    throw new Error(`${route.path} og:image missing`);
  }
  if (html.includes("og-default.svg")) throw new Error(`${route.path} still points at og-default.svg`);
  if (html.includes("hreflang=")) throw new Error(`${route.path} has hreflang without a real alternate URL`);
  if (PRICE_LEAK.test(html)) throw new Error(`${route.path} leaked a public price`);
  if (route.path === "/") {
    if (!html.includes('"@type": "Organization"') && !html.includes('"@type":"Organization"')) {
      throw new Error("homepage missing Organization");
    }
    if (!html.includes('"@type": "Course"') && !html.includes('"@type":"Course"')) {
      throw new Error("homepage missing Course");
    }
    if (!html.includes("FAQPage")) throw new Error("homepage missing FAQPage");
    for (const item of HOME_FAQ) {
      if (!html.includes(item.q)) throw new Error(`homepage FAQ missing question: ${item.q}`);
    }
  }
  if (route.path.startsWith("/blog/") && route.path !== "/blog") {
    if (!html.includes("BlogPosting") || !html.includes('"@type": "Article"') && !html.includes('"Article"')) {
      throw new Error(`${route.path} missing Article/BlogPosting`);
    }
    if (!html.includes("datePublished")) throw new Error(`${route.path} missing datePublished`);
  }
  if (route.mode === "page" && html.includes('"@type": "Course"')) {
    throw new Error(`${route.path} still includes the homepage Course schema`);
  }
}

function assertSources(posts: RouteDocument[]) {
  const translations = fs.readFileSync(path.join(ROOT, "src/i18n/translations.ts"), "utf8");
  for (const item of HOME_FAQ) {
    assertCopy(translations, "faq", item.q);
    assertCopy(translations, "faq", item.a);
  }
  for (const service of SERVICES) {
    assertCopy(translations, service.slug, service.desc);
    assertCopy(translations, service.slug, service.detail);
  }
  assertCopy(translations, "hilary", "孩子由日常觀察蝴蝶出發，逐步建立研究習慣，完成圖像與文字內容，最終成功出版並公開發表。");
  assertCopy(translations, "services-title", "Services｜Kidsmybook 6 大兒童成就服務");
  assertCopy(translations, "blog-index", "香港升學・子女教育・真人真事出版");

  const blogSrc = fs.readFileSync(path.join(ROOT, "src/BlogPages.tsx"), "utf8");
  const manifest = [...blogSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  const prerendered = posts.map((post) => post.path.replace("/blog/", "")).sort();
  const expected = [...manifest].sort();
  if (prerendered.join("\n") !== expected.join("\n")) {
    throw new Error(`blog manifest and markdown files differ\nmanifest: ${expected.join(",")}\nfiles: ${prerendered.join(",")}`);
  }

  const robots = fs.readFileSync(path.join(ROOT, "public/robots.txt"), "utf8");
  const sitemapLines = robots.match(/^Sitemap:/gm) || [];
  if (sitemapLines.length !== 1 || !robots.includes("Sitemap: https://kidsmybook.com/sitemap.xml")) {
    throw new Error("robots.txt must list only https://kidsmybook.com/sitemap.xml");
  }
  if (robots.includes("www.kidsmybook.com/sitemap.xml")) throw new Error("robots.txt still lists the www sitemap");
  for (const blocked of ["/admin", "/intake", "/intake-form", "/api/"]) {
    if (!robots.includes(`Disallow: ${blocked}`)) throw new Error(`robots.txt missing Disallow ${blocked}`);
  }
  if (!robots.includes("User-agent: GPTBot") || !robots.includes("User-agent: Google-Extended")) {
    throw new Error("robots.txt missing an AI crawler allow");
  }

  const sitemap = fs.readFileSync(path.join(ROOT, "public/sitemap.xml"), "utf8");
  const worker = fs.readFileSync(path.join(ROOT, "worker/index.ts"), "utf8");
  for (const slug of manifest) {
    const loc = `${SITE_ORIGIN}/blog/${slug}`;
    if (!sitemap.includes(loc) || !worker.includes(loc)) {
      throw new Error(`sitemap missing ${loc}`);
    }
  }
}

function main() {
  if (!fs.existsSync(SHELL_PATH)) {
    throw new Error("dist/index.html missing — run vite build first");
  }
  const shell = fs.readFileSync(SHELL_PATH, "utf8");
  if (!shell.includes('<div id="root"></div>')) {
    throw new Error("dist/index.html has no empty #root — prerender expects the Vite shell");
  }
  const posts = loadBlogPosts();
  assertSources(posts);
  const routes = [...staticRoutes(posts), ...serviceRoutes(), ...posts];
  const seen = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.path)) throw new Error(`duplicate route ${route.path}`);
    seen.add(route.path);
    const html = applyDocument(shell, route);
    assertDocument(html, route);
    const file = outputFile(route.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }

  const sample = fs.readFileSync(path.join(DIST, "blog/xing-qu-bian-chu-ban/index.html"), "utf8");
  const title = sample.match(/<title>([^<]*)<\/title>/)?.[1];
  const canonical = sample.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `${SITE_ORIGIN}/blog/xing-qu-bian-chu-ban`) {
    throw new Error(`sample canonical was ${canonical}`);
  }
  if (!title || title.startsWith("Kidsmybook｜兒童成就出版<") || title === "Kidsmybook｜兒童成就出版") {
    throw new Error(`sample title was not unique: ${title}`);
  }
  console.log(`prerendered ${routes.length} routes`);
  console.log(`sample title: ${title}`);
  console.log(`sample canonical: ${canonical}`);
}

main();
