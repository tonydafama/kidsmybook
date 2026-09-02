export interface Env {
  ASSETS: Fetcher;
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
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

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
  if (!name || !previewUrl || (!whatsapp && !wechat)) {
    return json({ error: "name, previewUrl, and a contact method are required." }, 400);
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
    if (url.pathname === "/api/whatsapp-webhook") {
      return handleWhatsAppWebhook(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
