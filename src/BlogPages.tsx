import { useEffect, useMemo, type ReactNode } from "react";
import { useLocale } from "./i18n/LocaleContext";
import { safeHttpsUrl, splitTrailingPunct } from "./seo/linkify";
import { DEFAULT_OG } from "./seo/meta";

export const SITE_ORIGIN = "https://kidsmybook.com";

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
    slug: "online-storefront-vs-physical-bookstore-listing",
    title: "網上書店／電子書上架 ≠ 三聯商務中華書架：家長點分清楚",
    excerpt: "Amazon、HKTVmall、POD 網店或者電子書目錄寫「有售」，唔等於三聯、商務、中華書架有貨。實體上架係發行之後店方入貨、陳列同退貨。Kidsmybook 第一句係出書連實體上架。ISBN 唔等於上架。私人報價，唔保證每間分店有貨，亦唔保證取錄。",
    date: "2026-10-21",
    readMin: 7,
  },
  {
    slug: "book-fair-booth-vs-year-round-bookstore-listing",
    title: "香港書展出書 ≠ 全年書店上架：家長點樣分清楚",
    excerpt: "書展攤位或者出版社展位見到書，唔等於三聯、商務、中華全年書架有貨。上架係供貨路徑，店方決定入貨、陳列同退貨。Kidsmybook 講出書連上架，唔係書展出場就算成功。ISBN 同呈繳亦唔等於上架。私人報價，唔保證每間分店有貨，亦唔保證取錄。",
    date: "2026-10-20",
    readMin: 6,
  },
  {
    slug: "anthology-vs-sole-authored-bookstore-listing",
    title: "比賽得獎作品集／學校結集，同個人出書連上架有咩分別？",
    excerpt: "學校結集、比賽得獎作品集，多數係多人合集入面一篇。Kidsmybook 係約 12 個月導師制，小朋友參與一本正式印刷嘅個人書，再按題材同配套走三聯、商務、中華等書店平台。ISBN 只係書號。私人報價，唔保證每間分店有貨，亦唔保證取錄。",
    date: "2026-10-19",
    readMin: 6,
  },
  {
    slug: "isbn-is-not-bookstore-listing",
    title: "只有 ISBN ≠ 實體書店上架",
    excerpt: "香港 ISBN 係書號。三聯、商務、中華書架上有冇貨，係另一條路。店長決定入貨、陳列同退貨。Kidsmybook 唔係呢幾間書店。私人報價，唔保證每間分店有貨。",
    date: "2026-10-18",
    readMin: 6,
  },
  {
    slug: "self-publish-pod-vs-mentored-bookstore-listing",
    title: "自費／POD／代印 vs 導師制＋實體上架",
    excerpt: "自費出書、代印同按需印刷多數停喺一本印好嘅書。導師制路徑先正式印刷，再走三聯、商務、中華等書店平台。店長決定入貨。私人報價，唔保證每間分店有貨。",
    date: "2026-10-18",
    readMin: 6,
  },
  {
    slug: "top-talent-pass-family-first-year-timeline",
    title: "高才通家庭第一年升學作品集時間線",
    excerpt: "高才通同新來港家庭：第 1 至 12 個月點樣排一本 ISBN 童書。仲有大約一年先開始出版路徑；面試只剩幾日趕唔切。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 7,
  },
  {
    slug: "international-school-interview-with-isbn-book",
    title: "國際學校面試 portfolio：點樣用一本 ISBN 書講",
    excerpt: "國際學校英文面試：用一本小朋友參與、有 ISBN 嘅書講一件興趣。四句講法，唔好背兩套故事。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 6,
  },
  {
    slug: "interview-class-vs-isbn-published-book",
    title: "升小面試班 vs ISBN 出版作品集：香港家長點樣揀",
    excerpt: "升小面試班練當場表現；ISBN 出版作品集係 12 個月導師制做出嚟、可以帶去面試嘅書。Kidsmybook 唔係短期面試班。臨近面試趕唔切一本書。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 6,
  },
  {
    slug: "art-portfolio-vs-isbn-published-book",
    title: "美術作品集 vs ISBN 出版作品集：香港升學幾時用邊樣",
    excerpt: "畫簿、素描同美術班作品集，同有 ISBN、小朋友參與嘅出版作品集，唔係同一種證據。幾時交畫作已經夠，幾時一本書幫到面試。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 6,
  },
  {
    slug: "how-to-build-an-admissions-portfolio",
    title: "點樣整靚升學作品集：香港家長實用清單",
    excerpt: "作品集薄、只有證書，或者臨近面試先整理：用一份清單決定放咩喺前面。證書班、補習作品同 ISBN 出版各自證明咩。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 6,
  },
  {
    slug: "portfolio-not-ready-before-interview",
    title: "作品集唔夠睇、臨時趕點算：叩門同面試季時間表",
    excerpt: "面試或叩門只剩幾日或幾星期，12 個月出版計劃趕唔切。而家可以收窄文件；出書適合下一個大約有一年嘅申請周期。私人報價，唔保證取錄。",
    date: "2026-10-17",
    readMin: 5,
  },
  {
    slug: "certificate-course-vs-isbn-publishing",
    title: "證書班 vs ISBN 正式出版：面試作品集點樣睇",
    excerpt: "證書班交一張等級紙；ISBN 正式出版交一本小朋友參與、可以翻開講嘅書。兩樣可以並存，但唔係同一種證據。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
  {
    slug: "tutoring-work-vs-published-portfolio",
    title: "補習作品 vs 出版作品集：面試官睇到咩",
    excerpt: "補習作文、練習紙同模擬面試稿係學習過程。出版作品集係一本做完、有 ISBN、可以引用嘅書。兩樣唔互相取代。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
  {
    slug: "local-primary-interview-vs-international-portfolio",
    title: "本地小學面試文件 vs 國際學校 portfolio：同一本書點樣交",
    excerpt: "本地小學多數喺面試或叩門當日打開文件；國際學校多數喺申請時先交 portfolio。呢篇講交件時間同位置，唔重複面試講法。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
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
    slug: "top-talent-pass-child-book-advantage",
    title: "高才通子女點樣用一本書建立香港升學優勢",
    excerpt: "從深圳過關嘅高才通家長視角，講點樣用一本真正屬於小朋友嘅書，幫佢喺升學面試突圍。",
    date: "2026-09-02",
    readMin: 4,
  },
  {
    slug: "child-hobby-into-published-book",
    title: "小朋友嘅興趣點樣變成一本正式出版嘅書",
    excerpt: "昆蟲、繪畫、觀星——呢啲「無用」嘅興趣，點樣經導師同教授整理成可上架嘅出版成果。",
    date: "2026-09-04",
    readMin: 4,
  },
  {
    slug: "why-certificate-stacks-bore-interviewers",
    title: "為何證書堆砌嘅履歷會令面試官疲倦",
    excerpt: "大家都係奥數、游泳、弦樂，面試官睇到第三個已經眼定。點樣用一本書突圍？",
    date: "2026-09-06",
    readMin: 4,
  },
  {
    slug: "professor-involvement-in-childrens-publishing",
    title: "大學教授參與出版對升學嘅說服力",
    excerpt: "一本有教授背書、真人真事改編嘅書，點樣比十張課外活動證書更有說服力。",
    date: "2026-09-08",
    readMin: 4,
  },
  {
    slug: "bookstore-shelf-listing-for-parents",
    title: "實體書店上架（三聯/商務/中華）對家長嘅意義",
    excerpt: "實體書店上架對家長可以意味住咩。店長決定入貨同陳列。Kidsmybook 唔係三聯、商務或中華，亦唔保證每間分店有貨。",
    date: "2026-10-18",
    readMin: 6,
  },
  {
    slug: "portfolio-book-4-skills",
    title: "點解一本書會係子女升學履歷最強嘅一張牌？",
    excerpt: "高才通家長每日幫子女報十個班、攞十張證書，但面試官記唔住。一本由小朋友自己參與、教授跟住做嘅書，反而令佢被記住。",
    date: "2026-09-12",
    readMin: 5,
  },
  {
    slug: "top-talent-pass-parent-burnout",
    title: "高才通媽媽嘅 burnout：我幫子女報嘅班，究竟為咗佢定係為咗我？",
    excerpt: "過來人視角。高才通家庭嚟港，家長最容易跌落嘅陷阱，係將自己嘅焦慮變成子女嘅課表。一本書，反而幫我同個女搵返屬於佢自己嘅節奏。",
    date: "2026-09-14",
    readMin: 5,
  },
  {
    slug: "school-ranking-myth",
    title: "第一梯隊、第二梯隊：排名以外，學校其實想睇咩？",
    excerpt: "家長成日講「第一梯隊第二梯隊」，但面試嗰陣，老師想見嘅唔係你子女攞過幾多獎，而係佢係一個點樣嘅人。一本書，係最難造假嘅答案。",
    date: "2026-09-16",
    readMin: 5,
  },
  {
    slug: "portfolio-vs-extracurriculars-hk-admissions",
    title: "香港升學履歷比較：實體書出版 vs 傳統興趣班",
    excerpt: "大家都學鋼琴同奧數，點樣令小朋友嘅 Portfolio 脫穎而出？一文比較傳統興趣班與兒童成就出版嘅升學優勢。",
    date: "2026-09-18",
    readMin: 4,
  },
  {
    slug: "top-talent-pass-first-year-portfolio",
    title: "高才通來港第一年：如何快速建立符合香港名校口味的 Portfolio",
    excerpt: "新港人家庭必看！剛搬到香港，如何避開盲目報班的陷阱，用一年時間為子女打造高含金量的升學履歷？",
    date: "2026-09-20",
    readMin: 5,
  },
  {
    slug: "international-school-interview-portfolio-highlight",
    title: "國際學校面試履歷亮點：為什麼「獨特性」比「全能」更重要？",
    excerpt: "想入讀香港頂尖國際學校？面試官真正在找的不是十項全能的完美學生，而是擁有獨特熱情與深度的孩子。",
    date: "2026-09-22",
    readMin: 4,
  },
  {
    slug: "primary-school-door-knocking-portfolio-prep",
    title: "小學叩門 Portfolio 準備：面試官真正在看什麼？",
    excerpt: "叩門階段競爭白熱化，一份普通的 Portfolio 已經無法引起校長注意。了解如何用出版實體書作為叩門的終極武器。",
    date: "2026-09-24",
    readMin: 4,
  },
  {
    slug: "child-background-enhancement-hk",
    title: "兒童背景提升：香港名校喜歡什麼樣的課外活動？",
    excerpt: "高收入家庭在為子女規劃課外活動時，常陷入「越多越好」的誤區。了解名校真正看重的背景提升策略。",
    date: "2026-09-26",
    readMin: 5,
  },
  {
    slug: "mainland-parents-hk-international-schools-prep",
    title: "內地家長必看：香港國際學校準備的 3 個常見誤區",
    excerpt: "剛透過優才或高才通來港的內地家長，在準備香港國際學校面試時，最容易犯的三個致命錯誤，以及如何用出版書籍來破局。",
    date: "2026-09-28",
    readMin: 4,
  },
  {
    slug: "kids-publishing-a-book-hk-isbn",
    title: "小朋友出書香港：從興趣到 ISBN 註冊的完整指南",
    excerpt: "想幫小朋友在香港出一本書？了解 Kidsmybook 的 12 個月出版計劃，如何將孩子的熱情轉化為有 ISBN 的正式出版物。",
    date: "2026-09-30",
    readMin: 5,
  },
  {
    slug: "university-professor-child-work-review",
    title: "大學教授兒童作品審閱：如何為升學履歷增加學術權威性？",
    excerpt: "為什麼一份有大學教授推薦語的 Portfolio，能瞬間秒殺其他競爭者？探討學術權威背書在香港名校面試中的決定性作用。",
    date: "2026-10-02",
    readMin: 4,
  },
  {
    slug: "children-project-based-learning-hk",
    title: "兒童項目式學習 (PBL) 香港實踐：出版一本書的教育價值",
    excerpt: "除了升學履歷，幫小朋友出書還能帶來什麼？深入探討 PBL 項目式學習如何培養孩子解決問題、邏輯思考與長期專注的能力。",
    date: "2026-10-04",
    readMin: 5,
  },
  {
    slug: "gifted-child-development-program-hk",
    title: "資優兒童發展計劃：除了跳級，還能如何展現天賦？",
    excerpt: "你的孩子在某些領域展現出驚人天賦？探討如何透過出版專著，為資優兒童提供更廣闊的舞台與升學優勢。",
    date: "2026-10-06",
    readMin: 4,
  },
  {
    slug: "self-publishing-vs-mentored-publishing",
    title: "自費出書 vs 導師制出版：邊樣先幫到香港升學面試？",
    excerpt: "自費印刷多數係紀念冊。導師制出版有小朋友參與、教授審閱、ISBN 同升學作品集包裝。私人報價，亦唔保證取錄。",
    date: "2026-10-10",
    readMin: 5,
  },
  {
    slug: "kindergarten-portfolio-book",
    title: "幼稚園作品集：細路都出得書嗎？",
    excerpt: "K1–K3 可以用圖畫、觀察同口述故事做一本保留小朋友聲音嘅書。深度由導師同家長把關，唔保證入學。",
    date: "2026-10-13",
    readMin: 5,
  },
  {
    slug: "hong-kong-isbn-childrens-book-guide",
    title: "香港 ISBN 童書家長指南：正式出版要知嘅 7 件事",
    excerpt: "根據香港公共圖書館書刊註冊組公開資料，分清 ISBN、書刊註冊同版權。Kidsmybook 唔係官方機構。私人報價。",
    date: "2026-10-16",
    readMin: 7,
  },
  {
    slug: "primary-interview-how-to-use-a-book",
    title: "升小學面試作品集：一本書點樣用",
    excerpt: "小一自行分配、面試同叩門，作品集唔係愈厚愈好。用一本小朋友參與、有 ISBN 嘅書，喺幾分鐘裡面講一個記得住嘅故事。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
  {
    slug: "secondary-dss-interview-published-book",
    title: "升中面試、DSS 同直資：作品集點樣放一本出版物",
    excerpt: "升中、直資同 DSS 面試想睇持續興趣同自述。正式出版物放喺作品集前面，同證書堆分開。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
  {
    slug: "international-vs-local-school-interview-portfolio",
    title: "國際學校 vs 本地學校面試：出版作品集有咩分別",
    excerpt: "同一本小朋友嘅書，國際學校同本地、直資、私立面試嘅講法唔同。準備兩個講法，而唔係兩套故事。私人報價，唔保證取錄。",
    date: "2026-10-16",
    readMin: 6,
  },
];

const APP_BASE = import.meta.env.BASE_URL;
function appHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";

const BLOG_MODULES = import.meta.glob("../blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function localeFileExt(locale: string): string {
  if (locale === "zh-Hans" || locale === "zhHans") return ".hans";
  if (locale === "en") return ".en";
  return "";
}

function loadPostRaw(slug: string, locale: string): string {
  const ext = localeFileExt(locale);
  const candidates = [`../blog/${slug}${ext}.md`, `../blog/${slug}.md`];
  for (const c of candidates) {
    const body = BLOG_MODULES[c];
    if (body) return body;
  }
  return "";
}

function parseFrontMatter(md: string): { title: string; description: string; date: string; body: string } {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: "", description: "", date: "", body: md };
  const fm = match[1];
  const body = match[2];
  const pick = (key: string) => {
    const re = new RegExp(`^${key}:\\s*"(.*)"\\s*$`, "m");
    const m = fm.match(re);
    if (m) return m[1].replace(/\\"/g, '"');
    const bare = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
    return bare?.[1]?.replace(/^["']|["']$/g, "") ?? "";
  };
  return { title: pick("title"), description: pick("description"), date: pick("date"), body };
}

function getLocalizedPostMeta(slug: string, locale: string): Pick<PostMeta, "title" | "excerpt"> {
  const fallback = POSTS.find((p) => p.slug === slug);
  const raw = loadPostRaw(slug, locale);
  if (!raw) {
    return { title: fallback?.title ?? slug, excerpt: fallback?.excerpt ?? "" };
  }
  const { title, description } = parseFrontMatter(raw);
  return {
    title: title || fallback?.title || slug,
    excerpt: description || fallback?.excerpt || "",
  };
}

function inlineFormat(text: string): ReactNode {
  // light markdown: https links, **bold**, *italic*, `code`
  const parts: ReactNode[] = [];
  const re = /(https:\/\/[^\s<>"']+|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("https://")) {
      const { href, rest } = splitTrailingPunct(token);
      const safe = safeHttpsUrl(href);
      if (safe) {
        const external = !safe.includes("://kidsmybook.com") && !safe.includes("://www.kidsmybook.com");
        parts.push(
          <a key={key++} href={safe} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
            {safe}
          </a>,
        );
      } else {
        parts.push(href);
      }
      if (rest) parts.push(rest);
    } else if (token.startsWith("**")) parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    else parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

type MdBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "ul"; items: string[] };

function parseMarkdownBlocks(md: string): MdBlock[] {
  const withoutFm = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const chunks = withoutFm
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out: MdBlock[] = [];
  for (const chunk of chunks) {
    if (/^###\s+/.test(chunk)) {
      out.push({ kind: "h3", text: chunk.replace(/^###\s+/, "").trim() });
      continue;
    }
    if (/^##\s+/.test(chunk)) {
      out.push({ kind: "h2", text: chunk.replace(/^##\s+/, "").trim() });
      continue;
    }
    if (/^>\s?/.test(chunk)) {
      out.push({
        kind: "quote",
        text: chunk
          .split("\n")
          .map((l) => l.replace(/^>\s?/, ""))
          .join(" ")
          .trim(),
      });
      continue;
    }
    if (/^[-*]\s+/m.test(chunk) && chunk.split("\n").every((l) => !l.trim() || /^[-*]\s+/.test(l.trim()))) {
      out.push({
        kind: "ul",
        items: chunk
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => l.replace(/^[-*]\s+/, "")),
      });
      continue;
    }
    // strip wrapping single italics used as CTA footer
    const plain = chunk.replace(/^\*([\s\S]+)\*$/, "$1").trim();
    out.push({ kind: "p", text: plain });
  }
  return out;
}

export function upsertJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const el = (existing as HTMLScriptElement | null) ?? document.createElement("script");
  el.type = "application/ld+json";
  el.id = id;
  el.text = JSON.stringify(data);
  if (!existing) document.head.appendChild(el);
}

function BlogIndexPage() {
  const { t, locale } = useLocale();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsapp.blog)}`;
  const sorted = useMemo(() => {
    return [...POSTS]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((p) => {
        const loc = getLocalizedPostMeta(p.slug, locale);
        return { ...p, title: loc.title, excerpt: loc.excerpt };
      });
  }, [locale]);

  useEffect(() => {
    upsertJsonLd("kidsmybook-blog-index-ld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: t.blog.indexTitle,
      description: t.blog.indexDesc,
      inLanguage: locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant",
      url: `${SITE_ORIGIN}/blog`,
      isPartOf: { "@type": "WebSite", name: "Kidsmybook", url: SITE_ORIGIN },
      about: [
        "Hong Kong school admissions",
        "Top Talent Pass / Quality Migrant families",
        "Children's achievement publishing",
      ],
      mainEntity: {
        "@type": "ItemList",
        itemListElement: sorted.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_ORIGIN}/blog/${p.slug}`,
          name: p.title,
        })),
      },
    });
    return () => upsertJsonLd("kidsmybook-blog-index-ld", null);
  }, [sorted, locale, t.blog.indexDesc, t.blog.indexTitle]);

  return (
    <main>
      <section className="panel">
        <span className="section-kicker">{t.blog.kicker}</span>
        <h1>{t.blog.indexTitle}</h1>
        <p className="meta">{t.blog.indexDesc}</p>
        <div className="service-grid">
          {sorted.map((p) => (
            <a key={p.slug} className="service-card link-card" href={appHref(`/blog/${p.slug}`)}>
              <div className="service-card-body">
                <h2 className="blog-card-title">{p.title}</h2>
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
  const { t, locale } = useLocale();
  const meta = POSTS.find((p) => p.slug === slug);
  const localized = useMemo(() => getLocalizedPostMeta(slug, locale), [slug, locale]);
  const blocks = useMemo(() => {
    const raw = loadPostRaw(slug, locale);
    if (!raw) return [] as MdBlock[];
    return parseMarkdownBlocks(raw);
  }, [slug, locale]);
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    localized.title ? t.whatsapp.blogPost(localized.title) : t.whatsapp.blog,
  )}`;
  const pageUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const inLanguage = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";

  useEffect(() => {
    if (!meta) {
      upsertJsonLd("kidsmybook-blog-post-ld", null);
      return;
    }
    const posting = {
      "@type": ["BlogPosting", "Article"],
      headline: localized.title,
      description: localized.excerpt,
      datePublished: meta.date,
      dateModified: meta.date,
      inLanguage,
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      image: DEFAULT_OG.url,
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
      about: [
        "Hong Kong school admissions",
        "Child achievement publishing",
        "Top Talent Pass families",
      ],
      isPartOf: {
        "@type": "Blog",
        name: "Kidsmybook Blog",
        url: `${SITE_ORIGIN}/blog`,
      },
    };
    const faqEntities = [] as Array<{
      "@type": "Question";
      name: string;
      acceptedAnswer: { "@type": "Answer"; text: string };
    }>;
    for (let i = 0; i < blocks.length; i++) {
      const heading = blocks[i];
      if (heading.kind !== "h2" || !/[?？]/.test(heading.text)) continue;
      const next = blocks[i + 1];
      const answer =
        next && (next.kind === "p" || next.kind === "quote")
          ? next.text
          : localized.excerpt;
      faqEntities.push({
        "@type": "Question",
        name: heading.text,
        acceptedAnswer: { "@type": "Answer", text: answer },
      });
    }
    upsertJsonLd(
      "kidsmybook-blog-post-ld",
      faqEntities.length > 0
        ? { "@context": "https://schema.org", "@graph": [posting, { "@type": "FAQPage", mainEntity: faqEntities }] }
        : { "@context": "https://schema.org", ...posting },
    );
    return () => upsertJsonLd("kidsmybook-blog-post-ld", null);
  }, [meta, localized.title, localized.excerpt, pageUrl, inLanguage, blocks]);

  return (
    <main>
      <article className="panel blog-post" itemScope itemType="https://schema.org/BlogPosting">
        <a className="btn ghost" href={appHref("/blog")}>
          {t.blog.backToBlog}
        </a>
        {meta && (
          <header className="blog-post__head">
            <h1 itemProp="headline">{localized.title}</h1>
            <p className="meta">
              <time dateTime={meta.date} itemProp="datePublished">
                {meta.date}
              </time>
              {" · "}約 {meta.readMin} 分鐘閱讀
            </p>
          </header>
        )}
        <div className="blog-post__body" itemProp="articleBody">
          {blocks.length === 0 && <p>_文章內容暫時未能載入。_</p>}
          {blocks.map((b, i) => {
            if (b.kind === "h2") return <h2 key={i}>{inlineFormat(b.text)}</h2>;
            if (b.kind === "h3") return <h3 key={i}>{inlineFormat(b.text)}</h3>;
            if (b.kind === "quote") return <blockquote key={i}>{inlineFormat(b.text)}</blockquote>;
            if (b.kind === "ul")
              return (
                <ul key={i}>
                  {b.items.map((item, j) => (
                    <li key={j}>{inlineFormat(item)}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{inlineFormat(b.text)}</p>;
          })}
        </div>
        <div className="social-share">
          <span className="social-share-label">Share:</span>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(localized.title + " " + pageUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-wa">WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-fb">Facebook</a>
          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(localized.title)}`} target="_blank" rel="noreferrer" className="share-btn share-in">LinkedIn</a>
        </div>
        <div className="cta-row">
          <a className="btn primary" href={whatsapp} target="_blank" rel="noreferrer">
            {t.hero.bookConsult}
          </a>
          <a className="btn ghost" href={appHref("/programme")}>
            {t.nav.programme}
          </a>
        </div>
      </article>
    </main>
  );
}

export { BlogIndexPage, BlogPostPage, POSTS, getLocalizedPostMeta };
