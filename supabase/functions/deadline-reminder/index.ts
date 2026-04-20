// Supabase Edge Function: deadline-reminder
// Scan tasks near deadline and create reminder records.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRole);

type ReminderPayload = {
  days_ahead?: number;
};

const addDays = (days: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const body = (await req.json().catch(() => ({}))) as ReminderPayload;
    const daysAhead = body.days_ahead ?? 3;
    const today = new Date().toISOString().slice(0, 10);
    const endDate = addDays(daysAhead);

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id,owner_name,project,task,deadline,status")
      .neq("status", "Completed")
      .gte("deadline", today)
      .lte("deadline", endDate);

    if (error) throw error;

    let created = 0;
    for (const task of tasks ?? []) {
      const dueAt = `${task.deadline}T09:00:00.000Z`;
      const { error: reminderError } = await supabase.from("reminders").upsert(
        {
          task_id: task.id,
          reminder_type: "deadline",
          message: `Task nearing deadline (${task.deadline}): ${task.project} - ${task.task} (owner: ${task.owner_name})`,
          due_at: dueAt,
        },
        { onConflict: "task_id,reminder_type,due_at" }
      );
      if (!reminderError) created += 1;
    }

    return Response.json({ ok: true, scanned: tasks?.length ?? 0, remindersUpserted: created });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
});
