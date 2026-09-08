import { useEffect, useMemo, type ReactNode } from "react";
import { useLocale } from "./i18n/LocaleContext";

export const SITE_ORIGIN = "https://kidsmybook.com";

/* ------------------------------------------------------------------ */
/* Blog post manifest — add a new entry per post. md files live in /blog */
/* ------------------------------------------------------------------ */
interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  readMin: number;
}

const POSTS: PostMeta[] = [
  {
    slug: "hk-international-school-book-mainland-parents",
    title: "大陸家長點樣用一本書幫子女入香港國際學校？",
    excerpt: "從深圳過關送仔女返學嘅家長視角，講香港升學履歷點樣靠一本真人真事改編嘅書突圍。",
    date: "2026-09-05",
    readMin: 4,
  },
  {
    slug: "gtp-family-child-book-portfolio",
    title: "高才通家庭嘅子女教育：一本書點解比十張證書更有說服力",
    excerpt: "高才通來港家庭點樣幫子女建立升學履歷——將興趣變成有教授參與、可引用嘅出版成果。",
    date: "2026-09-05",
    readMin: 4,
  },
  {
    slug: "talent-admission-book-advantage",
    title: "高才通子女點樣用一本書建立香港升學優勢？",
    excerpt: "高才通家庭嚟港後，發現競爭唔係靠報多幾個班，而係靠子女有冇自己嘅故事。",
    date: "2026-09-06",
    readMin: 4,
  },
  {
    slug: "gaocaitong-yisheng-xue-you-shi",
    title: "高才通子女點樣用一本書建立香港升學優勢",
    excerpt: "從深圳過關嘅高才通家長視角，講點樣用一本真正屬於小朋友嘅書，幫佢喺升學面試突圍。",
    date: "2026-09-02",
    readMin: 4,
  },
  {
    slug: "xing-qu-bian-chu-ban",
    title: "小朋友嘅興趣點樣變成一本正式出版嘅書",
    excerpt: "昆蟲、繪畫、觀星——呢啲「無用」嘅興趣，點樣經導師同教授整理成可上架嘅出版成果。",
    date: "2026-09-04",
    readMin: 4,
  },
  {
    slug: "zheng-shu-pi-juan",
    title: "為何證書堆砌嘅履歷會令面試官疲倦",
    excerpt: "大家都係奥數、游泳、弦樂，面試官睇到第三個已經眼定。點樣用一本書突圍？",
    date: "2026-09-06",
    readMin: 4,
  },
  {
    slug: "jiao-shou-chu-ban-shuo-fu-li",
    title: "大學教授參與出版對升學嘅說服力",
    excerpt: "一本有教授背書、真人真事改編嘅書，點樣比十張課外活動證書更有說服力。",
    date: "2026-09-08",
    readMin: 4,
  },
  {
    slug: "san-lian-shang-jia-yi-yi",
    title: "實體書店上架（三聯/商務/中華）對家長嘅意義",
    excerpt: "一本書唔係印嚟送人，而係擺得落書店平台搜得到——呢點對子女升學履歷意味住咩。",
    date: "2026-09-10",
    readMin: 4,
  },
  {
    slug: "portfolio-book-4-skills",
    title: "點解一本書會係子女升學履歷最強嘅一張牌？",
    excerpt: "高才通家長每日幫子女報十個班、攞十張證書，但面試官記唔住。一本由小朋友自己參與、教授跟住做嘅書，反而令佢被記住。",
    date: "2026-09-12",
    readMin: 5,
  },
  {
    slug: "gaocaitong-mom-burnout",
    title: "高才通媽媽嘅 burnout：我幫子女報嘅班，究竟為咗佢定係為咗我？",
    excerpt: "過來人視角。高才通家庭嚟港，家長最容易跌落嘅陷阱，係將自己嘅焦慮變成子女嘅課表。一本書，反而幫我同個女搵返屬於佢自己嘅節奏。",
    date: "2026-09-14",
    readMin: 5,
  },
  {
    slug: "school-ranking-myth",
    title: "第一梯隊、第二梯隊：排名以外，學校其實想睇咩？",
    excerpt: "家長成日講「第一梯隊第二梯隊」，但面試嗰陣，老師想見嘅唔係你子女攞過幾多獎，而係佢係一個點樣嘅人。一本書，係最難造假嘅答案。",
    date: "2026-09-16",
    readMin: 5,
  },
];

const APP_BASE = import.meta.env.BASE_URL;
function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";

const BLOG_MODULES = import.meta.glob("../blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function localeFileExt(locale: string): string {
  if (locale === "zh-Hans" || locale === "zhHans") return ".hans";
  if (locale === "en") return ".en";
  return "";
}

function loadPostRaw(slug: string, locale: string): string {
  const ext = localeFileExt(locale);
  const candidates = [`../blog/${slug}${ext}.md`, `../blog/${slug}.md`];
  for (const c of candidates) {
    const body = BLOG_MODULES[c];
    if (body) return body;
  }
  return "";
}

function parseFrontMatter(md: string): { title: string; description: string; date: string; body: string } {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: "", description: "", date: "", body: md };
  const fm = match[1];
  const body = match[2];
  const pick = (key: string) => {
    const re = new RegExp(`^${key}:\\s*"(.*)"\\s*$`, "m");
    const m = fm.match(re);
    if (m) return m[1].replace(/\\"/g, '"');
    const bare = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
    return bare?.[1]?.replace(/^["']|["']$/g, "") ?? "";
  };
  return { title: pick("title"), description: pick("description"), date: pick("date"), body };
}

function getLocalizedPostMeta(slug: string, locale: string): Pick<PostMeta, "title" | "excerpt"> {
  const fallback = POSTS.find((p) => p.slug === slug);
  const raw = loadPostRaw(slug, locale);
  if (!raw) {
    return { title: fallback?.title ?? slug, excerpt: fallback?.excerpt ?? "" };
  }
  const { title, description } = parseFrontMatter(raw);
  return {
    title: title || fallback?.title || slug,
    excerpt: description || fallback?.excerpt || "",
  };
}

function inlineFormat(text: string): ReactNode {
  // light markdown: **bold**, *italic*, `code`
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    else parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

type MdBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "ul"; items: string[] };

function parseMarkdownBlocks(md: string): MdBlock[] {
  const withoutFm = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const chunks = withoutFm
    .split(/\n{2,}/)
    .map((b) => b.trim())
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
          .map((l) => l.replace(/^>\s?/, ""))
          .join(" ")
          .trim(),
      });
      continue;
    }
    if (/^[-*]\s+/m.test(chunk) && chunk.split("\n").every((l) => !l.trim() || /^[-*]\s+/.test(l.trim()))) {
      out.push({
        kind: "ul",
        items: chunk
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => l.replace(/^[-*]\s+/, "")),
      });
      continue;
    }
    // strip wrapping single italics used as CTA footer
    const plain = chunk.replace(/^\*([\s\S]+)\*$/, "$1").trim();
    out.push({ kind: "p", text: plain });
  }
  return out;
}

function upsertJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const el = (existing as HTMLScriptElement | null) ?? document.createElement("script");
  el.type = "application/ld+json";
  el.id = id;
  el.text = JSON.stringify(data);
  if (!existing) document.head.appendChild(el);
}

function BlogIndexPage() {
  const { t, locale } = useLocale();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("想了解 Kidsmybook 兒童出版計劃")}`;
  const sorted = useMemo(() => {
    return [...POSTS]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((p) => {
        const loc = getLocalizedPostMeta(p.slug, locale);
        return { ...p, title: loc.title, excerpt: loc.excerpt };
      });
  }, [locale]);

  useEffect(() => {
    upsertJsonLd("kidsmybook-blog-index-ld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Kidsmybook Blog — Hong Kong school admissions & child publishing",
      url: `${SITE_ORIGIN}/blog`,
      isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
      about: [
        "Hong Kong school admissions",
        "Top Talent Pass / Quality Migrant families",
        "Children's achievement publishing",
      ],
      mainEntity: {
        "@type": "ItemList",
        itemListElement: sorted.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_ORIGIN}/blog/${p.slug}`,
          name: p.title,
        })),
      },
    });
    return () => upsertJsonLd("kidsmybook-blog-index-ld", null);
  }, [sorted]);

  return (
    <main>
      <section className="panel">
        <span className="section-kicker">{t.blog.kicker}</span>
        <h1>香港升學・子女教育・真人真事出版</h1>
        <p className="meta">
          大陸家長嚟港嘅升學觀察，同埋「一本書點樣變成子女升學亮點」嘅真實經驗。
        </p>
        <div className="service-grid">
          {sorted.map((p) => (
            <a key={p.slug} className="service-card link-card" href={appHref(`/blog/${p.slug}`)}>
              <div className="service-card-body">
                <h2 className="blog-card-title">{p.title}</h2>
                <p>{p.excerpt}</p>
                <p className="price">
                  {p.date} · 約 {p.readMin} 分鐘
                </p>
              </div>
            </a>
          ))}
        </div>
        <div className="cta-row">
          <a className="btn ghost" href={whatsapp} target="_blank" rel="noreferrer">
            {t.nav.whatsapp}
          </a>
        </div>
      </section>
    </main>
  );
}

function BlogPostPage({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const meta = POSTS.find((p) => p.slug === slug);
  const localized = useMemo(() => getLocalizedPostMeta(slug, locale), [slug, locale]);
  const blocks = useMemo(() => {
    const raw = loadPostRaw(slug, locale);
    if (!raw) return [] as MdBlock[];
    return parseMarkdownBlocks(raw);
  }, [slug, locale]);
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("想了解 Kidsmybook 兒童出版計劃")}`;
  const pageUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const inLanguage = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";

  useEffect(() => {
    if (!meta) {
      upsertJsonLd("kidsmybook-blog-post-ld", null);
      return;
    }
    upsertJsonLd("kidsmybook-blog-post-ld", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: localized.title,
      description: localized.excerpt,
      datePublished: meta.date,
      dateModified: meta.date,
      inLanguage,
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      author: {
        "@type": "Organization",
        name: "Kidsmybook",
        url: SITE_ORIGIN,
      },
      publisher: {
        "@type": "Organization",
        name: "Kidsmybook",
        url: SITE_ORIGIN,
      },
      about: [
        "Hong Kong school admissions",
        "Child achievement publishing",
        "Top Talent Pass families",
      ],
      isPartOf: {
        "@type": "Blog",
        name: "Kidsmybook Blog",
        url: `${SITE_ORIGIN}/blog`,
      },
    });
    return () => upsertJsonLd("kidsmybook-blog-post-ld", null);
  }, [meta, localized.title, localized.excerpt, pageUrl, inLanguage]);

  return (
    <main>
      <article className="panel blog-post" itemScope itemType="https://schema.org/BlogPosting">
        <a className="btn ghost" href={appHref("/blog")}>
          {t.blog.backToBlog}
        </a>
        {meta && (
          <header className="blog-post__head">
            <h1 itemProp="headline">{localized.title}</h1>
            <p className="meta">
              <time dateTime={meta.date} itemProp="datePublished">
                {meta.date}
              </time>
              {" · "}約 {meta.readMin} 分鐘閱讀
            </p>
          </header>
        )}
        <div className="blog-post__body" itemProp="articleBody">
          {blocks.length === 0 && <p>_文章內容暫時未能載入。_</p>}
          {blocks.map((b, i) => {
            if (b.kind === "h2") return <h2 key={i}>{inlineFormat(b.text)}</h2>;
            if (b.kind === "h3") return <h3 key={i}>{inlineFormat(b.text)}</h3>;
            if (b.kind === "quote") return <blockquote key={i}>{inlineFormat(b.text)}</blockquote>;
            if (b.kind === "ul")
              return (
                <ul key={i}>
                  {b.items.map((item, j) => (
                    <li key={j}>{inlineFormat(item)}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{inlineFormat(b.text)}</p>;
          })}
        </div>
        <div className="social-share">
          <span className="social-share-label">Share:</span>
          <a href={`https://wa.me/?text=${encodeURIComponent(localized.title + " " + pageUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-wa">WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-fb">Facebook</a>
          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(localized.title)}`} target="_blank" rel="noreferrer" className="share-btn share-in">LinkedIn</a>
        </div>
        <div className="cta-row">
          <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
        </div>
      </article>
    </main>
  );
}

export { BlogIndexPage, BlogPostPage, POSTS, getLocalizedPostMeta };
