/**
 * Usage:
 * 1) Set env vars:
 *    SUPABASE_PROJECT_URL=https://xxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=xxxxx
 * 2) Run:
 *    npm run test:notify-dispatch
 */

const projectUrl = process.env.SUPABASE_PROJECT_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_PROJECT_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const response = await fetch(`${projectUrl}/functions/v1/notify-dispatch`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceRoleKey}`,
  },
  body: JSON.stringify({}),
});

const result = await response.json().catch(() => ({}));
console.log("status:", response.status);
console.log(JSON.stringify(result, null, 2));

if (!response.ok) process.exit(1);
