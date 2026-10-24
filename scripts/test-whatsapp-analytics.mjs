import assert from "node:assert/strict";
import {
  analyticsPagePath,
  isWhatsappHref,
  publicWhatsappLink,
  resolveCtaLocation,
} from "../src/lib/analytics.ts";

const childText = encodeURIComponent("小朋友小明想出書，預覽 https://kidsmybook.com/?name=小明");

assert.equal(isWhatsappHref(`https://wa.me/85291214157?text=${childText}`), true);
assert.equal(isWhatsappHref("https://api.whatsapp.com/send?phone=85291214157&text=hello"), true);
assert.equal(isWhatsappHref("https://web.whatsapp.com/send?phone=85291214157"), true);
assert.equal(isWhatsappHref("http://wa.me/85291214157"), true);
assert.equal(isWhatsappHref("https://kidsmybook.com/programme"), false);
assert.equal(isWhatsappHref("mailto:kidsmybook@outlook.com"), false);
assert.equal(isWhatsappHref("https://example.com/?next=https://wa.me/85291214157"), false);
assert.equal(isWhatsappHref("javascript:alert(1)"), false);

assert.equal(publicWhatsappLink(`https://wa.me/85291214157?text=${childText}`), "https://wa.me/85291214157");
assert.equal(
  publicWhatsappLink("https://api.whatsapp.com/send?phone=85299999999&text=secret"),
  "https://api.whatsapp.com/send",
);
assert.equal(publicWhatsappLink("https://wa.me/85291214157/"), "https://wa.me/85291214157");
assert.equal(publicWhatsappLink("https://kidsmybook.com/"), "https://wa.me/");
assert.equal(publicWhatsappLink(`https://wa.me/85291214157?text=${childText}`).includes("小明"), false);
assert.equal(publicWhatsappLink(`https://wa.me/85291214157?text=${childText}`).includes("text="), false);

assert.equal(analyticsPagePath("/programme/"), "/programme");
assert.equal(analyticsPagePath("/"), "/");
assert.equal(analyticsPagePath(""), "/");

const empty = new Set();
assert.equal(
  resolveCtaLocation({ explicit: null, classes: new Set(["floating-wa"]), ids: empty, pathname: "/", inLandingHero: false }),
  "floating",
);
assert.equal(
  resolveCtaLocation({ explicit: null, classes: new Set(["top-nav"]), ids: empty, pathname: "/faq", inLandingHero: false }),
  "header",
);
assert.equal(
  resolveCtaLocation({ explicit: null, classes: new Set(["site-footer"]), ids: empty, pathname: "/", inLandingHero: false }),
  "footer",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["hero", "hero--premium", "btn", "primary"]),
    ids: empty,
    pathname: "/",
    inLandingHero: false,
  }),
  "hero",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["final-cta", "cta-row", "btn", "primary"]),
    ids: empty,
    pathname: "/programme",
    inLandingHero: false,
  }),
  "page_cta",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["landing", "panel", "btn", "primary"]),
    ids: empty,
    pathname: "/admissions-portfolio",
    inLandingHero: true,
  }),
  "landing_hero",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["landing", "panel"]),
    ids: new Set(["stages"]),
    pathname: "/admissions-portfolio",
    inLandingHero: false,
  }),
  "stages",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["blog-post", "cta-row", "btn", "primary"]),
    ids: empty,
    pathname: "/blog/interview-class-vs-isbn-published-book",
    inLandingHero: false,
  }),
  "blog_cta",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["blog-post", "share-wa", "share-btn"]),
    ids: empty,
    pathname: "/blog/interview-class-vs-isbn-published-book",
    inLandingHero: false,
  }),
  "blog_share",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["blog-post"]),
    ids: empty,
    pathname: "/blog/interview-class-vs-isbn-published-book",
    inLandingHero: false,
  }),
  "blog_inline",
);
assert.equal(
  resolveCtaLocation({ explicit: null, classes: new Set(["panel"]), ids: empty, pathname: "/blog", inLandingHero: false }),
  "blog_index",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["panel"]),
    ids: empty,
    pathname: "/services/author-programme",
    inLandingHero: false,
  }),
  "service",
);
assert.equal(
  resolveCtaLocation({ explicit: "custom", classes: new Set(["hero"]), ids: empty, pathname: "/", inLandingHero: false }),
  "custom",
);
assert.equal(
  resolveCtaLocation({
    explicit: null,
    classes: new Set(["faq-item"]),
    ids: new Set(["faq"]),
    pathname: "/faq",
    inLandingHero: false,
  }),
  "faq",
);

console.log("whatsapp analytics checks passed");
