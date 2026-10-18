/**
 * Retired Mandarin-pinyin public paths → English kebab-case paths.
 * Page copy stays Traditional Chinese. Lookup matches normalizeRoutePath in meta.ts.
 * Longer paths are listed before shorter prefixes only for readability; matching is by key.
 */
export const PINYIN_SLUG_REDIRECTS: Record<string, string> = {
  "/blog/isbn-bu-deng-yu-shu-dian-shang-jia": "/blog/isbn-is-not-bookstore-listing",
  "/blog/zi-fei-pod-vs-dao-shi-zhi-shang-jia": "/blog/self-publish-pod-vs-mentored-bookstore-listing",
  "/blog/gao-cai-tong-di-yi-nian-shi-jian-xian": "/blog/top-talent-pass-family-first-year-timeline",
  "/blog/guo-ji-xue-xiao-mian-shi-isbn-portfolio": "/blog/international-school-interview-with-isbn-book",
  "/blog/mian-shi-ban-vs-isbn-chu-ban": "/blog/interview-class-vs-isbn-published-book",
  "/blog/mei-shu-zuo-pin-ji-vs-isbn-chu-ban": "/blog/art-portfolio-vs-isbn-published-book",
  "/blog/dian-yang-zheng-liang-sheng-xue-zuo-pin-ji": "/blog/how-to-build-an-admissions-portfolio",
  "/blog/zuo-pin-ji-m-gau-lin-shi-gan": "/blog/portfolio-not-ready-before-interview",
  "/blog/zheng-shu-ban-vs-isbn-chu-ban": "/blog/certificate-course-vs-isbn-publishing",
  "/blog/bu-xi-zuo-pin-vs-chu-ban-zuo-pin-ji": "/blog/tutoring-work-vs-published-portfolio",
  "/blog/ben-di-xiao-xue-mian-shi-vs-guo-ji-portfolio": "/blog/local-primary-interview-vs-international-portfolio",
  "/blog/gaocaitong-yisheng-xue-you-shi": "/blog/top-talent-pass-child-book-advantage",
  "/blog/xing-qu-bian-chu-ban": "/blog/child-hobby-into-published-book",
  "/blog/zheng-shu-pi-juan": "/blog/why-certificate-stacks-bore-interviewers",
  "/blog/jiao-shou-chu-ban-shuo-fu-li": "/blog/professor-involvement-in-childrens-publishing",
  "/blog/san-lian-shang-jia-yi-yi": "/blog/bookstore-shelf-listing-for-parents",
  "/blog/gaocaitong-mom-burnout": "/blog/top-talent-pass-parent-burnout",
  "/blog/zi-fei-chu-shu-vs-dao-shi-zhi": "/blog/self-publishing-vs-mentored-publishing",
  "/blog/you-zhi-yuan-zuo-pin-ji-chu-shu": "/blog/kindergarten-portfolio-book",
  "/blog/isbn-tong-shu-jia-zhang-zhi-nan": "/blog/hong-kong-isbn-childrens-book-guide",
  "/blog/sheng-xiao-xue-mian-shi-zuo-pin-ji": "/blog/primary-interview-how-to-use-a-book",
  "/blog/sheng-zhong-dss-portfolio-chu-ban": "/blog/secondary-dss-interview-published-book",
  "/blog/guo-ji-vs-ben-di-mian-shi-zuo-pin-ji": "/blog/international-vs-local-school-interview-portfolio",
  "/tong-shu-shu-dian-shang-jia": "/kids-book-bookstore-listing",
  "/gao-cai-tong-sheng-xue-zuo-pin-ji": "/top-talent-pass-admissions-portfolio",
  "/xing-qu-chu-ban": "/interest-to-published-book",
  "/sheng-xiao-xue-mian-shi-zuo-pin-ji": "/primary-one-interview-portfolio",
  "/sheng-zhong-dss-zuo-pin-ji": "/secondary-dss-admissions-portfolio",
  "/sheng-xue-zuo-pin-ji-qing-dan": "/admissions-portfolio-checklist",
  "/sheng-xue-zuo-pin-ji": "/admissions-portfolio",
};

function normalizePublicPath(pathname: string): string {
  let path = pathname || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep the raw path */
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return (path || "/").toLowerCase();
}

/** 301 target for a retired pinyin path, or null when the path stays. */
export function englishSlugRedirect(pathname: string): string | null {
  return PINYIN_SLUG_REDIRECTS[normalizePublicPath(pathname)] ?? null;
}
