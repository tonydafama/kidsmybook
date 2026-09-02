import type { Locale } from "./locale";

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
    whatsapp: string;
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
    whatsapp: string;
    whatsappPlaceholder: string;
    wechat: string;
    wechatPlaceholder: string;
    contactHint: string;
    waStartChat: string;
    waChatOpened: string;
    waConfirmSent: string;
    waCodeLabel: string;
    waChatHint: string;
    errNeedWhatsAppChat: string;
    previewSentWhatsApp: string;
    waHandshakeMessage: (code: string, name: string) => string;
    generateBtn: string;
    generating: string;
    generatePhase: string;
    aiTimingHint: string;
    previewKicker: string;
    dragHintIdle: string;
    dragHintReady: string;
    backHome: string;
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
    errContact: string;
    errWhatsAppInvalid: string;
    aiFallbackNotice: (message: string) => string;
    consultSummaryHeader: string;
    consultChild: string;
    consultTopic: string;
    consultTitle: string;
    consultProfessor: string;
    consultAge: string;
    consultPersonality: string;
    consultWhatsapp: string;
    consultWechat: string;
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
    gallery: string;
    galleryItems: string[];
    results: string;
    resultItems: string[];
    ctaTitle: string;
  };
  caseIndex: {
    title: string;
    xuDuoTitle: string;
    xuDuoDesc: string;
    futureTitle: string;
    futureDesc: string;
  };
  notFound: {
    title: string;
    body: (path: string) => string;
    backHome: string;
  };
  seo: {
    homeTitle: string;
    homeDesc: string;
    servicesTitle: string;
    servicesDesc: string;
    caseStudiesTitle: string;
    caseStudiesDesc: string;
    xuDuoTitle: string;
    xuDuoDesc: string;
    serviceDetailTitle: (name: string) => string;
    serviceDetailDesc: (desc: string, detail: string) => string;
  };
  whatsapp: {
    home: string;
    service: (title: string) => string;
    floating: string;
    caseStudy: string;
  };
};

const zhHant: Translations = {
  brandTitle: "把孩子的熱愛，變成被世界看見的成就",
  brandEn: "Turn your child's passion into a published achievement.",
  nav: {
    main: "主選單",
    aiBook: "AI Book",
    services: "Services",
    caseStudies: "Case Studies",
    whatsapp: "WhatsApp: @kidsmybook",
  },
  hero: {
    eyebrow: "Hong Kong · Publishing · Exhibition · PR",
    lead: "出版、發布會、展覽、媒體、作品集 — 一條路徑做完。",
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
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "例如：91234567",
    wechat: "WeChat",
    wechatPlaceholder: "WeChat ID",
    contactHint: "請先用 WhatsApp 開啟對話並送出驗證碼，生成後封面連結與圖檔才會發到這個號碼。亦可只填 WeChat。",
    waStartChat: "開啟 WhatsApp 開始對話",
    waChatOpened: "已開啟 WhatsApp",
    waConfirmSent: "我已把驗證碼發到 @kidsmybook",
    waCodeLabel: "驗證碼",
    waChatHint: "點擊後會開啟 WhatsApp，請把含驗證碼的訊息發出。對話開始後，系統才能把封面連結／圖檔發回這個號碼。",
    errNeedWhatsAppChat: "請先開啟 WhatsApp 對話並勾選「我已把驗證碼發出」，再生成封面。",
    previewSentWhatsApp: "封面預覽已發到你的 WhatsApp",
    waHandshakeMessage: (code, name) =>
      `Kidsmybook 驗證碼：${code}\n我想開始對話，請在封面生成後把 3D 預覽連結與封面圖發到這個 WhatsApp。${name ? `\n小作者：${name}` : ""}`,
    generateBtn: "生成並發送專著預覽",
    generating: "正在繪製學者級封面…",
    generatePhase: "正在繪製專業學者級封面…",
    aiTimingHint: "AI 學術繪製約需 15–30 秒。",
    previewKicker: "3D 精裝學術專著預覽",
    dragHintIdle: "生成後在此預覽 3D 學術專著",
    dragHintReady: "拖曳可旋轉 · 查看封底學者評語與書脊",
    backHome: "← 返回首頁",
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
    errContact: "請留下 WhatsApp 或 WeChat，以便我們把專著預覽連結發給你。",
    errWhatsAppInvalid: "請輸入有效的 WhatsApp 手機號碼（香港 8 位，例如 91234567；或連國家碼）。我們無法即時向 WhatsApp 查詢是否已註冊，請確認此號碼能收發 WhatsApp 訊息。",
    aiFallbackNotice: (message) => `已改為學術版型示意預覽（${message}）`,
    consultSummaryHeader: "【Kidsmybook 專著封面預覽】",
    consultChild: "小作者",
    consultTopic: "興趣題材",
    consultTitle: "專著書名",
    consultProfessor: "聯名指導教授",
    consultAge: "年齡階段",
    consultPersonality: "孩子特質",
    consultWhatsapp: "家長 WhatsApp",
    consultWechat: "家長 WeChat",
    consultSendNote: "請把下方預覽連結發送給家長。",
    previewLinkInMessage: "預覽連結",
    ageRanges: { "3-6": "3–6 歲", "7-10": "7–10 歲", "10+": "10 歲以上" },
  },
  services: {
    kicker: "Services",
    title: "我們做什麼",
    intro: "六項合成一條全案，亦可單項諮詢。私人報價。",
    privateQuote: "私人報價",
    suitableFor: "適合對象",
    process: "服務流程",
    backToServices: "返回 Services",
    indexMeta: "Minimal · Elegant · Full-stack execution",
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
    copy: "先生成封面，再 WhatsApp (@kidsmybook) 對齊全案。私人報價。",
    generateCover: "生成封面",
  },
  caseStudy: {
    privacyName: "小作者 X",
    realName: "徐多",
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
    gallery: "Gallery",
    galleryItems: ["Book Spreads", "Event Photos", "Exhibition Photos", "Media Coverage Screenshots"],
    results: "Results",
    resultItems: [
      "Media mentions：深圳特區報、南方+（示例）",
      "Event attendance：現場家庭與嘉賓參與",
      "Online views：3,569+",
      "Parent testimonial：孩子更有自信，亦更主動分享成果",
    ],
    ctaTitle: "Start your child's publishing journey",
  },
  caseIndex: {
    title: "Case Studies",
    xuDuoTitle: "xu-duo-butterfly-guide",
    xuDuoDesc: "徐多蝴蝶圖鑑案例（可切換隱私模式）",
    futureTitle: "[future cases]",
    futureDesc: "預留後續案例頁模板，沿用同一結構。",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `你目前打開的是 \`${path}\`。此頁已保留，下一步可按同模板擴充內容。`,
    backHome: "返回首頁",
  },
  seo: {
    homeTitle: "Kidsmybook｜兒童成就出版 + 展覽 + 公關全案服務",
    homeDesc: "把孩子的熱愛，變成值得被世界看見的成就。出版、發布會、展覽、媒體、直播與升學作品集一站式服務。",
    servicesTitle: "Services｜Kidsmybook 6 大兒童成就服務",
    servicesDesc: "Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
    caseStudiesTitle: "Case Studies｜Kidsmybook 兒童案例",
    caseStudiesDesc: "查看兒童成就出版與活動案例，了解從興趣到被世界看見的完整旅程。",
    xuDuoTitle: "徐多蝴蝶圖鑑案例｜Kidsmybook",
    xuDuoDesc: "8 歲孩子從興趣出發完成雙語出版，並延伸發布會、展覽與媒體曝光。",
    serviceDetailTitle: (name) => `${name}｜Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: "你好，我想預約 Kidsmybook 兒童成就出版私人諮詢。",
    service: (title) => `你好，我想了解 ${title} 服務。`,
    floating: "Hi, I'd like premium child achievement publishing details.",
    caseStudy: "Start your child's publishing journey",
  },
};

const zhHans: Translations = {
  ...zhHant,
  brandTitle: "把孩子的热爱，变成被世界看见的成就",
  brandEn: "Turn your child's passion into a published achievement.",
  hero: {
    ...zhHant.hero,
    lead: "出版、发布会、展览、媒体、作品集 — 一条路径做完。",
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
    contactHint: "请先用 WhatsApp 开启对话并送出验证码，生成后封面链接与图档才会发到这个号码。亦可只填 WeChat。",
    waStartChat: "开启 WhatsApp 开始对话",
    waChatOpened: "已开启 WhatsApp",
    waConfirmSent: "我已把验证码发到 @kidsmybook",
    waCodeLabel: "验证码",
    waChatHint: "点击后会开启 WhatsApp，请把含验证码的讯息发出。对话开始后，系统才能把封面链接／图档发回这个号码。",
    errNeedWhatsAppChat: "请先开启 WhatsApp 对话并勾选「我已把验证码发出」，再生成封面。",
    previewSentWhatsApp: "封面预览已发到你的 WhatsApp",
    waHandshakeMessage: (code, name) =>
      `Kidsmybook 验证码：${code}\n我想开始对话，请在封面生成后把 3D 预览链接与封面图发到这个 WhatsApp。${name ? `\n小作者：${name}` : ""}`,
    generateBtn: "生成并发送专著预览",
    generating: "正在绘制学者级封面…",
    generatePhase: "正在绘制专业学者级封面…",
    aiTimingHint: "AI 学术绘制约需 15–30 秒。",
    previewKicker: "3D 精装学术专著预览",
    dragHintIdle: "生成后在此预览 3D 学术专著",
    dragHintReady: "拖曳可旋转 · 查看封底学者评语与书脊",
    backHome: "← 返回首页",
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
    errContact: "请留下 WhatsApp 或 WeChat，以便我们把专著预览链接发给你。",
    errWhatsAppInvalid: "请输入有效的 WhatsApp 手机号码（香港 8 位，例如 91234567；或连国家码）。我们无法即时向 WhatsApp 查询是否已注册，请确认此号码能收发 WhatsApp 消息。",
    aiFallbackNotice: (message) => `已改为学术版型示意预览（${message}）`,
    consultSummaryHeader: "【Kidsmybook 专著封面预览】",
    consultChild: "小作者",
    consultTopic: "兴趣题材",
    consultTitle: "专著名",
    consultProfessor: "联名指导教授",
    consultAge: "年龄阶段",
    consultPersonality: "孩子特质",
    consultWhatsapp: "家长 WhatsApp",
    consultWechat: "家长 WeChat",
    consultSendNote: "请把下方预览链接发送给家长。",
    previewLinkInMessage: "预览链接",
    ageRanges: { "3-6": "3–6 岁", "7-10": "7–10 岁", "10+": "10 岁以上" },
  },
  services: {
    ...zhHant.services,
    title: "我们做什么",
    intro: "六项合成一条全案，亦可单项咨询。私人报价。",
    privateQuote: "私人报价",
    suitableFor: "适合对象",
    process: "服务流程",
    backToServices: "返回 Services",
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
    copy: "先生成封面，再 WhatsApp (@kidsmybook) 对齐全案。私人报价。",
    generateCover: "生成封面",
  },
  caseStudy: {
    ...zhHant.caseStudy,
    storyP1: "孩子由日常观察蝴蝶出发，逐步建立研究习惯，完成图像与文字内容，最终成功出版并公开发表。",
    storyP2: "过程中克服了资料整理与口语表达挑战，学会用作品向世界分享自己的兴趣与成长。",
    resultItems: [
      "Media mentions：深圳特区报、南方+（示例）",
      "Event attendance：现场家庭与嘉宾参与",
      "Online views：3,569+",
      "Parent testimonial：孩子更有自信，亦更主动分享成果",
    ],
  },
  caseIndex: {
    title: "Case Studies",
    xuDuoTitle: "xu-duo-butterfly-guide",
    xuDuoDesc: "徐多蝴蝶图鉴案例（可切换隐私模式）",
    futureTitle: "[future cases]",
    futureDesc: "预留后续案例页模板，沿用同一结构。",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `你目前打开的是 \`${path}\`。此页已保留，下一步可按同模板扩充内容。`,
    backHome: "返回首页",
  },
  seo: {
    homeTitle: "Kidsmybook｜儿童成就出版 + 展览 + 公关全案服务",
    homeDesc: "把孩子的热爱，变成值得被世界看见的成就。出版、发布会、展览、媒体、直播与升学作品集一站式服务。",
    servicesTitle: "Services｜Kidsmybook 6 大儿童成就服务",
    servicesDesc: "Author Programme、Book Launch、Exhibition、Media & PR、Live Streaming、Portfolio Package。",
    caseStudiesTitle: "Case Studies｜Kidsmybook 儿童案例",
    caseStudiesDesc: "查看儿童成就出版与活动案例，了解从兴趣到被世界看见的完整旅程。",
    xuDuoTitle: "徐多蝴蝶图鉴案例｜Kidsmybook",
    xuDuoDesc: "8 岁孩子从兴趣出发完成双语出版，并延伸发布会、展览与媒体曝光。",
    serviceDetailTitle: (name) => `${name}｜Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: "你好，我想预约 Kidsmybook 儿童成就出版私人咨询。",
    service: (title) => `你好，我想了解 ${title} 服务。`,
    floating: "Hi, I'd like premium child achievement publishing details.",
    caseStudy: "Start your child's publishing journey",
  },
};

const en: Translations = {
  brandTitle: "Turn your child's passion into a published achievement",
  brandEn: "Publishing, launches, exhibitions, media, and portfolios — one integrated pathway.",
  nav: {
    main: "Main menu",
    aiBook: "AI Book",
    services: "Services",
    caseStudies: "Case Studies",
    whatsapp: "WhatsApp: @kidsmybook",
  },
  hero: {
    eyebrow: "Hong Kong · Publishing · Exhibition · PR",
    lead: "Publishing, book launches, exhibitions, media, and portfolios — delivered as one pathway.",
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
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "e.g. 91234567",
    wechat: "WeChat",
    wechatPlaceholder: "WeChat ID",
    contactHint: "Start a WhatsApp chat and send the code first — then we can send the cover link and image to this number. WeChat alone is also fine.",
    waStartChat: "Open WhatsApp to start chat",
    waChatOpened: "WhatsApp opened",
    waConfirmSent: "I sent the code to @kidsmybook",
    waCodeLabel: "Code",
    waChatHint: "This opens WhatsApp with a pre-filled code. Send it to start the chat — then we can return the cover link and file to this number.",
    errNeedWhatsAppChat: "Please start the WhatsApp chat and confirm you sent the code before generating.",
    previewSentWhatsApp: "Cover preview sent to your WhatsApp",
    waHandshakeMessage: (code, name) =>
      `Kidsmybook code: ${code}\nPlease start this chat, then send the 3D preview link and cover image to this WhatsApp after generation.${name ? `\nYoung author: ${name}` : ""}`,
    generateBtn: "Generate & send preview",
    generating: "Rendering scholar-grade cover…",
    generatePhase: "Rendering professional scholar-grade cover…",
    aiTimingHint: "AI academic rendering takes about 15–30 seconds.",
    previewKicker: "3D hardcover monograph preview",
    dragHintIdle: "Your 3D academic monograph preview appears here after generation",
    dragHintReady: "Drag to rotate · View back-cover blurb and spine",
    backHome: "← Back to home",
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
    errContact: "Please leave WhatsApp or WeChat so we can send your preview link.",
    errWhatsAppInvalid:
      "Enter a valid WhatsApp mobile number (HK 8 digits, e.g. 91234567, or with country code). We cannot query WhatsApp registration in real time — please confirm this number can send/receive WhatsApp.",
    aiFallbackNotice: (message) => `Showing academic layout preview instead (${message})`,
    consultSummaryHeader: "[Kidsmybook monograph cover preview]",
    consultChild: "Young author",
    consultTopic: "Interest / topic",
    consultTitle: "Monograph title",
    consultProfessor: "Co-advising professor",
    consultAge: "Age range",
    consultPersonality: "Traits",
    consultWhatsapp: "Parent WhatsApp",
    consultWechat: "Parent WeChat",
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
    indexMeta: "Minimal · Elegant · Full-stack execution",
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
    copy: "Generate a cover first, then align the full programme on WhatsApp (@kidsmybook). Private quotation.",
    generateCover: "Generate cover",
  },
  caseStudy: {
    privacyName: "Young Author X",
    realName: "Xu Duo",
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
    gallery: "Gallery",
    galleryItems: ["Book Spreads", "Event Photos", "Exhibition Photos", "Media Coverage Screenshots"],
    results: "Results",
    resultItems: [
      "Media mentions: Shenzhen Special Zone Daily, Nanfang Plus (examples)",
      "Event attendance: families and guests on site",
      "Online views: 3,569+",
      "Parent testimonial: more confidence, more willing to share the achievement",
    ],
    ctaTitle: "Start your child's publishing journey",
  },
  caseIndex: {
    title: "Case Studies",
    xuDuoTitle: "xu-duo-butterfly-guide",
    xuDuoDesc: "Xu Duo butterfly guide case (privacy mode available)",
    futureTitle: "[future cases]",
    futureDesc: "Template reserved for upcoming case studies.",
  },
  notFound: {
    title: "Page in Progress",
    body: (path) => `You opened \`${path}\`. This route is reserved for future content using the same template.`,
    backHome: "Back to home",
  },
  seo: {
    homeTitle: "Kidsmybook | Child achievement publishing, exhibitions & PR",
    homeDesc: "Turn your child's passion into a visible achievement. Publishing, launches, exhibitions, media, live streaming, and admission portfolios — one team.",
    servicesTitle: "Services | Kidsmybook six achievement programmes",
    servicesDesc: "Author Programme, Book Launch, Exhibition, Media & PR, Live Streaming, Portfolio Package.",
    caseStudiesTitle: "Case Studies | Kidsmybook",
    caseStudiesDesc: "See how children move from interest to public achievement.",
    xuDuoTitle: "Xu Duo butterfly guide | Kidsmybook",
    xuDuoDesc: "An 8-year-old's bilingual publication extended into launch, exhibition, and media.",
    serviceDetailTitle: (name) => `${name} | Kidsmybook Services`,
    serviceDetailDesc: (desc, detail) => `${desc} ${detail}`,
  },
  whatsapp: {
    home: "Hi, I'd like to book a private Kidsmybook child achievement publishing consultation.",
    service: (title) => `Hi, I'd like to learn more about ${title}.`,
    floating: "Hi, I'd like premium child achievement publishing details.",
    caseStudy: "Start your child's publishing journey",
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
