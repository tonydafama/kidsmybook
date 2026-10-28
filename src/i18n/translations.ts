import type { Locale } from "./locale";
import {
  ABOUT_EN,
  ABOUT_HANS,
  EXPLORE_EN,
  EXPLORE_HANS,
  FAQ_EN,
  FAQ_HANS,
  FAQ_PAGE_EN,
  FAQ_PAGE_HANS,
  CHECKLIST_EN,
  CHECKLIST_HANS,
  GAOCAI_EN,
  GAOCAI_HANS,
  SHENGXIAO_EN,
  SHENGXIAO_HANS,
  SHENGZHONG_EN,
  SHENGZHONG_HANS,
  PORTFOLIO_EN,
  PORTFOLIO_HANS,
  PROGRAMME_EN,
  PROGRAMME_HANS,
  XINGQU_EN,
  XINGQU_HANS,
  SHUDIAN_EN,
  SHUDIAN_HANS,
} from "./landing-extra";
import { ABOUT_ZH, BLOG_INDEX_ZH, CHECKLIST_ZH, EXPLORE_ZH, FAQ_PAGE_ZH, GAOCAI_ZH, PORTFOLIO_ZH, PROGRAMME_ZH, SHENGXIAO_ZH, SHENGZHONG_ZH, SHUDIAN_ZH, XINGQU_ZH, type HubCopy } from "../seo/landing-zh";
import { WA_QUOTE_EN, WA_QUOTE_HANS, WA_QUOTE_ZH } from "../lib/contact";
import { HOME_DESCRIPTION_ZH, HOME_FAQ, HOME_TITLE_ZH } from "../seo/meta";

export type ServiceSlug =
  | "author-programme"
  | "book-launch"
  | "exhibition"
  | "media-pr"
  | "live-streaming"
  | "portfolio-package";

export type AgeRangeKey = "3-6" | "7-10" | "10+";

export type JourneyStepCopy = {
  title: string;
  en: string;
  desc: string;
  deliverable: string;
};

export type ServiceCopy = {
  title: string;
  desc: string;
  price: string;
  detail: string;
  audience: string[];
  process: string[];
};

export type TestimonialCopy = {
  quote: string;
  cite: string;
  tag: string;
  initial: string;
};

export type Translations = {
  brandTitle: string;
  brandEn: string;
  nav: {
    main: string;
    aiBook: string;
    services: string;
    caseStudies: string;
    blog: string;
    whatsapp: string;
    intake: string;
    programme: string;
    faq: string;
    portfolio: string;
    about: string;
  };
  blog: {
    kicker: string;
    backToBlog: string;
    indexTitle: string;
    indexDesc: string;
    askQuote: string;
  };
  hero: {
    eyebrow: string;
    lead: string;
    generateCover: string;
    bookConsult: string;
    featuredAlt: string;
    badge: string;
    statLine: string;
  };
  aiLab: {
    eyebrow: string;
    title: string;
    lede: string;
    formKicker: string;
    formTitle: string;
    childName: string;
    childNamePlaceholder: string;
    interests: string;
    interestsPlaceholder: string;
    age: string;
    ageSelect: string;
    personality: string;
    personalityPlaceholder: string;
    personalityChips: string[];
    waHandshakeMessage: (name: string, topic: string, url: string) => string;
    generateBtn: string;
    generating: string;
    generatePhase: string;
    aiTimingHint: string;
    previewKicker: string;
    dragHintIdle: string;
    dragHintReady: string;
    backHome: string;
    successTitle: string;
    successDesc: string;
    stickyHint: string;
    getLinkBtn: string;
    previewReady: string;
    previewSent: string;
    previewSendCopy: string;
    previewSendEnd: string;
    previewLinkLabel: string;
    copyLink: string;
    copiedLink: string;
    notifyStudio: string;
    coverBadge: string;
    coverBrand: string;
    defaultBackBlurb: string;
    defaultProfHint: string;
    errNameTopic: string;
    aiFallbackNotice: (message: string) => string;
    consultSummaryHeader: string;
    consultChild: string;
    consultTopic: string;
    consultTitle: string;
    consultProfessor: string;
    consultAge: string;
    consultPersonality: string;
    consultSendNote: string;
    previewLinkInMessage: string;
    ageRanges: Record<AgeRangeKey, string>;
  };
  services: {
    kicker: string;
    title: string;
    intro: string;
    privateQuote: string;
    suitableFor: string;
    process: string;
    backToServices: string;
    indexHeading: string;
    indexMeta: string;
    detailEyebrow: string;
    items: Record<ServiceSlug, ServiceCopy>;
  };
  caseSection: {
    kicker: string;
    title: string;
    body: string;
    statLine: string;
    proofLabel: string;
  };
  journey: {
    kicker: string;
    title: string;
    intro: string;
    deliverablePrefix: string;
    steps: JourneyStepCopy[];
  };
  voices: {
    kicker: string;
    title: string;
    intro: string;
    items: TestimonialCopy[];
  };
  finalCta: {
    title: string;
    copy: string;
    generateCover: string;
  };
  caseStudy: {
    privacyName: string;
    realName: string;
    showName: string;
    hideName: string;
    bookTitle: string;
    meta: string;
    overview: string;
    topic: string;
    servicesUsed: string;
    format: string;
    storyTitle: string;
    storyP1: string;
    storyP2: string;
    storyP3: string;
    gallery: string;
    galleryItems: string[];
    results: string;
    resultItems: string[];
    ctaTitle: string;
  };
  caseIndex: {
    title: string;
    hilaryTitle: string;
    hilaryDesc: string;
    futureTitle: string;
    futureDesc: string;
  };
  notFound: {
    title: string;
    body: (path: string) => string;
    backHome: string;
  };
  faq: {
    kicker: string;
    title: string;
    items: Array<{ q: string; a: string }>;
  };
  explore: typeof EXPLORE_ZH;
  programmePage: typeof PROGRAMME_ZH;
  faqPage: typeof FAQ_PAGE_ZH;
  portfolioPage: typeof PORTFOLIO_ZH;
  checklistPage: typeof CHECKLIST_ZH;
  gaocaiPage: HubCopy;
  xingquPage: HubCopy;
  shengxiaoPage: HubCopy;
  shengzhongPage: HubCopy;
  shudianPage: HubCopy;
  aboutPage: typeof ABOUT_ZH;
  seo: {
    homeTitle: string;
    homeDesc: string;
    servicesTitle: string;
    servicesDesc: string;
    caseStudiesTitle: string;
    caseStudiesDesc: string;
    hilaryTitle: string;
    hilaryDesc: string;
    serviceDetailTitle: (name: string) => string;
    serviceDetailDesc: (desc: string, detail: string) => string;
  };
  whatsapp: {
    home: string;
    service: (title: string) => string;
    floating: string;
    blog: string;
    blogPost: (title: string) => string;
    caseStudy: string;
  };
  footer: {
    studio: string;
    privacy: string;
    quote: string;
    about: string;
  };
};

const zhHant: Translations = {
  brandTitle: "小朋友出書，走上實體書店上架",
  brandEn: "Turn your child's passion into a published achievement.",
  nav: {
    main: "主選單",
    aiBook: "AI Book",
    services: "服務",
    caseStudies: "個案",
    blog: "Blog",
    whatsapp: "WhatsApp: @kidsmybook",
    intake: "升學諮詢",
    programme: "出書計劃",
    faq: "常見問題",
    portfolio: "升學作品集",
    about: "關於我們",
  },
  blog: {
    kicker: "Kidsmybook 博客",
    backToBlog: "← 返博客",
    indexTitle: BLOG_INDEX_ZH.title,
    indexDesc: BLOG_INDEX_ZH.description,
    askQuote: BLOG_INDEX_ZH.askQuote,
  },
  hero: {
    eyebrow: "香港 · 兒童出書 · 實體書店上架",
    lead: "12 個月導師制：正式印刷，再按題材走香港實體書店上架／發行路徑。升學作品集係之後可以引用嘅成果。",
    generateCover: "生成封面",
    bookConsult: "預約諮詢",
    featuredAlt: "Hilary 新書發布會",
    badge: "Hilary · 8 歲",
    statLine: "一年成書 · 發布會 · 媒體報導 · 3,569 線上觀看",
  },
  aiLab: {
    eyebrow: "Academic Press · Young Scholar Series",
    title: "生成孩子專屬的青年學者學術專著封面",
    lede: "",
    formKicker: "專著出版資料",
    formTitle: "孩子與題材",
    childName: "小作者姓名",
    childNamePlaceholder: "例如：Emma 或 希賢",
    interests: "興趣題材",
    interestsPlaceholder: "例如：蝴蝶觀察、深海生物、宇宙太空、機械結構",
    age: "年齡階段（選填）",
    ageSelect: "請選擇",
    personality: "孩子特質 / 性格（選填）",
    personalityPlaceholder: "例如：好奇專注、喜愛探索、觀察細膩",
    personalityChips: ["好奇心強", "觀察力敏銳", "富有創意", "邏輯清晰", "充滿熱情", "善於表達"],
    waHandshakeMessage: (name, topic, url) => {
      const who = name ? `${name} 嘅題材` : "呢個題材";
      const subject = topic ? `${who}「${topic}」` : who;
      const link = url ? `\n封面預覽：${url}` : "";
      return `你好，我想問顧問：${subject}適唔適合出書。請私人報價。${link}`;
    },
    generateBtn: "生成 3D 專屬封面",
    generating: "正在繪製學者級封面…",
    generatePhase: "正在繪製專業學者級封面…",
    aiTimingHint: "AI 學術繪製約需 15–30 秒。",
    previewKicker: "3D 精裝學術專著預覽",
    dragHintIdle: "生成後在此預覽 3D 學術專著",
    dragHintReady: "拖曳可旋轉 · 查看封底學者評語與書脊",
    backHome: "← 返回首頁",
    successTitle: "封面已經生成",
    successDesc: "預覽就喺右邊。下一步問顧問：呢個題材適唔適合出一本 ISBN 童書。報價私人，網站唔公開價目。",
    stickyHint: "問顧問呢個題材適唔適合出書",
    getLinkBtn: "WhatsApp 問顧問：呢個題材適唔適合出書",
    previewReady: "專著預覽已備妥",
    previewSent: "專著預覽已交給顧問發送",
    previewSendCopy: "我們會把連結發到",
    previewSendEnd: "。",
    previewLinkLabel: "預覽連結",
    copyLink: "複製連結",
    copiedLink: "已複製",
    notifyStudio: "尚未收到？通知顧問",
    coverBadge: "★ 大學名師指導加持 · 香港知名書店上架 ★",
    coverBrand: "Kidsmybook Academic Publishing · Hong Kong",
    defaultBackBlurb:
      "【學術專著審定與出版】\nKidsmybook 專為孩子打造具備國際出版規範的正式專著。\n由大學教授學術指導、正式登記國際標準書號 (ISBN)、香港實體書店公開發行。\n請於左側填寫小作者姓名與興趣題材，立即預覽專屬封面。",
    defaultProfHint: "請於左側填寫資料 · 即時預覽專屬 3D 封面",
    errNameTopic: "請填寫小作者姓名與興趣題材。",
    aiFallbackNotice: (message) => `已改為學術版型示意預覽（${message}）`,
    consultSummaryHeader: "【Kidsmybook 專著封面預覽】",
    consultChild: "小作者",
    consultTopic: "興趣題材",
    consultTitle: "專著書名",
    consultProfessor: "聯名指導教授",
    consultAge: "年齡階段",
    consultPersonality: "孩子特質",
    consultSendNote: "請把下方預覽連結發送給家長。",
    previewLinkInMessage: "預覽連結",
    ageRanges: { "3-6": "3–6 歲", "7-10": "7–10 歲", "10+": "10 歲以上" },
  },
  services: {
    kicker: "服務",
    title: "我們做什麼",
    intro: "六項合成一條全案，亦可單項諮詢。私人報價。",
    privateQuote: "私人報價",
    suitableFor: "適合對象",
    process: "服務流程",
    backToServices: "返回服務",
    indexHeading: "六項兒童成就服務",
    indexMeta: "出版計劃、新書發布會、展覽、媒體公關、直播同升學作品集。英文服務名：Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。私人報價。",
    detailEyebrow: "Service Detail",
    items: {
      "author-programme": {
        title: "Author Programme",
        desc: "由興趣出發，1 對 1 指導完成正式出版成果。",
        price: "私人報價",
        detail: "包含出版指導、雙語支援、線上音頻整合與 ISBN 出版選項。",
        audience: ["孩子有明確興趣主題", "家庭希望建立長期成果", "需要雙語學習輸出"],
        process: ["Discovery 訪談", "內容創作引導", "編輯與設計", "成書與交付"],
      },
      "book-launch": {
        title: "Book Launch Event",
        desc: "為孩子作品打造有儀式感的新書發布會。",
        price: "私人報價",
        detail: "涵蓋場地策劃、流程設計、嘉賓邀請、現場佈置與攝影紀錄。",
        audience: ["孩子準備公開發表作品", "家庭重視儀式感與社交影響", "需要完整活動執行"],
        process: ["活動定位", "流程與嘉賓規劃", "現場執行", "活動後回顧素材交付"],
      },
      exhibition: {
        title: "Exhibition",
        desc: "讓創作被看見，從作品到空間完整呈現。",
        price: "私人報價",
        detail: "支援攝影展/插畫展、展板設計、場地協調與開幕活動規劃。",
        audience: ["孩子有系列作品", "希望成果被更多人看見", "需要展覽型履歷亮點"],
        process: ["展覽主題策展", "展板與空間設計", "場地協調", "開幕與導覽"],
      },
      "media-pr": {
        title: "Media & PR",
        desc: "把孩子故事轉化成可被報導的內容。",
        price: "私人報價",
        detail: "包括新聞稿、媒體邀請、報導協調與線上傳播策略。",
        audience: ["希望建立外部公信力", "需要媒體曝光", "準備學校/升學作品敘事"],
        process: ["媒體角度定位", "新聞稿與素材包", "媒體邀請溝通", "報導追蹤整理"],
      },
      "live-streaming": {
        title: "Live Streaming",
        desc: "活動當日即時直播與線上互動，擴大影響力。",
        price: "私人報價",
        detail: "提供直播導播、即時分享、互動監看與永久記錄素材。",
        audience: ["有外地親友需要線上參與", "重視活動擴散", "需要可重播紀錄"],
        process: ["直播規劃", "現場導播", "線上互動監看", "回放與剪輯交付"],
      },
      "portfolio-package": {
        title: "Portfolio Package",
        desc: "把完整成果整理成升學可用的作品集。",
        price: "私人報價",
        detail: "整合出版、活動、媒體素材，支援多格式輸出。",
        audience: ["有升學申請需求", "需要完整成就證據", "希望統一對外展示素材"],
        process: ["素材整合", "敘事與版面編排", "多格式輸出", "申請版本微調"],
      },
    },
  },
  caseSection: {
    kicker: "Case",
    title: "Hilary",
    body: "由觀察興趣到正式出版，再延伸發布會與媒體，成為可放進升學檔案的成果。",
    statLine: "一年成書 · 發布會 · 媒體報導 · 3,569 線上觀看",
    proofLabel: "新書發布會",
  },
  journey: {
    kicker: "Pathway",
    title: "從興趣到被看見",
    intro: "同一團隊走完六步，典型週期約 9–12 個月。每一步都有可交付的成果。",
    deliverablePrefix: "交付 · ",
    steps: [
      { title: "發現興趣", en: "Discover", desc: "鎖定真正願意投入的題材。", deliverable: "興趣地圖" },
      { title: "規劃項目", en: "Plan", desc: "把熱愛變成可執行的里程碑。", deliverable: "項目藍圖" },
      { title: "創作內容", en: "Create", desc: "共創文稿，保留孩子的聲音。", deliverable: "文稿與素材" },
      { title: "設計出版", en: "Publish", desc: "裝幀成正式出版物。", deliverable: "成書 · ISBN" },
      { title: "發布展覽", en: "Launch", desc: "發布會與展覽，讓成果被看見。", deliverable: "活動紀錄" },
      { title: "媒體傳播", en: "Amplify", desc: "報導與作品集，形成可引用的證據。", deliverable: "剪報 · Portfolio" },
    ],
  },
  voices: {
    kicker: "Voices",
    title: "家長怎麼說",
    intro: "不是廣告稿。有人講英文，有人講粵語，有人講普通話——都是家長自己的話。",
    items: [
      {
        quote:
          "We thought it would just be a keepsake. Then the launch happened, a few media pieces came out, and our daughter started talking about the book as her own work. The school later asked us to put it in her portfolio.",
        cite: "國際學校家長 · Year 4",
        tag: "Portfolio",
        initial: "A",
      },
      {
        quote:
          "本来只想给孩子留一本自己的书。没想到从选题到成书、发布会都有人带着走，孩子第一次觉得自己做的事情被认真对待。我们后来把这本书放进了升学资料里。",
        cite: "内地家长 · 孩子就读香港小学",
        tag: "升学档案",
        initial: "周",
      },
      {
        quote:
          "見到其他小朋友出書一直都覺得遙不可及。直至而家擁有一本屬於自己嘅書，唔單只係做 portfolio，仲係小朋友一個成就嘅肯定。佢將來大個都可以攞返出嚟話自己出過一本書，書店可以買到。見到佢同同學分享嗰份自信，一切都值得！",
        cite: "小四家長 · 九龍",
        tag: "成書發表",
        initial: "陳",
      },
      {
        quote:
          "有導師、顧問、大學教授一齊去幫忙寫呢本書，攞起成品我好有信心。見到喺書店嗰度可以買到自己嘅書，大人小朋友都充滿自信。升學面試同報學校嗰陣成個 Portfolio 清楚有說服力好多。",
        cite: "國際學校家長 · 小三",
        tag: "全案",
        initial: "林",
      },
    ],
  },
  finalCta: {
    title: "開始諮詢",
    copy: "WhatsApp（@kidsmybook）或填表預約。私人報價。",
    generateCover: "生成封面",
  },
  caseStudy: {
    privacyName: "小作者 X",
    realName: "Hilary",
    showName: "顯示原名",
    hideName: "隱私模式",
    bookTitle: "《蝴蝶雙語圖鑑》",
    meta: "Age at publication: 8 · Duration: 1 year",
    overview: "Project Overview",
    topic: "Topic: 蝴蝶生態與雙語科普",
    servicesUsed: "Services: 出版計劃 + 新書發布會 + 媒體公關 + 直播",
    format: "Format: 中英雙語圖鑑 + 活動紀錄素材",
    storyTitle: "The Story",
    storyP1: "孩子由日常觀察蝴蝶出發，逐步建立研究習慣，完成圖像與文字內容，最終成功出版並公開發表。",
    storyP2: "過程中克服了資料整理與口語表達挑戰，學會用作品向世界分享自己的興趣與成長。",
    storyP3: "這是目前公開具名的個案：Hilary，出版時八歲，約一年完成。成品是中英雙語圖鑑，其後有新書發布會、媒體公關與活動直播；線上觀看 3,569 次。家庭可以將這份成果放進升學檔案。",
    gallery: "Gallery",
    galleryItems: ["Book Spreads", "Event Photos", "Exhibition Photos", "Media Coverage Screenshots"],
    results: "Results",
    resultItems: [
      "Event attendance：現場家庭與嘉賓參與",
      "Online views：3,569+",
      "Parent testimonial：孩子更有自信，亦更主動分享成果",
    ],
    ctaTitle: "Start your child's publishing journey",
  },
  caseIndex: {
    title: "兒童成就出版個案",
    hilaryTitle: "hilary-butterfly-guide",
    hilaryDesc: "Hilary蝴蝶圖鑑案例（可切換隱私模式）",
    futureTitle: "[future cases]",
    futureDesc: "預留後續案例頁模板，沿用同一結構。",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `你目前打開的是 \`${path}\`。此頁已保留，下一步可按同模板擴充內容。`,
    backHome: "返回首頁",
  },
  faq: {
    kicker: "FAQ",
    title: "常見問題",
    items: HOME_FAQ,
  },
  explore: EXPLORE_ZH,
  programmePage: PROGRAMME_ZH,
  faqPage: FAQ_PAGE_ZH,
  portfolioPage: PORTFOLIO_ZH,
  checklistPage: CHECKLIST_ZH,
  gaocaiPage: GAOCAI_ZH,
  xingquPage: XINGQU_ZH,
  shengxiaoPage: SHENGXIAO_ZH,
  shengzhongPage: SHENGZHONG_ZH,
  shudianPage: SHUDIAN_ZH,
  aboutPage: ABOUT_ZH,
  seo: {
    homeTitle: HOME_TITLE_ZH,
    homeDesc: HOME_DESCRIPTION_ZH,
    servicesTitle: "服務｜Kidsmybook 六項兒童成就出版",
    servicesDesc:
      "出版計劃、新書發布會、展覽、媒體公關、直播同升學作品集，可全案或單項諮詢。私人報價，WhatsApp。Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
    caseStudiesTitle: "個案｜Kidsmybook 兒童成就出版案例",
    caseStudiesDesc: "目前公開具名個案係 Hilary《蝴蝶雙語圖鑑》：由興趣到正式出版、發布會同媒體紀錄。私人報價，WhatsApp 查詢。",
    hilaryTitle: "Hilary蝴蝶圖鑑案例｜Kidsmybook",
    hilaryDesc: "8 歲孩子從興趣出發完成雙語出版，並延伸發布會、展覽與媒體曝光。",
    serviceDetailTitle: (name) => `${name}｜Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: WA_QUOTE_ZH,
    service: (title) => `你好，我想了解 ${title} 服務。`,
    floating: WA_QUOTE_ZH,
    blog: WA_QUOTE_ZH,
    blogPost: (title) => `想了解 Kidsmybook 兒童出版計劃：${title}`,
    caseStudy: "Start your child's publishing journey",
  },
  footer: {
    studio: "Kidsmybook · 香港兒童成就出版工作室",
    privacy: "查詢資料只用於回覆你。未經同意，不會公開小朋友的姓名或學校。",
    quote: "私人報價，於諮詢時提供。",
    about: "關於我們",
  },
};

const zhHans: Translations = {
  ...zhHant,
  brandTitle: "小朋友出书，走上实体书店上架",
  brandEn: "Turn your child's passion into a published achievement.",
  nav: {
    ...zhHant.nav,
    main: "主菜单",
    blog: "Blog",
    programme: "出书计划",
    faq: "常见问题",
    portfolio: "升学作品集",
    about: "关于我们",
    services: "服务",
    caseStudies: "个案",
  },
  blog: {
    kicker: "Kidsmybook 博客",
    backToBlog: "← 返回博客",
    indexTitle: "香港升学作品集・升小升中・ISBN 童书",
    indexDesc:
      "香港家长：升小学面试、升小面试班和 ISBN 出版作品集、升中 DSS／直资 portfolio，以及导师制 ISBN 出版怎样成为可引用的亮点。私人报价，不保证录取。",
    askQuote: "WhatsApp 问价",
  },
  hero: {
    ...zhHant.hero,
    lead: "12 个月导师制：正式印刷，再按题材走香港实体书店上架／发行路径。升学作品集是之后可以引用的成果。",
    generateCover: "生成封面",
    bookConsult: "预约咨询",
    featuredAlt: "Hilary 新书发布会",
    badge: "Hilary · 8 岁",
    statLine: "一年成书 · 发布会 · 媒体报道 · 3,569 线上观看",
  },
  aiLab: {
    ...zhHant.aiLab,
    title: "生成孩子专属的青年学者学术专著封面",
    lede: "",
    formKicker: "专著出版资料",
    formTitle: "孩子与题材",
    childName: "小作者姓名",
    childNamePlaceholder: "例如：Emma 或 希贤",
    interests: "兴趣题材",
    interestsPlaceholder: "例如：蝴蝶观察、深海生物、宇宙太空、机械结构",
    age: "年龄阶段（选填）",
    ageSelect: "请选择",
    personality: "孩子特质 / 性格（选填）",
    personalityPlaceholder: "例如：好奇专注、喜爱探索、观察细腻",
    personalityChips: ["好奇心强", "观察力敏锐", "富有创意", "逻辑清晰", "充满热情", "善于表达"],
    waHandshakeMessage: (name, topic, url) => {
      const who = name ? `${name} 的题材` : "这个题材";
      const subject = topic ? `${who}「${topic}」` : who;
      const link = url ? `\n封面预览：${url}` : "";
      return `你好，我想问顾问：${subject}适不适合出书。请私人报价。${link}`;
    },
    generateBtn: "生成 3D 专属封面",
    generating: "正在绘制学者级封面…",
    generatePhase: "正在绘制专业学者级封面…",
    aiTimingHint: "AI 学术绘制约需 15–30 秒。",
    previewKicker: "3D 精装学术专著预览",
    dragHintIdle: "生成后在此预览 3D 学术专著",
    dragHintReady: "拖曳可旋转 · 查看封底学者评语与书脊",
    backHome: "← 返回首页",
    successTitle: "封面已经生成",
    successDesc: "预览就在右边。下一步问顾问：这个题材适不适合出一本 ISBN 童书。报价私人，网站不公开价目。",
    stickyHint: "问顾问这个题材适不适合出书",
    getLinkBtn: "WhatsApp 问顾问：这个题材适不适合出书",
    previewReady: "专著预览已备妥",
    previewSent: "专著预览已交给顾问发送",
    previewSendCopy: "我们会把链接发到",
    previewSendEnd: "。",
    previewLinkLabel: "预览链接",
    copyLink: "复制链接",
    copiedLink: "已复制",
    notifyStudio: "尚未收到？通知顾问",
    coverBadge: "★ 大学名师指导加持 · 香港知名书店上架 ★",
    defaultBackBlurb:
      "【学术专著审定与出版】\nKidsmybook 专为孩子打造具备国际出版规范的正式专著。\n由大学教授学术指导、正式登记国际标准书号 (ISBN)、香港实体书店公开发行。\n请于左侧填写小作者姓名与兴趣题材，立即预览专属封面。",
    defaultProfHint: "请于左侧填写资料 · 即时预览专属 3D 封面",
    errNameTopic: "请填写小作者姓名与兴趣题材。",
    aiFallbackNotice: (message) => `已改为学术版型示意预览（${message}）`,
    consultSummaryHeader: "【Kidsmybook 专著封面预览】",
    consultChild: "小作者",
    consultTopic: "兴趣题材",
    consultTitle: "专著名",
    consultProfessor: "联名指导教授",
    consultAge: "年龄阶段",
    consultPersonality: "孩子特质",
    consultSendNote: "请把下方预览链接发送给家长。",
    previewLinkInMessage: "预览链接",
    ageRanges: { "3-6": "3–6 岁", "7-10": "7–10 岁", "10+": "10 岁以上" },
  },
  services: {
    ...zhHant.services,
    kicker: "服务",
    title: "我们做什么",
    intro: "六项合成一条全案，亦可单项咨询。私人报价。",
    privateQuote: "私人报价",
    suitableFor: "适合对象",
    process: "服务流程",
    backToServices: "返回服务",
    indexHeading: "六项儿童成就服务",
    indexMeta: "出版计划、新书发布会、展览、媒体公关、直播和升学作品集。英文服务名：Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。私人报价。",
    items: {
      "author-programme": {
        title: "Author Programme",
        desc: "由兴趣出发，1 对 1 指导完成正式出版成果。",
        price: "私人报价",
        detail: "包含出版指导、双语支援、线上音频整合与 ISBN 出版选项。",
        audience: ["孩子有明确兴趣主题", "家庭希望建立长期成果", "需要双语学习输出"],
        process: ["Discovery 访谈", "内容创作引导", "编辑与设计", "成书与交付"],
      },
      "book-launch": {
        title: "Book Launch Event",
        desc: "为孩子作品打造有仪式感的新书发布会。",
        price: "私人报价",
        detail: "涵盖场地策划、流程设计、嘉宾邀请、现场布置与摄影纪录。",
        audience: ["孩子准备公开发表作品", "家庭重视仪式感与社交影响", "需要完整活动执行"],
        process: ["活动定位", "流程与嘉宾规划", "现场执行", "活动后回顾素材交付"],
      },
      exhibition: {
        title: "Exhibition",
        desc: "让创作被看见，从作品到空间完整呈现。",
        price: "私人报价",
        detail: "支援摄影展/插画展、展板设计、场地协调与开幕活动规划。",
        audience: ["孩子有系列作品", "希望成果被更多人看见", "需要展览型履历亮点"],
        process: ["展览主题策展", "展板与空间设计", "场地协调", "开幕与导览"],
      },
      "media-pr": {
        title: "Media & PR",
        desc: "把孩子故事转化成可被报导的内容。",
        price: "私人报价",
        detail: "包括新闻稿、媒体邀请、报导协调与线上传播策略。",
        audience: ["希望建立外部公信力", "需要媒体曝光", "准备学校/升学作品叙事"],
        process: ["媒体角度定位", "新闻稿与素材包", "媒体邀请沟通", "报导追踪整理"],
      },
      "live-streaming": {
        title: "Live Streaming",
        desc: "活动当日即时直播与线上互动，扩大影响力。",
        price: "私人报价",
        detail: "提供直播导播、即时分享、互动监看与永久记录素材。",
        audience: ["有外地亲友需要线上参与", "重视活动扩散", "需要可重播纪录"],
        process: ["直播规划", "现场导播", "线上互动监看", "回放与剪辑交付"],
      },
      "portfolio-package": {
        title: "Portfolio Package",
        desc: "把完整成果整理成升学可用的作品集。",
        price: "私人报价",
        detail: "整合出版、活动、媒体素材，支援多格式输出。",
        audience: ["有升学申请需求", "需要完整成就证据", "希望统一对外展示素材"],
        process: ["素材整合", "叙事与版面编排", "多格式输出", "申请版本微调"],
      },
    },
  },
  caseSection: {
    ...zhHant.caseSection,
    body: "由观察兴趣到正式出版，再延伸发布会与媒体，成为可放进升学档案的成果。",
    statLine: "一年成书 · 发布会 · 媒体报道 · 3,569 线上观看",
    proofLabel: "新书发布会",
  },
  journey: {
    ...zhHant.journey,
    title: "从兴趣到被看见",
    intro: "同一团队走完六步，典型周期约 9–12 个月。每一步都有可交付的成果。",
    deliverablePrefix: "交付 · ",
    steps: [
      { title: "发现兴趣", en: "Discover", desc: "锁定真正愿意投入的题材。", deliverable: "兴趣地图" },
      { title: "规划项目", en: "Plan", desc: "把热爱变成可执行的里程碑。", deliverable: "项目蓝图" },
      { title: "创作内容", en: "Create", desc: "共创文稿，保留孩子的声音。", deliverable: "文稿与素材" },
      { title: "设计出版", en: "Publish", desc: "装帧成正式出版物。", deliverable: "成书 · ISBN" },
      { title: "发布展览", en: "Launch", desc: "发布会与展览，让成果被看见。", deliverable: "活动纪录" },
      { title: "媒体传播", en: "Amplify", desc: "报导与作品集，形成可引用的证据。", deliverable: "剪报 · Portfolio" },
    ],
  },
  voices: {
    kicker: "Voices",
    title: "家长怎么说",
    intro: "不是广告稿。有人讲英文，有人讲粤语，有人讲普通话——都是家长自己的话。",
    items: [
      {
        quote:
          "We thought it would just be a keepsake. Then the launch happened, a few media pieces came out, and our daughter started talking about the book as her own work. The school later asked us to put it in her portfolio.",
        cite: "国际学校家长 · 四年级",
        tag: "Portfolio",
        initial: "A",
      },
      {
        quote:
          "本来只想给孩子留一本自己的书。没想到从选题到成书、发布会都有人带着走，孩子第一次觉得自己做的事情被认真对待。我们后来把这本书放进了升学资料里。",
        cite: "内地家长 · 孩子就读香港小学",
        tag: "升学档案",
        initial: "周",
      },
      {
        quote:
          "见到其他小朋友出书一直都觉得遥不可及。直至现在拥有一本属于自己的书，不单只是做 portfolio，还是小朋友一个成就的肯定。他将来长大都可以拿出来，说自己出过一本书、书店可以买到。见到他和同学分享那份自信，一切都值得！",
        cite: "四年级家长 · 九龙",
        tag: "成书发表",
        initial: "陈",
      },
      {
        quote:
          "有导师、顾问、大学教授一起帮忙写这本书，拿起成品我很有信心。见到在书店可以买到自己的书，大人小朋友都充满自信。升学面试和报学校的时候整个 Portfolio 清楚有说服力很多。",
        cite: "国际学校家长 · 三年级",
        tag: "全案",
        initial: "林",
      },
    ],
  },
  finalCta: {
    title: "开始咨询",
    copy: "WhatsApp（@kidsmybook）或填表预约。私人报价。",
    generateCover: "生成封面",
  },
  caseStudy: {
    ...zhHant.caseStudy,
    storyP1: "孩子由日常观察蝴蝶出发，逐步建立研究习惯，完成图像与文字内容，最终成功出版并公开发表。",
    storyP2: "过程中克服了资料整理与口语表达挑战，学会用作品向世界分享自己的兴趣与成长。",
    storyP3: "这是目前公开具名的个案：Hilary，出版时八岁，约一年完成。成品是中英双语图鉴，其后有新书发布会、媒体公关与活动直播；线上观看 3,569 次。家庭可以将这份成果放进升学档案。",
    resultItems: [
      "Event attendance：现场家庭与嘉宾参与",
      "Online views：3,569+",
      "Parent testimonial：孩子更有自信，亦更主动分享成果",
    ],
  },
  caseIndex: {
    title: "儿童成就出版个案",
    hilaryTitle: "hilary-butterfly-guide",
    hilaryDesc: "Hilary蝴蝶图鉴案例（可切换隐私模式）",
    futureTitle: "[future cases]",
    futureDesc: "预留后续案例页模板，沿用同一结构。",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `你目前打开的是 \`${path}\`。此页已保留，下一步可按同模板扩充内容。`,
    backHome: "返回首页",
  },
  footer: {
    studio: "Kidsmybook · 香港儿童成就出版工作室",
    privacy: "查询资料只用于回复你。未经同意，不会公开小朋友的姓名或学校。",
    quote: "私人报价，于咨询时提供。",
    about: "关于我们",
  },
  faq: {
    kicker: "FAQ",
    title: "常见问题",
    items: FAQ_HANS,
  },
  explore: EXPLORE_HANS,
  programmePage: PROGRAMME_HANS,
  faqPage: FAQ_PAGE_HANS,
  portfolioPage: PORTFOLIO_HANS,
  checklistPage: CHECKLIST_HANS,
  gaocaiPage: GAOCAI_HANS,
  xingquPage: XINGQU_HANS,
  shengxiaoPage: SHENGXIAO_HANS,
  shengzhongPage: SHENGZHONG_HANS,
  shudianPage: SHUDIAN_HANS,
  aboutPage: ABOUT_HANS,
  seo: {
    homeTitle: "Kidsmybook｜儿童出书・实体书店上架｜香港实体书店上架／发行路径",
    homeDesc:
      "香港儿童出版工作室。12 个月导师制，把小朋友的兴趣做成正式印刷的书，并走香港实体书店上架／发行路径（视题材和配套）。ISBN 不等于每间分店都有货。升学作品集是次要用途。私人报价：WhatsApp。",
    servicesTitle: "服务｜Kidsmybook 六项儿童成就出版",
    servicesDesc:
      "出版计划、新书发布会、展览、媒体公关、直播和升学作品集，可全案或单项咨询。私人报价，WhatsApp。Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
    caseStudiesTitle: "个案｜Kidsmybook 儿童成就出版案例",
    caseStudiesDesc: "目前公开具名个案是 Hilary《蝴蝶双语图鉴》：由兴趣到正式出版、发布会和媒体纪录。私人报价，WhatsApp 查询。",
    hilaryTitle: "Hilary蝴蝶图鉴案例｜Kidsmybook",
    hilaryDesc: "8 岁孩子从兴趣出发完成双语出版，并延伸发布会、展览与媒体曝光。",
    serviceDetailTitle: (name) => `${name}｜Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: WA_QUOTE_HANS,
    service: (title) => `你好，我想了解 ${title} 服务。`,
    floating: WA_QUOTE_HANS,
    blog: WA_QUOTE_HANS,
    blogPost: (title) => `想了解 Kidsmybook 儿童出版计划：${title}`,
    caseStudy: "Start your child's publishing journey",
  },
};

const en: Translations = {
  brandTitle: "A child's book, on a real bookstore path",
  brandEn: "Publishing, launches, exhibitions, media, and portfolios — one integrated pathway.",
  nav: {
    main: "Main menu",
    aiBook: "AI Book",
    services: "Services",
    caseStudies: "Case Studies",
    blog: "Blog",
    whatsapp: "WhatsApp: @kidsmybook",
    intake: "Admissions Consultation",
    programme: "Programme",
    faq: "FAQ",
    portfolio: "Portfolio",
    about: "About",
  },
  blog: {
    kicker: "Kidsmybook Blog",
    backToBlog: "← Back to Blog",
    indexTitle: "Hong Kong school portfolios · primary, secondary, ISBN books",
    indexDesc:
      "For Hong Kong parents: primary interviews, a primary interview class versus an ISBN portfolio, DSS and direct-subsidy secondary files, and how a mentored ISBN book becomes a citable highlight. Private quotation. No place is guaranteed.",
    askQuote: "WhatsApp for a quote",
  },
  hero: {
    eyebrow: "Hong Kong · Children's books · Bookstore shelves",
    lead: "Twelve mentored months: a formal print run, then a Hong Kong physical bookstore listing / distribution path. An admissions portfolio is the later use.",
    generateCover: "Generate cover",
    bookConsult: "Book a consultation",
    featuredAlt: "Hilary book launch",
    badge: "Hilary · age 8",
    statLine: "One year to publish · Launch event · Media coverage · 3,569 online views",
  },
  aiLab: {
    eyebrow: "Academic Press · Young Scholar Series",
    title: "Generate a young-scholar academic monograph cover for your child",
    lede: "",
    formKicker: "Monograph details",
    formTitle: "Child & topic",
    childName: "Young author name",
    childNamePlaceholder: "e.g. Emma or Hilary",
    interests: "Interest / topic",
    interestsPlaceholder: "e.g. butterflies, deep-sea life, space, mechanics",
    age: "Age range (optional)",
    ageSelect: "Select",
    personality: "Traits / personality (optional)",
    personalityPlaceholder: "e.g. curious, focused, observant",
    personalityChips: ["Curious", "Observant", "Creative", "Logical", "Passionate", "Expressive"],
    waHandshakeMessage: (name, topic, url) => {
      const who = name ? `${name}'s topic` : "this topic";
      const subject = topic ? `${who} "${topic}"` : who;
      const link = url ? `\nCover preview: ${url}` : "";
      return `Hi, I'd like to ask an advisor whether ${subject} is a fit for a mentored ISBN children's book. Please quote privately.${link}`;
    },
    generateBtn: "Generate 3D Cover",
    generating: "Rendering scholar-grade cover…",
    generatePhase: "Rendering professional scholar-grade cover…",
    aiTimingHint: "AI academic rendering takes about 15–30 seconds.",
    previewKicker: "3D hardcover monograph preview",
    dragHintIdle: "Your 3D academic monograph preview appears here after generation",
    dragHintReady: "Drag to rotate · View back-cover blurb and spine",
    backHome: "← Back to home",
    successTitle: "Cover ready",
    successDesc: "The preview is on the right. Next, ask an advisor whether this topic fits an ISBN children's book. Quotes stay private.",
    stickyHint: "Ask whether this topic fits a book",
    getLinkBtn: "WhatsApp an advisor: does this topic fit a book?",
    previewReady: "Monograph preview ready",
    previewSent: "Preview handed to consultant for delivery",
    previewSendCopy: "We will send the link to",
    previewSendEnd: ".",
    previewLinkLabel: "Preview link",
    copyLink: "Copy link",
    copiedLink: "Copied",
    notifyStudio: "Haven't received it? Notify consultant",
    coverBadge: "★ University mentor endorsement · Listed in Hong Kong bookstores ★",
    coverBrand: "Kidsmybook Academic Publishing · Hong Kong",
    defaultBackBlurb:
      "[Academic monograph review & publishing]\nKidsmybook creates formal monographs that meet international publishing standards for children.\nUniversity professor guidance · Registered ISBN · Available in Hong Kong bookstores.\nFill in the young author's name and topic on the left to preview your cover.",
    defaultProfHint: "Fill in details on the left · Live 3D cover preview",
    errNameTopic: "Please enter the young author's name and interest/topic.",
    aiFallbackNotice: (message) => `Showing academic layout preview instead (${message})`,
    consultSummaryHeader: "[Kidsmybook monograph cover preview]",
    consultChild: "Young author",
    consultTopic: "Interest / topic",
    consultTitle: "Monograph title",
    consultProfessor: "Co-advising professor",
    consultAge: "Age range",
    consultPersonality: "Traits",
    consultSendNote: "Please send the preview link below to the parent.",
    previewLinkInMessage: "Preview link",
    ageRanges: { "3-6": "Ages 3–6", "7-10": "Ages 7–10", "10+": "Age 10+" },
  },
  services: {
    kicker: "Services",
    title: "What we do",
    intro: "Six services as one full programme, or book individually. Private quotation.",
    privateQuote: "Private quotation",
    suitableFor: "Who it's for",
    process: "Process",
    backToServices: "Back to Services",
    indexHeading: "Six child-achievement services",
    indexMeta: "Author Programme, Book Launch, Exhibition, Media & PR, Live Streaming, and Portfolio Package. Full programme or a single service. Private quotation.",
    detailEyebrow: "Service Detail",
    items: {
      "author-programme": {
        title: "Author Programme",
        desc: "From interest to a formally published outcome with 1-on-1 guidance.",
        price: "Private quotation",
        detail: "Publishing guidance, bilingual support, online audio integration, and ISBN options.",
        audience: ["Child has a clear interest topic", "Family wants a long-term achievement", "Needs bilingual learning output"],
        process: ["Discovery interview", "Content co-creation", "Editing & design", "Book delivery"],
      },
      "book-launch": {
        title: "Book Launch Event",
        desc: "A ceremonial launch event for your child's work.",
        price: "Private quotation",
        detail: "Venue planning, run-of-show, guest invitations, staging, and photo documentation.",
        audience: ["Child ready to present publicly", "Family values ceremony & social impact", "Needs full event execution"],
        process: ["Event positioning", "Programme & guest planning", "On-site execution", "Post-event assets"],
      },
      exhibition: {
        title: "Exhibition",
        desc: "From artwork to space — make the work visible.",
        price: "Private quotation",
        detail: "Photo/illustration exhibitions, panel design, venue coordination, and opening events.",
        audience: ["Child has a body of work", "Wants wider visibility", "Needs exhibition-style portfolio highlight"],
        process: ["Curatorial theme", "Panel & space design", "Venue coordination", "Opening & tours"],
      },
      "media-pr": {
        title: "Media & PR",
        desc: "Turn your child's story into newsworthy content.",
        price: "Private quotation",
        detail: "Press releases, media invitations, coverage coordination, and digital amplification.",
        audience: ["Wants external credibility", "Needs media exposure", "Preparing school/admission narrative"],
        process: ["Media angle", "Press kit", "Outreach", "Coverage tracking"],
      },
      "live-streaming": {
        title: "Live Streaming",
        desc: "Live broadcast and online engagement on event day.",
        price: "Private quotation",
        detail: "Live direction, real-time sharing, chat moderation, and permanent archive assets.",
        audience: ["Remote family needs to join", "Wants reach beyond the room", "Needs replayable record"],
        process: ["Stream planning", "On-site direction", "Online moderation", "Replay & edit delivery"],
      },
      "portfolio-package": {
        title: "Portfolio Package",
        desc: "Package the full achievement into an admissions-ready portfolio.",
        price: "Private quotation",
        detail: "Integrates publishing, events, and media assets with multi-format export.",
        audience: ["Applying to schools", "Needs complete evidence of achievement", "Wants unified public materials"],
        process: ["Asset integration", "Narrative & layout", "Multi-format export", "Application variants"],
      },
    },
  },
  caseSection: {
    kicker: "Case",
    title: "Hilary",
    body: "From observing a personal interest to formal publication, then launch events and media — a result ready for school files.",
    statLine: "One year to publish · Launch · Media · 3,569 online views",
    proofLabel: "Book launch",
  },
  journey: {
    kicker: "Pathway",
    title: "From interest to visibility",
    intro: "One team through six steps — typically 9–12 months. Each step has a deliverable.",
    deliverablePrefix: "Deliverable · ",
    steps: [
      { title: "Discover", en: "Discover", desc: "Lock in a topic they'll truly invest in.", deliverable: "Interest map" },
      { title: "Plan", en: "Plan", desc: "Turn passion into executable milestones.", deliverable: "Project blueprint" },
      { title: "Create", en: "Create", desc: "Co-write while keeping the child's voice.", deliverable: "Manuscript & assets" },
      { title: "Publish", en: "Publish", desc: "Bind it as a formal publication.", deliverable: "Book · ISBN" },
      { title: "Launch", en: "Launch", desc: "Launch events and exhibitions.", deliverable: "Event record" },
      { title: "Amplify", en: "Amplify", desc: "Press and portfolio as citable proof.", deliverable: "Clippings · Portfolio" },
    ],
  },
  voices: {
    kicker: "Voices",
    title: "What parents say",
    intro: "Not ad copy. English, Cantonese, Mandarin — in the parents' own words.",
    items: [
      {
        quote:
          "We thought it would just be a keepsake. Then the launch happened, a few media pieces came out, and our daughter started talking about the book as her own work. The school later asked us to put it in her portfolio.",
        cite: "Parent, international school · Year 4",
        tag: "Portfolio",
        initial: "A",
      },
      {
        quote:
          "We only wanted a book for our child at first. From topic selection to publication and the launch, someone guided us through it all — our child felt their work was taken seriously for the first time. We later included the book in school application materials.",
        cite: "Mainland parent · child at HK primary school",
        tag: "Admissions file",
        initial: "Z",
      },
      {
        quote:
          "Watching other children publish a book always felt out of reach. Now we have one of our own — not only for the portfolio, but as real proof of what our child has achieved. When they grow up, they can still take it out and say: I published a book you can buy in a bookstore. Seeing the confidence when they share it with classmates — it was all worth it.",
        cite: "P4 parent · Kowloon",
        tag: "Book launch",
        initial: "C",
      },
      {
        quote:
          "Mentors, consultants and university professors all helped write this book — holding the finished copy, I felt real confidence. Seeing it for sale in a bookstore filled both the adults and the child with pride. For interviews and school applications, the whole portfolio is much clearer and more convincing.",
        cite: "International school parent · Year 3",
        tag: "Full programme",
        initial: "L",
      },
    ],
  },
  finalCta: {
    title: "Start your consultation",
    copy: "Message WhatsApp (@kidsmybook) or send the enquiry form. Private quotation.",
    generateCover: "Generate cover",
  },
  caseStudy: {
    privacyName: "Young Author X",
    realName: "Hilary",
    showName: "Show real name",
    hideName: "Privacy mode",
    bookTitle: "Butterfly Bilingual Field Guide",
    meta: "Age at publication: 8 · Duration: 1 year",
    overview: "Project Overview",
    topic: "Topic: butterfly ecology & bilingual science writing",
    servicesUsed: "Services: publishing programme + book launch + media PR + live stream",
    format: "Format: bilingual field guide + event documentation",
    storyTitle: "The Story",
    storyP1: "Starting from daily butterfly observation, the child built research habits, completed images and text, and published publicly.",
    storyP2: "Along the way they worked through organisation and oral presentation — learning to share their interest with the world through the work itself.",
    storyP3: "This is the named public case: Hilary, age 8 at publication, about one year. The result is a Chinese–English field guide, followed by a book launch, media support, and a live stream, with 3,569 online views. The family can place that result in an admissions portfolio.",
    gallery: "Gallery",
    galleryItems: ["Book Spreads", "Event Photos", "Exhibition Photos", "Media Coverage Screenshots"],
    results: "Results",
    resultItems: [
      "Event attendance: families and guests on site",
      "Online views: 3,569+",
      "Parent testimonial: more confidence, more willing to share the achievement",
    ],
    ctaTitle: "Start your child's publishing journey",
  },
  caseIndex: {
    title: "Case Studies",
    hilaryTitle: "hilary-butterfly-guide",
    hilaryDesc: "Hilary butterfly guide case (privacy mode available)",
    futureTitle: "[future cases]",
    futureDesc: "Template reserved for upcoming case studies.",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `You opened \`${path}\`. This route is reserved for future content using the same template.`,
    backHome: "Back to Home",
  },
  faq: {
    kicker: "FAQ",
    title: "Frequently Asked Questions",
    items: FAQ_EN,
  },
  explore: EXPLORE_EN,
  programmePage: PROGRAMME_EN,
  faqPage: FAQ_PAGE_EN,
  portfolioPage: PORTFOLIO_EN,
  checklistPage: CHECKLIST_EN,
  gaocaiPage: GAOCAI_EN,
  xingquPage: XINGQU_EN,
  shengxiaoPage: SHENGXIAO_EN,
  shengzhongPage: SHENGZHONG_EN,
  shudianPage: SHUDIAN_EN,
  aboutPage: ABOUT_EN,
  seo: {
    homeTitle: "Kidsmybook | Children's books on Hong Kong bookstore shelves",
    homeDesc:
      "Hong Kong children's publishing studio. A 12-month mentored programme prints a child's book and arranges a Hong Kong physical bookstore listing / distribution path, depending on the title. An ISBN is not a shelf. An admissions portfolio is secondary. Quoted privately via WhatsApp.",
    servicesTitle: "Services | Kidsmybook six achievement programmes",
    servicesDesc: "Author Programme, Book Launch, Exhibition, Media & PR, Live Streaming, Portfolio Package.",
    caseStudiesTitle: "Case Studies | Kidsmybook",
    caseStudiesDesc: "See how children move from interest to public achievement.",
    hilaryTitle: "Hilary butterfly guide | Kidsmybook",
    hilaryDesc: "An 8-year-old's bilingual publication extended into launch, exhibition, and media.",
    serviceDetailTitle: (name) => `${name} | Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: WA_QUOTE_EN,
    service: (title) => `Hi, I'd like to learn more about ${title}.`,
    floating: WA_QUOTE_EN,
    blog: WA_QUOTE_EN,
    blogPost: (title) => `I'd like to know about the Kidsmybook children's publishing programme: ${title}`,
    caseStudy: "Start your child's publishing journey",
  },
  footer: {
    studio: "Kidsmybook · Hong Kong child-achievement publishing studio",
    privacy: "Enquiry details are used only to reply to you. A child's name or school is not published without consent.",
    quote: "Quoted privately during consultation.",
    about: "About",
  },
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
  en,
};

export const SERVICE_SLUGS: ServiceSlug[] = [
  "author-programme",
  "book-launch",
  "exhibition",
  "media-pr",
  "live-streaming",
  "portfolio-package",
];

export const AGE_RANGE_KEYS: AgeRangeKey[] = ["3-6", "7-10", "10+"];

export const SERVICE_ICONS: Record<ServiceSlug, string> = {
  "author-programme": "Book",
  "book-launch": "Celebration",
  exhibition: "Gallery",
  "media-pr": "Newspaper",
  "live-streaming": "Video",
  "portfolio-package": "Folder",
};

export const SERVICE_CARD_ART: Record<ServiceSlug, string> = {
  "author-programme": "services/service-author-programme.png",
  "book-launch": "services/service-book-launch.png",
  exhibition: "services/service-exhibition.png",
  "media-pr": "services/service-media-pr.png",
  "live-streaming": "services/service-live-streaming.png",
  "portfolio-package": "services/service-portfolio-package.png",
};
