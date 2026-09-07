var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.ts
var MONICA_FLUX_URL = "https://openapi.monica.im/v1/image/gen/flux";
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
async function generateFluxImage(prompt, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55e3);
  try {
    const res = await fetch(MONICA_FLUX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        model: "flux_dev",
        num_outputs: 1,
        size: "768x1344"
      }),
      signal: controller.signal
    });
    const text = await res.text();
    let payload;
    try {
      payload = JSON.parse(text);
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
__name(generateFluxImage, "generateFluxImage");
async function handleCoverGenerate(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  const ip = request.headers.get("cf-connecting-ip") || "unknown-ip";
  const cache = caches.default;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  const frontPrompt = body.frontPrompt?.trim();
  if (!frontPrompt) {
    return json({ error: "frontPrompt is required." }, 400);
  }
  try {
    const frontUrl = await generateFluxImage(frontPrompt, apiKey);
    const backUrl = frontUrl;
    try {
      const newResponse = new Response((count + 1).toString(), {
        headers: { "Cache-Control": "max-age=86400" }
        // Cache for 24 hours
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
__name(handleCoverGenerate, "handleCoverGenerate");
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}
__name(json, "json");
async function sendWhatsAppJson(phoneNumberId, token, payload) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload })
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WhatsApp API ${res.status}: ${text.slice(0, 400)}`);
  }
}
__name(sendWhatsAppJson, "sendWhatsAppJson");
async function sendWhatsAppPreview(lead, env) {
  const token = env.WHATSAPP_TOKEN?.trim();
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = lead.whatsapp.replace(/\D/g, "");
  if (!token || !phoneId || !to || !lead.conversationStarted) return false;
  const caption = [
    `Kidsmybook \u5C08\u8457\u5C01\u9762\u9810\u89BD \xB7 ${lead.name}`,
    lead.handshakeCode ? `\u9A57\u8B49\u78BC ${lead.handshakeCode}` : "",
    lead.previewUrl
  ].filter(Boolean).join("\n");
  try {
    if (lead.frontImg.startsWith("http")) {
      await sendWhatsAppJson(phoneId, token, {
        to,
        type: "image",
        image: { link: lead.frontImg, caption: caption.slice(0, 1024) }
      });
    } else {
      await sendWhatsAppJson(phoneId, token, {
        to,
        type: "text",
        text: { preview_url: true, body: caption }
      });
    }
    return true;
  } catch (err) {
    console.error("WhatsApp send to parent failed:", err);
    return false;
  }
}
__name(sendWhatsAppPreview, "sendWhatsAppPreview");
async function sendTelegramNotification(lead, botToken, chatId) {
  const cleanWa = lead.whatsapp.replace(/\D/g, "");
  const waLink = cleanWa ? `https://wa.me/${cleanWa}` : "";
  const lines = [
    `\u{1F6A8} <b>\u3010Kidsmybook \u65B0\u5BA2\u6236\u5373\u6642\u901A\u77E5\u3011</b>`,
    ``,
    `\u2022 <b>\u5C0F\u4F5C\u8005\u59D3\u540D</b>\uFF1A${lead.name}`,
    `\u2022 <b>\u8208\u8DA3\u984C\u6750</b>\uFF1A${lead.topic || "\u672A\u586B\u5BEB"}`,
    lead.age ? `\u2022 <b>\u5E74\u9F61\u968E\u6BB5</b>\uFF1A${lead.age}` : "",
    lead.personality ? `\u2022 <b>\u5B69\u5B50\u7279\u8CEA</b>\uFF1A${lead.personality}` : "",
    lead.whatsapp ? `\u2022 <b>WhatsApp</b>\uFF1A<code>${lead.whatsapp}</code>` : "",
    lead.handshakeCode ? `\u2022 <b>\u9A57\u8B49\u78BC</b>\uFF1A<code>${lead.handshakeCode}</code>\uFF08\u8ACB\u56DE\u8986\u8A72\u5C0D\u8A71\uFF09` : "",
    lead.conversationStarted ? `\u2022 <b>\u5BB6\u9577\u5DF2\u958B\u555F WhatsApp \u5C0D\u8A71</b>` : "",
    lead.wechat ? `\u2022 <b>WeChat ID</b>\uFF1A<code>${lead.wechat}</code>` : "",
    ``,
    `\u{1F4D6} <b>3D \u5C08\u8457\u9810\u89BD\u9023\u7D50</b>\uFF1A`,
    `<a href="${lead.previewUrl}">${lead.previewUrl}</a>`,
    lead.frontImg.startsWith("http") ? `\u{1F5BC} <b>\u5C01\u9762\u5716</b>\uFF1A<a href="${lead.frontImg}">${lead.frontImg}</a>` : ""
  ];
  if (waLink) {
    lines.push(``, `\u{1F449} <a href="${waLink}">\u9EDE\u64CA\u76F4\u63A5\u958B\u555F WhatsApp \u56DE\u8986\u5BB6\u9577</a>`);
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
        disable_web_page_preview: false
      })
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
          caption: `\u5C01\u9762\u5716 \xB7 ${lead.name}${lead.handshakeCode ? ` \xB7 \u9A57\u8B49\u78BC ${lead.handshakeCode}` : ""}
\u8ACB\u628A\u6B64\u5716\u8207\u9810\u89BD\u9023\u7D50\u767C\u56DE\u5BB6\u9577 WhatsApp\u3002`
        })
      });
    } catch (err) {
      console.error("Telegram photo failed:", err);
    }
  }
}
__name(sendTelegramNotification, "sendTelegramNotification");
async function sendResendEmail(lead, apiKey, toEmail) {
  const cleanWa = lead.whatsapp.replace(/\D/g, "");
  const waLink = cleanWa ? `https://wa.me/${cleanWa}` : "";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0e18; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(218, 185, 125, 0.4);">
      <h2 style="color: #dab97d; margin-top: 0;">\u{1F6A8} Kidsmybook \u65B0\u5BA2\u6236\u9810\u89BD\u901A\u77E5</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #ad9d85; width: 100px;">\u5C0F\u4F5C\u8005\uFF1A</td><td style="padding: 8px 0; font-weight: bold; font-size: 15px;">${lead.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #ad9d85;">\u8208\u8DA3\u984C\u6750\uFF1A</td><td style="padding: 8px 0; font-weight: bold; color: #dab97d; font-size: 15px;">${lead.topic || "\u672A\u586B\u5BEB"}</td></tr>
        ${lead.age ? `<tr><td style="padding: 8px 0; color: #ad9d85;">\u5E74\u9F61\uFF1A</td><td style="padding: 8px 0;">${lead.age}</td></tr>` : ""}
        ${lead.personality ? `<tr><td style="padding: 8px 0; color: #ad9d85;">\u7279\u8CEA\uFF1A</td><td style="padding: 8px 0;">${lead.personality}</td></tr>` : ""}
        ${lead.whatsapp ? `<tr><td style="padding: 8px 0; color: #ad9d85;">WhatsApp\uFF1A</td><td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #25D366;">${lead.whatsapp}</td></tr>` : ""}
        ${lead.wechat ? `<tr><td style="padding: 8px 0; color: #ad9d85;">WeChat ID\uFF1A</td><td style="padding: 8px 0; font-weight: bold;">${lead.wechat}</td></tr>` : ""}
      </table>
      <div style="margin-top: 20px; padding: 14px; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);">
        <p style="margin: 0 0 6px; font-size: 12px; color: #ad9d85;">3D \u5C08\u8457\u9810\u89BD\u9023\u7D50\uFF1A</p>
        <a href="${lead.previewUrl}" style="color: #dab97d; word-break: break-all; font-size: 14px;">${lead.previewUrl}</a>
      </div>
      ${waLink ? `
      <div style="margin-top: 22px;">
        <a href="${waLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 15px;">
          \u{1F449} \u9EDE\u64CA\u958B\u555F WhatsApp \u56DE\u8986\u5BB6\u9577
        </a>
      </div>` : ""}
    </div>
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: "Kidsmybook Alerts <onboarding@resend.dev>",
        to: [toEmail],
        subject: `\u{1F6A8} Kidsmybook \u65B0\u5BA2\u6236\uFF1A${lead.name}\uFF08${lead.topic || "\u5C08\u8457"}\uFF09`,
        html
      })
    });
  } catch (err) {
    console.error("Resend email failed:", err);
  }
}
__name(sendResendEmail, "sendResendEmail");
async function handlePreviewLead(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  let body;
  try {
    body = await request.json();
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
  const lead = {
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
    receivedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.log("preview-lead", JSON.stringify(lead));
  let delivery = "studio";
  if (whatsapp && lead.conversationStarted) {
    const sent = await sendWhatsAppPreview(lead, env);
    if (sent) delivery = "whatsapp";
  }
  const promises = [];
  const tgToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChatId = env.TELEGRAM_CHAT_ID?.trim();
  if (tgToken && tgChatId) {
    promises.push(sendTelegramNotification(lead, tgToken, tgChatId));
  }
  const resendKey = env.RESEND_API_KEY?.trim();
  const notifyEmail = env.NOTIFICATION_EMAIL?.trim();
  if (resendKey && notifyEmail) {
    promises.push(sendResendEmail(lead, resendKey, notifyEmail));
  }
  const webhook = env.PREVIEW_LEAD_WEBHOOK?.trim();
  if (webhook) {
    promises.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      }).then(() => {
      }).catch((err) => {
        console.error("Webhook failed:", err);
      })
    );
  }
  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
  return json({ ok: true, delivery }, 200);
}
__name(handlePreviewLead, "handlePreviewLead");
async function sendIntakeTelegram(rec, env) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  const topics = rec.topics?.join("\u3001") || "\uFF08\u672A\u586B\uFF09";
  const lines = [
    "\u{1F4CB} <b>Kidsmybook \u65B0\u8AEE\u8A62</b>",
    "",
    `\u2022 <b>\u5B78\u54E1</b>\uFF1A${rec.student}`,
    rec.parent ? `\u2022 <b>\u5BB6\u9577</b>\uFF1A${rec.parent}` : "",
    rec.grade ? `\u2022 <b>\u5E74\u7D1A</b>\uFF1A${rec.grade}` : "",
    rec.stage ? `\u2022 <b>\u7528\u9014</b>\uFF1A${rec.stage}` : "",
    `\u2022 <b>\u8208\u8DA3</b>\uFF1A${topics}`,
    rec.competition ? `\u2022 <b>\u6BD4\u8CFD/\u734E\u9805</b>\uFF1A${rec.competition}` : "",
    rec.deadline ? `\u2022 <b>\u5B8C\u6210</b>\uFF1A${rec.deadline}` : "",
    rec.contact ? `\u2022 <b>\u806F\u7D61</b>\uFF1A<code>${rec.contact}</code>` : "",
    rec.remark ? `\u2022 <b>\u5099\u8A3B</b>\uFF1A${rec.remark}` : "",
    "",
    `\u{1F550} ${String(rec.receivedAt).slice(0, 16).replace("T", " ")}`
  ].filter(Boolean);
  const text = lines.join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
    });
    return res.ok;
  } catch (err) {
    console.error("intake telegram failed:", err);
    return false;
  }
}
__name(sendIntakeTelegram, "sendIntakeTelegram");
async function sendIntakeWhatsApp(rec, env) {
  const token = env.WHATSAPP_TOKEN?.trim();
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = "85291214157";
  if (!token || !phoneId) return false;
  const lines = [
    "\u{1F4DD} Kidsmybook \u65B0\u8AEE\u8A62",
    `\u5B78\u751F\uFF1A${rec.student}`,
    rec.parent ? `\u5BB6\u9577\uFF1A${rec.parent}` : "",
    rec.grade ? `\u5E74\u7D1A\uFF1A${rec.grade}` : "",
    rec.stage ? `\u7528\u9014\uFF1A${rec.stage}` : "",
    rec.topics?.length ? `\u8208\u8DA3\uFF1A${rec.topics.join("\u3001")}` : "",
    rec.competition ? `\u6BD4\u8CFD/\u734E\u9805\uFF1A${rec.competition}` : "",
    rec.deadline ? `\u5B8C\u6210\uFF1A${rec.deadline}` : "",
    rec.contact ? `\u806F\u7D61\uFF1A${rec.contact}` : "",
    rec.remark ? `\u5099\u8A3B\uFF1A${rec.remark}` : ""
  ].filter(Boolean);
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: lines.join("\n") }
      })
    });
    return res.ok;
  } catch (err) {
    console.error("intake whatsapp failed:", err);
    return false;
  }
}
__name(sendIntakeWhatsApp, "sendIntakeWhatsApp");
var INTAKE_FORM_HTML = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kidsmybook \u8208\u8DA3\u51FA\u7248\u8AEE\u8A62\u8868</title>
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
<h1>Kidsmybook \u8208\u8DA3\u51FA\u7248\u8AEE\u8A62\u8868</h1>
<p class="note">\u586B\u5BEB\u4EE5\u4E0B\u8CC7\u6599\uFF0C\u672C\u6A5F\u69CB\u5C07\u5B89\u6392\u6703\u9762\uFF0C\u5C55\u793A\u5DF2\u51FA\u7248\u66F8\u7C4D\u5BE6\u7269\uFF0C\u4E26\u6309\u5B78\u54E1\u4E4B\u8AB2\u984C\u914D\u5C0D\u76F8\u95DC\u6559\u6388\u53CA\u7DE8\u64B0\u65E5\u7A0B\u3002</p>

<form id="f">
  <label>\u5B78\u54E1\u59D3\u540D</label>
  <input name="student" required placeholder="\u4F8B\u5982\uFF1APeter" />

  <label>\u5BB6\u9577\u59D3\u540D\uFF08\u4E2D\u6587\uFF09</label>
  <input name="parent" required placeholder="\u4F8B\u5982\uFF1A\u9673\u5973\u58EB" />

  <label>\u5C31\u8B80\u5E74\u7D1A / \u968E\u6BB5</label>
  <select name="grade" required>
    <option value="">\u8ACB\u9078\u64C7</option>
    <option>\u5E7C\u7A1A\u5712</option>
    <option>\u5C0F\u5B78</option>
    <option>\u521D\u4E2D\uFF08\u4E2D\u4E00\u81F3\u4E2D\u4E09\uFF09</option>
    <option>\u9AD8\u4E2D\uFF08\u4E2D\u56DB\u81F3\u4E2D\u516D / DSE / IB / A-Level\uFF09</option>
    <option>\u5927\u5B78 / \u5DF2\u7562\u696D</option>
  </select>

  <label>\u672C\u66F8\u4E3B\u8981\u61C9\u7528\u968E\u6BB5</label>
  <select name="stage" required>
    <option value="">\u8ACB\u9078\u64C7</option>
    <option>\u5347\u8B80\u5C0F\u5B78\uFF08\u53E9\u9580 / \u9762\u8A66\u6A94\u6848\uFF09</option>
    <option>\u5347\u8B80\u4E2D\u5B78\uFF08\u4E2D\u5B78\u9762\u8A66 / \u5448\u5206\u8A66\uFF09</option>
    <option>\u5347\u8B80\u5927\u5B78\uFF08\u6D77\u5916 / \u672C\u5730\u5927\u5B78\u7533\u8ACB\uFF09</option>
    <option>\u672A\u78BA\u5B9A\uFF0C\u5148\u884C\u5EFA\u7ACB\u5099\u7528</option>
    <option>\u7D14\u7CB9\u7559\u5FF5 / \u5BB6\u5EAD\u7D00\u9304</option>
  </select>

  <label>\u7B2C\u4E00\u8208\u8DA3\u4E3B\u984C</label>
  <input name="t1" required placeholder="\u4F8B\u5982\uFF1A\u5929\u6587\u3001\u70F9\u98EA\u3001\u6D77\u6D0B\u751F\u7269" />

  <label>\u7B2C\u4E8C\u8208\u8DA3\u4E3B\u984C</label>
  <input name="t2" placeholder="\u4F8B\u5982\uFF1A\u651D\u5F71\u3001\u5BEB\u4F5C\u3001\u904B\u52D5" />

  <label>\u7B2C\u4E09\u8208\u8DA3\u4E3B\u984C</label>
  <input name="t3" placeholder="\u4F8B\u5982\uFF1A\u6B77\u53F2\u3001\u7A0B\u5F0F\u8A2D\u8A08\u3001\u97F3\u6A02" />

  <label>\u9810\u671F\u5B8C\u6210\u6642\u9593</label>
  <select name="deadline" required>
    <option value="">\u8ACB\u9078\u64C7</option>
    <option>\u4E09\u500B\u6708\u5167</option>
    <option>\u516D\u500B\u6708\u5167</option>
    <option>\u4E00\u5E74\u5167</option>
    <option>\u5C1A\u672A\u78BA\u5B9A\uFF0C\u9762\u8B70\u5F8C\u518D\u5B9A</option>
  </select>

  <label>\u5BB6\u9577\u806F\u7D61\u65B9\u5F0F\uFF08WhatsApp / \u96FB\u90F5\uFF09</label>
  <input name="contact" required placeholder="852xxxxxxx \u6216 email" />

  <label>\u5099\u8A3B</label>
  <textarea name="remark" rows="3"></textarea>

  <label>\u6BD4\u8CFD\u7D93\u9A57 / \u6240\u7372\u734E\u9805</label>
  <textarea name="competition" rows="3" placeholder="\u4F8B\u5982\uFF1A\u5168\u6E2F\u6578\u5B78\u6BD4\u8CFD\u91D1\u734E\u3001\u5C0F\u63D0\u7434\u516B\u7D1A\u3001\u79D1\u5B78\u5C55\u89BD\u5165\u570D"></textarea>

  <button type="submit">\u63D0\u4EA4\u8AEE\u8A62</button>
</form>

<div class="succ" id="succ">\u611F\u8B1D\u586B\u5BEB\uFF01\u672C\u6A5F\u69CB\u5C07\u76E1\u5FEB\u8207\u60A8\u806F\u7D61\uFF0C\u5B89\u6392\u6703\u9762\u8A73\u8AC7\u3002</div>

<script>
document.getElementById('f').addEventListener('submit', async function(e){
  e.preventDefault();
  var btn = document.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = '\u63D0\u4EA4\u4E2D...';
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
      alert('\u63D0\u4EA4\u5931\u6557\uFF1A' + (r.error || '\u672A\u77E5\u932F\u8AA4'));
      btn.disabled = false; btn.textContent = '\u63D0\u4EA4\u8AEE\u8A62';
    }
  } catch (err) {
    alert('\u7DB2\u7D61\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u6216\u806F\u7D61 WhatsApp 85291214157');
    btn.disabled = false; btn.textContent = '\u63D0\u4EA4\u8AEE\u8A62';
  }
});
<\/script>
</body>
</html>`;
async function handleIntake(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  let body;
  try {
    body = await request.json();
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
    receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "new"
  };
  try {
    await env.kidsmybook_leads.put(id, JSON.stringify(record));
    const idxRaw = await env.kidsmybook_leads.get("__index__");
    const idx = idxRaw ? JSON.parse(idxRaw) : [];
    idx.unshift(id);
    await env.kidsmybook_leads.put("__index__", JSON.stringify(idx.slice(0, 500)));
  } catch (err) {
    console.error("KV put failed:", err);
    return json({ error: "Storage failed" }, 500);
  }
  const sentWa = await sendIntakeWhatsApp(record, env);
  console.log("intake-whatsapp", sentWa ? "sent" : "skipped(no creds)");
  const sentTg = await sendIntakeTelegram(record, env);
  console.log("intake-telegram", sentTg ? "sent" : "skipped(no creds)");
  console.log("intake-lead", JSON.stringify(record));
  return json({ ok: true, id }, 200);
}
__name(handleIntake, "handleIntake");
async function handleIntakeList(env) {
  const idxRaw = await env.kidsmybook_leads.get("__index__");
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  const records = [];
  for (const id of idx.slice(0, 100)) {
    const r = await env.kidsmybook_leads.get(id);
    if (r) records.push(JSON.parse(r));
  }
  return json({ count: records.length, leads: records }, 200);
}
__name(handleIntakeList, "handleIntakeList");
var ADMIN_PASSWORD = "kmyb2026";
async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const pw = url.searchParams.get("pw") || request.headers.get("x-admin-pw") || "";
  if (pw !== ADMIN_PASSWORD) {
    return new Response(
      `<!DOCTYPE html><html lang="zh"><body style="font-family:sans-serif;max-width:400px;margin:4rem auto"><h2>Kidsmybook Admin</h2><form method="get"><input name="pw" placeholder="password" style="padding:.5rem;font-size:1rem;width:100%"/><br><button style="margin-top:1rem;padding:.5rem 1rem">\u9032\u5165</button></form></body></html>`,
      { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  const idxRaw = await env.kidsmybook_leads.get("__index__");
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  const rows = [];
  for (const id of idx.slice(0, 200)) {
    const r = await env.kidsmybook_leads.get(id);
    if (!r) continue;
    const d = JSON.parse(r);
    rows.push(`<tr><td>${d.receivedAt?.slice(0, 10) || ""}</td><td>${d.student || ""}</td><td>${d.parent || ""}</td><td>${d.grade || ""}</td><td>${d.stage || ""}</td><td>${(d.topics || []).join("\u3001")}</td><td>${d.competition || ""}</td><td>${d.deadline || ""}</td><td>${d.contact || ""}</td><td>${d.remark || ""}</td></tr>`);
  }
  const html = `<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>Kidsmybook Leads</title><style>body{font-family:-apple-system,sans-serif;margin:2rem;font-size:14px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:.5rem;text-align:left;vertical-align:top}th{background:#c0392b;color:#fff}</style></head><body><h2>Kidsmybook \u8AEE\u8A62\u540D\u55AE (${rows.length})</h2><table><tr><th>\u63D0\u4EA4\u65E5\u671F</th><th>\u5B78\u54E1\u59D3\u540D</th><th>\u5BB6\u9577\u59D3\u540D</th><th>\u5C31\u8B80\u5E74\u7D1A</th><th>\u51FA\u7248\u7528\u9014</th><th>\u8208\u8DA3\u4E3B\u984C</th><th>\u6BD4\u8CFD\u7D93\u9A57 / \u734E\u9805</th><th>\u9810\u671F\u5B8C\u6210</th><th>\u806F\u7D61\u65B9\u5F0F</th><th>\u5099\u8A3B</th></tr>${rows.join("")}</table></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(handleAdmin, "handleAdmin");
async function handleWhatsAppWebhook(request, env) {
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
    const body = await request.json();
    const from = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    const text = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    console.log("whatsapp-inbound", JSON.stringify({ from, text }));
  } catch {
  }
  return json({ ok: true }, 200);
}
__name(handleWhatsAppWebhook, "handleWhatsAppWebhook");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/cover-generate") {
      return handleCoverGenerate(request, env);
    }
    if (url.pathname === "/api/preview-lead") {
      return handlePreviewLead(request, env);
    }
    if (url.pathname === "/intake-form" || url.pathname === "/intake-form/" || url.pathname === "/intake" || url.pathname === "/intake/") {
      return new Response(INTAKE_FORM_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store, no-cache, must-revalidate", "Surrogate-Control": "no-store" }
      });
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
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
