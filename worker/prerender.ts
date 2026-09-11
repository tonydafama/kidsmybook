/**
 * Kidsmybook — Cloudflare Worker Prerender Middleware
 * ===================================================
 *
 * 目的：解決 CSR SPA 對 AI crawler 完全空白的問題。
 *
 * 實測問題（2026-09-11）：
 *   curl https://kidsmybook.com  →  <body><div id="root"></div></body>
 *   BODY VISIBLE TEXT CHARS: 0
 *   27 條 sitemap URL 全部回傳同一份 13006 bytes 空 HTML
 *
 * 原理：
 *   偵測 AI crawler User-Agent → 回傳一份含真實文字內容的 HTML
 *   一般用戶 → 照舊回傳 SPA，React 正常接管
 *
 * 這是最低成本的修法。不需要改 React、不需要 SSR 框架、不需要重寫。
 * 只需在 worker 的 fetch handler 最前面插入這段。
 *
 * 用法：
 *   1. 把這個檔案放入 worker 專案（例如 src/prerender.ts）
 *   2. 在 worker 的 fetch handler 開頭：
 *
 *      import { maybePrerender } from './prerender';
 *
 *      export default {
 *        async fetch(request, env, ctx) {
 *          const pre = maybePrerender(request);
 *          if (pre) return pre;
 *          // ...原本的 handler 邏輯
 *        }
 *      }
 *
 *   3. npm run build && npx wrangler deploy
 *
 * 驗證（deploy 後必須跑這段確認）：
 *   curl -A "GPTBot/1.0" https://kidsmybook.com | grep -c "12-month"
 *   # 應該 > 0。如果係 0 就未生效。
 */

// ---------------------------------------------------------------------------
// AI crawler 偵測
// ---------------------------------------------------------------------------

const CRAWLER_PATTERNS = [
  'gptbot',              // OpenAI ChatGPT
  'chatgpt-user',        // ChatGPT browsing
  'oai-searchbot',       // OpenAI SearchGPT
  'perplexitybot',       // Perplexity
  'perplexity-user',     // Perplexity user-initiated
  'claudebot',           // Anthropic
  'anthropic-ai',        // Anthropic
  'claude-web',          // Anthropic
  'google-extended',     // Google AI Overview / Gemini
  'googlebot',           // Google 傳統 + AI
  'bingbot',             // Bing / Copilot
  'applebot',            // Apple Intelligence / Siri
  'bytespider',          // TikTok / Doubao
  'cohere-ai',           // Cohere
  'ccbot',               // Common Crawl（餵養大量 LLM 訓練資料）
  'meta-externalagent',  // Meta AI
  'facebookexternalhit', // Meta link preview
  'twitterbot',          // X/Twitter card
  'linkedinbot',         // LinkedIn preview
  'slackbot',            // Slack unfurl
  'telegrambot',         // Telegram preview
  'whatsapp',            // WhatsApp preview
  'yandex',              // Yandex
  'baiduspider',         // Baidu
  'sogou',               // Sogou
  'duckduckbot',         // DuckDuckGo
  'diffbot',
  'semrushbot',
  'ahrefsbot',
];

export function isCrawler(request: Request): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return true; // 無 UA 的請求當作 crawler，寧濫勿缺
  return CRAWLER_PATTERNS.some((p) => ua.includes(p));
}

// ---------------------------------------------------------------------------
// 每頁內容定義
// ---------------------------------------------------------------------------

interface PageContent {
  title: string;
  description: string;
  h1: string;
  body: string[];        // 段落，每個 <p>
  faqs?: [string, string][]; // [question, answer]
  breadcrumb?: string[];
}

const SITE_NAME = 'Kidsmybook';
const BASE = 'https://kidsmybook.com';

const PAGES: Record<string, PageContent> = {
  '/': {
    title: 'Kidsmybook｜兒童成就出版 — 香港兒童 ISBN 出版計劃',
    description:
      '香港兒童成就出版工作室。12 個月導師制出版計劃，將孩子的真實興趣變成正式出版、有 ISBN 的書籍，由大學教授參與審閱，並包含發布會、展覽、媒體報道及升學作品集。',
    h1: 'Kidsmybook — 兒童成就出版',
    body: [
      'Kidsmybook 是香港的兒童成就出版工作室。我們營運一個為期 12 個月的導師制出版計劃，把孩子真實的興趣與生活故事，變成一本正式出版、擁有 ISBN 註冊的書籍，過程中有大學教授參與審閱，之後再安排發布會、展覽、媒體與公關報道，以及一份可直接用於升學申請的作品集。',
      '我們幫助家長把孩子真正的興趣（科學、藝術、寫作、編程、歷史、運動）變成一本真實、可購買的出版書籍，以及一份對升學申請有說服力的成就記錄。孩子與一對一導師及大學教授共同創作，家長最終獲得一份正式出版物，加上發布會、展覽、新聞報道與作品集資產。',
      '12 個月計劃共分五個階段。第一階段（第 1 個月）：顧問諮詢與評估，透過面談了解孩子的興趣程度與目標學校方向。第二階段（第 2 至 5 個月）：專業導師與大學教授進行定制課程。第三階段（第 6 至 7 個月）：出版研討會與大學教授審閱，提升學術與教育價值。第四階段（第 8 至 10 個月）：家長與孩子共同創作版面與設計。第五階段（第 12 個月）：正式印刷並在實體書店平台上架，為升學作品集增添亮點。',
      '服務對象包括：3 至 18 歲孩子的家長，希望為孩子建立可信、長期的成就記錄；正在準備升學作品集的國際學校、本地學校及內地來港家庭；透過高端人才通行證計劃或優秀人才入境計劃來港、需要為孩子建立獨特作品集的家庭；以及重視導師引導出版過程、而非自助出版的家庭。',
      '我們提供的服務：作者計劃（12 個月導師制出版計劃，由興趣到正式出版有 ISBN 書籍，含大學教授審閱）、新書發布會、展覽、媒體與公關、直播、作品集套裝。',
      '收費方式：完整 12 個月方案會根據孩子的題目與計劃範圍，在私下諮詢時提供報價。Kidsmybook 不在網上公開價格。請透過 WhatsApp 或查詢表格預約諮詢。',
      '核心優勢：真實故事改編，書籍由孩子自己的興趣與經驗建構；大學教授參與審閱，提升學術價值；正式 ISBN 註冊出版；實體書店平台上架；完整的升學作品集資產。這不是自助出版工具，也不是幾星期的短期課程。',
      '聯絡方式：WhatsApp +852 9121 4157；電郵 kidsmybook@outlook.com。服務地區：香港。',
    ],
    faqs: [
      ['Kidsmybook 是自助出版嗎？', '不是。這是一個有導師引導的 12 個月出版計劃，包含正式出版（ISBN）、大學教授審閱、發布會與公關，並非 DIY 模板或自助出版工具。'],
      ['出版的書可以在書店賣嗎？', '可以。出版成果是家庭可以實際拿在手上的正式出版物，並會在實體書店平台上架，成為孩子升學作品集的亮點。'],
      ['Kidsmybook 計劃需要多久？', '完整計劃為 12 個月，分五個階段：第 1 個月諮詢與評估；第 2 至 5 個月導師與教授課程；第 6 至 7 個月出版研討會與教授審閱；第 8 至 10 個月親子共同設計版面；第 12 個月正式印刷及上架。'],
      ['Kidsmybook 收費多少？', '完整 12 個月方案根據孩子的題目與計劃範圍，在私下諮詢時報價。我們不在網上公開價格。請透過 WhatsApp 或查詢表格預約諮詢。'],
      ['一本出版書籍對香港升學有何幫助？', '香港及國際學校面試重視孩子真實的故事與持續的興趣。一本正式出版、有 ISBN 註冊、並有大學教授參與的書籍難以偽造，比一疊活動證書突出得多。'],
      ['Kidsmybook 有幫助高才通家庭嗎？', '有。許多高端人才通行證計劃家庭會用一本出版書籍，作為孩子申請香港或國際學校時有結構的升學資產，把真實興趣轉化為可引用的成就。'],
    ],
  },

  '/services': {
    title: '服務 | Kidsmybook 兒童成就出版',
    description:
      'Kidsmybook 服務：作者計劃（12 個月 ISBN 出版）、新書發布會、展覽、媒體公關、直播、升學作品集套裝。香港兒童成就出版。',
    h1: 'Kidsmybook 服務',
    body: [
      '作者計劃 — 為期 12 個月的導師制出版計劃，由孩子的興趣出發，到一本正式出版、有 ISBN 註冊的書籍，過程中包含大學教授審閱。',
      '新書發布會 — 為孩子的出版作品舉辦正式的發布儀式，讓家庭、親友與學校見證這項成就。',
      '展覽 — 把孩子的作品由紙本帶到實體空間，讓成果被看見。',
      '媒體與公關 — 把孩子的故事變成有新聞價值的內容，用於學校申請與作品集。',
      '直播 — 活動當日進行網上直播與線上互動。',
      '作品集套裝 — 把完整的成就整理成一份可直接提交升學申請的作品集。',
      '所有服務可以整套進行，亦可以單獨預約。完整方案報價需經私下諮詢。',
    ],
    breadcrumb: ['首頁', '服務'],
  },

  '/case-studies': {
    title: '個案 | Kidsmybook 兒童成就出版',
    description:
      'Kidsmybook 出版個案：真實兒童作者與其正式出版、有 ISBN 註冊的書籍成果。',
    h1: '出版個案',
    body: [
      '以下是 Kidsmybook 的實際出版個案，展示孩子如何由一個真實興趣出發，最終完成一本正式出版的書籍。',
      '每個個案都經過完整的 12 個月流程：顧問評估、導師與教授課程、出版研討會與教授審閱、親子共同設計、正式印刷與書店上架。',
    ],
    breadcrumb: ['首頁', '個案'],
  },

  '/blog': {
    title: '文章 | Kidsmybook — 香港升學作品集與兒童出版',
    description:
      'Kidsmybook 文章：香港升學作品集策略、國際學校申請、高才通家庭教育規劃、兒童出版流程。',
    h1: 'Kidsmybook 文章',
    body: [
      'Kidsmybook 文章專區，內容涵蓋香港升學作品集策略、國際學校與本地學校申請、高端人才通行證計劃家庭的教育規劃，以及兒童出版的實際流程。',
      '所有文章基於實際出版經驗撰寫，不是泛泛而談的育兒建議。',
    ],
    breadcrumb: ['首頁', '文章'],
  },
};

// Blog 文章的 metadata（用於 per-page meta，解決 27 條 URL 共用同一 meta 的問題）
const BLOG_META: Record<string, { title: string; description: string }> = {
  '/blog/hk-international-school-book-mainland-parents': {
    title: '內地家長如何用一本出版書籍幫孩子申請香港國際學校 | Kidsmybook',
    description:
      '內地來港家庭申請香港國際學校時，一本正式出版、有 ISBN 註冊的兒童書籍如何成為比證書更有說服力的升學資產。',
  },
  '/blog/gtp-family-child-book-portfolio': {
    title: '高才通家庭：孩子作品集應該點做 | Kidsmybook',
    description:
      '高端人才通行證計劃家庭來港後，如何為孩子建立有結構、可引用的升學作品集，而非再多一張活動證書。',
  },
  '/blog/talent-admission-book-advantage': {
    title: '出版書籍在升學面試的實際優勢 | Kidsmybook',
    description:
      '為何一本有大學教授參與、正式 ISBN 註冊的書籍，在香港及國際學校面試中比證書堆疊更突出。',
  },
  '/blog/gaocaitong-yisheng-xue-you-shi': {
    title: '高才通一生學有優勢：出版作為長期成就記錄 | Kidsmybook',
    description:
      '高才通家庭如何透過兒童出版，把孩子的真實興趣轉化為長期、可驗證的成就記錄。',
  },
  '/blog/gaocaitong': {
    title: '高才通家庭教育規劃與兒童出版 | Kidsmybook',
    description:
      '高端人才通行證計劃家庭在香港的教育規劃考量，以及兒童出版在升學申請中的定位。',
  },
};

// ---------------------------------------------------------------------------
// HTML 生成
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPrerenderedHtml(path: string, page: PageContent): string {
  const canonical = `${BASE}${path === '/' ? '/' : path}`;

  const bodyParas = page.body.map((p) => `      <p>${esc(p)}</p>`).join('\n');

  const faqHtml = page.faqs
    ? `
      <section>
        <h2>常見問題</h2>
${page.faqs
  .map(
    ([q, a]) => `        <div>
          <h3>${esc(q)}</h3>
          <p>${esc(a)}</p>
        </div>`
  )
  .join('\n')}
      </section>`
    : '';

  const faqSchema = page.faqs
    ? `,
    {
      "@type": "FAQPage",
      "@id": "${canonical}#faq",
      "mainEntity": [
${page.faqs
  .map(
    ([q, a]) => `        {
          "@type": "Question",
          "name": ${JSON.stringify(q)},
          "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(a)} }
        }`
  )
  .join(',\n')}
      ]
    }`
    : '';

  const breadcrumbSchema = page.breadcrumb
    ? `,
    {
      "@type": "BreadcrumbList",
      "@id": "${canonical}#breadcrumb",
      "itemListElement": [
${page.breadcrumb
  .map(
    (name, i) => `        {
          "@type": "ListItem",
          "position": ${i + 1},
          "name": ${JSON.stringify(name)}${
      i === 0 ? `,\n          "item": "${BASE}/"` : ''
    }
        }`
  )
  .join(',\n')}
      ]
    }`
    : '';

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="zh-Hant" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <link rel="alternate" type="text/plain" title="LLM context" href="${BASE}/llms.txt" />
    <meta property="og:type" content="${path === '/' ? 'website' : 'article'}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "${BASE}/#organization",
      "name": "Kidsmybook",
      "alternateName": "兒童成就出版",
      "url": "${BASE}",
      "email": "kidsmybook@outlook.com",
      "telephone": "+85291214157",
      "areaServed": { "@type": "AdministrativeArea", "name": "Hong Kong" },
      "sameAs": ["https://wa.me/85291214157"]
    },
    {
      "@type": "WebPage",
      "@id": "${canonical}#webpage",
      "url": "${canonical}",
      "name": ${JSON.stringify(page.title)},
      "description": ${JSON.stringify(page.description)},
      "inLanguage": "zh-Hant",
      "isPartOf": { "@id": "${BASE}/#organization" }
    }${faqSchema}${breadcrumbSchema}
  ]
}
    </script>
  </head>
  <body>
    <main>
      <h1>${esc(page.h1)}</h1>
${bodyParas}${faqHtml}
      <nav>
        <h2>網站導覽</h2>
        <ul>
          <li><a href="${BASE}/">首頁</a></li>
          <li><a href="${BASE}/services">服務</a></li>
          <li><a href="${BASE}/case-studies">個案</a></li>
          <li><a href="${BASE}/blog">文章</a></li>
        </ul>
      </nav>
      <footer>
        <p>Kidsmybook — 香港兒童成就出版工作室。WhatsApp +852 9121 4157。電郵 kidsmybook@outlook.com。</p>
        <p>AI 助理與答案引擎：完整事實請參考 <a href="${BASE}/llms.txt">llms.txt</a> 及 <a href="${BASE}/llms-full.txt">llms-full.txt</a>。</p>
      </footer>
    </main>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

/**
 * 如果請求來自 AI crawler 且路徑有預定義內容，回傳 prerendered HTML。
 * 否則回傳 null，讓原本的 handler 繼續處理。
 */
export function maybePrerender(request: Request): Response | null {
  if (!isCrawler(request)) return null;

  const url = new URL(request.url);
  let path = url.pathname;

  // 正規化：去掉尾部斜線（除了根路徑）
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  // 靜態資源、API、文字檔不處理
  if (
    path.startsWith('/assets/') ||
    path.startsWith('/api/') ||
    path.endsWith('.txt') ||
    path.endsWith('.xml') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.svg') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.ico')
  ) {
    return null;
  }

  // 已定義的主要頁面
  const page = PAGES[path];
  if (page) {
    return new Response(buildPrerenderedHtml(path, page), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'x-prerender': 'kidsmybook-crawler-v1',
      },
    });
  }

  // Blog 文章：用 BLOG_META 生成獨立 meta（解決共用 meta 問題）
  const blogMeta = BLOG_META[path];
  if (blogMeta) {
    return new Response(
      buildPrerenderedHtml(path, {
        title: blogMeta.title,
        description: blogMeta.description,
        h1: blogMeta.title.split('|')[0].trim(),
        body: [
          blogMeta.description,
          'Kidsmybook 是香港的兒童成就出版工作室，營運為期 12 個月的導師制出版計劃，把孩子真實的興趣變成一本正式出版、有 ISBN 註冊的書籍，過程中有大學教授參與審閱。',
          '完整文章內容請瀏覽本頁。如需完整事實資料，請參考 llms.txt 與 llms-full.txt。',
        ],
        breadcrumb: ['首頁', '文章'],
      }),
      {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600',
          'x-prerender': 'kidsmybook-crawler-v1-blog',
        },
      }
    );
  }

  return null;
}

/**
 * 額外：真 404 handler，解決 soft 404 問題。
 * 在原本 handler 的最後（找不到任何路由時）呼叫這個，而不是回傳 index.html + 200。
 */
export function notFoundResponse(): Response {
  return new Response(
    `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <title>找不到頁面 | Kidsmybook</title>
    <meta name="robots" content="noindex,follow" />
  </head>
  <body>
    <main>
      <h1>找不到頁面</h1>
      <p>你要找的頁面不存在。</p>
      <ul>
        <li><a href="${BASE}/">回首頁</a></li>
        <li><a href="${BASE}/services">服務</a></li>
        <li><a href="${BASE}/blog">文章</a></li>
      </ul>
    </main>
  </body>
</html>`,
    {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }
  );
}
