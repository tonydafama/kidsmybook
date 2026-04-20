// Supabase Edge Function: notify-dispatch
// Dispatch due reminders to configured channels (Teams webhook / email webhook / dashboard-only)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRole);
const allowedNotifyHosts = (Deno.env.get("ALLOWED_NOTIFY_HOSTS") ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

type Channel = {
  id: string;
  channel_type: "teams_webhook" | "email_webhook" | "dashboard_only";
  target_name: string;
  target_value: string | null;
  is_active: boolean;
};

const sendToWebhook = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text: text.slice(0, 500) };
};

const isAllowedWebhookTarget = (url: string): { ok: boolean; reason?: string } => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return { ok: false, reason: "only https webhook is allowed" };
    }
    if (allowedNotifyHosts.length > 0 && !allowedNotifyHosts.includes(parsed.host.toLowerCase())) {
      return { ok: false, reason: `host not in allowlist: ${parsed.host}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid webhook url" };
  }
};

const redactSensitive = (raw: string): string => {
  let text = raw;
  // mask email addresses
  text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
  // mask long numeric identifiers
  text = text.replace(/\b\d{6,}\b/g, "[redacted-id]");
  // avoid large payload
  return text.slice(0, 400);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const nowIso = new Date().toISOString();

    const [{ data: reminders, error: reminderErr }, { data: channels, error: channelErr }] = await Promise.all([
      supabase
        .from("reminders")
        .select("id,task_id,message,due_at,sent_at")
        .is("sent_at", null)
        .lte("due_at", nowIso)
        .order("due_at", { ascending: true })
        .limit(100),
      supabase.from("notification_channels").select("*").eq("is_active", true),
    ]);

    if (reminderErr) throw reminderErr;
    if (channelErr) throw channelErr;

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const reminder of reminders ?? []) {
      let hasSent = false;
      const safeMessage = redactSensitive(reminder.message);

      for (const channel of (channels ?? []) as Channel[]) {
        if (channel.channel_type === "dashboard_only") {
          // Dashboard uses reminders table directly, mark as skipped delivery channel.
          skippedCount += 1;
          await supabase.from("notification_delivery_logs").insert({
            reminder_id: reminder.id,
            channel_id: channel.id,
            status: "skipped",
            response_snippet: "dashboard_only channel uses in-app query",
          });
          continue;
        }

        if (!channel.target_value) {
          failedCount += 1;
          await supabase.from("notification_delivery_logs").insert({
            reminder_id: reminder.id,
            channel_id: channel.id,
            status: "failed",
            response_snippet: "missing target_value",
          });
          continue;
        }

        const allow = isAllowedWebhookTarget(channel.target_value);
        if (!allow.ok) {
          failedCount += 1;
          await supabase.from("notification_delivery_logs").insert({
            reminder_id: reminder.id,
            channel_id: channel.id,
            status: "failed",
            response_snippet: allow.reason ?? "blocked by allowlist",
          });
          continue;
        }

        const payload =
          channel.channel_type === "teams_webhook"
            ? { text: `[SI Ops Reminder] ${safeMessage}` }
            : {
                subject: "[SI Ops Reminder]",
                body: safeMessage,
                reminder_id: reminder.id,
              };

        const result = await sendToWebhook(channel.target_value, payload);
        if (result.ok) {
          sentCount += 1;
          hasSent = true;
          await supabase.from("notification_delivery_logs").insert({
            reminder_id: reminder.id,
            channel_id: channel.id,
            status: "sent",
            response_snippet: `status=${result.status}`,
          });
        } else {
          failedCount += 1;
          await supabase.from("notification_delivery_logs").insert({
            reminder_id: reminder.id,
            channel_id: channel.id,
            status: "failed",
            response_snippet: `status=${result.status} body=${result.text}`,
          });
        }
      }

      if (hasSent) {
        await supabase.from("reminders").update({ sent_at: new Date().toISOString() }).eq("id", reminder.id);
      }
    }

    return Response.json({
      ok: true,
      scanned: reminders?.length ?? 0,
      sentCount,
      failedCount,
      skippedCount,
    });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
