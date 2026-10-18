import type { Translations } from "../i18n/translations";

/** Page intent for the floating WhatsApp button. Falls back to the locale default. */
export function pageWhatsappText(pathname: string, t: Translations, blogTitle?: string): string {
  if (pathname === "/admissions-portfolio") return t.portfolioPage.whatsappText;
  if (pathname === "/admissions-portfolio-checklist") return t.checklistPage.whatsappText;
  if (pathname === "/top-talent-pass-admissions-portfolio") return t.gaocaiPage.whatsappText;
  if (pathname === "/interest-to-published-book") return t.xingquPage.whatsappText;
  if (pathname === "/kids-book-bookstore-listing") return t.shudianPage.whatsappText;
  if (pathname === "/primary-one-interview-portfolio") return t.shengxiaoPage.whatsappText;
  if (pathname === "/secondary-dss-admissions-portfolio") return t.shengzhongPage.whatsappText;
  if (pathname === "/programme") return t.programmePage.whatsappText;
  if (pathname === "/faq") return t.faqPage.whatsappText;
  if (pathname === "/blog") return t.whatsapp.blog;
  if (pathname.startsWith("/blog/")) return blogTitle ? t.whatsapp.blogPost(blogTitle) : t.whatsapp.blog;
  return t.whatsapp.floating;
}
