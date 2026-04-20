-- Schedule: run deadline reminder every workday at 09:00 HKT
-- Requires pg_cron + pg_net enabled in Supabase project.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace placeholders before running:
-- <SUPABASE_PROJECT_URL> e.g. https://xxxx.supabase.co
-- <SUPABASE_SERVICE_ROLE_KEY> from project settings

select cron.schedule(
  'deadline-reminder-weekday-0900',
  '0 1 * * 1-5',
  $$
  select net.http_post(
    url := '<SUPABASE_PROJECT_URL>/functions/v1/deadline-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>'
    ),
    body := '{"days_ahead":3}'::jsonb
  );
  $$
);

-- Optional: dispatch due reminders every 10 minutes during work hours (HKT 09:00-19:00 roughly UTC 01:00-11:00)
select cron.schedule(
  'notify-dispatch-workhours',
  '*/10 1-11 * * 1-5',
  $$
  select net.http_post(
    url := '<SUPABASE_PROJECT_URL>/functions/v1/notify-dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
