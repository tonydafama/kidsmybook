/**
 * Usage:
 * 1) Set env vars:
 *    SUPABASE_PROJECT_URL=https://xxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=xxxxx
 * 2) Optional payload file:
 *    EMAIL_INGEST_PAYLOAD=./scripts/payloads/email-ingest.ijso.json
 * 3) Run:
 *    npm run test:email-ingest
 */

import { readFile } from "node:fs/promises";

const projectUrl = process.env.SUPABASE_PROJECT_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const payloadPath = process.env.EMAIL_INGEST_PAYLOAD || "./scripts/payloads/email-ingest.default.json";

if (!projectUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_PROJECT_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const payload = JSON.parse(await readFile(payloadPath, "utf8"));

const response = await fetch(`${projectUrl}/functions/v1/email-ingest`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceRoleKey}`,
  },
  body: JSON.stringify(payload),
});

const result = await response.json().catch(() => ({}));
console.log("status:", response.status);
console.log(JSON.stringify(result, null, 2));

if (!response.ok) process.exit(1);
