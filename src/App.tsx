import { useEffect, useMemo, useState, type CSSProperties } from "react";

type CoverSet = {
  front: string;
  back: string;
  source: "Monica API" | "Demo Fallback";
};

type ServiceItem = {
  slug: string;
  title: string;
  icon: string;
  desc: string;
  price: string;
  detail: string;
  audience: string[];
  process: string[];
  /** Public URL path under `public/` (e.g. services/foo.png). */
  cardArt: string;
};

const API_URL = import.meta.env.VITE_MONICA_API_URL || "https://api.monica.im/v1/images/generate";
const API_KEY = import.meta.env.VITE_MONICA_API_KEY || "";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85200000000";
const WECHAT_ID = import.meta.env.VITE_WECHAT_ID || "mybook_service";

const BRAND_TITLE = "把孩子的熱愛，變成值得被世界看見的成就";
const BRAND_EN = "Turn your child's passion into a published achievement the world can see.";

const APP_BASE = import.meta.env.BASE_URL;

function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

/** Bumps when service card art files change so browsers/CDN fetch fresh images. */
const SERVICE_CARD_ART_CACHE = "calm-v2";

function serviceCardImgSrc(cardArt: string): string {
  const href = appHref(cardArt);
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}cb=${SERVICE_CARD_ART_CACHE}`;
}

const serviceItems: ServiceItem[] = [
  {
    slug: "author-programme",
    title: "Author Programme",
    icon: "Book",
    cardArt: "services/service-author-programme.png",
    desc: "由興趣出發，1 對 1 指導完成正式出版成果。",
    price: "From HKD XX,XXX",
    detail: "包含出版指導、雙語支援、線上音頻整合與 ISBN 出版選項。",
    audience: ["孩子有明確興趣主題", "家庭希望建立長期成果", "需要雙語學習輸出"],
    process: ["Discovery 訪談", "內容創作引導", "編輯與設計", "成書與交付"],
  },
  {
    slug: "book-launch",
    title: "Book Launch Event",
    icon: "Celebration",
    cardArt: "services/service-book-launch.png",
    desc: "為孩子作品打造有儀式感的新書發布會。",
    price: "From HKD XX,XXX",
    detail: "涵蓋場地策劃、流程設計、嘉賓邀請、現場佈置與攝影紀錄。",
    audience: ["孩子準備公開發表作品", "家庭重視儀式感與社交影響", "需要完整活動執行"],
    process: ["活動定位", "流程與嘉賓規劃", "現場執行", "活動後回顧素材交付"],
  },
  {
    slug: "exhibition",
    title: "Exhibition",
    icon: "Gallery",
    cardArt: "services/service-exhibition.png",
    desc: "讓創作被看見，從作品到空間完整呈現。",
    price: "From HKD XX,XXX",
    detail: "支援攝影展/插畫展、展板設計、場地協調與開幕活動規劃。",
    audience: ["孩子有系列作品", "希望成果被更多人看見", "需要展覽型履歷亮點"],
    process: ["展覽主題策展", "展板與空間設計", "場地協調", "開幕與導覽"],
  },
  {
    slug: "media-pr",
    title: "Media & PR",
    icon: "Newspaper",
    cardArt: "services/service-media-pr.png",
    desc: "把孩子故事轉化成可被報導的內容。",
    price: "Custom quote",
    detail: "包括新聞稿、媒體邀請、報導協調與線上傳播策略。",
    audience: ["希望建立外部公信力", "需要媒體曝光", "準備學校/升學作品敘事"],
    process: ["媒體角度定位", "新聞稿與素材包", "媒體邀請溝通", "報導追蹤整理"],
  },
  {
    slug: "live-streaming",
    title: "Live Streaming",
    icon: "Video",
    cardArt: "services/service-live-streaming.png",
    desc: "活動當日即時直播與線上互動，擴大影響力。",
    price: "From HKD X,XXX",
    detail: "提供直播導播、即時分享、互動監看與永久記錄素材。",
    audience: ["有外地親友需要線上參與", "重視活動擴散", "需要可重播紀錄"],
    process: ["直播規劃", "現場導播", "線上互動監看", "回放與剪輯交付"],
  },
  {
    slug: "portfolio-package",
    title: "Portfolio Package",
    icon: "Folder",
    cardArt: "services/service-portfolio-package.png",
    desc: "把完整成果整理成升學可用的作品集。",
    price: "From HKD X,XXX",
    detail: "整合出版、活動、媒體素材，支援多格式輸出。",
    audience: ["有升學申請需求", "需要完整成就證據", "希望統一對外展示素材"],
    process: ["素材整合", "敘事與版面編排", "多格式輸出", "申請版本微調"],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const svgCover = (title: string, subtitle: string, interest: string, dark = false) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${dark ? "#070a16" : "#fdf2f8"}"/>
        <stop offset="55%" stop-color="${dark ? "#4f46e5" : "#f59e0b"}"/>
        <stop offset="100%" stop-color="${dark ? "#8b5cf6" : "#db2777"}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#g)"/>
    <rect x="62" y="62" width="900" height="1412" rx="32" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.28)"/>
    <text x="120" y="208" fill="white" font-size="40" font-family="Arial" opacity="0.86">MYBOOK ACHIEVEMENT EDITION</text>
    <text x="120" y="842" fill="white" font-size="84" font-weight="700" font-family="Arial">${title}</text>
    <text x="120" y="922" fill="white" font-size="42" font-family="Arial" opacity="0.92">${subtitle}</text>
    <text x="120" y="1168" fill="white" font-size="36" font-family="Arial" opacity="0.84">主題：${interest}</text>
    <text x="120" y="1242" fill="white" font-size="30" font-family="Arial" opacity="0.76">Author Programme · Launch · Exhibition · PR</text>
  </svg>`)}`
};

const extractImageUrls = (payload: unknown): string[] => {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (!node) return;
    if (typeof node === "string" && /^https?:\/\//.test(node)) {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };
  walk(payload);
  return out;
};

function BookPreviewSection() {
  const [interest, setInterest] = useState("蝴蝶、生態觀察與自然攝影");
  const [tone, setTone] = useState("Quiet Luxury");
  const [lang, setLang] = useState("中英雙語");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState({ x: 7, y: -14 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [covers, setCovers] = useState<CoverSet>({
    front: svgCover("Passion in Print", "Hero Cover Preview", "蝴蝶圖鑑", true),
    back: svgCover("Achievement Story", "Back Cover Preview", "創作旅程", false),
    source: "Demo Fallback",
  });

  const generateCovers = async () => {
    setIsGenerating(true);
    setError("");
    const prompt = `Create premium child achievement book FRONT and BACK cover. Interest: ${interest}. Tone: ${tone}. Language: ${lang}. Elegant editorial style.`;
    try {
      if (!API_KEY) throw new Error("未設定 Monica API key，已使用 demo 封面。");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ prompt, image_size: "1024x1536", count: 2 }),
      });
      if (!response.ok) throw new Error(`Monica API 失敗：${response.status}`);
      const data = (await response.json()) as unknown;
      const urls = extractImageUrls(data);
      if (urls.length < 2) throw new Error("Monica API 回傳不足兩張封面。");
      setCovers({ front: urls[0], back: urls[1], source: "Monica API" });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "封面生成失敗";
      setError(message);
      setCovers({
        front: svgCover("Passion in Print", `${tone} Front`, interest, true),
        back: svgCover("Achievement Story", `${lang} Back`, interest, false),
        source: "Demo Fallback",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <section className="panel panel-showcase">
      <div className="showcase-heading">
        <p className="eyebrow">Immersive preview</p>
        <h3>3D 出版預覽工作室</h3>
        <p className="meta showcase-lede">拖曳即可 360 度檢視封面，採用穩定 CSS 3D，避免 WebGL 相容性問題。</p>
      </div>
      <div className="preview-layout">
        <div className="book-stage-wrap">
          <div className="book-stage">
            <div
              className="book"
              style={
                {
                  "--rx": `${rotation.x}deg`,
                  "--ry": `${rotation.y}deg`,
                  "--front": `url("${covers.front}")`,
                  "--back": `url("${covers.back}")`,
                } as CSSProperties
              }
              onPointerDown={(event) => {
                (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
                setDragging({ startX: event.clientX, startY: event.clientY, baseX: rotation.x, baseY: rotation.y });
              }}
              onPointerMove={(event) => {
                if (!dragging) return;
                const nextY = dragging.baseY + (event.clientX - dragging.startX) * 0.17;
                const nextX = clamp(dragging.baseX - (event.clientY - dragging.startY) * 0.12, -12, 16);
                setRotation({ x: nextX, y: nextY });
              }}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
            >
              <div className="book-face front" />
              <div className="book-face back" />
              <div className="book-core" />
              <div className="book-face spine" />
              <div className="book-face fore-edge" />
              <div className="book-shadow" />
            </div>
          </div>
        </div>
        <div className="generator-grid">
          <p className="generator-label">封面實驗室</p>
          <input value={interest} onChange={(event) => setInterest(event.target.value)} placeholder="孩子主題：例 蝴蝶、機械、歷史" />
          <select value={tone} onChange={(event) => setTone(event.target.value)}>
            <option>Quiet Luxury</option>
            <option>Editorial Premium</option>
            <option>Modern Global</option>
          </select>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            <option>中英雙語</option>
            <option>繁中</option>
            <option>English</option>
          </select>
          <button type="button" className="btn primary" onClick={generateCovers} disabled={isGenerating}>
            {isGenerating ? "生成中..." : "生成前後封"}
          </button>
          <p className="meta">來源：{covers.source}{error ? ` ｜ ${error}` : ""}</p>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const [wechatCopied, setWechatCopied] = useState(false);
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("你好，我想預約 MyBook 兒童成就出版私人諮詢。")}`;
  const services = serviceItems;

  return (
    <>
      <header className="hero hero--premium">
        <div className="hero-aurora" aria-hidden />
        <div className="hero-copy">
          <p className="eyebrow">Child Achievement Publishing · Exhibition · PR</p>
          <h1>{BRAND_TITLE}</h1>
          <p className="lead">出版 · 發布會 · 展覽 · 媒體報導 · 一站式全案服務</p>
          <p className="lead en">{BRAND_EN}</p>
          <div className="cta-row">
            <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
              預約私人諮詢
            </a>
            <a className="btn ghost" href={appHref("/services")}>
              查看服務
            </a>
            <button
              className="btn ghost"
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(WECHAT_ID);
                setWechatCopied(true);
                setTimeout(() => setWechatCopied(false), 1800);
              }}
            >
              {wechatCopied ? "已複製 WeChat" : "複製 WeChat"}
            </button>
          </div>
        </div>
        <div className="hero-visual hero-visual--glass">
          <div className="hero-visual-shine" aria-hidden />
          <div className="hero-badge">Featured · 徐多案例</div>
          <p className="hero-stat-line">8 歲 · 歷時 1 年 · 新書發布會 · 媒體報導 · 3,569 人次線上觀看</p>
          <p className="hero-stat-sub">高訂出版視覺 · 策展敘事 · 全鏈路成就展示</p>
        </div>
      </header>

      <main className="content-flow">
        <section className="panel panel--standard">
          <div className="section-head">
            <span className="section-kicker">Services</span>
            <h3>What We Do</h3>
          </div>
          <div className="service-grid">
            {services.map((item) => (
              <a key={item.slug} className="service-card link-card" href={appHref(`/services/${item.slug}`)}>
                <div className="service-card-visual" aria-hidden>
                  <img src={serviceCardImgSrc(item.cardArt)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="service-card-body">
                  <p className="icon">{item.icon}</p>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="panel featured-case">
          <div className="section-head">
            <span className="section-kicker">Spotlight</span>
            <h3>Featured Case Study</h3>
          </div>
          <h4>徐多《蝴蝶雙語圖鑑》</h4>
          <p>8 歲 · 歷時 1 年 · 新書發布會 · 媒體報導 · 3,569 人次線上觀看</p>
          <p>由興趣觀察到正式出版，並延伸展覽與媒體報導，形成可用於升學展示的完整成果鏈。</p>
          <a className="btn ghost" href={appHref("/case-studies/xu-duo-butterfly-guide")}>
            查看完整案例
          </a>
        </section>

        <section className="panel">
          <h3>The Journey</h3>
          <ol className="journey-list">
            <li>發現興趣</li>
            <li>規劃項目</li>
            <li>創作內容</li>
            <li>設計出版</li>
            <li>發布展覽</li>
            <li>媒體傳播</li>
          </ol>
        </section>

        <BookPreviewSection />

        <section className="panel panel--standard">
          <div className="section-head">
            <span className="section-kicker">Audience</span>
            <h3>For Whom</h3>
          </div>
          <ul className="privacy-list">
            <li>孩子有明確興趣或特長</li>
            <li>重視 PBL 項目制學習</li>
            <li>希望孩子成就被完整記錄</li>
            <li>有升學 portfolio 需求</li>
          </ul>
        </section>

        <section className="panel panel--standard">
          <div className="section-head">
            <span className="section-kicker">Voices</span>
            <h3>Testimonial</h3>
          </div>
          <div className="quote-list">
            <blockquote>「孩子第一次覺得自己真係有作品，仲願意主動向同學介紹。」— 徐多家長</blockquote>
            <blockquote>「唔只一本書，而係完整成就項目，發布會、媒體、作品集一次整合。」— 國際學校家長</blockquote>
          </div>
        </section>

        <section className="panel">
          <h3>Media Coverage</h3>
          <div className="media-wall">
            <span>深圳特區報</span>
            <span>南方+</span>
            <span>Regional Parenting Media</span>
          </div>
        </section>

        <section className="panel final-cta">
          <h3>開始你孩子的出版之旅</h3>
          <div className="cta-row">
            <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
              WhatsApp 聯繫
            </a>
            <a className="btn ghost" href={appHref("/services")}>
              查看 6 大服務
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

function ServicesIndexPage() {
  return (
    <main>
      <section className="panel">
        <h2>Services</h2>
        <p className="meta">Minimal · Elegant · Full-stack execution</p>
        <div className="service-grid">
          {serviceItems.map((item) => (
            <a key={item.slug} className="service-card link-card" href={appHref(`/services/${item.slug}`)}>
              <div className="service-card-visual" aria-hidden>
                <img src={serviceCardImgSrc(item.cardArt)} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="service-card-body">
                <p className="icon">{item.icon}</p>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <p className="price">{item.price}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function ServiceDetailPage({ item }: { item: ServiceItem }) {
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`你好，我想了解 ${item.title} 服務。`)}`;
  return (
    <main>
      <section className="panel">
        <p className="eyebrow">Service Detail</p>
        <h2>{item.title}</h2>
        <p className="lead">{item.desc}</p>
        <p>{item.detail}</p>
        <p className="price">{item.price}</p>
        <h3>適合對象</h3>
        <ul className="privacy-list">
          {item.audience.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
        <h3>服務流程</h3>
        <ol className="journey-list">
          {item.process.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ol>
        <div className="cta-row">
          <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
            預約諮詢
          </a>
          <a className="btn ghost" href={appHref("/services")}>
            返回 Services
          </a>
        </div>
      </section>
    </main>
  );
}

function CaseStudyPage() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const childName = privacyMode ? "小作者 X" : "徐多";
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Start your child's publishing journey")}`;
  return (
    <main>
      <section className="panel">
        <p className="eyebrow">Case Study</p>
        <h2>{childName}｜《蝴蝶雙語圖鑑》</h2>
        <p className="meta">Age at publication: 8 · Duration: 1 year</p>
        <div className="cta-row">
          <button type="button" className="btn ghost" onClick={() => setPrivacyMode((old) => !old)}>
            {privacyMode ? "顯示原名" : "隱私模式"}
          </button>
        </div>
      </section>

      <section className="panel">
        <h3>Project Overview</h3>
        <ul className="privacy-list">
          <li>Topic: 蝴蝶生態與雙語科普</li>
          <li>Services: 出版計劃 + 新書發布會 + 媒體公關 + 直播</li>
          <li>Format: 中英雙語圖鑑 + 活動紀錄素材</li>
        </ul>
      </section>

      <section className="panel">
        <h3>The Story</h3>
        <p>孩子由日常觀察蝴蝶出發，逐步建立研究習慣，完成圖像與文字內容，最終成功出版並公開發表。</p>
        <p>過程中克服了資料整理與口語表達挑戰，學會用作品向世界分享自己的興趣與成長。</p>
      </section>

      <section className="panel">
        <h3>Gallery</h3>
        <div className="media-wall">
          <span>Book Spreads</span>
          <span>Event Photos</span>
          <span>Exhibition Photos</span>
          <span>Media Coverage Screenshots</span>
        </div>
      </section>

      <section className="panel">
        <h3>Results</h3>
        <ul className="privacy-list">
          <li>Media mentions：深圳特區報、南方+（示例）</li>
          <li>Event attendance：現場家庭與嘉賓參與</li>
          <li>Online views：3,569+</li>
          <li>Parent testimonial：孩子更有自信，亦更主動分享成果</li>
        </ul>
      </section>

      <section className="panel final-cta">
        <h3>Start your child's publishing journey</h3>
        <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
          WhatsApp 諮詢
        </a>
      </section>
    </main>
  );
}

function CaseStudiesIndex() {
  return (
    <main>
      <section className="panel">
        <h2>Case Studies</h2>
        <div className="service-grid">
          <a className="service-card link-card" href={appHref("/case-studies/xu-duo-butterfly-guide")}>
            <h4>xu-duo-butterfly-guide</h4>
            <p>徐多蝴蝶圖鑑案例（可切換隱私模式）</p>
          </a>
          <article className="service-card">
            <h4>[future cases]</h4>
            <p>預留後續案例頁模板，沿用同一結構。</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function usePathname() {
  return useMemo(() => {
    const raw = window.location.pathname || "/";
    const baseNoSlash = APP_BASE.replace(/\/$/, "");
    let logical = raw;
    if (baseNoSlash && (raw === baseNoSlash || raw.startsWith(`${baseNoSlash}/`))) {
      logical = raw.slice(baseNoSlash.length) || "/";
    }
    if (logical === "/index.html") {
      logical = "/";
    }
    const normalized = logical.replace(/\/+$/, "");
    return normalized || "/";
  }, []);
}

export default function App() {
  const pathname = usePathname();
  const currentService = serviceItems.find((item) => pathname === `/services/${item.slug}`);
  const whatsappFloating = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like premium child achievement publishing details.")}`;
  useEffect(() => {
    const seoMap: Record<string, { title: string; description: string }> = {
      "/": {
        title: "MyBook｜兒童成就出版 + 展覽 + 公關全案服務",
        description: "把孩子的熱愛，變成值得被世界看見的成就。出版、發布會、展覽、媒體、直播與升學作品集一站式服務。",
      },
      "/services": {
        title: "Services｜MyBook 6 大兒童成就服務",
        description: "Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
      },
      "/case-studies": {
        title: "Case Studies｜MyBook 兒童案例",
        description: "查看兒童成就出版與活動案例，了解從興趣到被世界看見的完整旅程。",
      },
      "/case-studies/xu-duo-butterfly-guide": {
        title: "徐多蝴蝶圖鑑案例｜MyBook",
        description: "8 歲孩子從興趣出發完成雙語出版，並延伸發布會、展覽與媒體曝光。",
      },
    };
    for (const item of serviceItems) {
      seoMap[`/services/${item.slug}`] = {
        title: `${item.title}｜MyBook Services`,
        description: `${item.desc} ${item.detail}`,
      };
    }
    const fallback = { title: "MyBook", description: BRAND_EN };
    const meta = seoMap[pathname] || fallback;
    document.title = meta.title;
    const existing = document.querySelector('meta[name="description"]');
    if (existing) {
      existing.setAttribute("content", meta.description);
    } else {
      const tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      tag.setAttribute("content", meta.description);
      document.head.appendChild(tag);
    }
  }, [pathname]);

  return (
    <div className="site">
      <nav className="top-nav" aria-label="主選單">
        <a className="brand" href={appHref("/")}>
          <span className="brand-mark" aria-hidden />
          MyBook Achievement Studio
        </a>
        <div className="nav-links">
          <a href={appHref("/services")}>Services</a>
          <a href={appHref("/case-studies")}>Case Studies</a>
          <a href={whatsappFloating} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </nav>

      {pathname === "/" && <HomePage />}
      {pathname === "/services" && <ServicesIndexPage />}
      {currentService && <ServiceDetailPage item={currentService} />}
      {pathname === "/case-studies" && <CaseStudiesIndex />}
      {pathname === "/case-studies/xu-duo-butterfly-guide" && <CaseStudyPage />}
      {!["/", "/services", "/case-studies", "/case-studies/xu-duo-butterfly-guide", ...serviceItems.map((item) => `/services/${item.slug}`)].includes(
        pathname
      ) && (
        <main>
          <section className="panel">
            <h2>Page in Progress</h2>
            <p>你目前打開的是 `{pathname}`。此頁已保留，下一步可按同模板擴充內容。</p>
            <a className="btn ghost" href={appHref("/")}>
              返回首頁
            </a>
          </section>
        </main>
      )}

      <a className="floating-wa" href={whatsappFloating} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </div>
  );
}
