import { useEffect, useMemo, useState } from "react";
import { AiBookCreatorPanel } from "./AiBookCreatorPage";
import { AboutPage, ChecklistPage, FaqPage, GaocaiHubPage, HomeExplore, PortfolioHubPage, ProgrammePage, ShengxiaoHubPage, ShengzhongHubPage, ShudianHubPage, XingquHubPage } from "./LandingPages";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useLocale } from "./i18n/LocaleContext";
import { getCoverEnquiry, postPreviewLead, subscribeCoverEnquiry, type CoverEnquiry } from "./lib/coverEnquiry";
import { pageWhatsappText } from "./lib/whatsappIntent";
import { BlogIndexPage, BlogPostPage, POSTS, SITE_ORIGIN, getLocalizedPostMeta, upsertJsonLd } from "./BlogPages";
import { ogImageForPath } from "./seo/meta";
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

  useEffect(() => {
    upsertJsonLd("kidsmybook-faq-ld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_ORIGIN}/#faq`,
      mainEntity: t.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    return () => upsertJsonLd("kidsmybook-faq-ld", null);
  }, [t.faq.items]);

  return (
    <>
      <header className="hero hero--premium">
        <div className="hero-aurora" aria-hidden />
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.brandTitle}</h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="cta-row hero-cta-row">
            <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
              {t.hero.bookConsult}
            </a>
            <a className="btn ghost" href={appHref("/#ai-book-lab")}>
              {t.hero.generateCover}
            </a>
          </div>
          <p className="hero-secondary-links">
            <a href={appHref("/intake-form")} rel="noreferrer">
              {t.nav.intake ?? "升學諮詢"}
            </a>
          </p>
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

        <HomeExplore />

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
                  ?
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
            <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
              {t.hero.bookConsult}
            </a>
            <a className="btn ghost" href={appHref("/intake-form")} rel="noreferrer">
              {t.nav.intake ?? "升學諮詢表"}
            </a>
          </div>
        </section>

        <section className="panel panel--standard" id="faq" itemScope itemType="https://schema.org/FAQPage">
          <div className="section-head">
            <span className="section-kicker">{t.faq.kicker}</span>
            <h3>{t.faq.title}</h3>
          </div>
          <div className="faq-list">
            {t.faq.items.map((item) => (
              <details
                key={item.q}
                id={item.q.includes("申請 ISBN") || item.q.includes("申请 ISBN") || item.q.toLowerCase().includes("isbn registration") ? "isbn" : undefined}
                className="faq-item"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <summary className="faq-q" itemProp="name">{item.q}</summary>
                <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div itemProp="text">{item.a}</div>
                </div>
              </details>
            ))}
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
        <h1>{t.services.indexHeading}</h1>
        <p className="meta">{t.services.indexMeta}</p>
        <p>
          <a href={appHref("/programme")}>{t.nav.programme}</a>
          {" · "}
          <a href={appHref("/sheng-xue-zuo-pin-ji")}>{t.nav.portfolio}</a>
          {" · "}
          <a href={appHref("/faq")}>{t.nav.faq}</a>
        </p>
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
          {item.slug === "author-programme" && (
            <a className="btn ghost" href={appHref("/programme")}>
              {t.nav.programme}
            </a>
          )}
          {item.slug === "portfolio-package" && (
            <a className="btn ghost" href={appHref("/sheng-xue-zuo-pin-ji")}>
              {t.nav.portfolio}
            </a>
          )}
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

  useEffect(() => {
    upsertJsonLd("kidsmybook-case-study-ld", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t.seo.hilaryTitle,
      description: t.seo.hilaryDesc,
      image: ogImageForPath("/case-studies/hilary-butterfly-guide").url,
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
      mainEntityOfPage: `${SITE_ORIGIN}/case-studies/hilary-butterfly-guide`,
      about: [
        "Child achievement publishing",
        "Hong Kong school admissions portfolio",
        "Project-Based Learning",
      ],
    });
    return () => upsertJsonLd("kidsmybook-case-study-ld", null);
  }, [t.seo.hilaryTitle, t.seo.hilaryDesc]);

  return (
    <main>
      <section className="panel">
        <p className="eyebrow">Case Study</p>
        <h2>
          {childName} · {t.caseStudy.bookTitle}
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
        <p>{t.caseStudy.storyP3}</p>
      </section>

      <section className="panel">
        <h3>{t.caseStudy.gallery}</h3>
        <div className="case-proof-grid case-proof-grid--hilary">
          <figure className="case-proof-tile">
            <img
              src={publicAssetSrc(HERO_FEATURED_SRC, FEATURED_ART_CACHE)}
              alt={t.hero.featuredAlt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{t.hero.featuredAlt}</figcaption>
          </figure>
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
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.caseStudy)}`;
  return (
    <main>
      <section className="panel">
        <h1>{t.caseIndex.title}</h1>
        <p>{t.seo.caseStudiesDesc}</p>
        <div className="service-grid">
          <a className="service-card link-card" href={appHref("/case-studies/hilary-butterfly-guide")}>
            <h4>
              {t.caseStudy.realName} · {t.caseStudy.bookTitle}
            </h4>
            <p>{t.seo.hilaryDesc}</p>
          </a>
        </div>
        <div className="cta-row">
          <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
            {t.nav.whatsapp}
          </a>
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
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const [coverEnquiry, setCoverEnquiryState] = useState<CoverEnquiry | null>(() => getCoverEnquiry());
  useEffect(() => subscribeCoverEnquiry(() => setCoverEnquiryState(getCoverEnquiry())), []);
  const serviceItems = useMemo(() => buildServiceItems(t), [t]);
  const currentService = serviceItems.find((item) => pathname === `/services/${item.slug}`);
  const blogTitle = pathname.startsWith("/blog/")
    ? getLocalizedPostMeta(pathname.slice("/blog/".length), locale).title
    : "";
  const coverOnHome = pathname === "/" || pathname === "/ai-book" ? coverEnquiry : null;
  const floatingText = coverOnHome?.text || pageWhatsappText(pathname, t, blogTitle);
  const whatsappFloating = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(floatingText)}`;
  const trackFloatingEnquiry = () => {
    if (coverOnHome) postPreviewLead(coverOnHome, true);
  };
  const knownPaths = [
    "/",
    "/ai-book",
    "/services",
    "/blog",
    "/programme",
    "/faq",
    "/sheng-xue-zuo-pin-ji",
    "/sheng-xue-zuo-pin-ji-qing-dan",
    "/gao-cai-tong-sheng-xue-zuo-pin-ji",
    "/xing-qu-chu-ban",
    "/tong-shu-shu-dian-shang-jia",
    "/sheng-xiao-xue-mian-shi-zuo-pin-ji",
    "/sheng-zhong-dss-zuo-pin-ji",
    "/about",
    "/case-studies",
    "/case-studies/hilary-butterfly-guide",
    ...serviceItems.map((item) => `/services/${item.slug}`),
    ...POSTS.map((item) => `/blog/${item.slug}`),
  ];

  useEffect(() => {
    const seoMap: Record<string, { title: string; description: string }> = {
      "/": { title: t.seo.homeTitle, description: t.seo.homeDesc },
      "/programme": { title: t.programmePage.title, description: t.programmePage.description },
      "/faq": { title: t.faqPage.title, description: t.faqPage.description },
      "/sheng-xue-zuo-pin-ji": { title: t.portfolioPage.title, description: t.portfolioPage.description },
      "/sheng-xue-zuo-pin-ji-qing-dan": { title: t.checklistPage.title, description: t.checklistPage.description },
      "/gao-cai-tong-sheng-xue-zuo-pin-ji": { title: t.gaocaiPage.title, description: t.gaocaiPage.description },
      "/xing-qu-chu-ban": { title: t.xingquPage.title, description: t.xingquPage.description },
      "/tong-shu-shu-dian-shang-jia": { title: t.shudianPage.title, description: t.shudianPage.description },
      "/sheng-xiao-xue-mian-shi-zuo-pin-ji": { title: t.shengxiaoPage.title, description: t.shengxiaoPage.description },
      "/sheng-zhong-dss-zuo-pin-ji": { title: t.shengzhongPage.title, description: t.shengzhongPage.description },
      "/about": { title: t.aboutPage.title, description: t.aboutPage.description },
      "/services": { title: t.seo.servicesTitle, description: t.seo.servicesDesc },
      "/case-studies": { title: t.seo.caseStudiesTitle, description: t.seo.caseStudiesDesc },
      "/blog": {
        title: `${t.blog.indexTitle}｜Kidsmybook`,
        description: t.blog.indexDesc,
      },
      ...POSTS.reduce((acc, item) => {
        const loc = getLocalizedPostMeta(item.slug, locale);
        acc[`/blog/${item.slug}`] = { title: loc.title, description: loc.excerpt };
        return acc;
      }, {} as Record<string, { title: string; description: string }>),
    };
    for (const item of serviceItems) {
      seoMap[`/services/${item.slug}`] = {
        title: t.seo.serviceDetailTitle(item.title),
        description: t.seo.serviceDetailDesc(item.desc, item.detail),
      };
    }
    const fallback = { title: "Kidsmybook", description: t.brandEn };
    const meta = seoMap[pathname] || fallback;
    const canonical = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname}`;
    const ogType = pathname.startsWith("/blog/") || pathname.startsWith("/case-studies/") ? "article" : "website";
    const og = ogImageForPath(pathname);

    document.title = meta.title;

    const setNamed = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const setProp = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setNamed("description", meta.description);
    setNamed("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    setNamed("twitter:card", "summary_large_image");
    setNamed("twitter:title", meta.title);
    setNamed("twitter:description", meta.description);
    setProp("og:type", ogType);
    setProp("og:site_name", "Kidsmybook");
    setProp("og:locale", locale === "en" ? "en_HK" : locale === "zh-Hans" ? "zh_CN" : "zh_HK");
    setProp("og:url", canonical);
    setProp("og:title", meta.title);
    setProp("og:description", meta.description);
    setProp("og:image", og.url);
    setProp("og:image:width", String(og.width));
    setProp("og:image:height", String(og.height));
    setProp("og:image:alt", meta.title);
    setNamed("twitter:image", og.url);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname, t, locale, serviceItems]);

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
          <a href={appHref("/programme")}>{t.nav.programme}</a>
          <a href={appHref("/tong-shu-shu-dian-shang-jia")}>{t.shudianPage.crumb}</a>
          <a href={appHref("/sheng-xue-zuo-pin-ji")}>{t.nav.portfolio}</a>
          <a href={appHref("/faq")}>{t.nav.faq}</a>
          <a href={appHref("/#ai-book-lab")}>{t.nav.aiBook}</a>
          <a href={appHref("/services")}>{t.nav.services}</a>
          <a href={appHref("/blog")}>{t.nav.blog}</a>
          <a href={appHref("/case-studies")}>{t.nav.caseStudies}</a>
          <a href={appHref("/about")}>{t.nav.about}</a>
          <a href={appHref("/intake-form")} rel="noreferrer">
            {t.nav.intake ?? "升學諮詢"}
          </a>
          <a href={whatsappFloating} target="_blank" rel="noreferrer" onClick={trackFloatingEnquiry}>
            {t.nav.whatsapp}
          </a>
        </div>
      </nav>

      {isHome && <HomePage services={serviceItems} />}
      {pathname === "/programme" && <ProgrammePage />}
      {pathname === "/faq" && <FaqPage />}
      {pathname === "/sheng-xue-zuo-pin-ji" && <PortfolioHubPage />}
      {pathname === "/sheng-xue-zuo-pin-ji-qing-dan" && <ChecklistPage />}
      {pathname === "/gao-cai-tong-sheng-xue-zuo-pin-ji" && <GaocaiHubPage />}
      {pathname === "/xing-qu-chu-ban" && <XingquHubPage />}
      {pathname === "/tong-shu-shu-dian-shang-jia" && <ShudianHubPage />}
      {pathname === "/sheng-xiao-xue-mian-shi-zuo-pin-ji" && <ShengxiaoHubPage />}
      {pathname === "/sheng-zhong-dss-zuo-pin-ji" && <ShengzhongHubPage />}
      {pathname === "/services" && <ServicesIndexPage services={serviceItems} />}
      {currentService && <ServiceDetailPage item={currentService} />}
      {pathname === "/about" && <AboutPage />}
      {pathname === "/case-studies" && <CaseStudiesIndex />}
      {pathname === "/case-studies/hilary-butterfly-guide" && <CaseStudyPage />}
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

      <footer className="site-footer">
        <p>{t.footer.studio}</p>
        <p className="site-footer__links">
          <a href={appHref("/about")}>{t.footer.about}</a>
          <a href={appHref("/tong-shu-shu-dian-shang-jia")}>{t.shudianPage.crumb}</a>
          <a href={appHref("/sheng-xiao-xue-mian-shi-zuo-pin-ji")}>{t.shengxiaoPage.crumb}</a>
          <a href={appHref("/sheng-zhong-dss-zuo-pin-ji")}>{t.shengzhongPage.crumb}</a>
          <a href={appHref("/blog/mian-shi-ban-vs-isbn-chu-ban")}>
            {locale === "en" ? "Interview class vs ISBN" : locale === "zh-Hans" ? "面试班 vs ISBN" : "面試班 vs ISBN"}
          </a>
          <a href={whatsappFloating} target="_blank" rel="noreferrer" onClick={trackFloatingEnquiry}>
            WhatsApp +852 9121 4157
          </a>
          <a href="mailto:kidsmybook@outlook.com">kidsmybook@outlook.com</a>
        </p>
        <p>{t.footer.quote}</p>
        <p>{t.footer.privacy}</p>
      </footer>

      <a className="floating-wa" href={whatsappFloating} target="_blank" rel="noreferrer" aria-label={t.nav.whatsapp} onClick={trackFloatingEnquiry}>
        {t.nav.whatsapp}
      </a>
    </div>
  );
}
