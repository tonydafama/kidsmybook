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
    "⚠️⚠️ <b>新升學資產諮詢 — 請確認收到</b> ⚠️⚠️",
    "━━━━━━━━━━━━━━━━━━",
    `🔴 <b>學員</b>：${rec.surname} ${rec.givenName}`,
    rec.parent ? `👤 <b>家長</b>：${rec.parent}` : "",
    rec.school ? `🏫 <b>學校</b>：${rec.school}` : "",
    rec.curriculum ? `📚 <b>學制</b>：${rec.curriculum}` : "",
    rec.grade ? `🎓 <b>年級</b>：${rec.grade}` : "",
    rec.stage ? `🎯 <b>用途</b>：${rec.stage}` : "",
    `💡 <b>興趣</b>：${topics}`,
    rec.competition ? `🏆 <b>比賽/獎項</b>：${rec.competition}` : "",
    rec.deadline ? `⏰ <b>完成</b>：${rec.deadline}` : "",
    rec.contact ? `📱 <b>聯絡</b>：<code>${rec.contact}</code>` : "",
    rec.remark ? `📝 <b>備註</b>：${rec.remark}` : "",
    "━━━━━━━━━━━━━━━━━━",
    `🕐 ${String(rec.receivedAt).slice(0,16).replace("T"," ")}`,
    "",
    "👉 <b>請回覆「✅ 收到」確認，唔好錯過任何客。</b>",
  ].filter(Boolean);
  const text = lines.join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (res.ok) {
      // mark lead as unconfirmed, store msg id for read receipt
      const r = await res.json();
      const msgId = r?.result?.message_id;
      try {
        const key = `pending_${rec.id}`;
        await env.kidsmybook_leads.put(key, JSON.stringify({ msgId, leadId: rec.id, askedAt: new Date().toISOString() }));
      } catch {}
    }
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

const INTAKE_FORM_HTML = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kidsmybook 升學資產諮詢表</title>
<style>
  body { font-family: -apple-system, "PingFang HK", "Microsoft JhengHei", sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1.2rem; color: #1a1a1a; }
  h1 { font-size: 1.5rem; }
  label { display: block; margin: 1.1rem 0 .4rem; font-weight: 600; }
  input, select, textarea { width: 100%; padding: .6rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
  button { margin-top: 1.5rem; background: #c0392b; color: #fff; border: 0; padding: .8rem 1.5rem; font-size: 1.05rem; border-radius: 8px; cursor: pointer; }
  .note { font-size: .85rem; color: #666; margin-top: .3rem; }
  .succ { background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem; display:none; }
</style>
</head>
<body>
<h1>Kidsmybook 升學資產諮詢表</h1>
<p class="note">填寫以下資料，本機構將安排會面，展示學員升學資產實物，並按學員之課題配對相關教授及編撰日程。</p>

<form id="f">
  <label>學員姓氏</label>
  <input name="surname" required placeholder="例如：陳" />

  <label>學員名字</label>
  <input name="givenName" required placeholder="例如：志明" />

  <label>家長姓名（中文）</label>
  <input name="parent" required placeholder="例如：陳大文" />

  <label>就讀學校名稱</label>
  <input name="school" required placeholder="例如：維多利亞書院 / 拔萃男書院" />

  <label>學制</label>
  <input name="curriculum" required placeholder="例如：DSE / IB / A-Level / AP" />

  <label>年級</label>
  <input name="grade" required placeholder="例如：中四 / Grade 10 / Year 12" />

  <label>本書主要應用階段</label>
  <input name="stage" required placeholder="例如：升讀大學（海外 / 本地大學申請）" />

  <label>第一興趣主題</label>
  <input name="t1" required placeholder="例如：天文、烹飪、海洋生物" />

  <label>第二興趣主題</label>
  <input name="t2" placeholder="例如：攝影、寫作、運動" />

  <label>第三興趣主題</label>
  <input name="t3" placeholder="例如：歷史、程式設計、音樂" />

  <label>預期完成時間</label>
  <select name="deadline" required>
    <option value="">請選擇</option>
    <option>三個月內</option>
    <option>半年內</option>
    <option>一年內</option>
  </select>

  <label>家長聯絡方式（WhatsApp / 電郵）</label>
  <input name="contact" required placeholder="852xxxxxxx 或 email" />

  <label>備註</label>
  <textarea name="remark" rows="3"></textarea>

  <label>比賽經驗 / 所獲獎項</label>
  <textarea name="competition" rows="3" placeholder="例如：全港數學比賽金獎、小提琴八級、科學展覽入圍"></textarea>

  <button type="submit">提交諮詢</button>
</form>

<div class="succ" id="succ">感謝填寫！本機構將盡快與您聯絡，安排會面詳談。</div>

<script>
document.getElementById('f').addEventListener('submit', async function(e){
  e.preventDefault();
  var btn = document.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = '提交中...';
  var d = Object.fromEntries(new FormData(e.target).entries());
  try {
    var res = await fetch('/api/intake', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(d)
    });
    var r = await res.json();
    if (r.ok) {
      document.getElementById('succ').style.display = 'block';
      document.getElementById('f').style.display = 'none';
    } else {
      alert('提交失敗：' + (r.error || '未知錯誤'));
      btn.disabled = false; btn.textContent = '提交諮詢';
    }
  } catch (err) {
    alert('網絡錯誤，請稍後再試或聯絡 WhatsApp 85291214157');
    btn.disabled = false; btn.textContent = '提交諮詢';
  }
});
</script>
</body>
</html>`;

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

  const surname = body.surname?.trim() ?? "";
  const givenName = body.givenName?.trim() ?? "";
  const parent = body.parent?.trim() ?? "";
  const school = body.school?.trim() ?? "";
  const curriculum = body.curriculum?.trim() ?? "";
  const grade = body.grade?.trim() ?? "";
  const contact = body.contact?.trim() ?? "";
  if (!surname || !givenName || !contact) {
    return json({ error: "surname, givenName and contact are required." }, 400);
  }

  const id = `intake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    surname,
    givenName,
    student: `${surname}${givenName}`,
    parent,
    school,
    curriculum,
    grade,
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

  // 1) saved to KV already. 2) notify studio on Telegram. 3) ack the parent if they left an email.
  const sentTg = await sendIntakeTelegram(record, env);
  const sentAck = await sendIntakeAckEmail(record, env);
  console.log("intake-telegram", sentTg ? "sent" : "skipped(no creds)");
  console.log("intake-ack-email", sentAck ? "sent" : "skipped");

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

const ROBOTS_TXT = `User-agent: *
Allow: /

# Prefer canonical host for indexing
Host: https://kidsmybook.com

# Sitemaps (Google, Bing, and AI crawlers)
Sitemap: https://kidsmybook.com/sitemap.xml
Sitemap: https://www.kidsmybook.com/sitemap.xml

# AI assistant crawlers: full content index
LLMs: https://kidsmybook.com/llms.txt
LLMs-full: https://kidsmybook.com/llms-full.txt

# Explicit allow for common AI / answer-engine crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

Disallow: /admin
Disallow: /intake
Disallow: /intake-form
Disallow: /api/
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kidsmybook.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://kidsmybook.com/blog</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://kidsmybook.com/services</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/case-studies</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://kidsmybook.com/case-studies/hilary-butterfly-guide</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://kidsmybook.com/llms.txt</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://kidsmybook.com/blog/hk-international-school-book-mainland-parents</loc><lastmod>2026-09-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/gtp-family-child-book-portfolio</loc><lastmod>2026-09-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/talent-admission-book-advantage</loc><lastmod>2026-09-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/gaocaitong-yisheng-xue-you-shi</loc><lastmod>2026-09-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/xing-qu-bian-chu-ban</loc><lastmod>2026-09-04</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/zheng-shu-pi-juan</loc><lastmod>2026-09-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/jiao-shou-chu-ban-shuo-fu-li</loc><lastmod>2026-09-08</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/san-lian-shang-jia-yi-yi</loc><lastmod>2026-09-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/portfolio-book-4-skills</loc><lastmod>2026-09-12</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/gaocaitong-mom-burnout</loc><lastmod>2026-09-14</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/school-ranking-myth</loc><lastmod>2026-09-16</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/portfolio-vs-extracurriculars-hk-admissions</loc><lastmod>2026-09-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/top-talent-pass-first-year-portfolio</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/international-school-interview-portfolio-highlight</loc><lastmod>2026-09-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/primary-school-door-knocking-portfolio-prep</loc><lastmod>2026-09-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/child-background-enhancement-hk</loc><lastmod>2026-09-26</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/mainland-parents-hk-international-schools-prep</loc><lastmod>2026-09-28</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/kids-publishing-a-book-hk-isbn</loc><lastmod>2026-09-30</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/university-professor-child-work-review</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/children-project-based-learning-hk</loc><lastmod>2026-10-04</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/gifted-child-development-program-hk</loc><lastmod>2026-10-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>
`;

function plainText(body: string, contentType: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function serveSeoAsset(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/robots.txt") return plainText(ROBOTS_TXT, "text/plain; charset=utf-8");
  if (pathname === "/sitemap.xml") return plainText(SITEMAP_XML, "application/xml; charset=utf-8");

  // llms-full.txt: extended AI crawler file with full blog summaries
  if (url.pathname === "/llms-full.txt") {
    const fullRes = await env.ASSETS.fetch(new Request(new URL("/llms-full.txt", request.url), request));
    if (fullRes.ok) {
      return new Response(fullRes.body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    }
  }

  // llms.txt: prefer static asset, but never return the SPA HTML shell
  const assetRes = await env.ASSETS.fetch(new Request(new URL("/llms.txt", request.url), request));
  const ct = assetRes.headers.get("content-type") || "";
  const text = await assetRes.text();
  if (assetRes.ok && !ct.includes("text/html") && !text.trimStart().startsWith("<!")) {
    return plainText(text, "text/plain; charset=utf-8");
  }
  return plainText(
    "# Kidsmybook\n\nSee https://kidsmybook.com and https://kidsmybook.com/sitemap.xml\n",
    "text/plain; charset=utf-8",
  );
}

async function sendIntakeAckEmail(rec: Record<string, unknown>, env: Env): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const contact = String(rec.contact || "");
  const emailMatch = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!apiKey || !emailMatch) return false;
  const student = `${rec.surname ?? ""} ${rec.givenName ?? ""}`.trim() || "小朋友";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Kidsmybook <onboarding@resend.dev>",
        to: [emailMatch[0]],
        reply_to: "kidsmybook@outlook.com",
        subject: "Kidsmybook 已收到你的諮詢",
        html: `<p>你好${rec.parent ? ` ${rec.parent}` : ""}，</p>
<p>我哋已收到 <strong>${student}</strong> 嘅出版諮詢。顧問會喺辦公時間內用 WhatsApp 或電郵回覆你，唔使重複提交。</p>
<p>如要即時聯絡：<a href="https://wa.me/85291214157">WhatsApp @kidsmybook</a></p>
<p>Kidsmybook<br>https://kidsmybook.com</p>`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("intake ack email failed:", err);
    return false;
  }
}

const PRICE_LEAK = /HK\$?\s*3,?800|HKD\s*3,?800|priceRange":\s*"HKD 3800|Entry packages start from HKD/i;

async function runSeoHealthCheck(env: Env): Promise<void> {
  const checks = [
    { name: "homepage", url: "https://kidsmybook.com/" },
    { name: "llms.txt", url: "https://kidsmybook.com/llms.txt" },
    { name: "sitemap.xml", url: "https://kidsmybook.com/sitemap.xml" },
    { name: "robots.txt", url: "https://kidsmybook.com/robots.txt" },
  ];
  const lines: string[] = ["📋 Kidsmybook SEO health check（資產健康，唔係 AI 排名）"];
  let bad = false;
  for (const check of checks) {
    try {
      const res = await fetch(check.url, { headers: { "Cache-Control": "no-cache" } });
      const text = await res.text();
      const leak = PRICE_LEAK.test(text);
      const garbled = check.name === "llms.txt" && (text.includes("??") || text.includes("�"));
      const blogs = check.name === "sitemap.xml" ? (text.match(/\/blog\//g) || []).length : null;
      if (!res.ok || leak || garbled) bad = true;
      lines.push(
        `${res.ok && !leak && !garbled ? "✅" : "❌"} ${check.name} HTTP ${res.status}` +
          (leak ? " · 公開價錢漏出" : "") +
          (garbled ? " · 亂碼" : "") +
          (blogs != null ? ` · blog URLs ${blogs}` : ""),
      );
    } catch (err) {
      bad = true;
      lines.push(`❌ ${check.name} fetch failed: ${String(err)}`);
    }
  }
  lines.push(bad ? "需要人手睇一眼。" : "公開 SEO 資產正常。");
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.log("seo-health", lines.join(" | "));
    return;
  }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines.join("\n") }),
  });
}

export default {
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil: (p: Promise<unknown>) => void }): Promise<void> {
    ctx.waitUntil(runSeoHealthCheck(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Enforce canonical domain (SEO)
    if (
      url.hostname === "www.kidsmybook.com" ||
      url.hostname === "mybook.pub" ||
      url.hostname === "www.mybook.pub"
    ) {
      return Response.redirect(`https://kidsmybook.com${url.pathname}${url.search}`, 301);
    }

    if (url.pathname === "/api/seo-health") {
      const pw = url.searchParams.get("pw") || request.headers.get("x-admin-pw") || "";
      if (pw !== ADMIN_PASSWORD) return json({ error: "Forbidden" }, 403);
      await runSeoHealthCheck(env);
      return json({ ok: true, note: "SEO asset health check sent to Telegram if credentials exist." });
    }
    if (url.pathname === "/api/cover-generate") {
      return handleCoverGenerate(request, env);
    }
    if (url.pathname === "/api/preview-lead") {
      return handlePreviewLead(request, env);
    }
    if (url.pathname === "/intake-form" || url.pathname === "/intake-form/" || url.pathname === "/intake" || url.pathname === "/intake/") {
      return new Response(INTAKE_FORM_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store, no-cache, must-revalidate", "Surrogate-Control": "no-store" },
      });
    }
    if (url.pathname === "/api/intake" && request.method === "POST") {
      return handleIntake(request, env);
    }
    if (url.pathname === "/api/intake" && request.method === "GET") {
      return handleIntakeList(env);
    }
    if (url.pathname === "/api/intake" && request.method === "DELETE") {
      const body = await request.json().catch(() => ({}));
      const drop = body.drop || [];
      const idxRaw = await env.kidsmybook_leads.get("__index__");
      const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
      const kept: string[] = [];
      let removed = 0;
      for (const id of idx) {
        const rec = await env.kidsmybook_leads.get(id);
        if (!rec) continue;
        try {
          const obj = JSON.parse(rec);
          if (drop.includes(obj.student) || drop.includes("test") || drop.includes("irene")) { await env.kidsmybook_leads.delete(id); removed++; continue; }
        } catch { /* keep */ }
        kept.push(id);
      }
      await env.kidsmybook_leads.put("__index__", JSON.stringify(kept));
      return json({ ok: true, removed }, 200);
    }
    if (url.pathname === "/admin") {
      return handleAdmin(request, env);
    }
    if (url.pathname === "/api/whatsapp-webhook") {
      return handleWhatsAppWebhook(request, env);
    }

    if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml" || url.pathname === "/llms.txt") {
      return serveSeoAsset(request, env, url.pathname);
    }

    return env.ASSETS.fetch(request);
  },
};
