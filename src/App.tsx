import { useMemo, useState, type CSSProperties } from "react";

type CoverSet = {
  front: string;
  back: string;
  source: "Monica API" | "Demo Fallback";
};

const API_URL = import.meta.env.VITE_MONICA_API_URL || "https://api.monica.im/v1/images/generate";
const API_KEY = import.meta.env.VITE_MONICA_API_KEY || "";
const DEPOSIT_URL = import.meta.env.VITE_DEPOSIT_URL || "";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85200000000";
const WECHAT_ID = import.meta.env.VITE_WECHAT_ID || "mybook_service";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const svgCover = (title: string, subtitle: string, interest: string, dark = false) => {
  const bg = dark ? "linear-gradient(160deg,#0b1220,#1d4ed8,#7c3aed)" : "linear-gradient(160deg,#fff7ed,#f59e0b,#ef4444)";
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${dark ? "#0b1220" : "#fff7ed"}"/>
        <stop offset="55%" stop-color="${dark ? "#1d4ed8" : "#f59e0b"}"/>
        <stop offset="100%" stop-color="${dark ? "#7c3aed" : "#ef4444"}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#g)"/>
    <rect x="70" y="70" width="884" height="1396" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)"/>
    <text x="110" y="200" fill="white" font-size="42" font-family="Arial" opacity="0.85">MYBOOK PREVIEW</text>
    <text x="110" y="860" fill="white" font-size="88" font-weight="700" font-family="Arial">${title}</text>
    <text x="110" y="940" fill="white" font-size="44" font-family="Arial" opacity="0.9">${subtitle}</text>
    <text x="110" y="1180" fill="white" font-size="36" font-family="Arial" opacity="0.85">主題：${interest}</text>
    <text x="110" y="1260" fill="white" font-size="30" font-family="Arial" opacity="0.75">Premium Child Author Publishing</text>
  </svg>`)}`
    .replace("linear-gradient(160deg,#0b1220,#1d4ed8,#7c3aed)", bg)
    .replace("linear-gradient(160deg,#fff7ed,#f59e0b,#ef4444)", bg);
};

const extractImageUrls = (payload: unknown): string[] => {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (!node) return;
    if (typeof node === "string" && /^https?:\/\//.test(node)) {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };
  walk(payload);
  return out;
};

export default function App() {
  const [interest, setInterest] = useState("蝴蝶、生態觀察與自然攝影");
  const [tone, setTone] = useState("Quiet Luxury");
  const [lang, setLang] = useState("中英雙語");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [rotation, setRotation] = useState({ x: 12, y: -28 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [covers, setCovers] = useState<CoverSet>({
    front: svgCover("Little Author", "Front Cover Preview", "自然圖鑑", true),
    back: svgCover("Back Cover", "Story Summary + QR", "孩子創作旅程", false),
    source: "Demo Fallback",
  });

  const [budget, setBudget] = useState("15000+");
  const [urgency, setUrgency] = useState("1_month");
  const [goal, setGoal] = useState("portfolio");
  const [involvement, setInvolvement] = useState("high");
  const [wechatCopied, setWechatCopied] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("8");
  const [interestTopic, setInterestTopic] = useState("蝴蝶與自然觀察");
  const [parentWhatsapp, setParentWhatsapp] = useState("");
  const [schoolType, setSchoolType] = useState("國際學校");
  const [heardFrom, setHeardFrom] = useState("朋友介紹");

  const agentTasks = [
    "首頁高端視覺與轉化文案優化（已執行）",
    "3D 書封即時預覽互動（已執行）",
    "Monica API 封面生成串接（已執行）",
    "高潛力家庭分級與訂金開關（已執行）",
    "隱私合規文案與公開素材規範（已執行）",
  ];

  const userTasks = [
    "SiteGround 後台確認 WordPress、SSL、域名綁定",
    "WordPress 安裝 Elementor / WooCommerce / Fluent Forms / Join.chat",
    "建立正式訂金產品頁並填入 VITE_DEPOSIT_URL",
    "在 Join.chat 放入正式 WhatsApp Business 號碼",
    "上線前進行手機實機 QA 與付款測試",
  ];

  const leadScore = useMemo(() => {
    const budgetScore = budget === "30000+" ? 40 : budget === "15000+" ? 30 : budget === "8000+" ? 15 : 0;
    const urgencyScore = urgency === "1_month" ? 20 : urgency === "3_month" ? 12 : 6;
    const goalScore = goal === "portfolio" ? 20 : goal === "brand" ? 16 : 8;
    const involvementScore = involvement === "high" ? 20 : involvement === "medium" ? 10 : 4;
    return budgetScore + urgencyScore + goalScore + involvementScore;
  }, [budget, urgency, goal, involvement]);

  const leadTier = leadScore >= 75 ? "高潛力家庭" : leadScore >= 55 ? "可培育潛力家庭" : "低匹配（建議先諮詢）";
  const canPayDeposit = leadScore >= 75;
  const actionPlan =
    leadScore >= 75
      ? "建議立即支付 HKD 500 訂金，保留 72 小時優先檔期。"
      : leadScore >= 55
        ? "建議先進行 15 分鐘預審通話，再安排客製化提案。"
        : "建議先由客服提供入門方案，提升匹配度後再進入訂金流程。";

  const whatsappMessage = encodeURIComponent(
    `你好，我想預約 MyBook 高端出版諮詢。孩子興趣：${interest}，目前評估等級：${leadTier}，想了解 HKD500 訂金流程。`
  );
  const applyMessage = encodeURIComponent(
    `Apply Request\nChild: ${childName || "N/A"}\nAge: ${childAge}\nInterest: ${interestTopic}\nSchool Type: ${schoolType}\nParent WhatsApp: ${
      parentWhatsapp || "N/A"
    }\nHeard From: ${heardFrom}\nPlease review and reply in 24h.`
  );

  const faqItems = [
    {
      q: "什麼年齡適合 MyBook？",
      a: "我們主要服務 6-14 歲孩子，核心是把孩子真實興趣轉化為可出版成果。",
    },
    {
      q: "整個項目要多久？",
      a: "一般約 6-12 個月，會依主題深度、雙語需求與排程調整。",
    },
    {
      q: "可以做英文、中文或雙語嗎？",
      a: "可以，支援 English、繁中、或中英雙語模式。",
    },
    {
      q: "HKD 500 訂金用途是什麼？",
      a: "用於保留 45 分鐘 Discovery Session，若後續簽約可全額折抵項目費。",
    },
    {
      q: "孩子一定要很會寫作嗎？",
      a: "不需要。我們會用訪談、引導和編輯流程，把孩子的想法整理成完整作品。",
    },
  ];

  const serviceItems = [
    { title: "Author Programme", desc: "孩子主題發想、研究引導、編輯與出版流程。" },
    { title: "Book Launch Event", desc: "發布會流程策劃、現場視覺、活動動線設計。" },
    { title: "Exhibition", desc: "攝影/插畫展規劃，將作品延伸成公開展覽體驗。" },
    { title: "Media & PR", desc: "新聞稿架構與媒體素材包，強化品牌曝光。" },
    { title: "Live Streaming", desc: "活動直播與回放規劃，放大家族與社群觸達。" },
    { title: "Portfolio Package", desc: "升學用途的作品整理與敘事包裝（多格式輸出）。" },
  ];

  const journeyItems = [
    "Discovery Intake：收集孩子興趣、目標、時間線",
    "Editorial Blueprint：規劃主題、章節與創作方法",
    "Creation Sprint：訪談、寫作、插圖與素材整理",
    "Book Production：設計、排版、校對、試印",
    "Launch & Showcase：發布會/展覽/媒體素材準備",
    "Portfolio Delivery：輸出家長可直接使用的成果包",
  ];

  const testimonials = [
    "「孩子第一次認真說：這是我的作品。」— 匿名家長 A",
    "「原本只想做一本紀念冊，最後變成真正出版計畫。」— 匿名家長 B",
    "「最重要是孩子投入了，家長不用自己硬撐全流程。」— 匿名家長 C",
  ];

  const mediaMentions = ["Major Regional Media", "Education Community", "Parent Networks", "Live Audience 3,500+"];

  const generateCovers = async () => {
    setIsGenerating(true);
    setGenerationError("");
    const prompt = `Create premium child book FRONT and BACK cover. Interest: ${interest}. Tone: ${tone}. Language: ${lang}. Keep elegant and high-end.`;
    try {
      if (!API_KEY) throw new Error("未設定 Monica API key，已切換 demo 生成");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          image_size: "1024x1536",
          count: 2,
        }),
      });
      if (!response.ok) throw new Error(`Monica API 失敗：${response.status}`);
      const data = (await response.json()) as unknown;
      const urls = extractImageUrls(data);
      if (urls.length < 2) throw new Error("Monica API 回傳格式未找到兩張圖");
      setCovers({ front: urls[0], back: urls[1], source: "Monica API" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "封面生成失敗";
      setGenerationError(message);
      setCovers({
        front: svgCover("Little Author", `${tone} Front`, interest, true),
        back: svgCover("Back Story", `${lang} Edition`, interest, false),
        source: "Demo Fallback",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="site">
      <header className="hero">
        <nav className="nav">
          <p className="brand">MyBook Editorial Luxury Studio</p>
          <a href="#deposit" className="nav-btn">
            HKD 500 訂金入口
          </a>
        </nav>

        <div className="hero-grid">
          <section>
            <p className="eyebrow">Premium Child Author Publishing</p>
            <h1>讓家長「看見」孩子未來作品，立即進入成交流程</h1>
            <p className="lead">
              輸入孩子興趣，即時生成前後封 demo，家長可拖曳 360 度檢視 3D 書本。
              系統同時篩選高潛力家庭，只開放匹配客戶進入 HKD 500 訂金。
            </p>
            <div className="cta-row">
              <a className="btn ghost" href="#apply">
                先提交 Apply
              </a>
              <a className="btn primary" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                WhatsApp 客服
              </a>
              <button
                className="btn ghost"
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(WECHAT_ID);
                  setWechatCopied(true);
                  setTimeout(() => setWechatCopied(false), 1800);
                }}
              >
                {wechatCopied ? "已複製 WeChat ID" : `複製 WeChat ID：${WECHAT_ID}`}
              </button>
            </div>
            <div className="highlights">
              <p>3D 即時預覽：家長先看成果，再決定下單。</p>
              <p>高潛力分級：只針對高匹配家庭開放訂金入口。</p>
              <p>隱私優先：不上線任何可辨識舊客姓名與臉部影像。</p>
            </div>
          </section>

          <section className="book-stage">
            <div
              className="book"
              style={
                {
                  "--rx": `${rotation.x}deg`,
                  "--ry": `${rotation.y}deg`,
                  "--front": `url("${covers.front}")`,
                  "--back": `url("${covers.back}")`,
                } as CSSProperties
              }
              onPointerDown={(event) => {
                (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
                setDragging({ startX: event.clientX, startY: event.clientY, baseX: rotation.x, baseY: rotation.y });
              }}
              onPointerMove={(event) => {
                if (!dragging) return;
                const nextY = dragging.baseY + (event.clientX - dragging.startX) * 0.28;
                const nextX = clamp(dragging.baseX - (event.clientY - dragging.startY) * 0.18, -18, 24);
                setRotation({ x: nextX, y: nextY });
              }}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
            >
              <div className="book-face front" />
              <div className="book-face back" />
              <div className="book-face spine" />
              <div className="book-shadow" />
            </div>
          </section>
        </div>
      </header>

      <main>
        <section className="panel">
          <h3>What We Do（6 大服務）</h3>
          <div className="service-grid">
            {serviceItems.map((item) => (
              <article className="service-card" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Featured Case Study（匿名版）</h3>
          <p className="meta">Young Author S, 8, a bilingual school in the Greater Bay Area.</p>
          <p className="case-text">
            孩子以蝴蝶與生態為主題，完成中英雙語自然圖鑑。項目歷時約一年，包含研究、創作、編輯與出版流程。
            最終成果延伸至發布活動與公開展示，並獲區域媒體類型報導。全程採匿名與隱私保護標準。
          </p>
        </section>

        <section className="panel">
          <h3>The Journey（6 Steps）</h3>
          <ol className="journey-list">
            {journeyItems.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h3>封面生成 Demo（Monica API）</h3>
          <div className="generator-grid">
            <input value={interest} onChange={(event) => setInterest(event.target.value)} placeholder="孩子興趣，例如：昆蟲、生態、太空" />
            <select value={tone} onChange={(event) => setTone(event.target.value)}>
              <option>Quiet Luxury</option>
              <option>Editorial Premium</option>
              <option>Modern Global</option>
            </select>
            <select value={lang} onChange={(event) => setLang(event.target.value)}>
              <option>中英雙語</option>
              <option>繁中</option>
              <option>English</option>
            </select>
            <button type="button" className="btn primary" onClick={generateCovers} disabled={isGenerating}>
              {isGenerating ? "生成中..." : "生成前後封"}
            </button>
          </div>
          <p className="meta">
            圖片來源：{covers.source}
            {generationError ? ` | ${generationError}` : ""}
          </p>
        </section>

        <section className="panel" id="deposit">
          <h3>高購買力篩選 + HKD 500 訂金</h3>
          <div className="qualify-grid">
            <label>
              每月教育投資預算
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                <option value="30000+">HKD 30,000+</option>
                <option value="15000+">HKD 15,000+</option>
                <option value="8000+">HKD 8,000+</option>
                <option value="below">低於 HKD 8,000</option>
              </select>
            </label>
            <label>
              啟動時程
              <select value={urgency} onChange={(event) => setUrgency(event.target.value)}>
                <option value="1_month">1 個月內啟動</option>
                <option value="3_month">3 個月內</option>
                <option value="later">半年後再看</option>
              </select>
            </label>
            <label>
              主要目標
              <select value={goal} onChange={(event) => setGoal(event.target.value)}>
                <option value="portfolio">升學 Portfolio 差異化</option>
                <option value="brand">孩子個人品牌與成就展示</option>
                <option value="interest">興趣體驗為主</option>
              </select>
            </label>
            <label>
              家長投入程度
              <select value={involvement} onChange={(event) => setInvolvement(event.target.value)}>
                <option value="high">每週可投入 3 小時以上</option>
                <option value="medium">每週 1-2 小時</option>
                <option value="low">只希望外包處理</option>
              </select>
            </label>
          </div>

          <div className="score-card">
            <p>篩選分數：{leadScore} / 100</p>
            <strong>{leadTier}</strong>
            <p>{canPayDeposit ? "符合條件，已開放訂金頁面。" : "未達門檻，建議先進行客服預審。"} </p>
            <p>{actionPlan}</p>
          </div>

          <div className="cta-row">
            <a
              href={canPayDeposit && DEPOSIT_URL ? DEPOSIT_URL : "#"}
              className={`btn primary ${canPayDeposit ? "" : "disabled"}`}
              aria-disabled={!canPayDeposit}
              onClick={(event) => {
                if (!canPayDeposit || !DEPOSIT_URL) event.preventDefault();
              }}
            >
              支付 HKD 500 訂金
            </a>
            <a className="btn ghost" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
              預審後客服接手
            </a>
          </div>
        </section>

        <section className="panel" id="apply">
          <h3>Apply Intake（24 小時內 WhatsApp 回覆）</h3>
          <p className="meta">Tell us about your child's story. We'll tell you if it's ready to become a book.</p>
          <div className="apply-grid">
            <input value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="孩子名稱（可用英文名）" />
            <select value={childAge} onChange={(event) => setChildAge(event.target.value)}>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
            </select>
            <input value={interestTopic} onChange={(event) => setInterestTopic(event.target.value)} placeholder="興趣主題（例：昆蟲、太空、歷史）" />
            <input value={parentWhatsapp} onChange={(event) => setParentWhatsapp(event.target.value)} placeholder="家長 WhatsApp（例：85291234567）" />
            <select value={schoolType} onChange={(event) => setSchoolType(event.target.value)}>
              <option>國際學校</option>
              <option>本地學校</option>
              <option>雙語學校</option>
              <option>其他</option>
            </select>
            <select value={heardFrom} onChange={(event) => setHeardFrom(event.target.value)}>
              <option>朋友介紹</option>
              <option>WhatsApp</option>
              <option>小紅書</option>
              <option>Google</option>
              <option>其他</option>
            </select>
          </div>
          <div className="cta-row">
            <a className="btn primary" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${applyMessage}`} target="_blank" rel="noreferrer">
              提交 Apply 到 WhatsApp
            </a>
          </div>
        </section>

        <section className="panel" id="faq">
          <h3>FAQ</h3>
          <div className="faq-list">
            {faqItems.map((item) => (
              <article key={item.q} className="faq-item">
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Testimonials</h3>
          <div className="quote-list">
            {testimonials.map((quote) => (
              <blockquote key={quote}>{quote}</blockquote>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Media Coverage Wall</h3>
          <div className="media-wall">
            {mediaMentions.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>隱私合規與品牌保護</h3>
          <ul className="privacy-list">
            <li>網站與素材不得出現任何舊客戶可辨識姓名（包含諧音、縮寫、暱稱）。</li>
            <li>案例圖片僅使用授權素材、AI 圖、或無法辨識個人身分的內容。</li>
            <li>客服腳本預設採匿名稱呼，避免在公開渠道提及客戶身份資訊。</li>
          </ul>
        </section>

        <section className="panel">
          <h3>Monica 任務看板（已讀取）</h3>
          <p className="meta">已同步 Dashboard 與 7 天計劃；目前策略維持你指定的「HKD 500 篩選訂金」模式。</p>
          <div className="execution-grid">
            <div>
              <h4>我可直接執行</h4>
              <ul className="privacy-list">
                {agentTasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>你需在後台手動完成</h4>
              <ul className="privacy-list">
                {userTasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel final-cta">
          <h3>Reserve Your Child's MyBook Discovery Session</h3>
          <p>This HKD 500 deposit secures a 45-minute 1-on-1 session and is redeemable against project fee.</p>
          <div className="cta-row">
            <a className="btn primary" href="#deposit">
              立即評分並進入訂金流程
            </a>
            <a className="btn ghost" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
              直接 WhatsApp 詢問
            </a>
          </div>
        </section>
      </main>
      <a className="floating-wa" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to know more about MyBook for my child.")}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </div>
  );
}
