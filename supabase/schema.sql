-- Users should be created with Supabase Auth.
-- This schema focuses on team members, tasks, email signals and reminders.

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  role text not null check (role in ('manager', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.manager_whitelist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  source_message_id text,
  owner_name text not null,
  backup_owner_name text,
  project text not null,
  task text not null,
  deliverables text not null,
  deadline date not null,
  status text not null check (status in ('Not Started', 'In Progress', 'Pending Approval', 'Completed')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  procurement_note text,
  approval_chain text,
  notes text,
  last_update date not null default current_date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_signals (
  id uuid primary key default gen_random_uuid(),
  source_message_id text,
  sender_name text not null,
  email_subject text not null,
  attachment_name text,
  status text not null,
  notes text,
  target_owner_name text,
  source_received_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.email_task_rules (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  project text not null,
  owner_name text not null,
  default_priority text not null check (default_priority in ('High', 'Medium', 'Low')),
  default_due_days int not null default 3,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('deadline', 'approval', 'email_signal')),
  message text not null,
  due_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null check (channel_type in ('teams_webhook', 'email_webhook', 'dashboard_only')),
  target_name text not null,
  target_value text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  channel_id uuid references public.notification_channels(id) on delete set null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  response_snippet text,
  created_at timestamptz not null default now()
);

alter table public.tasks add column if not exists source_message_id text;
alter table public.email_signals add column if not exists source_message_id text;
alter table public.team_members
  add constraint if not exists team_members_hkage_email_chk
  check (lower(email) like '%@hkage.edu.hk');

alter table public.team_members enable row level security;
alter table public.manager_whitelist enable row level security;
alter table public.tasks enable row level security;
alter table public.email_signals enable row level security;
alter table public.email_task_rules enable row level security;
alter table public.reminders enable row level security;
alter table public.notification_channels enable row level security;
alter table public.notification_delivery_logs enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Any team_member with role = manager is treated as elevated (no separate table allowlist).
create or replace function public.is_manager_whitelisted()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.email = auth.jwt() ->> 'email'
      and tm.role = 'manager'
  );
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create policy "manager can read all team members"
on public.team_members for select
using (public.is_manager_whitelisted());

create policy "members can read own profile"
on public.team_members for select
using (email = auth.jwt() ->> 'email');

create policy "manager can manage tasks"
on public.tasks for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "member can read own tasks"
on public.tasks for select
using (owner_name = (
  select display_name from public.team_members m where m.email = auth.jwt() ->> 'email'
));

create policy "member can update own tasks"
on public.tasks for update
using (owner_name = (
  select display_name from public.team_members m where m.email = auth.jwt() ->> 'email'
))
with check (owner_name = (
  select display_name from public.team_members m where m.email = auth.jwt() ->> 'email'
));

create policy "manager can manage email signals"
on public.email_signals for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "member can read targeted email signals"
on public.email_signals for select
using (
  target_owner_name = (
    select display_name from public.team_members m where m.email = auth.jwt() ->> 'email'
  )
);

create policy "manager can manage email rules"
on public.email_task_rules for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "manager can manage reminders"
on public.reminders for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "member can read own reminders"
on public.reminders for select
using (
  exists (
    select 1
    from public.tasks t
    join public.team_members m on m.display_name = t.owner_name
    where t.id = reminders.task_id
      and m.email = auth.jwt() ->> 'email'
  )
);

create policy "manager can manage notification channels"
on public.notification_channels for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "manager can manage notification logs"
on public.notification_delivery_logs for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create policy "manager can manage whitelist"
on public.manager_whitelist for all
using (public.is_manager_whitelisted())
with check (public.is_manager_whitelisted());

create unique index if not exists reminders_task_type_due_idx
on public.reminders(task_id, reminder_type, due_at);

create unique index if not exists email_signals_source_message_id_uidx
on public.email_signals(source_message_id)
where source_message_id is not null;

create unique index if not exists tasks_source_message_id_uidx
on public.tasks(source_message_id)
where source_message_id is not null;
