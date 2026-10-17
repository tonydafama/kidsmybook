import type { Translations } from "../i18n/translations";

/** Page intent for the floating WhatsApp button. Falls back to the locale default. */
export function pageWhatsappText(pathname: string, t: Translations, blogTitle?: string): string {
  if (pathname === "/sheng-xue-zuo-pin-ji") return t.portfolioPage.whatsappText;
  if (pathname === "/sheng-xue-zuo-pin-ji-qing-dan") return t.checklistPage.whatsappText;
  if (pathname === "/gao-cai-tong-sheng-xue-zuo-pin-ji") return t.gaocaiPage.whatsappText;
  if (pathname === "/xing-qu-chu-ban") return t.xingquPage.whatsappText;
  if (pathname === "/sheng-xiao-xue-mian-shi-zuo-pin-ji") return t.shengxiaoPage.whatsappText;
  if (pathname === "/sheng-zhong-dss-zuo-pin-ji") return t.shengzhongPage.whatsappText;
  if (pathname === "/programme") return t.programmePage.whatsappText;
  if (pathname === "/faq") return t.faqPage.whatsappText;
  if (pathname === "/blog") return t.whatsapp.blog;
  if (pathname.startsWith("/blog/")) return blogTitle ? t.whatsapp.blogPost(blogTitle) : t.whatsapp.blog;
  return t.whatsapp.floating;
}
