# SI Ops Dashboard (Anthony)

這個專案係你要嘅 web-based operations tracker 骨架，目標係：

- 以同事做 ownership 單位管理任務
- 每項任務可見 deliverables / deadline / progress / approval
- Anthony / Marius 管理總覽 + 成員自助更新
- 匯入 `dashboard_seed.csv`、`audit_ingest.csv` 即時刷新
- 可接 Supabase Auth + DB + Edge Function（email ingest）
- 已落實 RBAC（manager 全視圖；member 只睇/改自己任務）

## 1) 本機啟動

```bash
npm install
cp .env.example .env
npm run dev
```

> 未配置 Supabase 都可以用內建 demo data 示範。

## 2) Supabase 設定

1. 在 Supabase 建新 project
2. SQL Editor 執行 `supabase/schema.sql`
3. SQL Editor 執行 `supabase/seed.sql`
4. 建立 Auth users（Anthony / Marius / team members）
5. `.env` 設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 後端 function secrets 建議加入：
   - `ALLOWED_NOTIFY_HOSTS`（例如 `outlook.office.com,logic.azure.com`）

## 3) Email ingest pipeline

Edge Function 已提供：`supabase/functions/email-ingest/index.ts`
另外有：`supabase/functions/deadline-reminder/index.ts`

你可用 Outlook webhook / middleware 轉成 JSON，POST 到 function：

```json
{
  "sender_name": "Rachel Zhang",
  "email_subject": "Handover Note Update",
  "attachment_name": "Handover Note_Rachel_as of 20260413.xlsx",
  "status": "new_instruction",
  "notes": "Please update handover progress",
  "target_owner_name": "Ann Tang",
  "source_received_at": "2026-02-11T10:20:00+08:00",
  "create_reminder": true
}
```

`email-ingest` 會按 `email_task_rules`（`supabase/seed.sql`）做 keyword matching，自動建立新 task（可關閉：`"auto_create_task": false`）。
亦支援 `source_message_id`（建議直接用 Outlook `internetMessageId`）做 idempotency，避免重複 ingest。

完整 Outlook/middleware 對接規格見：`docs/outlook-integration.md`
安全與部署建議見：`docs/security-and-hosting-hkage.md`
RECF Event Partner 訓練／認證流程整理見：`docs/event-partner-training-onboarding.md`

本機快速測試：

```bash
npm run test:email-ingest
npm run test:deadline-reminder
npm run test:notify-dispatch
```

可選 payload：

```bash
EMAIL_INGEST_PAYLOAD=./scripts/payloads/email-ingest.procurement.json npm run test:email-ingest
```

## 4) CSV 匯入欄位

- `dashboard_seed.csv`：`project,task,owner,backup_owner,deadline,status,priority,...`
- `audit_ingest.csv`：`sender,email_subject,attachment,status,notes`

## 5) 部署建議

- 前端：Vercel / Netlify（share link 給同事）
- 後端：Supabase
- 任務通知：可用 Supabase cron + Edge Function 針對 near-deadline 任務發 email/slack

## 6) 自動提醒排程

執行 `supabase/cron.sql` 前先把以下 placeholders 換成真值：

- `<SUPABASE_PROJECT_URL>`
- `<SUPABASE_SERVICE_ROLE_KEY>`

排程會在工作天早上 (HKT 09:00) 呼叫 `deadline-reminder`，自動建立 near-deadline reminders。

## 7) 權限模型 (RBAC)

- `manager`：
  - 可讀寫所有 tasks / email_signals / reminders / email_task_rules
  - 必須同時在 `manager_whitelist` 才有 manager 管理權限
  - 可切換 manager/member 視角
  - 可上載 CSV 匯入
- `member`：
  - 只可讀寫自己 `owner_name` 的任務
  - 只可讀取 `target_owner_name` 指向自己的 email signals

## 9) 機構安全強化（已實作）

- `team_members` 限制 `@hkage.edu.hk` 網域
- `manager_whitelist` 白名單控制 manager 寫入權限
- `notify-dispatch` 只允許 HTTPS，並可用 `ALLOWED_NOTIFY_HOSTS` host allowlist
- 通知內容會做基本敏感資訊遮罩（email / 長數字 ID）

## 8) Owner mapping 模板

你可以用 `supabase/email_task_rules.template.csv` 作為維運模板，再同步到 `email_task_rules` table。
