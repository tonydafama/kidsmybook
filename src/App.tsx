import { useEffect, useMemo, useState } from "react";
import { AiBookCreatorPanel } from "./AiBookCreatorPage";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useLocale } from "./i18n/LocaleContext";
import { BlogIndexPage, BlogPostPage, POSTS } from "./BlogPages";
import {
  SERVICE_CARD_ART,
  SERVICE_ICONS,
  SERVICE_SLUGS,
  type ServiceSlug,
  type Translations,
} from "./i18n/translations";

type ServiceItem = {
  slug: ServiceSlug;
  title: string;
  icon: string;
  desc: string;
  price: string;
  detail: string;
  audience: string[];
  process: string[];
  cardArt: string;
};

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";
const APP_BASE = import.meta.env.BASE_URL;

function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const SERVICE_CARD_ART_CACHE = "calm-v2";
const FEATURED_ART_CACHE = "hilary-v1";
const HERO_FEATURED_SRC = "featured/hilary-launch.png";

function serviceCardImgSrc(cardArt: string): string {
  return publicAssetSrc(cardArt, SERVICE_CARD_ART_CACHE);
}

function publicAssetSrc(assetPath: string, cache = SERVICE_CARD_ART_CACHE): string {
  const href = appHref(assetPath);
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}cb=${cache}`;
}

function buildServiceItems(t: Translations): ServiceItem[] {
  return SERVICE_SLUGS.map((slug) => {
    const copy = t.services.items[slug];
    return {
      slug,
      title: copy.title,
      icon: SERVICE_ICONS[slug],
      desc: copy.desc,
      price: copy.price,
      detail: copy.detail,
      audience: copy.audience,
      process: copy.process,
      cardArt: SERVICE_CARD_ART[slug],
    };
  });
}

function JourneyPathSection() {
  const { t } = useLocale();
  return (
    <section className="panel journey-path-panel" aria-labelledby="journey-path-heading">
      <div className="journey-path-head">
        <div>
          <span className="section-kicker">{t.journey.kicker}</span>
          <h3 id="journey-path-heading">{t.journey.title}</h3>
        </div>
        <p>{t.journey.intro}</p>
      </div>
      <ol className="journey-track">
        {t.journey.steps.map((step, index) => (
          <li key={step.en}>
            <span className="journey-track__num">{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <em>{step.en}</em>
            <p>{step.desc}</p>
            <small>
              {t.journey.deliverablePrefix}
              {step.deliverable}
            </small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function HomePage({ services }: { services: ServiceItem[] }) {
  const { t } = useLocale();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.home)}`;

  return (
    <>
      <header className="hero hero--premium">
        <div className="hero-aurora" aria-hidden />
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.brandTitle}</h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="cta-row hero-cta-row">
            <a className="btn primary" href={appHref("/#ai-book-lab")}>
              {t.hero.generateCover}
            </a>
            <a className="btn ghost" href={whatsapp} target="_blank" rel="noreferrer">
              {t.hero.bookConsult}
            </a>
          </div>
        </div>
        <div className="hero-visual hero-visual--glass">
          <div className="hero-visual-shine" aria-hidden />
          <div className="hero-showcase-img">
            <img
              src={publicAssetSrc(HERO_FEATURED_SRC, FEATURED_ART_CACHE)}
              alt={t.hero.featuredAlt}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="hero-badge">{t.hero.badge}</div>
          <p className="hero-stat-line">{t.hero.statLine}</p>
        </div>
      </header>

      <main className="content-flow">
        <AiBookCreatorPanel showBackLink={false} />

        <section className="panel panel--standard" id="services">
          <div className="section-head">
            <span className="section-kicker">{t.services.kicker}</span>
            <h3>{t.services.title}</h3>
          </div>
          <p className="services-intro">{t.services.intro}</p>
          <div className="service-grid">
            {services.map((item) => (
              <article key={item.slug} className="service-card">
                <div className="service-card-visual" aria-hidden>
                  <img src={serviceCardImgSrc(item.cardArt)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="service-card-body">
                  <p className="icon">{item.icon}</p>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel featured-case featured-case--split" id="case-studies">
          <div className="featured-case__copy">
            <div className="section-head">
              <span className="section-kicker">{t.caseSection.kicker}</span>
              <h3>{t.caseSection.title}</h3>
            </div>
            <p>{t.caseSection.body}</p>
            <p className="hero-stat-line">{t.caseSection.statLine}</p>
          </div>
          <div className="case-proof-grid case-proof-grid--hilary">
            <figure className="case-proof-tile">
              <img
                src={publicAssetSrc(HERO_FEATURED_SRC, FEATURED_ART_CACHE)}
                alt={t.caseSection.proofLabel}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{t.caseSection.proofLabel}</figcaption>
            </figure>
          </div>
        </section>

        <JourneyPathSection />

        <section className="panel panel--standard voices-panel" aria-labelledby="voices-heading">
          <div className="voices-head">
            <span className="section-kicker">{t.voices.kicker}</span>
            <h3 id="voices-heading">{t.voices.title}</h3>
            <p className="voices-intro">{t.voices.intro}</p>
          </div>
          <div className="voices-board">
            {t.voices.items.map((item, index) => (
              <figure key={item.cite} className={`voice-note voice-note--${index}`}>
                <span className="voice-note__mark" aria-hidden>
                  “
                </span>
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption>
                  <span className="voice-note__avatar" aria-hidden>
                    {item.initial}
                  </span>
                  <span className="voice-note__meta">
                    <cite>{item.cite}</cite>
                    <span className="voice-note__tag">{item.tag}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="panel final-cta">
          <h3>{t.finalCta.title}</h3>
          <p className="final-cta-copy">{t.finalCta.copy}</p>
          <div className="cta-row">
            <a className="btn primary" href={appHref("/#ai-book-lab")}>
              {t.finalCta.generateCover}
            </a>
            <a className="btn ghost" href={whatsapp} target="_blank" rel="noreferrer">
              {t.nav.whatsapp}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

function ServicesIndexPage({ services }: { services: ServiceItem[] }) {
  const { t } = useLocale();
  return (
    <main>
      <section className="panel">
        <h2>{t.services.kicker}</h2>
        <p className="meta">{t.services.indexMeta}</p>
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
  const { t } = useLocale();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.service(item.title))}`;
  return (
    <main>
      <section className="panel">
        <p className="eyebrow">{t.services.detailEyebrow}</p>
        <h2>{item.title}</h2>
        <p className="lead">{item.desc}</p>
        <p>{item.detail}</p>
        <p className="price">{item.price}</p>
        <h3>{t.services.suitableFor}</h3>
        <ul className="privacy-list">
          {item.audience.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
        <h3>{t.services.process}</h3>
        <ol className="journey-list">
          {item.process.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ol>
        <div className="cta-row">
          <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
          <a className="btn ghost" href={appHref("/services")}>
            {t.services.backToServices}
          </a>
        </div>
      </section>
    </main>
  );
}

function CaseStudyPage() {
  const { t } = useLocale();
  const [privacyMode, setPrivacyMode] = useState(false);
  const childName = privacyMode ? t.caseStudy.privacyName : t.caseStudy.realName;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.caseStudy)}`;
  return (
    <main>
      <section className="panel">
        <p className="eyebrow">Case Study</p>
        <h2>
          {childName}｜{t.caseStudy.bookTitle}
        </h2>
        <p className="meta">{t.caseStudy.meta}</p>
        <div className="cta-row">
          <button type="button" className="btn ghost" onClick={() => setPrivacyMode((old) => !old)}>
            {privacyMode ? t.caseStudy.showName : t.caseStudy.hideName}
          </button>
        </div>
      </section>

      <section className="panel">
        <h3>{t.caseStudy.overview}</h3>
        <ul className="privacy-list">
          <li>{t.caseStudy.topic}</li>
          <li>{t.caseStudy.servicesUsed}</li>
          <li>{t.caseStudy.format}</li>
        </ul>
      </section>

      <section className="panel">
        <h3>{t.caseStudy.storyTitle}</h3>
        <p>{t.caseStudy.storyP1}</p>
        <p>{t.caseStudy.storyP2}</p>
      </section>

      <section className="panel">
        <h3>{t.caseStudy.gallery}</h3>
        <div className="media-wall">
          {t.caseStudy.galleryItems.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>{t.caseStudy.results}</h3>
        <ul className="privacy-list">
          {t.caseStudy.resultItems.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      </section>

      <section className="panel final-cta">
        <h3>{t.caseStudy.ctaTitle}</h3>
        <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
          {t.nav.whatsapp}
        </a>
      </section>
    </main>
  );
}

function CaseStudiesIndex() {
  const { t } = useLocale();
  return (
    <main>
      <section className="panel">
        <h2>{t.caseIndex.title}</h2>
        <div className="service-grid">
          <a className="service-card link-card" href={appHref("/case-studies/xu-duo-butterfly-guide")}>
            <h4>{t.caseIndex.xuDuoTitle}</h4>
            <p>{t.caseIndex.xuDuoDesc}</p>
          </a>
          <article className="service-card">
            <h4>{t.caseIndex.futureTitle}</h4>
            <p>{t.caseIndex.futureDesc}</p>
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
  const { t } = useLocale();
  const pathname = usePathname();
  const serviceItems = useMemo(() => buildServiceItems(t), [t]);
  const currentService = serviceItems.find((item) => pathname === `/services/${item.slug}`);
  const whatsappFloating = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.floating)}`;
  const knownPaths = [
    "/",
    "/ai-book",
    "/services",
    "/blog",
    "/case-studies",
    "/case-studies/xu-duo-butterfly-guide",
    ...serviceItems.map((item) => `/services/${item.slug}`),
    ...POSTS.map((item) => `/blog/${item.slug}`),
  ];

  useEffect(() => {
    const seoMap: Record<string, { title: string; description: string }> = {
      "/": { title: t.seo.homeTitle, description: t.seo.homeDesc },
      "/services": { title: t.seo.servicesTitle, description: t.seo.servicesDesc },
      "/case-studies": { title: t.seo.caseStudiesTitle, description: t.seo.caseStudiesDesc },
      "/blog": { title: "Kidsmybook 博客｜香港升學與子女教育", description: "大陸家長嚟港升學觀察，同埋一本書點樣變成子女升學亮點嘅真實經驗。" },
      ...POSTS.reduce((acc, item) => { acc[`/blog/${item.slug}`] = { title: item.title, description: item.excerpt }; return acc; }, {} as Record<string, { title: string; description: string }>),
    };
    for (const item of serviceItems) {
      seoMap[`/services/${item.slug}`] = {
        title: t.seo.serviceDetailTitle(item.title),
        description: t.seo.serviceDetailDesc(item.desc, item.detail),
      };
    }
    const fallback = { title: "Kidsmybook", description: t.brandEn };
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
  }, [pathname, t, serviceItems]);

  useEffect(() => {
    if (pathname !== "/ai-book") return;
    window.history.replaceState(null, "", appHref("/#ai-book-lab"));
    const scrollToLab = () => document.getElementById("ai-book-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToLab();
    const timer = window.setTimeout(scrollToLab, 120);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const isHome = pathname === "/" || pathname === "/ai-book";

  return (
    <div className="site">
      <nav className="top-nav" aria-label={t.nav.main}>
        <a className="brand" href={appHref("/")}>
          <span className="brand-mark" aria-hidden />
          kidsmybook.com
        </a>
        <div className="nav-links">
          <LanguageSwitcher />
          <a href={appHref("/#ai-book-lab")}>{t.nav.aiBook}</a>
          <a href={appHref("/#services")}>{t.nav.services}</a>
          <a href={appHref("/blog")}>博客</a>
          <a href={appHref("/#case-studies")}>{t.nav.caseStudies}</a>
          <a href={whatsappFloating} target="_blank" rel="noreferrer">
            {t.nav.whatsapp}
          </a>
        </div>
      </nav>

      {isHome && <HomePage services={serviceItems} />}
      {pathname === "/services" && <ServicesIndexPage services={serviceItems} />}
      {currentService && <ServiceDetailPage item={currentService} />}
      {pathname === "/case-studies" && <CaseStudiesIndex />}
      {pathname === "/case-studies/xu-duo-butterfly-guide" && <CaseStudyPage />}
      {pathname === "/blog" && <BlogIndexPage />}
      {pathname.startsWith("/blog/") && <BlogPostPage slug={pathname.slice("/blog/".length)} />}
      {!knownPaths.includes(pathname) && (
        <main>
          <section className="panel">
            <h2>{t.notFound.title}</h2>
            <p>{t.notFound.body(pathname)}</p>
            <a className="btn ghost" href={appHref("/")}>
              {t.notFound.backHome}
            </a>
          </section>
        </main>
      )}

      <a className="floating-wa" href={whatsappFloating} target="_blank" rel="noreferrer" aria-label={t.nav.whatsapp}>
        {t.nav.whatsapp}
      </a>
    </div>
  );
}
