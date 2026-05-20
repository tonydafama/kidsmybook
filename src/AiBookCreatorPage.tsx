import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const APP_BASE = import.meta.env.BASE_URL;

function localAppHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85200000000";
const DEPOSIT_HKD = "2,000";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type StoryTheme = {
  id: string;
  emoji: string;
  label: string;
  labelZh: string;
  c0: string;
  c1: string;
  c2: string;
  /** Full-width chip in theme grid */
  wide?: boolean;
};

const STORY_THEMES: StoryTheme[] = [
  { id: "space", emoji: "🚀", label: "Adventure in Space", labelZh: "太空冒險", c0: "#0b1020", c1: "#312e81", c2: "#6d28d9" },
  { id: "ocean", emoji: "🌊", label: "Underwater Kingdom", labelZh: "海底王國", c0: "#051a24", c1: "#0e7490", c2: "#0369a1" },
  { id: "forest", emoji: "🌿", label: "Magical Forest", labelZh: "魔法森林", c0: "#0f172a", c1: "#14532d", c2: "#15803d" },
  { id: "time", emoji: "⌛", label: "Time Travel", labelZh: "時空旅行", c0: "#1c1410", c1: "#854d0e", c2: "#b45309" },
  { id: "dino", emoji: "🦕", label: "Dinosaur World", labelZh: "恐龍世界", c0: "#1a1510", c1: "#3f2e1f", c2: "#a16207" },
  { id: "fairy", emoji: "🏰", label: "Fairy Tale Castle", labelZh: "童話城堡", c0: "#1e1033", c1: "#5b21b6", c2: "#a855f7" },
  {
    id: "open",
    emoji: "✨",
    label: "Open",
    labelZh: "自由主題 · 由孩子定義",
    c0: "#12101a",
    c1: "#5c4a7a",
    c2: "#c8a874",
    wide: true,
  },
];

const CHILD_AGE_OPTIONS: string[] = Array.from({ length: 21 - 3 + 1 }, (_, i) => `${3 + i} years old`);

function coverSvgDataUri(opts: {
  title: string;
  subtitle: string;
  footnote: string;
  emoji: string;
  c0: string;
  c1: string;
  c2: string;
  accent: string;
  variant: "front" | "back";
  editionLine?: string;
}) {
  const title = escapeXml(opts.title);
  const subtitle = escapeXml(opts.subtitle);
  const footnote = escapeXml(opts.footnote);
  const emoji = escapeXml(opts.emoji);
  const edition = escapeXml(opts.editionLine ?? "MYBOOK · BESPOKE CHILD EDITION");
  const titleSize = opts.title.length > 36 ? 58 : opts.title.length > 28 ? 68 : 76;
  const raw = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.c0}"/>
        <stop offset="48%" stop-color="${opts.c1}"/>
        <stop offset="100%" stop-color="${opts.c2}"/>
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#bg)"/>
    <rect width="1024" height="1536" fill="url(#shine)"/>
    <rect x="48" y="48" width="928" height="1440" rx="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
    <text x="512" y="280" text-anchor="middle" fill="${opts.accent}" font-size="128">${emoji}</text>
    <text x="120" y="400" fill="rgba(255,255,255,0.72)" font-size="30" font-family="Georgia, serif" letter-spacing="0.12em">${edition}</text>
    <text x="120" y="880" fill="white" font-size="${titleSize}" font-weight="700" font-family="Georgia, serif">${title}</text>
    <text x="120" y="980" fill="rgba(255,255,255,0.94)" font-size="38" font-family="Georgia, serif">${subtitle}</text>
    <text x="120" y="1200" fill="rgba(255,255,255,0.8)" font-size="32" font-family="Georgia, serif">${footnote}</text>
    <text x="120" y="1320" fill="${opts.accent}" font-size="26" font-family="Georgia, serif" opacity="0.9">Hong Kong · Quiet Luxury Publishing</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

export type AiBookCreatorPanelProps = {
  showBackLink?: boolean;
  releaseTag?: string;
};

export function AiBookCreatorPanel({ showBackLink = true, releaseTag }: AiBookCreatorPanelProps) {
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [favAnimal, setFavAnimal] = useState("");
  const [personality, setPersonality] = useState("");
  const [themeId, setThemeId] = useState<string>(STORY_THEMES[4].id);
  const [formError, setFormError] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rotation, setRotation] = useState({ x: 6, y: -30 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const previewAnchorRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(() => STORY_THEMES.find((t) => t.id === themeId) ?? STORY_THEMES[0], [themeId]);

  const [covers, setCovers] = useState({
    front: coverSvgDataUri({
      title: "Your Child's Edition",
      subtitle: "Bespoke achievement publishing",
      footnote: "Complete the form to reveal your cover",
      emoji: "📚",
      c0: "#0f0f11",
      c1: "#2c193f",
      c2: "#7351b8",
      accent: "#e8cb9a",
      variant: "front",
    }),
    back: coverSvgDataUri({
      title: "Author Programme",
      subtitle: "Launch · Exhibition · Media",
      footnote: "Full achievement pathway",
      emoji: "✨",
      c0: "#0f0f11",
      c1: "#2c193f",
      c2: "#7351b8",
      accent: "#e8cb9a",
      variant: "back",
    }),
  });

  useEffect(() => {
    if (!previewReady || !previewAnchorRef.current) return;
    const t = window.setTimeout(() => {
      previewAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [previewReady]);

  const buildCoverCopy = (name: string, ageLine: string, activeTheme: StoryTheme) => {
    const displayTitle = fitCoverTitleForTheme(name, activeTheme, interests);
    const subtitle = `Written by ${name}, ${ageLine}`;
    const detailBits = [
      interests.trim() && `興趣：${interests.trim()}`,
      favAnimal.trim() && `喜愛：${favAnimal.trim()}`,
      personality.trim() && `特質：${personality.trim()}`,
    ].filter(Boolean);
    const footFront =
      activeTheme.id === "open"
        ? detailBits.join(" · ") || "Your theme · your child's voice"
        : detailBits.join(" · ") || `Theme · ${activeTheme.labelZh}`;
    const footBack = detailBits.length
      ? `成就出版備忘 · ${detailBits.join(" · ")}`
      : "MyBook · 出版 · 發布 · 展覽 · 媒體 · 升學作品集";
    return { displayTitle, subtitle, footFront, footBack };
  };

  const generatePreview = () => {
    const name = childName.trim();
    const ageLine = age.trim();
    if (!name || !ageLine || !theme) {
      setFormError("請填寫孩子姓名、選擇年齡（3–21 歲），並選擇故事主題。");
      return;
    }
    setFormError("");
    setIsGenerating(true);
    const activeTheme = theme;
    const { displayTitle, subtitle, footFront, footBack } = buildCoverCopy(name, ageLine, activeTheme);

    window.setTimeout(() => {
      setCovers({
        front: coverSvgDataUri({
          title: displayTitle,
          subtitle,
          footnote: footFront,
          emoji: activeTheme.emoji,
          c0: activeTheme.c0,
          c1: activeTheme.c1,
          c2: activeTheme.c2,
          accent: "#f5e6c8",
          variant: "front",
          editionLine: "MYBOOK · BESPOKE CHILD EDITION",
        }),
        back: coverSvgDataUri({
          title: `${name} 的成就之旅`,
          subtitle: "Author Programme · Full pathway",
          footnote: footBack,
          emoji: "📖",
          c0: activeTheme.c0,
          c1: activeTheme.c1,
          c2: activeTheme.c2,
          accent: "#e8cb9a",
          variant: "back",
        }),
      });
      setPreviewReady(true);
      setIsGenerating(false);
    }, 520);
  };

  const summaryForWa = useMemo(() => {
    const bits = [
      `【MyBook 童書預覽】`,
      `孩子：${childName.trim() || "—"}`,
      `年齡：${age.trim() || "—"}`,
      `故事主題：${theme?.label ?? ""}${theme?.id === "open" ? "（自由主題）" : ""}`,
      interests.trim() && `興趣：${interests.trim()}`,
      favAnimal.trim() && `喜愛動物：${favAnimal.trim()}`,
      personality.trim() && `性格：${personality.trim()}`,
      `希望了解全案出版與成就方案（私人諮詢）。`,
    ].filter(Boolean);
    return bits.join("\n");
  }, [childName, age, theme, interests, favAnimal, personality]);

  const waConsult = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summaryForWa)}`;
  const waDeposit = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `${summaryForWa}\n\n我想以 HK$${DEPOSIT_HKD} 可退款留位，鎖定本季 Author Programme 名額，請安排顧問回覆。`
  )}`;

  return (
    <section className="panel panel-showcase ai-book-hero-panel" id="ai-book-lab">
      <div className="showcase-heading">
        {releaseTag ? <p className="ai-release-tag">{releaseTag}</p> : null}
        <p className="eyebrow">Private publishing · Hong Kong</p>
        <h3>為孩子生成專屬出版封面預覽</h3>
        <p className="meta showcase-lede">
          三分鐘感受「正式出版」的份量。填寫資料後即時預覽封面；滿意可 WhatsApp 帶齊資料諮詢全案，或了解可退款留位鎖定本季名額。
        </p>
        <ul className="ai-trust-strip" aria-label="服務定位">
          <li>高訂兒童成就出版全案</li>
          <li>出版 · 發布 · 展覽 · 媒體 · 作品集</li>
          <li>每季限量接案 · 1 對 1 顧問</li>
        </ul>
      </div>

      <div className="ai-book-layout">
        <div className="ai-book-form">
          <p className="ai-form-kicker">Step 1 · 約 2 分鐘</p>
          <h4 className="ai-form-title">Tell Us About Your Child</h4>

          <label className="ai-field">
            <span>
              Child&apos;s Name <span className="req">*</span>
            </span>
            <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="e.g. Emma" autoComplete="given-name" />
          </label>

          <label className="ai-field">
            <span>
              Age <span className="req">*</span>
            </span>
            <select value={age} onChange={(e) => setAge(e.target.value)} aria-label="Age in years">
              <option value="">Select age · 請選擇（3–21 歲）</option>
              {CHILD_AGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="ai-field">
            <span>Interests &amp; Hobbies</span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder={themeId === "open" ? "建議填寫 · 將成為封面敘事重點" : "e.g. butterflies, robotics"}
            />
          </label>

          <label className="ai-field">
            <span>Favourite Animal</span>
            <input value={favAnimal} onChange={(e) => setFavAnimal(e.target.value)} placeholder="e.g. dog" />
          </label>

          <label className="ai-field">
            <span>Personality Traits</span>
            <input value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="e.g. curious, gentle" />
          </label>

          <fieldset className="ai-theme-fieldset">
            <legend>
              Story Theme <span className="req">*</span>
            </legend>
            <p className="ai-theme-hint">選「Open」可配合上方興趣，打造不限題材的專屬敘事。</p>
            <div className="theme-chip-grid" role="group" aria-label="Story theme">
              {STORY_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-chip ${themeId === t.id ? "theme-chip--active" : ""} ${t.wide ? "theme-chip--wide" : ""}`}
                  onClick={() => setThemeId(t.id)}
                  aria-pressed={themeId === t.id}
                >
                  <span className="theme-chip-emoji" aria-hidden>
                    {t.emoji}
                  </span>
                  <span className="theme-chip-label">{t.label}</span>
                  <span className="theme-chip-zh">{t.labelZh}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {formError ? <p className="ai-form-error" role="alert">{formError}</p> : null}

          <button type="button" className="btn primary ai-generate-btn" onClick={generatePreview} disabled={isGenerating}>
            {isGenerating ? "正在為孩子編排封面…" : "✨ 生成專屬封面預覽"}
          </button>
          <p className="meta ai-form-hint">預覽為高訂版型示意；成書由編輯、設計與策展團隊為孩子完整打造。</p>
        </div>

        <div className="ai-book-side">
          <p className="ai-form-kicker">Step 2 · 您的孩子的書</p>
          <div
            ref={previewAnchorRef}
            className={`book-stage-wrap ai-book-stage-wrap ${previewReady ? "ai-book-stage-wrap--ready" : ""}`}
          >
            <div className="ai-book-pedestal" aria-hidden />
            <div className="book-stage">
              <div
                className={`book-vol ${previewReady ? "book-vol--ready" : ""}`}
                style={
                  {
                    "--rx": `${rotation.x}deg`,
                    "--ry": `${rotation.y}deg`,
                    "--front": `url("${covers.front}")`,
                    "--back": `url("${covers.back}")`,
                    "--spine-a": "#0f0f11",
                    "--spine-b": "#7351b8",
                    "--edge-a": "#1a1428",
                    "--edge-b": "#4a3377",
                  } as CSSProperties
                }
                onPointerDown={(event) => {
                  (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
                  setDragging({ startX: event.clientX, startY: event.clientY, baseX: rotation.x, baseY: rotation.y });
                }}
                onPointerMove={(event) => {
                  if (!dragging) return;
                  const nextY = dragging.baseY + (event.clientX - dragging.startX) * 0.17;
                  const nextX = clamp(dragging.baseX - (event.clientY - dragging.startY) * 0.12, -10, 14);
                  setRotation({ x: nextX, y: nextY });
                }}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
              >
                <div className="book-vol__rig">
                  <div className="book-vol__face book-vol__face--front" />
                  <div className="book-vol__face book-vol__face--back" />
                  <div className="book-vol__face book-vol__face--spine" aria-hidden />
                  <div className="book-vol__face book-vol__face--edge" aria-hidden />
                </div>
                <div className="book-vol__shadow" aria-hidden />
              </div>
            </div>
          </div>
          <p className="meta ai-drag-hint">{previewReady ? "拖曳書本 · 感受成書份量" : "完成 Step 1 後，封面將在此呈現"}</p>

          <div className={`ai-cta-card ${previewReady ? "ai-cta-card--ready" : "ai-cta-card--muted"}`}>
            {previewReady ? (
              <>
                <p className="ai-cta-eyebrow">Next step</p>
                <h4>這就是您孩子可能被世界看見的方式</h4>
                <p className="ai-cta-copy">
                  全案成就出版含編輯、設計、發布、展覽與媒體敘事。本季名額有限；可先以{" "}
                  <strong>HK${DEPOSIT_HKD} 可退款留位</strong> 鎖定顧問時段（條款以合約為準）。
                </p>
                <div className="ai-cta-row">
                  <a className="btn primary ai-cta-primary" href={waConsult} target="_blank" rel="noreferrer">
                    WhatsApp 諮詢全案（已帶預覽資料）
                  </a>
                  <a className="btn ghost" href={waDeposit} target="_blank" rel="noreferrer">
                    留位訂金 HK${DEPOSIT_HKD}
                  </a>
                </div>
                <p className="meta ai-cta-foot">無需重填資料 · 按鈕會自動帶入孩子姓名、年齡與主題。</p>
              </>
            ) : (
              <p className="ai-cta-copy">填寫左側並按「生成專屬封面預覽」，即可在此看到專屬書名與聯繫選項。</p>
            )}
          </div>
        </div>
      </div>

      {showBackLink ? (
        <p className="meta ai-page-back">
          <a href={localAppHref("/")}>← 返回首頁</a>
        </p>
      ) : null}
    </section>
  );
}

function fitCoverTitleForTheme(name: string, theme: StoryTheme, interests: string): string {
  if (theme.id === "open") {
    const hint = interests.trim();
    if (hint.length > 0 && hint.length <= 18) return `${name} · ${hint}`;
    return `${name}'s Story`;
  }
  const raw = `${name}'s ${theme.label}`;
  return raw.length > 42 ? `${name}'s Edition` : raw;
}

