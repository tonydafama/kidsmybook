# Outlook Integration Playbook

呢份係你可以交比 IT / middleware 同事直接實作嘅規格。

## 1) 推薦架構

- Outlook / Graph webhook -> Middleware parser -> Supabase Edge Function `email-ingest`
- `email-ingest` 會：
  - 新增 `email_signals`
  - 根據 `email_task_rules` 自動建立 task（可關閉）
  - 建立 reminders

## 2) Middleware -> `email-ingest` payload 規格

`POST /functions/v1/email-ingest`

```json
{
  "source_message_id": "<internetMessageId-from-graph>",
  "sender_name": "Rachel Zhang",
  "email_subject": "IJSO handover updates and payment follow-up",
  "attachment_name": "Handover Note_Rachel_as of 20260413.xlsx",
  "status": "new_instruction",
  "notes": "Please review handover and update progress before Friday.",
  "target_owner_name": "Ann Tang",
  "source_received_at": "2026-04-17T09:15:00+08:00",
  "create_reminder": true,
  "auto_create_task": true
}
```

### 欄位說明

- `sender_name` (required): 寄件人顯示名稱
- `email_subject` (required): 郵件主旨
- `source_message_id` (recommended): 直接用 Outlook Graph `internetMessageId`，用作 idempotency key
- `attachment_name` (optional): 第一個關鍵附件名，或彙整字串
- `status` (optional): 建議值 `new_instruction`, `follow_up`, `attachment_indexed_body_reviewed`
- `notes` (optional): 解析後指令摘要
- `target_owner_name` (optional): 指定 owner（如果無，會由 keyword rule 推導）
- `source_received_at` (optional): ISO timestamp
- `create_reminder` (optional, default false)
- `auto_create_task` (optional, default true)

## 3) Owner mapping / keyword 規則

模板檔：`supabase/email_task_rules.template.csv`

建議流程：

1. PM 每週更新 mapping CSV
2. 匯入 `email_task_rules` table
3. 新 subject 進來會按 keyword match project + owner

### 優先序建議

1. `target_owner_name`（middleware 強制指定）
2. keyword 規則（`email_task_rules`）
3. fallback owner（例如 Anthony）

## 4) 去重策略（避免重複建 task）

現時 function 會檢查：

- `source_message_id`（如果有）: 同一封郵件只會 ingest 一次
- 如無 `source_message_id`：退回 owner+project+subject+24h 規則

建議 middleware：

- 直接傳入 `internetMessageId` 到 `source_message_id`
- 如果做重試，請保持同一 `source_message_id` 不變

## 5) 一鍵測試

先設定環境變數：

```bash
export SUPABASE_PROJECT_URL=https://<project>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

測試 email ingest：

```bash
npm run test:email-ingest
```

測試 procurement case：

```bash
EMAIL_INGEST_PAYLOAD=./scripts/payloads/email-ingest.procurement.json npm run test:email-ingest
```

測試 near-deadline reminder：

```bash
npm run test:deadline-reminder
```
