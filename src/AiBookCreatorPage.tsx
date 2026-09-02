import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "./i18n/LocaleContext";
import { AGE_RANGE_KEYS, type AgeRangeKey } from "./i18n/translations";
import { buildPolishedBackBlurb, deriveBookTopic, getScholarlyProfile, INITIAL_DEFAULT_PROFILE } from "./lib/bookCover";
import { generateBookCoverPair } from "./lib/monica";

const APP_BASE = import.meta.env.BASE_URL;

function localAppHref(path: string): string {
  if (!path || path === "/") return APP_BASE;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_BASE}${trimmed}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "85291214157";

function parseAgeParam(raw: string | null | undefined): AgeRangeKey | "" {
  if (!raw?.trim()) return "";
  const value = raw.trim();
  if (AGE_RANGE_KEYS.includes(value as AgeRangeKey)) return value as AgeRangeKey;
  if (/3.?6|3–6|3-6/.test(value)) return "3-6";
  if (/7.?10|7–10|7-10/.test(value)) return "7-10";
  if (/10\+|10以上|10 歲|10岁|Age 10/i.test(value)) return "10+";
  return "";
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const REST_ROTATION = { x: 12, y: -28 };

type StoryTheme = {
  id: string;
  emoji: string;
  label: string;
  labelZh: string;
  c0: string;
  c1: string;
  c2: string;
};

const OPEN_THEME: StoryTheme = {
  id: "open",
  emoji: "✦",
  label: "Academic Monograph",
  labelZh: "青年學者專著",
  c0: "#0c0d14",
  c1: "#141a29",
  c2: "#1e2b44",
};

function normalizeWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 8) return `852${digits}`;
  if (digits.startsWith("852") && digits.length === 11) return digits;
  if (digits.startsWith("86") && digits.length === 13) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return `86${digits}`;
  return digits;
}

/** Format check only — WhatsApp does not expose a public "is registered" API. */
function isPlausibleWhatsAppNumber(raw: string): boolean {
  const digits = normalizeWhatsApp(raw);
  if (!digits) return false;

  // Hong Kong mobile: 852 + 8 digits (typically starts with 4–9)
  if (digits.startsWith("852") && digits.length === 11) {
    return /^852[4-9]\d{7}$/.test(digits);
  }
  // Mainland China mobile: 86 + 11 digits starting with 1
  if (digits.startsWith("86") && digits.length === 13) {
    return /^86[1]\d{10}$/.test(digits);
  }
  // Other E.164: country code + national number, 10–15 digits total
  if (digits.length >= 10 && digits.length <= 15) {
    return /^\d{10,15}$/.test(digits) && !/^0+$/.test(digits);
  }
  return false;
}

function makeHandshakeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function blankCoverSvgDataUri(variant: "front" | "back"): string {
  const c0 = variant === "back" ? "#080a10" : "#0c0d14";
  const c1 = variant === "back" ? "#101524" : "#141a29";
  const c2 = variant === "back" ? "#1a2238" : "#1e2b44";
  const raw = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <defs>
      <linearGradient id="bgBlank" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c0}"/>
        <stop offset="48%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="glowBlank" cx="50%" cy="32%" r="52%">
        <stop offset="0%" stop-color="rgba(218,185,125,0.12)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#bgBlank)"/>
    <rect width="1024" height="1536" fill="url(#glowBlank)"/>
    <rect x="44" y="44" width="936" height="1448" rx="16" fill="none" stroke="rgba(218,185,125,0.42)" stroke-width="2.5"/>
    <rect x="56" y="56" width="912" height="1424" rx="12" fill="none" stroke="rgba(218,185,125,0.2)" stroke-width="1.2"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

function coverSvgDataUri(opts: {
  title: string;
  titleZh?: string;
  subtitle: string;
  footnote: string;
  emoji: string;
  c0: string;
  c1: string;
  c2: string;
  accent: string;
  variant: "front" | "back";
  editionLine?: string;
  profTitle?: string;
}) {
  const title = escapeXml(opts.title);
  const titleZh = escapeXml(opts.titleZh ?? "");
  const subtitle = escapeXml(opts.subtitle);
  const footnote = escapeXml(opts.footnote);
  const profTitle = escapeXml(opts.profTitle ?? "Faculty of Science · Academic Advisory Board");
  const edition = escapeXml(opts.editionLine ?? "YOUNG SCHOLAR MONOGRAPH SERIES · OXFORD & CAMBRIDGE ADVISORY");
  const titleSize = opts.title.length > 40 ? 52 : opts.title.length > 26 ? 62 : 72;

  if (opts.variant === "back") {
    const rawBack = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
      <defs>
        <linearGradient id="bgBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#080a10"/>
          <stop offset="50%" stop-color="#101524"/>
          <stop offset="100%" stop-color="#1a2238"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1536" fill="url(#bgBack)"/>
      <rect x="44" y="44" width="936" height="1448" rx="16" fill="none" stroke="rgba(218,185,125,0.45)" stroke-width="2.5"/>
      <rect x="56" y="56" width="912" height="1424" rx="12" fill="none" stroke="rgba(218,185,125,0.22)" stroke-width="1.2"/>
      
      <text x="512" y="140" text-anchor="middle" fill="#dab97d" font-size="20" font-family="Georgia, serif" letter-spacing="0.22em">PEER-REVIEWED MONOGRAPH SYNOPSIS</text>
      <text x="890" y="80" text-anchor="end" fill="rgba(218,185,125,0.85)" font-size="16" font-family="Courier, monospace" letter-spacing="0.1em">ISBN 978-988-8765-43-2</text>
      <line x1="200" y1="170" x2="824" y2="170" stroke="rgba(218,185,125,0.3)" stroke-width="1"/>
      
      <text x="100" y="280" fill="#ffffff" font-size="34" font-weight="700" font-family="Georgia, serif">【學術專著審定評語】</text>
      <text x="100" y="360" fill="rgba(255,255,255,0.88)" font-size="26" font-family="sans-serif">本專著收錄第一手實證觀測數據與系統化田野紀錄，</text>
      <text x="100" y="410" fill="rgba(255,255,255,0.88)" font-size="26" font-family="sans-serif">由青年學者執筆，經大學教授學術指導共同研討完成。</text>
      <text x="100" y="460" fill="rgba(255,255,255,0.88)" font-size="26" font-family="sans-serif">全書兼具學術嚴謹度與青年研究者之開創性視野。</text>

      <rect x="100" y="540" width="824" height="180" rx="10" fill="rgba(218,185,125,0.06)" stroke="rgba(218,185,125,0.25)" stroke-width="1"/>
      <text x="130" y="590" fill="#dab97d" font-size="22" font-weight="700" font-family="sans-serif">★ 大學名師推薦 · 香港知名書店正式上架</text>
      <text x="130" y="640" fill="rgba(255,255,255,0.82)" font-size="20" font-family="sans-serif">專為頂尖名校升學打造之核心學術 Portfolio 專著</text>
      <text x="130" y="680" fill="rgba(255,255,255,0.6)" font-size="18" font-family="sans-serif">國際標準書號 (ISBN) 登記 · 公開發行流通認證</text>

      <circle cx="512" cy="920" r="90" fill="none" stroke="#dab97d" stroke-width="2" stroke-dasharray="6,4"/>
      <circle cx="512" cy="920" r="76" fill="rgba(218,185,125,0.08)" stroke="#dab97d" stroke-width="1"/>
      <text x="512" y="910" text-anchor="middle" fill="#dab97d" font-size="18" font-family="Georgia, serif" letter-spacing="0.15em">ACADEMIC PRESS</text>
      <text x="512" y="938" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="700" font-family="Georgia, serif">VERIFIED</text>
      <text x="512" y="960" text-anchor="middle" fill="#dab97d" font-size="14" font-family="sans-serif">ENDORSED</text>

      <line x1="100" y1="1360" x2="924" y2="1360" stroke="rgba(218,185,125,0.3)" stroke-width="1"/>
      <text x="512" y="1410" text-anchor="middle" fill="#dab97d" font-size="20" font-family="Georgia, serif" letter-spacing="0.2em">KIDSMYBOOK ACADEMIC PUBLISHING · HONG KONG</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawBack)}`;
  }

  const raw = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <defs>
      <linearGradient id="bgFront" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.c0}"/>
        <stop offset="48%" stop-color="${opts.c1}"/>
        <stop offset="100%" stop-color="${opts.c2}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="30%" r="50%">
        <stop offset="0%" stop-color="rgba(218,185,125,0.2)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1536" fill="url(#bgFront)"/>
    <rect width="1024" height="1536" fill="url(#glow)"/>
    
    <!-- Academic double gold frame -->
    <rect x="44" y="44" width="936" height="1448" rx="16" fill="none" stroke="rgba(218,185,125,0.5)" stroke-width="2.5"/>
    <rect x="56" y="56" width="912" height="1424" rx="12" fill="none" stroke="rgba(218,185,125,0.25)" stroke-width="1.2"/>
    <line x1="44" y1="90" x2="980" y2="90" stroke="rgba(218,185,125,0.2)" stroke-width="1"/>
    <line x1="44" y1="1446" x2="980" y2="1446" stroke="rgba(218,185,125,0.2)" stroke-width="1"/>
    
    <!-- Top Series Banner & ISBN -->
    <text x="512" y="130" text-anchor="middle" fill="#dab97d" font-size="20" font-family="Georgia, serif" letter-spacing="0.24em">${edition}</text>
    <text x="890" y="80" text-anchor="end" fill="rgba(218,185,125,0.85)" font-size="16" font-family="Courier, monospace" letter-spacing="0.1em">ISBN 978-988-8765-43-2</text>
    <line x1="160" y1="160" x2="864" y2="160" stroke="rgba(218,185,125,0.4)" stroke-width="1"/>

    <!-- Scientific Emblem -->
    <g transform="translate(512, 380)">
      <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(218,185,125,0.3)" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="94" fill="none" stroke="rgba(218,185,125,0.5)" stroke-width="2"/>
      <circle cx="0" cy="0" r="78" fill="rgba(218,185,125,0.08)"/>
      <text x="0" y="24" text-anchor="middle" fill="#dab97d" font-size="70" font-family="Georgia, serif">${opts.emoji}</text>
    </g>

    <!-- Book Titles -->
    <text x="100" y="720" fill="#ffffff" font-size="${titleSize}" font-weight="700" font-family="Georgia, serif">${title}</text>
    ${titleZh ? `<text x="100" y="800" fill="#dab97d" font-size="34" font-family="Georgia, serif" letter-spacing="0.06em">${titleZh}</text>` : ""}
    
    <line x1="100" y1="860" x2="924" y2="860" stroke="rgba(218,185,125,0.35)" stroke-width="1.5"/>

    <!-- Authorship & Co-Author Professor -->
    <text x="100" y="930" fill="rgba(255,255,255,0.96)" font-size="36" font-weight="700" font-family="Georgia, serif">${subtitle}</text>
    <text x="100" y="980" fill="rgba(218,185,125,0.88)" font-size="22" font-family="Georgia, serif">${profTitle}</text>
    
    <!-- Footer Press line -->
    <text x="100" y="1380" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Georgia, serif" letter-spacing="0.1em">${footnote}</text>
    <text x="100" y="1420" fill="#dab97d" font-size="18" font-family="Georgia, serif" letter-spacing="0.18em">KIDSMYBOOK ACADEMIC PRESS · PEER-REVIEWED MONOGRAPH</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

export type AiBookCreatorPanelProps = {
  showBackLink?: boolean;
  releaseTag?: string;
};

export function AiBookCreatorPanel({ showBackLink = true, releaseTag }: AiBookCreatorPanelProps) {
  const { t } = useLocale();
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [personality, setPersonality] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");
  const [wechatContact, setWechatContact] = useState("");
  const [handshakeCode, setHandshakeCode] = useState("");
  const [waChatOpened, setWaChatOpened] = useState(false);
  const [waConfirmedSent, setWaConfirmedSent] = useState(false);
  const [deliveryChannel, setDeliveryChannel] = useState<"whatsapp" | "studio" | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [shareCopied, setShareCopied] = useState<"link" | "wechat" | null>(null);
  const [formError, setFormError] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [coverSource, setCoverSource] = useState<"idle" | "svg" | "ai">("idle");
  const [generatePhase, setGeneratePhase] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const initialProfile = INITIAL_DEFAULT_PROFILE;

  const [coverMeta, setCoverMeta] = useState({
    displayTitle: initialProfile.scholarlyTitleEn,
    displayTitleZh: initialProfile.scholarlyTitleZh,
    seriesName: initialProfile.seriesName,
    authorCredit: `Bespoke Edition · Oxford & Cambridge Academic Advisory`,
    professorTitle: initialProfile.professorTitle,
    bookTopic: initialProfile.scholarlyTitleEn,
    backBlurb: t.aiLab.defaultBackBlurb,
    subfieldZh: initialProfile.subfieldZh,
  });

  const [rotation, setRotation] = useState(REST_ROTATION);
  const [dragging, setDragging] = useState<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const previewAnchorRef = useRef<HTMLDivElement>(null);

  const theme = OPEN_THEME;

  const [covers, setCovers] = useState({
    front: blankCoverSvgDataUri("front"),
    back: blankCoverSvgDataUri("back"),
  });

  useEffect(() => {
    if (previewReady) return;
    setCoverMeta((prev) => ({ ...prev, backBlurb: t.aiLab.defaultBackBlurb }));
  }, [t, previewReady]);

  useEffect(() => {
    if (!previewReady || !previewAnchorRef.current) return;
    const timeout = window.setTimeout(() => {
      previewAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [previewReady]);

  const buildConsultSummary = (name: string, ageLine: string) => {
    const profile = getScholarlyProfile(interests, name);
    const ageLabel = ageLine ? t.aiLab.ageRanges[ageLine as AgeRangeKey] ?? ageLine : "";
    const bits = [
      t.aiLab.consultSummaryHeader,
      `${t.aiLab.consultChild}：${name}`,
      `${t.aiLab.consultTopic}：${interests.trim() || "自然科學"}`,
      `${t.aiLab.consultTitle}：${profile.scholarlyTitleZh}`,
      `${t.aiLab.consultProfessor}：${profile.professorName}`,
      ageLabel && `${t.aiLab.consultAge}：${ageLabel}`,
      personality.trim() && `${t.aiLab.consultPersonality}：${personality.trim()}`,
      whatsappContact.trim() && `${t.aiLab.consultWhatsapp}：${whatsappContact.trim()}`,
      wechatContact.trim() && `${t.aiLab.consultWechat}：${wechatContact.trim()}`,
      t.aiLab.consultSendNote,
    ].filter(Boolean);
    return bits.join("\n");
  };

  const buildPreviewQuery = (
    name: string,
    ageLine: string,
    imageUrls?: { front: string; back: string }
  ) => {
    const params = new URLSearchParams();
    params.set("preview", "1");
    params.set("name", name);
    params.set("age", ageLine);
    if (interests.trim()) params.set("interests", interests.trim());
    if (personality.trim()) params.set("personality", personality.trim());
    if (imageUrls?.front.startsWith("http")) params.set("frontImg", imageUrls.front);
    if (imageUrls?.back.startsWith("http")) params.set("backImg", imageUrls.back);
    return params.toString();
  };

  const applySvgCovers = (
    name: string,
    activeTheme: StoryTheme,
    profile: ReturnType<typeof getScholarlyProfile>
  ) => {
    const authorCredit = `By ${name.trim() || "Young Scholar"} & ${profile.professorName}`;
    setCovers({
      front: coverSvgDataUri({
        title: profile.scholarlyTitleEn,
        titleZh: profile.scholarlyTitleZh,
        subtitle: authorCredit,
        profTitle: profile.professorTitle,
        footnote: `Monograph · ${profile.subfieldZh}`,
        emoji: "⚛",
        c0: activeTheme.c0,
        c1: activeTheme.c1,
        c2: activeTheme.c2,
        accent: "#dab97d",
        variant: "front",
        editionLine: profile.seriesName,
      }),
      back: coverSvgDataUri({
        title: "Peer-Reviewed Synopsis",
        subtitle: profile.professorTitle,
        footnote: "Kidsmybook Academic Publishing",
        emoji: "🏛",
        c0: activeTheme.c0,
        c1: activeTheme.c1,
        c2: activeTheme.c2,
        accent: "#dab97d",
        variant: "back",
      }),
    });
    setCoverSource("svg");
  };

  const resetBookView = () => {
    setRotation(REST_ROTATION);
  };

  const buildCoverCopy = (name: string, topic: string) => {
    const profile = getScholarlyProfile(topic, name);
    const authorCredit = `By ${name.trim() || "Young Scholar"} · with ${profile.professorName}`;
    return {
      displayTitle: profile.scholarlyTitleEn,
      displayTitleZh: profile.scholarlyTitleZh,
      seriesName: profile.seriesName,
      authorCredit,
      professorTitle: profile.professorTitle,
      subfieldZh: profile.subfieldZh,
      footFront: `Monograph · ${profile.subfieldZh}`,
      footBack: profile.professorTitle,
    };
  };

  const notifyStudioToSendPreview = async (
    previewUrl: string,
    name: string,
    ageLine: string,
    imageUrls?: { front: string; back: string }
  ) => {
    const wa = whatsappContact.trim();
    const wx = wechatContact.trim();
    try {
      const res = await fetch("/api/preview-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: ageLine,
          topic: interests.trim(),
          personality: personality.trim(),
          whatsapp: normalizeWhatsApp(wa) || wa,
          wechat: wx,
          previewUrl,
          handshakeCode,
          conversationStarted: Boolean(wa && waChatOpened && waConfirmedSent),
          frontImg: imageUrls?.front?.startsWith("http") ? imageUrls.front : "",
          backImg: imageUrls?.back?.startsWith("http") ? imageUrls.back : "",
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { delivery?: "whatsapp" | "studio" };
      setDeliveryChannel(payload.delivery === "whatsapp" ? "whatsapp" : "studio");
    } catch {
      setDeliveryChannel("studio");
    }
    setLeadSent(true);
  };

  const generatePreview = async () => {
    const name = childName.trim();
    const ageLine = age.trim();
    const topic = interests.trim();
    const wa = whatsappContact.trim();
    const wx = wechatContact.trim();
    if (!name || !topic) {
      setFormError(t.aiLab.errNameTopic);
      return;
    }
    if (!wa && !wx) {
      setFormError(t.aiLab.errContact);
      return;
    }
    if (wa && !isPlausibleWhatsAppNumber(wa)) {
      setFormError(t.aiLab.errWhatsAppInvalid);
      return;
    }
    if (wa && (!waChatOpened || !waConfirmedSent)) {
      setFormError(t.aiLab.errNeedWhatsAppChat);
      return;
    }
    setFormError("");
    setApiNotice("");
    setLeadSent(false);
    setDeliveryChannel(null);
    setIsGenerating(true);
    setGeneratePhase(t.aiLab.generatePhase);
    resetBookView();

    const copy = buildCoverCopy(name, topic);
    const profile = getScholarlyProfile(topic, name);
    const bookTopic = deriveBookTopic(theme, topic);
    const backBlurb = buildPolishedBackBlurb({
      name,
      ageLine,
      theme,
      interests: topic,
      personality,
    });

    setCoverMeta({
      displayTitle: copy.displayTitle,
      displayTitleZh: copy.displayTitleZh,
      seriesName: copy.seriesName,
      authorCredit: copy.authorCredit,
      professorTitle: copy.professorTitle,
      bookTopic,
      backBlurb,
      subfieldZh: copy.subfieldZh,
    });

    let previewUrl = "";
    let generatedImages: { front: string; back: string } | undefined;
    try {
      const pair = await generateBookCoverPair({
        name,
        ageLine: "", // Age removed from cover generation
        themeLabel: topic,
        themeLabelZh: profile.scholarlyTitleZh,
        themeEmoji: "⚛",
        interests: topic,
        personality,
        parentView: "",
        bookTopic,
      });
      generatedImages = { front: pair.frontUrl, back: pair.backUrl };
      setCovers({ front: pair.frontUrl, back: pair.backUrl });
      setCoverSource("ai");
      setApiNotice("");
      setPreviewReady(true);
      const query = buildPreviewQuery(name, ageLine, generatedImages);
      previewUrl = `${window.location.origin}${window.location.pathname}?${query}#ai-book-lab`;
      window.history.replaceState(null, "", `${window.location.pathname}?${query}#ai-book-lab`);
    } catch (err) {
      applySvgCovers(name, theme, profile);
      setPreviewReady(true);
      const message = err instanceof Error ? err.message : "AI cover unavailable";
      setApiNotice(t.aiLab.aiFallbackNotice(message));
      const query = buildPreviewQuery(name, ageLine);
      previewUrl = `${window.location.origin}${window.location.pathname}?${query}#ai-book-lab`;
      window.history.replaceState(null, "", `${window.location.pathname}?${query}#ai-book-lab`);
    } finally {
      setIsGenerating(false);
      setGeneratePhase("");
    }
    if (previewUrl) {
      await notifyStudioToSendPreview(previewUrl, name, ageLine, generatedImages);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") !== "1") return;
    const name = params.get("name")?.trim();
    const ageLine = params.get("age")?.trim();
    const interestsParam = params.get("interests")?.trim() ?? "";
    const personalityParam = params.get("personality")?.trim() ?? "";
    const frontImg = params.get("frontImg")?.trim();
    const backImg = params.get("backImg")?.trim();
    if (name) setChildName(name);
    if (ageLine) {
      const parsedAge = parseAgeParam(ageLine);
      if (parsedAge) setAge(parsedAge);
    }
    if (interestsParam) setInterests(interestsParam);
    if (personalityParam) setPersonality(personalityParam);
    if (name) {
      const copy = buildCoverCopy(name, interestsParam);
      const profile = getScholarlyProfile(interestsParam, name);
      const bookTopic = deriveBookTopic(theme, interestsParam);
      const backBlurb = buildPolishedBackBlurb({
        name,
        ageLine: ageLine ?? "",
        theme,
        interests: interestsParam,
        personality: personalityParam,
      });
      setCoverMeta({
        displayTitle: copy.displayTitle,
        displayTitleZh: copy.displayTitleZh,
        seriesName: copy.seriesName,
        authorCredit: copy.authorCredit,
        professorTitle: copy.professorTitle,
        bookTopic,
        backBlurb,
        subfieldZh: copy.subfieldZh,
      });

      if (frontImg?.startsWith("http") && backImg?.startsWith("http")) {
        setCovers({ front: frontImg, back: backImg });
        setCoverSource("ai");
      } else {
        applySvgCovers(name, theme, profile);
      }
      setPreviewReady(true);
    }
  }, []);

  const consultSummary = useMemo(() => {
    if (!previewReady || !childName.trim()) return "";
    return buildConsultSummary(childName.trim(), age.trim());
  }, [previewReady, childName, age, interests, personality, whatsappContact, wechatContact, t]);

  const previewShareUrl = useMemo(() => {
    if (!previewReady || !childName.trim()) return "";
    const query = buildPreviewQuery(
      childName.trim(),
      age.trim(),
      coverSource === "ai" ? covers : undefined
    );
    return `${window.location.origin}${window.location.pathname}?${query}#ai-book-lab`;
  }, [previewReady, childName, age, interests, personality, coverSource, covers]);

  const studioNotifyUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    previewShareUrl
      ? `${consultSummary}\n\n${t.aiLab.previewLinkInMessage}：${previewShareUrl}`
      : consultSummary
  )}`;

  const copyShareLink = async () => {
    if (!previewShareUrl) return;
    await navigator.clipboard?.writeText(previewShareUrl);
    setShareCopied("link");
    window.setTimeout(() => setShareCopied(null), 2000);
  };

  return (
    <section className="panel panel-showcase ai-book-hero-panel" id="ai-book-lab">
      <div className="showcase-heading">
        {releaseTag ? <p className="ai-release-tag">{releaseTag}</p> : null}
        <p className="eyebrow">{t.aiLab.eyebrow}</p>
        <h3>{t.aiLab.title}</h3>
      </div>

      <div className="ai-book-layout">
        <div className="ai-book-form">
          <p className="ai-form-kicker">{t.aiLab.formKicker}</p>
          <h4 className="ai-form-title">{t.aiLab.formTitle}</h4>

          <label className="ai-field">
            <span>
              {t.aiLab.childName} <span className="req">*</span>
            </span>
            <input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder={t.aiLab.childNamePlaceholder}
              autoComplete="given-name"
            />
          </label>

          <label className="ai-field">
            <span>
              {t.aiLab.interests} <span className="req">*</span>
            </span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder={t.aiLab.interestsPlaceholder}
            />
          </label>

          <label className="ai-field">
            <span>{t.aiLab.age}</span>
            <select value={age} onChange={(e) => setAge(e.target.value)} aria-label={t.aiLab.age}>
              <option value="">{t.aiLab.ageSelect}</option>
              {AGE_RANGE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t.aiLab.ageRanges[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="ai-field">
            <span>{t.aiLab.personality}</span>
            <input
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder={t.aiLab.personalityPlaceholder}
            />
          </label>

          <div className="ai-contact-grid">
            <label className="ai-field">
              <span>{t.aiLab.whatsapp}</span>
              <input
                value={whatsappContact}
                onChange={(e) => {
                  setWhatsappContact(e.target.value);
                  setWaChatOpened(false);
                  setWaConfirmedSent(false);
                  setHandshakeCode("");
                }}
                placeholder={t.aiLab.whatsappPlaceholder}
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            <label className="ai-field">
              <span>{t.aiLab.wechat}</span>
              <input
                value={wechatContact}
                onChange={(e) => setWechatContact(e.target.value)}
                placeholder={t.aiLab.wechatPlaceholder}
                autoComplete="off"
              />
            </label>
          </div>
          {isPlausibleWhatsAppNumber(whatsappContact) ? (
            <div className="wa-handshake">
              <p className="meta ai-form-hint">{t.aiLab.waChatHint}</p>
              {handshakeCode ? (
                <p className="wa-handshake__code">
                  {t.aiLab.waCodeLabel}：<strong>{handshakeCode}</strong>
                </p>
              ) : null}
              <button
                type="button"
                className="btn ghost wa-handshake__open"
                onClick={() => {
                  const code = handshakeCode || makeHandshakeCode();
                  if (!handshakeCode) setHandshakeCode(code);
                  const text = t.aiLab.waHandshakeMessage(code, childName.trim());
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                  setWaChatOpened(true);
                }}
              >
                {waChatOpened ? t.aiLab.waChatOpened : t.aiLab.waStartChat}
              </button>
              <label className="wa-handshake__confirm">
                <input
                  type="checkbox"
                  checked={waConfirmedSent}
                  onChange={(e) => setWaConfirmedSent(e.target.checked)}
                  disabled={!waChatOpened}
                />
                <span>{t.aiLab.waConfirmSent}</span>
              </label>
            </div>
          ) : null}
          <p className="meta ai-form-hint">{t.aiLab.contactHint}</p>

          {formError ? <p className="ai-form-error" role="alert">{formError}</p> : null}
          {apiNotice ? <p className="ai-form-notice" role="status">{apiNotice}</p> : null}

          <button
            type="button"
            className="btn primary ai-generate-btn"
            onClick={() => void generatePreview()}
            disabled={isGenerating}
          >
            {isGenerating ? generatePhase || t.aiLab.generating : t.aiLab.generateBtn}
          </button>
          <p className="meta ai-form-hint">{t.aiLab.aiTimingHint}</p>

          {previewReady ? (
            <div className="ai-cta-card ai-cta-card--ready">
              <h4>
                {leadSent
                  ? deliveryChannel === "whatsapp"
                    ? t.aiLab.previewSentWhatsApp
                    : t.aiLab.previewSent
                  : t.aiLab.previewReady}
              </h4>
              <p className="ai-cta-copy">
                {t.aiLab.previewSendCopy}
                {whatsappContact.trim() ? ` WhatsApp ${whatsappContact.trim()}` : ""}
                {whatsappContact.trim() && wechatContact.trim() ? " /" : ""}
                {wechatContact.trim() ? ` WeChat ${wechatContact.trim()}` : ""}
                {t.aiLab.previewSendEnd}
              </p>
              <div className="ai-share-link-row">
                <input className="ai-share-link-input" readOnly value={previewShareUrl} aria-label={t.aiLab.previewLinkLabel} />
                <button type="button" className="btn ghost ai-share-copy-btn" onClick={copyShareLink}>
                  {shareCopied === "link" ? t.aiLab.copiedLink : t.aiLab.copyLink}
                </button>
              </div>
              <a className="btn ghost ai-cta-primary" href={studioNotifyUrl} target="_blank" rel="noreferrer">
                {t.aiLab.notifyStudio}
              </a>
            </div>
          ) : null}
        </div>

        <div className="ai-book-side">
          <p className="ai-form-kicker">{t.aiLab.previewKicker}</p>
          <div
            ref={previewAnchorRef}
            className={`book-stage-wrap ai-book-stage-wrap ai-book-stage-wrap--hero ${previewReady ? "ai-book-stage-wrap--ready" : ""}`}
          >
            <div className="ai-book-pedestal" aria-hidden />
            <div className="book-stage">
              <div
                className={`book-vol ${previewReady ? "book-vol--ready" : ""} ${coverSource === "ai" ? "book-vol--ai" : ""} ${dragging ? "book-vol--dragging" : ""}`}
                onPointerDown={(event) => {
                  (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
                  setDragging({
                    startX: event.clientX,
                    startY: event.clientY,
                    baseX: rotation.x,
                    baseY: rotation.y,
                  });
                }}
                onPointerMove={(event) => {
                  if (!dragging) return;
                  const nextY = dragging.baseY + (event.clientX - dragging.startX) * 0.22;
                  const nextX = dragging.baseX - (event.clientY - dragging.startY) * 0.14;
                  setRotation({ x: nextX, y: nextY });
                }}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
              >
                <div
                  className="book-vol__rig"
                  style={
                    {
                      "--rx": `${rotation.x}deg`,
                      "--ry": `${rotation.y}deg`,
                    } as CSSProperties
                  }
                >
                  <div className="book-vol__face book-vol__face--front">
                    <img className="book-vol__cover-img" src={covers.front} alt="" draggable={false} />
                    <div className="book-cover-frame-square" aria-hidden />
                    {coverSource === "ai" ? (
                      <div className="book-cover-overlay book-cover-overlay--front">
                        <div className="book-cover-overlay__header-row">
                          <p className="book-cover-overlay__edition">{coverMeta.seriesName}</p>
                          <span className="book-cover-overlay__isbn">ISBN 978-988-8765-43-2</span>
                        </div>
                        <h5 className="book-cover-overlay__title">{coverMeta.displayTitle}</h5>
                        {coverMeta.displayTitleZh ? (
                          <p className="book-cover-overlay__title-zh">{coverMeta.displayTitleZh}</p>
                        ) : null}
                        <div className="book-cover-overlay__author-box">
                          <p className="book-cover-overlay__author">{coverMeta.authorCredit}</p>
                          <p className="book-cover-overlay__prof-title">{coverMeta.professorTitle}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="book-vol__face book-vol__face--back">
                    <img className="book-vol__cover-img" src={covers.back} alt="" draggable={false} />
                    <div className="book-cover-frame-square" aria-hidden />
                    {coverSource === "ai" ? (
                      <div className="book-cover-overlay book-cover-overlay--back">
                        <div className="book-cover-overlay__back-header">
                          <p className="book-cover-overlay__edition">PEER-REVIEWED MONOGRAPH SYNOPSIS</p>
                          <span className="book-cover-overlay__isbn">ISBN 978-988-8765-43-2</span>
                        </div>
                        <p className="book-cover-overlay__blurb">{coverMeta.backBlurb}</p>
                        <div className="book-cover-overlay__seal-row">
                          <span className="book-cover-overlay__badge">{t.aiLab.coverBadge}</span>
                          <div className="book-cover-overlay__barcode-row">
                            <div className="book-cover-overlay__barcode" aria-hidden>
                              <div className="barcode-bars" />
                              <span className="barcode-code">9 789888 765432</span>
                            </div>
                            <p className="book-cover-overlay__brand">{t.aiLab.coverBrand}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="book-vol__face book-vol__face--spine" aria-hidden />
                  <div className="book-vol__face book-vol__face--fore" aria-hidden />
                  <div className="book-vol__face book-vol__face--top" aria-hidden />
                  <div className="book-vol__face book-vol__face--bottom" aria-hidden />
                </div>
                <div className="book-vol__shadow" aria-hidden />
              </div>
            </div>
          </div>
          <p className="meta ai-drag-hint">{previewReady ? t.aiLab.dragHintReady : t.aiLab.dragHintIdle}</p>
        </div>
      </div>

      {showBackLink ? (
        <p className="meta ai-page-back">
          <a href={localAppHref("/")}>{t.aiLab.backHome}</a>
        </p>
      ) : null}
    </section>
  );
}
