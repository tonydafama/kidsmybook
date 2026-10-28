import { useEffect } from "react";
import { getLocalizedPostMeta, upsertJsonLd, SITE_ORIGIN } from "./BlogPages";
import { LinkedText } from "./components/LinkedText";
import { useLocale } from "./i18n/LocaleContext";
import type { Locale } from "./i18n/locale";
import { STUDIO_EMAIL, whatsappHref as buildWhatsappHref } from "./lib/contact";
import { CHECKLIST_PATH, FAQ_READING_ZH, GAOCAI_PATH, PORTFOLIO_READING_ZH, READING_ZH, SHENGXIAO_PATH, SHENGZHONG_PATH, SHUDIAN_PATH, XINGQU_PATH, type HubCopy } from "./seo/landing-zh";
import { ORGANIZATION_SAME_AS, breadcrumbList, canonicalUrl, faqPageEntity } from "./seo/meta";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";
const APP_BASE = import.meta.env.BASE_URL;

function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

function whatsappHref(text: string): string {
  return buildWhatsappHref(text, WHATSAPP_NUMBER);
}

function homeLabelFor(locale: Locale): string {
  if (locale === "en") return "Home";
  if (locale === "zh-Hans") return "首页";
  return "首頁";
}

function localizedReading(links: { href: string; label: string }[], locale: Locale) {
  return links.map((link) => {
    const slug = link.href.startsWith("/blog/") ? link.href.slice("/blog/".length) : "";
    if (!slug || locale === "zh-Hant") return link;
    return { href: link.href, label: getLocalizedPostMeta(slug, locale).title };
  });
}

function faqAnchor(question: string): string | undefined {
  if (question.includes("申請 ISBN") || question.includes("申请 ISBN") || question.toLowerCase().includes("isbn registration")) {
    return "isbn";
  }
  return undefined;
}

function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="landing-crumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && <span aria-hidden> / </span>}
          {index === items.length - 1 ? <span>{item.label}</span> : <a href={item.href}>{item.label}</a>}
        </span>
      ))}
    </nav>
  );
}

function QuoteCta({
  title,
  body,
  whatsappLabel,
  whatsappText,
  ctaLocation,
}: {
  title: string;
  body: string;
  whatsappLabel: string;
  whatsappText?: string;
  ctaLocation?: string;
}) {
  const { t } = useLocale();
  return (
    <section className="panel final-cta">
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="cta-row">
        <a
          className="btn primary"
          href={whatsappHref(whatsappText || t.whatsapp.home)}
          target="_blank"
          rel="noreferrer"
          {...(ctaLocation ? { "data-cta-location": ctaLocation } : {})}
        >
          {whatsappLabel}
        </a>
        <a className="btn ghost" href={`mailto:${STUDIO_EMAIL}`}>
          {STUDIO_EMAIL}
        </a>
      </div>
    </section>
  );
}

function ReadingList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="privacy-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={appHref(link.href)}>{link.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProgrammePage() {
  const { t, locale } = useLocale();
  const page = t.programmePage;
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    upsertJsonLd("kidsmybook-page-ld", {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList([
          { name: homeLabel, path: "/" },
          { name: page.h1, path: "/programme" },
        ]),
        {
          "@type": "HowTo",
          name: page.phasesTitle,
          description: page.phasesIntro,
          totalTime: "P12M",
          step: page.phases.map((phase, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: phase.name,
            text: phase.text,
            url: `${canonicalUrl("/programme")}#phases`,
          })),
        },
      ],
    });
    return () => upsertJsonLd("kidsmybook-page-ld", null);
  }, [homeLabel, page]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            { href: appHref("/programme"), label: t.nav.programme },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <p>
          <a href={appHref(`${SHUDIAN_PATH}#path`)}>{page.shelfLink}</a>
        </p>
        <p>{page.notLabel}：{page.notBody}</p>
        <div className="cta-row">
          <a
            className="btn primary"
            href={whatsappHref(page.whatsappText)}
            target="_blank"
            rel="noreferrer"
            data-cta-location="programme_intro"
          >
            {page.whatsappLabel}
          </a>
          <a className="btn ghost" href={appHref("/faq")}>
            {t.nav.faq}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{page.whoTitle}</h2>
        <ul className="privacy-list">
          {page.whoItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel" id="phases">
        <h2>{page.phasesTitle}</h2>
        <p>{page.phasesIntro}</p>
        <ol className="journey-list">
          {page.phases.map((phase) => (
            <li key={phase.name}>
              <strong>{phase.name}</strong> — {phase.text}
            </li>
          ))}
        </ol>
      </section>

      <QuoteCta
        title={page.ctaTitle}
        body={page.ctaBody}
        whatsappLabel={page.whatsappLabel}
        whatsappText={page.whatsappText}
        ctaLocation="phases"
      />

      <section className="panel">
        <h2>{page.vsClassTitle}</h2>
        <p>{page.vsClass}</p>
        <h2>{page.vsDiyTitle}</h2>
        <p>{page.vsDiy}</p>
        <p>
          <a href={appHref("/blog/self-publishing-vs-mentored-publishing")}>
            {localizedReading([{ href: "/blog/self-publishing-vs-mentored-publishing", label: "自費出書 vs 導師制出版" }], locale)[0].label}
          </a>
        </p>
        <h2>{page.singleTitle}</h2>
        <p>{page.single}</p>
      </section>

      <section className="panel">
        <h2>{page.caseTitle}</h2>
        <p>{page.caseBody}</p>
        <p>
          <a href={appHref("/case-studies/hilary-butterfly-guide")}>{page.caseLink}</a>
        </p>
        <p>
          <a href={appHref("/admissions-portfolio")}>{page.portfolioLink}</a>
        </p>
        <p>
          <a href={appHref("/faq")}>{page.faqLink}</a>
        </p>
      </section>

      <ReadingList title={page.readingTitle} links={localizedReading(READING_ZH, locale)} />
      <QuoteCta
        title={page.ctaTitle}
        body={page.ctaBody}
        whatsappLabel={page.whatsappLabel}
        whatsappText={page.whatsappText}
        ctaLocation="programme_end"
      />
    </main>
  );
}

export function FaqPage() {
  const { t, locale } = useLocale();
  const page = t.faqPage;
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    upsertJsonLd("kidsmybook-faq-ld", {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList([
          { name: homeLabel, path: "/" },
          { name: page.h1, path: "/faq" },
        ]),
        faqPageEntity(t.faq.items, `${SITE_ORIGIN}/faq#faq`),
      ],
    });
    return () => upsertJsonLd("kidsmybook-faq-ld", null);
  }, [homeLabel, page.h1, t.faq.items]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            { href: appHref("/faq"), label: t.nav.faq },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <p>
          <a href={appHref("/programme")}>{page.programmeLink}</a>
          {" · "}
          <a href={appHref("/admissions-portfolio")}>{page.portfolioLink}</a>
        </p>
        <div className="cta-row">
          <a className="btn primary" href={whatsappHref(page.whatsappText)} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
        </div>
      </section>

      <section className="panel" id="faq" itemScope itemType="https://schema.org/FAQPage">
        <div className="faq-list">
          {t.faq.items.map((item) => {
            const anchor = faqAnchor(item.q);
            return (
              <details
                key={item.q}
                id={anchor}
                className="faq-item"
                open={Boolean(anchor)}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <summary className="faq-q" itemProp="name">
                  {item.q}
                </summary>
                <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div itemProp="text">
                    <LinkedText text={item.a} />
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <ReadingList title={page.readingTitle} links={localizedReading(FAQ_READING_ZH, locale)} />
      <QuoteCta title={page.ctaTitle} body={page.ctaBody} whatsappLabel={t.hero.bookConsult} whatsappText={page.whatsappText} />
    </main>
  );
}

function ChecklistLinkList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="privacy-list">
      {links.map((link) => (
        <li key={link.href}>
          <a href={appHref(link.href)}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}

export function ChecklistPage() {
  const { t, locale } = useLocale();
  const page = t.checklistPage;
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    upsertJsonLd("kidsmybook-page-ld", {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList([
          { name: homeLabel, path: "/" },
          { name: t.nav.portfolio, path: "/admissions-portfolio" },
          { name: page.h1, path: CHECKLIST_PATH },
        ]),
        {
          "@type": "WebPage",
          name: page.h1,
          description: page.description,
          url: canonicalUrl(CHECKLIST_PATH),
          inLanguage: locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant",
          isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
        },
        faqPageEntity(page.faqs, `${canonicalUrl(CHECKLIST_PATH)}#faq`),
      ],
    });
    return () => upsertJsonLd("kidsmybook-page-ld", null);
  }, [homeLabel, locale, page, t.nav.portfolio]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            { href: appHref("/admissions-portfolio"), label: t.nav.portfolio },
            { href: appHref(CHECKLIST_PATH), label: page.h1 },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <p>
          <strong>{page.softCta}</strong>
        </p>
        <div className="cta-row">
          <a className="btn primary btn-lg" href={whatsappHref(page.whatsappText)} target="_blank" rel="noreferrer">
            {page.whatsappLabel}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{page.docTitle}</h2>
        <p>{page.docIntro}</p>
        <ul className="privacy-list">
          {page.docs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>{page.appendixTitle}</h2>
        <p>{page.appendix}</p>
        <ChecklistLinkList links={page.appendixLinks} />
      </section>

      <section className="panel">
        <h2>{page.artTitle}</h2>
        <p>{page.art}</p>
        <ChecklistLinkList links={page.artLinks} />
      </section>

      <section className="panel">
        <h2>{page.rushTitle}</h2>
        <p>{page.rush}</p>
        <ChecklistLinkList links={page.rushLinks} />
        <h2>{page.stageTitle}</h2>
        <ChecklistLinkList links={page.stageLinks} />
        <p>
          <a href={appHref("/programme")}>{page.programmeLink}</a>
          {" · "}
          <a href={appHref("/admissions-portfolio")}>{t.nav.portfolio}</a>
        </p>
      </section>

      <section className="panel" id="faq" itemScope itemType="https://schema.org/FAQPage">
        <h2>{page.faqTitle}</h2>
        <div className="faq-list">
          {page.faqs.map((item) => (
            <details key={item.q} className="faq-item" open itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="faq-q" itemProp="name">
                {item.q}
              </summary>
              <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div itemProp="text">
                  <LinkedText text={item.a} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <QuoteCta title={page.softCta} body={page.lead} whatsappLabel={page.whatsappLabel} whatsappText={page.whatsappText} />
    </main>
  );
}

export function PortfolioHubPage() {
  const { t, locale } = useLocale();
  const page = t.portfolioPage;
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    upsertJsonLd("kidsmybook-page-ld", {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList([
          { name: homeLabel, path: "/" },
          { name: page.h1, path: "/admissions-portfolio" },
        ]),
        {
          "@type": "WebPage",
          name: page.h1,
          description: page.lead,
          url: canonicalUrl("/admissions-portfolio"),
          inLanguage: locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant",
          isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
          about: ["Hong Kong school admissions portfolio", "Child achievement publishing"],
        },
        faqPageEntity(page.faqs, `${canonicalUrl("/admissions-portfolio")}#faq`),
      ],
    });
    return () => upsertJsonLd("kidsmybook-page-ld", null);
  }, [homeLabel, locale, page]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            { href: appHref("/admissions-portfolio"), label: t.nav.portfolio },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <p>
          <a href={appHref(CHECKLIST_PATH)}>{t.checklistPage.hubLink}</a>
          {" · "}
          {t.checklistPage.softCta}
        </p>
        <div className="cta-row">
          <a className="btn primary" href={whatsappHref(page.whatsappText)} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
          <a className="btn ghost" href={appHref(CHECKLIST_PATH)}>
            {t.checklistPage.cardTitle}
          </a>
          <a className="btn ghost" href={appHref("/programme")}>
            {page.programmeLink}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{page.pointsTitle}</h2>
        <ul className="privacy-list">
          {page.points.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel" id="stages">
        <h2>{page.tracksTitle}</h2>
        <p>{page.tracksIntro}</p>
        {page.tracks.map((track) => (
          <div key={track.href}>
            <h3>{track.title}</h3>
            <p>{track.body}</p>
            <p>
              <a href={appHref(track.href)}>{track.link}</a>
            </p>
          </div>
        ))}
        <p>
          <a className="btn primary" href={whatsappHref(page.whatsappText)} target="_blank" rel="noreferrer">
            {page.whatsappLink}
          </a>
        </p>
      </section>

      <section className="panel">
        <h2>{page.limitTitle}</h2>
        <p>{page.limit}</p>
        <h2>{page.whoTitle}</h2>
        <ul className="privacy-list">
          {page.whoItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          <a href={appHref("/blog/kindergarten-portfolio-book")}>
            {localizedReading([{ href: "/blog/kindergarten-portfolio-book", label: "幼稚園作品集：細路都出得書嗎？" }], locale)[0].label}
          </a>
        </p>
      </section>

      <section className="panel">
        <h2>{page.caseTitle}</h2>
        <p>{page.caseBody}</p>
        <p>
          <a href={appHref("/case-studies/hilary-butterfly-guide")}>{page.caseLink}</a>
        </p>
      </section>

      <section className="panel" id="faq" itemScope itemType="https://schema.org/FAQPage">
        <h2>{page.faqTitle}</h2>
        <div className="faq-list">
          {page.faqs.map((item) => (
            <details key={item.q} className="faq-item" open itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="faq-q" itemProp="name">
                {item.q}
              </summary>
              <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div itemProp="text">
                  <LinkedText text={item.a} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <ReadingList title={page.readingTitle} links={localizedReading(PORTFOLIO_READING_ZH, locale)} />
      <QuoteCta title={page.ctaTitle} body={page.ctaBody} whatsappLabel={t.hero.bookConsult} whatsappText={page.whatsappText} />
    </main>
  );
}

export function HubLandingPage({ path, page }: { path: string; page: HubCopy }) {
  const { t, locale } = useLocale();
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    const crumbs = [{ name: homeLabel, path: "/" }];
    if (page.parent) crumbs.push({ name: page.parent.label, path: page.parent.href });
    crumbs.push({ name: page.crumb, path });
    const graph: object[] = [
      breadcrumbList(crumbs),
      {
        "@type": "WebPage",
        name: page.h1,
        description: page.description,
        url: canonicalUrl(path),
        isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
      },
      faqPageEntity(page.faqs, `${canonicalUrl(path)}#faq`),
    ];
    if (page.howTo) {
      graph.push({
        "@type": "HowTo",
        name: page.pathTitle,
        description: page.pathIntro,
        step: page.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
          url: `${canonicalUrl(path)}#path`,
        })),
      });
    }
    upsertJsonLd("kidsmybook-page-ld", {
      "@context": "https://schema.org",
      "@graph": graph,
    });
    return () => upsertJsonLd("kidsmybook-page-ld", null);
  }, [homeLabel, page, path]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            ...(page.parent ? [{ href: appHref(page.parent.href), label: page.parent.label }] : []),
            { href: appHref(path), label: page.crumb },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <p>
          <strong>{page.notLabel}</strong>
          {locale === "en" ? ": " : "："}
          {page.notBody}
        </p>
        <div className="cta-row">
          <a className="btn primary" href={whatsappHref(page.whatsappText)} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
          <a className="btn ghost" href={appHref("/programme")}>
            {t.nav.programme}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{page.listTitle}</h2>
        <ul className="privacy-list">
          {page.listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>{page.limitTitle}</h2>
        <ul className="privacy-list">
          {page.limitItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel" id="path">
        <h2>{page.pathTitle}</h2>
        <p>{page.pathIntro}</p>
        <ol className="journey-list">
          {page.steps.map((step) => (
            <li key={step.name}>
              <strong>{step.name}</strong> — {step.text}
            </li>
          ))}
        </ol>
      </section>

      <QuoteCta title={page.ctaTitle} body={page.ctaBody} whatsappLabel={t.hero.bookConsult} whatsappText={page.whatsappText} />

      <section className="panel" id="faq" itemScope itemType="https://schema.org/FAQPage">
        <h2>{page.faqTitle}</h2>
        <div className="faq-list">
          {page.faqs.map((item) => (
            <details key={item.q} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className="faq-q" itemProp="name">
                {item.q}
              </summary>
              <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div itemProp="text">
                  <LinkedText text={item.a} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <ReadingList title={page.readingTitle} links={localizedReading(page.links, locale)} />
      <QuoteCta title={page.ctaTitle} body={page.ctaBody} whatsappLabel={t.hero.bookConsult} whatsappText={page.whatsappText} />
    </main>
  );
}

export function GaocaiHubPage() {
  const { t } = useLocale();
  return <HubLandingPage path={GAOCAI_PATH} page={t.gaocaiPage} />;
}

export function XingquHubPage() {
  const { t } = useLocale();
  return <HubLandingPage path={XINGQU_PATH} page={t.xingquPage} />;
}

export function ShudianHubPage() {
  const { t } = useLocale();
  return <HubLandingPage path={SHUDIAN_PATH} page={t.shudianPage} />;
}

export function ShengxiaoHubPage() {
  const { t } = useLocale();
  return <HubLandingPage path={SHENGXIAO_PATH} page={t.shengxiaoPage} />;
}

export function ShengzhongHubPage() {
  const { t } = useLocale();
  return <HubLandingPage path={SHENGZHONG_PATH} page={t.shengzhongPage} />;
}

export function AboutPage() {
  const { t, locale } = useLocale();
  const page = t.aboutPage;
  const homeLabel = homeLabelFor(locale);

  useEffect(() => {
    upsertJsonLd("kidsmybook-page-ld", {
      "@context": "https://schema.org",
      "@graph": [
        breadcrumbList([
          { name: homeLabel, path: "/" },
          { name: t.nav.about, path: "/about" },
        ]),
        {
          "@type": "AboutPage",
          "@id": `${canonicalUrl("/about")}#webpage`,
          name: page.h1,
          description: page.lead,
          url: canonicalUrl("/about"),
          inLanguage: locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant",
          isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
          about: { "@id": `${SITE_ORIGIN}/#organization` },
          mainEntity: {
            "@type": "Organization",
            "@id": `${SITE_ORIGIN}/#organization`,
            name: "Kidsmybook",
            alternateName: "兒童成就出版",
            url: SITE_ORIGIN,
            email: "kidsmybook@outlook.com",
            description: page.lead,
            areaServed: "Hong Kong",
            sameAs: [...ORGANIZATION_SAME_AS],
          },
        },
      ],
    });
    return () => upsertJsonLd("kidsmybook-page-ld", null);
  }, [homeLabel, locale, page.h1, page.lead, t.nav.about]);

  return (
    <main className="landing">
      <section className="panel">
        <Breadcrumb
          items={[
            { href: appHref("/"), label: homeLabel },
            { href: appHref("/about"), label: t.nav.about },
          ]}
        />
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <div className="cta-row">
          <a className="btn primary" href={whatsappHref(t.whatsapp.home)} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
          <a className="btn ghost" href={`mailto:${STUDIO_EMAIL}`}>
            {STUDIO_EMAIL}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{page.coverageTitle}</h2>
        <p>{page.coverage}</p>
        <h2>{page.programmeTitle}</h2>
        <p>{page.programme}</p>
        <p>
          <a href={appHref("/programme")}>{page.programmeLink}</a>
          {" · "}
          <a href={appHref("/admissions-portfolio")}>{page.portfolioLink}</a>
          {" · "}
          <a href={appHref("/faq")}>{page.faqLink}</a>
        </p>
      </section>

      <section className="panel">
        <h2>{page.disclaimerTitle}</h2>
        <p>{page.disclaimer}</p>
      </section>

      <QuoteCta title={page.contactTitle} body={page.contact} whatsappLabel={t.hero.bookConsult} />
    </main>
  );
}

export function HomeExplore() {
  const { t, locale } = useLocale();
  const links = localizedReading(READING_ZH, locale);
  return (
    <section className="panel panel--standard" id="explore" aria-labelledby="explore-heading">
      <div className="section-head">
        <span className="section-kicker">{t.explore.kicker}</span>
        <h3 id="explore-heading">{t.explore.title}</h3>
      </div>
      <p>{t.explore.intro}</p>
      <div className="service-grid">
        <a className="service-card link-card" href={appHref(SHUDIAN_PATH)}>
          <div className="service-card-body">
            <h4>{t.shudianPage.cardTitle}</h4>
            <p>{t.shudianPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref("/programme")}>
          <div className="service-card-body">
            <h4>{t.explore.programme}</h4>
            <p>{t.explore.programmeBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref("/admissions-portfolio")}>
          <div className="service-card-body">
            <h4>{t.explore.portfolio}</h4>
            <p>{t.explore.portfolioBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref(CHECKLIST_PATH)}>
          <div className="service-card-body">
            <h4>{t.checklistPage.cardTitle}</h4>
            <p>{t.checklistPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref(SHENGXIAO_PATH)}>
          <div className="service-card-body">
            <h4>{t.shengxiaoPage.cardTitle}</h4>
            <p>{t.shengxiaoPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref(SHENGZHONG_PATH)}>
          <div className="service-card-body">
            <h4>{t.shengzhongPage.cardTitle}</h4>
            <p>{t.shengzhongPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref(GAOCAI_PATH)}>
          <div className="service-card-body">
            <h4>{t.gaocaiPage.cardTitle}</h4>
            <p>{t.gaocaiPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref(XINGQU_PATH)}>
          <div className="service-card-body">
            <h4>{t.xingquPage.cardTitle}</h4>
            <p>{t.xingquPage.cardBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref("/faq")}>
          <div className="service-card-body">
            <h4>{t.explore.faq}</h4>
            <p>{t.explore.faqBlurb}</p>
          </div>
        </a>
        <a className="service-card link-card" href={appHref("/case-studies/hilary-butterfly-guide")}>
          <div className="service-card-body">
            <h4>{t.explore.caseLabel}</h4>
            <p>{t.explore.caseBlurb}</p>
          </div>
        </a>
      </div>
      <h4>{t.explore.readingTitle}</h4>
      <ul className="privacy-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={appHref(link.href)}>{link.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
