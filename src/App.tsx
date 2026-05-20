import { useEffect, useState } from "react";
import { AiBookCreatorPanel } from "./AiBookCreatorPage";

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

type JourneyStep = {
  title: string;
  en: string;
  desc: string;
  deliverable: string;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    title: "發現興趣",
    en: "Discover",
    desc: "深度訪談與觀察，鎖定孩子真正願意投入的題材。",
    deliverable: "興趣地圖 · 出版可行性",
  },
  {
    title: "規劃項目",
    en: "Plan",
    desc: "以 PBL 思維設計里程碑，讓熱愛變成可執行的全案。",
    deliverable: "項目藍圖 · 時程與目標",
  },
  {
    title: "創作內容",
    en: "Create",
    desc: "內容共創與專業編輯並行，保留孩子聲音與個性。",
    deliverable: "文稿 · 訪談 · 素材庫",
  },
  {
    title: "設計出版",
    en: "Publish",
    desc: "高訂裝幀與版面敘事，把作品提升到正式出版物級別。",
    deliverable: "成書 · ISBN · 作者身份",
  },
  {
    title: "發布展覽",
    en: "Launch",
    desc: "發布會與展覽策展，讓成就被親友、學校與社群親眼看見。",
    deliverable: "發布禮 · 展覽 · 現場紀錄",
  },
  {
    title: "媒體傳播",
    en: "Amplify",
    desc: "媒體報導與數位傳播，建立可被引用的公信力與影響力。",
    deliverable: "報導 · 剪報 · 作品集",
  },
];

function JourneyPathSection() {
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "你好，我想了解 MyBook 從興趣到出版的完整成就路徑，請安排私人諮詢。"
  )}`;

  return (
    <section className="panel journey-path-panel" aria-labelledby="journey-path-heading">
      <div className="journey-path-aurora" aria-hidden />
      <div className="section-head">
        <span className="section-kicker">Achievement Pathway</span>
        <h3 id="journey-path-heading">The Journey</h3>
      </div>
      <p className="journey-path-lede">
        六個階段，把孩子的熱愛鍊成<strong>可出版、可展出、可報導、可升學引用</strong>的完整成就鏈——不是單一本書，而是一套能被世界看見的證據。
      </p>

      <div className="journey-path-track" role="list">
        {JOURNEY_STEPS.map((step, index) => (
          <article key={step.title} className="journey-step" role="listitem">
            <div className="journey-step__rail" aria-hidden>
              {index < JOURNEY_STEPS.length - 1 ? <span className="journey-step__connector" /> : null}
            </div>
            <div className="journey-step__node" aria-hidden>
              <span className="journey-step__num">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="journey-step__body">
              <p className="journey-step__en">{step.en}</p>
              <h4 className="journey-step__title">{step.title}</h4>
              <p className="journey-step__desc">{step.desc}</p>
              <p className="journey-step__deliverable">
                <span className="journey-step__deliverable-label">交付</span>
                {step.deliverable}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="journey-path-footer">
        <p className="journey-path-outcome">
          成果可同步沉澱為升學 portfolio、媒體剪報與展覽紀錄——讓每一次努力都有「被看見」的證明。
        </p>
        <a className="btn ghost journey-path-cta" href={whatsapp} target="_blank" rel="noreferrer">
          了解完整路徑 · WhatsApp 諮詢
        </a>
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
            <a className="btn primary" href={appHref("/#ai-book-lab")}>
              生成孩子專屬封面
            </a>
            <a className="btn ghost" href={whatsapp} target="_blank" rel="noreferrer">
              預約私人諮詢
            </a>
            <a className="btn ghost" href={appHref("/#services")}>
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
        <AiBookCreatorPanel showBackLink={false} />

        <section className="panel panel--standard" id="services">
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

        <section className="panel featured-case" id="case-studies">
          <div className="section-head">
            <span className="section-kicker">Spotlight</span>
            <h3>Featured Case Study</h3>
          </div>
          <h4>徐多《蝴蝶雙語圖鑑》</h4>
          <p>8 歲 · 歷時 1 年 · 新書發布會 · 媒體報導 · 3,569 人次線上觀看</p>
          <p>由興趣觀察到正式出版，並延伸展覽與媒體報導，形成可用於升學展示的完整成果鏈。</p>
          <a className="btn ghost" href={whatsapp} target="_blank" rel="noreferrer">
            WhatsApp 了解此案例
          </a>
        </section>

        <JourneyPathSection />

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

function getLogicalPathname(): string {
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
}

function usePathname() {
  const [pathname, setPathname] = useState(getLogicalPathname);
  useEffect(() => {
    const sync = () => setPathname(getLogicalPathname());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return pathname;
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

  useEffect(() => {
    if (pathname !== "/ai-book") return;
    window.history.replaceState(null, "", appHref("/#ai-book-lab"));
    const scrollToLab = () => document.getElementById("ai-book-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToLab();
    const t = window.setTimeout(scrollToLab, 120);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const isHome = pathname === "/" || pathname === "/ai-book";

  return (
    <div className="site">
      <nav className="top-nav" aria-label="主選單">
        <a className="brand" href={appHref("/")}>
          <span className="brand-mark" aria-hidden />
          MyBook Achievement Studio
        </a>
        <div className="nav-links">
          <a href={appHref("/#ai-book-lab")}>AI Book</a>
          <a href={appHref("/#services")}>Services</a>
          <a href={appHref("/#case-studies")}>Case Studies</a>
          <a href={whatsappFloating} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          </div>
      </nav>

      {isHome && <HomePage />}
      {pathname === "/services" && <ServicesIndexPage />}
      {currentService && <ServiceDetailPage item={currentService} />}
      {pathname === "/case-studies" && <CaseStudiesIndex />}
      {pathname === "/case-studies/xu-duo-butterfly-guide" && <CaseStudyPage />}
      {!["/", "/ai-book", "/services", "/case-studies", "/case-studies/xu-duo-butterfly-guide", ...serviceItems.map((item) => `/services/${item.slug}`)].includes(
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
