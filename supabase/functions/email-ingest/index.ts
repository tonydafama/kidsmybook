// Supabase Edge Function: email-ingest
// Receives parsed email events from your middleware (Cursor/Manus/Outlook webhook processor)
// and inserts them into email_signals. It can also auto-create a reminder.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRole);

type IngestPayload = {
  source_message_id?: string | null;
  sender_name: string;
  email_subject: string;
  attachment_name?: string | null;
  status?: string;
  notes?: string | null;
  target_owner_name?: string | null;
  source_received_at?: string | null;
  create_reminder?: boolean;
  auto_create_task?: boolean;
};

const addDays = (days: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = (await req.json()) as IngestPayload;
    if (!body.sender_name || !body.email_subject) {
      return new Response("sender_name and email_subject are required", { status: 400 });
    }
    const messageId = body.source_message_id?.trim() || null;

    if (messageId) {
      const { data: existingSignal } = await supabase
        .from("email_signals")
        .select("*")
        .eq("source_message_id", messageId)
        .maybeSingle();
      if (existingSignal) {
        return Response.json({ ok: true, deduped: true, signal: existingSignal, taskCreated: null });
      }
    }

    const { data: signal, error } = await supabase
      .from("email_signals")
      .insert({
        source_message_id: messageId,
        sender_name: body.sender_name,
        email_subject: body.email_subject,
        attachment_name: body.attachment_name ?? null,
        status: body.status ?? "new_instruction",
        notes: body.notes ?? null,
        target_owner_name: body.target_owner_name ?? null,
        source_received_at: body.source_received_at ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;

    if (body.create_reminder && body.target_owner_name) {
      await supabase.from("reminders").insert({
        reminder_type: "email_signal",
        message: `New email signal for ${body.target_owner_name}: ${body.email_subject}`,
        due_at: new Date().toISOString(),
        task_id: null,
      });
    }

    let taskCreated = null;
    const shouldAutoCreate = body.auto_create_task ?? true;
    if (shouldAutoCreate) {
      const { data: rules } = await supabase
        .from("email_task_rules")
        .select("*")
        .eq("is_active", true);
      const normalizedSubject = body.email_subject.toLowerCase();
      const rule = rules?.find((r) => normalizedSubject.includes(String(r.keyword).toLowerCase()));

      if (rule) {
        const ownerName = body.target_owner_name ?? rule.owner_name;
        const { data: existing } = messageId
          ? await supabase.from("tasks").select("id").eq("source_message_id", messageId).maybeSingle()
          : await supabase
              .from("tasks")
              .select("id")
              .eq("owner_name", ownerName)
              .eq("project", rule.project)
              .eq("task", body.email_subject)
              .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString())
              .maybeSingle();

        if (!existing) {
          const { data: newTask } = await supabase
            .from("tasks")
            .insert({
              source_message_id: messageId,
              owner_name: ownerName,
              backup_owner_name: null,
              project: rule.project,
              task: body.email_subject,
              deliverables: body.notes ?? `Follow up from incoming email: ${body.email_subject}`,
              deadline: addDays(rule.default_due_days ?? 3),
              status: "Not Started",
              progress: 0,
              priority: rule.default_priority ?? "Medium",
              procurement_note: body.notes?.toLowerCase().includes("procurement") ? body.notes : null,
              approval_chain: null,
              notes: `Auto-created by email-ingest. Attachment: ${body.attachment_name ?? "none"}`,
            })
            .select("*")
            .single();

          taskCreated = newTask ?? null;

          if (newTask) {
            await supabase.from("reminders").insert({
              task_id: newTask.id,
              reminder_type: "email_signal",
              message: `New task auto-created for ${ownerName}: ${body.email_subject}`,
              due_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return Response.json({ ok: true, signal, taskCreated });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
