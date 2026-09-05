import { useEffect, useMemo, useState } from "react";
import { useLocale } from "./i18n/LocaleContext";
import type { Translations } from "./i18n/translations";

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
];

const APP_BASE = import.meta.env.BASE_URL;
function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";

async function loadPostBody(slug: string): Promise<string> {
  try {
    const mod = await import(/* @vite-ignore */ `../blog/${slug}.md?raw`);
    return mod.default as string;
  } catch {
    return "_文章內容暫時未能載入。_";
  }
}

/* strip the front-matter (--- ... ---) and render as plain paragraphs */
function renderMarkdown(md: string): string[] {
  const withoutFm = md.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFm
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function BlogIndexPage() {
  const { t } = useLocale();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("想了解 Kidsmybook 兒童出版計劃")}`;
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main>
      <section className="panel">
        <span className="section-kicker">Kidsmybook 博客</span>
        <h2>香港升學・子女教育・真人真事出版</h2>
        <p className="meta">
          大陸家長嚟港嘅升學觀察，同埋「一本書點樣變成子女升學亮點」嘅真實經驗。
        </p>
        <div className="service-grid">
          {sorted.map((p) => (
            <a key={p.slug} className="service-card link-card" href={appHref(`/blog/${p.slug}`)}>
              <div className="service-card-body">
                <h4>{p.title}</h4>
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
  const { t } = useLocale();
  const [body, setBody] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const meta = POSTS.find((p) => p.slug === slug);
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("想了解 Kidsmybook 兒童出版計劃")}`;

  useEffect(() => {
    let alive = true;
    loadPostBody(slug).then((txt) => {
      if (alive) {
        setBody(txt);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  const blocks = useMemo(() => (loaded ? renderMarkdown(body) : []), [loaded, body]);

  return (
    <main>
      <article className="panel blog-post">
        <a className="btn ghost" href={appHref("/blog")}>
          ← 返博客
        </a>
        {meta && (
          <header className="blog-post__head">
            <h2>{meta.title}</h2>
            <p className="meta">
              {meta.date} · 約 {meta.readMin} 分鐘閱讀
            </p>
          </header>
        )}
        <div className="blog-post__body">
          {blocks.map((b, i) => (
            <p key={i}>{b}</p>
          ))}
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

export { BlogIndexPage, BlogPostPage, POSTS };
