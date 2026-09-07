export interface Env {
  ASSETS: Fetcher;
  kidsmybook_leads: KVNamespace;
  MONICA_API_KEY?: string;
  PREVIEW_LEAD_WEBHOOK?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
}

const MONICA_FLUX_URL = "https://openapi.monica.im/v1/image/gen/flux";
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type CoverGenerateBody = {
  frontPrompt?: string;
  backPrompt?: string;
};

type MonicaFluxResponse = {
  data?: { url?: string }[];
  error?: { code?: string; message?: string };
};

async function generateFluxImage(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

  try {
    const res = await fetch(MONICA_FLUX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model: "flux_dev",
        num_outputs: 1,
        size: "768x1344",
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    let payload: MonicaFluxResponse;
    try {
      payload = JSON.parse(text) as MonicaFluxResponse;
    } catch {
      throw new Error(`Monica API returned unexpected response (${res.status}): ${text.slice(0, 100)}`);
    }

    if (!res.ok) {
      const msg = payload.error?.message ?? `Monica API HTTP ${res.status}`;
      throw new Error(msg);
    }

    const url = payload.data?.[0]?.url;
    if (!url) throw new Error("Monica API returned no image URL");
    return url;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleCoverGenerate(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Rate Limiting: Max 3 requests per IP per day (using Cloudflare Cache API)
  const ip = request.headers.get("cf-connecting-ip") || "unknown-ip";
  const cache = caches.default;
  const today = new Date().toISOString().split("T")[0]; // e.g., "2026-09-03"
  const cacheKey = new Request(`https://kidsmybook.com/ratelimit/${ip}/${today}`);
  
  let count = 0;
  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      count = parseInt(await cachedResponse.text(), 10) || 0;
    }
  } catch (err) {
    console.error("Cache read error:", err);
  }

  if (count >= 3) {
    return json({ error: "Daily limit reached. Please try again tomorrow." }, 429);
  }

  const apiKey = env.MONICA_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Cover API is not configured (missing MONICA_API_KEY)." }, 503);
  }

  let body: CoverGenerateBody;
  try {
    body = (await request.json()) as CoverGenerateBody;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const frontPrompt = body.frontPrompt?.trim();
  if (!frontPrompt) {
    return json({ error: "frontPrompt is required." }, 400);
  }

  try {
    // Generate primary front cover artwork
    const frontUrl = await generateFluxImage(frontPrompt, apiKey);
    
    // For back cover, use the high-quality companion front artwork background
    const backUrl = frontUrl;

    // Increment rate limit counter on success
    try {
      const newResponse = new Response((count + 1).toString(), {
        headers: { "Cache-Control": "max-age=86400" }, // Cache for 24 hours
      });
      await cache.put(cacheKey, newResponse);
    } catch (err) {
      console.error("Cache write error:", err);
    }

    return json({ frontUrl, backUrl }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cover generation failed";
    return json({ error: message }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

type PreviewLeadBody = {
  name?: string;
  age?: string;
  topic?: string;
  personality?: string;
  whatsapp?: string;
  wechat?: string;
  previewUrl?: string;
  handshakeCode?: string;
  conversationStarted?: boolean;
  frontImg?: string;
  backImg?: string;
};

type LeadPayload = {
  name: string;
  age: string;
  topic: string;
  personality: string;
  whatsapp: string;
  wechat: string;
  previewUrl: string;
  handshakeCode: string;
  conversationStarted: boolean;
  frontImg: string;
  backImg: string;
  receivedAt: string;
};

type DeliveryChannel = "whatsapp" | "studio";

async function sendWhatsAppJson(
  phoneNumberId: string,
  token: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WhatsApp API ${res.status}: ${text.slice(0, 400)}`);
  }
}

/** Send cover image + 3D preview link. Requires an open 24h session (parent messaged first). */
async function sendWhatsAppPreview(lead: LeadPayload, env: Env): Promise<boolean> {
  const token = env.WHATSAPP_TOKEN?.trim();
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = lead.whatsapp.replace(/\D/g, "");
  if (!token || !phoneId || !to || !lead.conversationStarted) return false;

  const caption = [
    `Kidsmybook 專著封面預覽 · ${lead.name}`,
    lead.handshakeCode ? `驗證碼 ${lead.handshakeCode}` : "",
    lead.previewUrl,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    if (lead.frontImg.startsWith("http")) {
      await sendWhatsAppJson(phoneId, token, {
        to,
        type: "image",
        image: { link: lead.frontImg, caption: caption.slice(0, 1024) },
      });
    } else {
      await sendWhatsAppJson(phoneId, token, {
        to,
        type: "text",
        text: { preview_url: true, body: caption },
      });
    }
    return true;
  } catch (err) {
    console.error("WhatsApp send to parent failed:", err);
    return false;
  }
}

async function sendTelegramNotification(lead: LeadPayload, botToken: string, chatId: string): Promise<void> {
  const cleanWa = lead.whatsapp.replace(/\D/g, "");
  const waLink = cleanWa ? `https://wa.me/${cleanWa}` : "";
  
  const lines = [
    `🚨 <b>【Kidsmybook 新客戶即時通知】</b>`,
    ``,
    `• <b>小作者姓名</b>：${lead.name}`,
    `• <b>興趣題材</b>：${lead.topic || "未填寫"}`,
    lead.age ? `• <b>年齡階段</b>：${lead.age}` : "",
    lead.personality ? `• <b>孩子特質</b>：${lead.personality}` : "",
    lead.whatsapp ? `• <b>WhatsApp</b>：<code>${lead.whatsapp}</code>` : "",
    lead.handshakeCode ? `• <b>驗證碼</b>：<code>${lead.handshakeCode}</code>（請回覆該對話）` : "",
    lead.conversationStarted ? `• <b>家長已開啟 WhatsApp 對話</b>` : "",
    lead.wechat ? `• <b>WeChat ID</b>：<code>${lead.wechat}</code>` : "",
    ``,
    `📖 <b>3D 專著預覽連結</b>：`,
    `<a href="${lead.previewUrl}">${lead.previewUrl}</a>`,
    lead.frontImg.startsWith("http") ? `🖼 <b>封面圖</b>：<a href="${lead.frontImg}">${lead.frontImg}</a>` : "",
  ];

  if (waLink) {
    lines.push(``, `👉 <a href="${waLink}">點擊直接開啟 WhatsApp 回覆家長</a>`);
  }

  const text = lines.filter(Boolean).join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram send failed:", errText);
    }
  } catch (err) {
    console.error("Telegram network error:", err);
  }

  if (lead.frontImg.startsWith("http")) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: lead.frontImg,
          caption: `封面圖 · ${lead.name}${lead.handshakeCode ? ` · 驗證碼 ${lead.handshakeCode}` : ""}\n請把此圖與預覽連結發回家長 WhatsApp。`,
        }),
      });
    } catch (err) {
      console.error("Telegram photo failed:", err);
    }
  }
}

async function sendResendEmail(lead: LeadPayload, apiKey: string, toEmail: string): Promise<void> {
  const cleanWa = lead.whatsapp.replace(/\D/g, "");
  const waLink = cleanWa ? `https://wa.me/${cleanWa}` : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0e18; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(218, 185, 125, 0.4);">
      <h2 style="color: #dab97d; margin-top: 0;">🚨 Kidsmybook 新客戶預覽通知</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #ad9d85; width: 100px;">小作者：</td><td style="padding: 8px 0; font-weight: bold; font-size: 15px;">${lead.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #ad9d85;">興趣題材：</td><td style="padding: 8px 0; font-weight: bold; color: #dab97d; font-size: 15px;">${lead.topic || "未填寫"}</td></tr>
        ${lead.age ? `<tr><td style="padding: 8px 0; color: #ad9d85;">年齡：</td><td style="padding: 8px 0;">${lead.age}</td></tr>` : ""}
        ${lead.personality ? `<tr><td style="padding: 8px 0; color: #ad9d85;">特質：</td><td style="padding: 8px 0;">${lead.personality}</td></tr>` : ""}
        ${lead.whatsapp ? `<tr><td style="padding: 8px 0; color: #ad9d85;">WhatsApp：</td><td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #25D366;">${lead.whatsapp}</td></tr>` : ""}
        ${lead.wechat ? `<tr><td style="padding: 8px 0; color: #ad9d85;">WeChat ID：</td><td style="padding: 8px 0; font-weight: bold;">${lead.wechat}</td></tr>` : ""}
      </table>
      <div style="margin-top: 20px; padding: 14px; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);">
        <p style="margin: 0 0 6px; font-size: 12px; color: #ad9d85;">3D 專著預覽連結：</p>
        <a href="${lead.previewUrl}" style="color: #dab97d; word-break: break-all; font-size: 14px;">${lead.previewUrl}</a>
      </div>
      ${waLink ? `
      <div style="margin-top: 22px;">
        <a href="${waLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 15px;">
          👉 點擊開啟 WhatsApp 回覆家長
        </a>
      </div>` : ""}
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Kidsmybook Alerts <onboarding@resend.dev>",
        to: [toEmail],
        subject: `🚨 Kidsmybook 新客戶：${lead.name}（${lead.topic || "專著"}）`,
        html,
      }),
    });
  } catch (err) {
    console.error("Resend email failed:", err);
  }
}

async function handlePreviewLead(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: PreviewLeadBody;
  try {
    body = (await request.json()) as PreviewLeadBody;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const name = body.name?.trim() ?? "";
  const previewUrl = body.previewUrl?.trim() ?? "";
  const whatsapp = body.whatsapp?.trim() ?? "";
  const wechat = body.wechat?.trim() ?? "";
  if (!name || !previewUrl) {
    return json({ error: "name and previewUrl are required." }, 400);
  }

  const lead: LeadPayload = {
    name,
    age: body.age?.trim() ?? "",
    topic: body.topic?.trim() ?? "",
    personality: body.personality?.trim() ?? "",
    whatsapp,
    wechat,
    previewUrl,
    handshakeCode: body.handshakeCode?.trim() ?? "",
    conversationStarted: Boolean(body.conversationStarted),
    frontImg: body.frontImg?.trim() ?? "",
    backImg: body.backImg?.trim() ?? "",
    receivedAt: new Date().toISOString(),
  };

  console.log("preview-lead", JSON.stringify(lead));

  let delivery: DeliveryChannel = "studio";
  if (whatsapp && lead.conversationStarted) {
    const sent = await sendWhatsAppPreview(lead, env);
    if (sent) delivery = "whatsapp";
  }

  const promises: Promise<void>[] = [];

  // 1. Telegram Bot Notification
  const tgToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChatId = env.TELEGRAM_CHAT_ID?.trim();
  if (tgToken && tgChatId) {
    promises.push(sendTelegramNotification(lead, tgToken, tgChatId));
  }

  // 2. Resend Email Notification
  const resendKey = env.RESEND_API_KEY?.trim();
  const notifyEmail = env.NOTIFICATION_EMAIL?.trim();
  if (resendKey && notifyEmail) {
    promises.push(sendResendEmail(lead, resendKey, notifyEmail));
  }

  // 3. Generic Webhook (e.g. Make / Zapier / Slack / Google Sheets)
  const webhook = env.PREVIEW_LEAD_WEBHOOK?.trim();
  if (webhook) {
    promises.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).then(() => {}).catch((err) => {
        console.error("Webhook failed:", err);
      })
    );
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }

  return json({ ok: true, delivery }, 200);
}

type IntakeBody = {
  student?: string;
  parent?: string;
  grade?: string;
  stage?: string;
  t1?: string;
  t2?: string;
  t3?: string;
  deadline?: string;
  contact?: string;
  remark?: string;
  competition?: string;
};

async function sendIntakeTelegram(rec: Record<string, unknown>, env: Env): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  const topics = (rec.topics as string[])?.join("、") || "（未填）";
  const lines = [
    "📋 <b>Kidsmybook 新諮詢</b>",
    "",
    `• <b>學員</b>：${rec.student}`,
    rec.parent ? `• <b>家長</b>：${rec.parent}` : "",
    rec.grade ? `• <b>年級</b>：${rec.grade}` : "",
    rec.stage ? `• <b>用途</b>：${rec.stage}` : "",
    `• <b>興趣</b>：${topics}`,
    rec.competition ? `• <b>比賽/獎項</b>：${rec.competition}` : "",
    rec.deadline ? `• <b>完成</b>：${rec.deadline}` : "",
    rec.contact ? `• <b>聯絡</b>：<code>${rec.contact}</code>` : "",
    rec.remark ? `• <b>備註</b>：${rec.remark}` : "",
    "",
    `🕐 ${String(rec.receivedAt).slice(0,16).replace("T"," ")}`,
  ].filter(Boolean);
  const text = lines.join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch (err) {
    console.error("intake telegram failed:", err);
    return false;
  }
}

async function sendIntakeWhatsApp(rec: Record<string, unknown>, env: Env): Promise<boolean> {
  const token = env.WHATSAPP_TOKEN?.trim();
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = "85291214157";
  if (!token || !phoneId) return false;
  const lines = [
    "📝 Kidsmybook 新諮詢",
    `學生：${rec.student}`,
    rec.parent ? `家長：${rec.parent}` : "",
    rec.grade ? `年級：${rec.grade}` : "",
    rec.stage ? `用途：${rec.stage}` : "",
    (rec.topics as string[])?.length ? `興趣：${(rec.topics as string[]).join("、")}` : "",
    rec.competition ? `比賽/獎項：${rec.competition}` : "",
    rec.deadline ? `完成：${rec.deadline}` : "",
    rec.contact ? `聯絡：${rec.contact}` : "",
    rec.remark ? `備註：${rec.remark}` : "",
  ].filter(Boolean);
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: lines.join("\n") },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("intake whatsapp failed:", err);
    return false;
  }
}

async function handleIntake(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  let body: IntakeBody;
  try {
    body = (await request.json()) as IntakeBody;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const student = body.student?.trim() ?? "";
  const parent = body.parent?.trim() ?? "";
  const contact = body.contact?.trim() ?? "";
  if (!student || !contact) {
    return json({ error: "student and contact are required." }, 400);
  }

  const id = `intake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    student,
    parent,
    grade: body.grade?.trim() ?? "",
    stage: body.stage?.trim() ?? "",
    topics: [body.t1?.trim(), body.t2?.trim(), body.t3?.trim()].filter(Boolean),
    deadline: body.deadline?.trim() ?? "",
    contact,
    remark: body.remark?.trim() ?? "",
    competition: body.competition?.trim() ?? "",
    receivedAt: new Date().toISOString(),
    status: "new",
  };

  try {
    await env.kidsmybook_leads.put(id, JSON.stringify(record));
    const idxRaw = await env.kidsmybook_leads.get("__index__");
    const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
    idx.unshift(id);
    await env.kidsmybook_leads.put("__index__", JSON.stringify(idx.slice(0, 500)));
  } catch (err) {
    console.error("KV put failed:", err);
    return json({ error: "Storage failed" }, 500);
  }

  // notify Anthony: WhatsApp + Telegram
  const sentWa = await sendIntakeWhatsApp(record as unknown as Record<string, unknown>, env);
  console.log("intake-whatsapp", sentWa ? "sent" : "skipped(no creds)");
  const sentTg = await sendIntakeTelegram(record, env);
  console.log("intake-telegram", sentTg ? "sent" : "skipped(no creds)");

  console.log("intake-lead", JSON.stringify(record));
  return json({ ok: true, id }, 200);
}

async function handleIntakeList(env: Env): Promise<Response> {
  const idxRaw = await env.kidsmybook_leads.get("__index__");
  const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  const records = [];
  for (const id of idx.slice(0, 100)) {
    const r = await env.kidsmybook_leads.get(id);
    if (r) records.push(JSON.parse(r));
  }
  return json({ count: records.length, leads: records }, 200);
}

const ADMIN_PASSWORD = "kmyb2026";

async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pw = url.searchParams.get("pw") || request.headers.get("x-admin-pw") || "";
  if (pw !== ADMIN_PASSWORD) {
    return new Response(
      `<!DOCTYPE html><html lang="zh"><body style="font-family:sans-serif;max-width:400px;margin:4rem auto"><h2>Kidsmybook Admin</h2><form method="get"><input name="pw" placeholder="password" style="padding:.5rem;font-size:1rem;width:100%"/><br><button style="margin-top:1rem;padding:.5rem 1rem">進入</button></form></body></html>`,
      { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  const idxRaw = await env.kidsmybook_leads.get("__index__");
  const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  const rows: string[] = [];
  for (const id of idx.slice(0, 200)) {
    const r = await env.kidsmybook_leads.get(id);
    if (!r) continue;
    const d = JSON.parse(r);
    rows.push(`<tr><td>${d.receivedAt?.slice(0,10) || ""}</td><td>${d.student||""}</td><td>${d.parent||""}</td><td>${d.grade||""}</td><td>${d.stage||""}</td><td>${(d.topics||[]).join("、")}</td><td>${d.competition||""}</td><td>${d.deadline||""}</td><td>${d.contact||""}</td><td>${d.remark||""}</td></tr>`);
  }
  const html = `<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>Kidsmybook Leads</title><style>body{font-family:-apple-system,sans-serif;margin:2rem;font-size:14px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:.5rem;text-align:left;vertical-align:top}th{background:#c0392b;color:#fff}</style></head><body><h2>Kidsmybook 諮詢名單 (${rows.length})</h2><table><tr><th>提交日期</th><th>學員姓名</th><th>家長姓名</th><th>就讀年級</th><th>出版用途</th><th>興趣主題</th><th>比賽經驗 / 獎項</th><th>預期完成</th><th>聯絡方式</th><th>備註</th></tr>${rows.join("")}</table></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

type WhatsAppWebhookEntry = {
  changes?: {
    value?: {
      messages?: { from?: string; text?: { body?: string } }[];
    };
  }[];
};

async function handleWhatsAppWebhook(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const verifyToken = env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (request.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json()) as { entry?: WhatsAppWebhookEntry[] };
    const from = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    const text = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    console.log("whatsapp-inbound", JSON.stringify({ from, text }));
  } catch {
    /* still ack so Meta does not retry forever */
  }

  return json({ ok: true }, 200);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/cover-generate") {
      return handleCoverGenerate(request, env);
    }
    if (url.pathname === "/api/preview-lead") {
      return handlePreviewLead(request, env);
    }
    if (url.pathname === "/intake-form" || url.pathname === "/intake-form/") {
      return env.ASSETS.fetch(new Request("https://kidsmybook.com/intake-form.html"));
    }
    if (url.pathname === "/api/intake" && request.method === "POST") {
      return handleIntake(request, env);
    }
    if (url.pathname === "/api/intake" && request.method === "GET") {
      return handleIntakeList(env);
    }
    if (url.pathname === "/admin") {
      return handleAdmin(request, env);
    }
    if (url.pathname === "/api/whatsapp-webhook") {
      return handleWhatsAppWebhook(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
