# Security & Hosting Guide (HKAGE / Government-sensitive context)

以下係針對你問嘅「資料儲存位置、保安、私隱、是否要長開主機、通知方式」的實際建議。

## 1) 資料會儲存喺邊？

你目前代碼設計係 **雲端資料庫**（Supabase PostgreSQL）：

- SQL schema (`supabase/schema.sql`) 會落到 Supabase 專案 DB
- 前端只係讀寫 API，不會把完整資料長期存本機

### 選項比較

- **本機主機（你部機）**
  - 優點：可完全內網控制
  - 缺點：你要長開機、維運麻煩、不利多人穩定存取
- **OneDrive 只適合放檔案**
  - 可分享 CSV/文件
  - 不適合作為「動態 web app + DB + webhook ingest」後端
- **雲端（建議用受控租戶）**
  - 建議：M365/Azure tenant + Entra ID + 受控 DB（如 Azure Database / 私有部署）
  - 可做到 SSO、審計、最小權限、IP 限制

## 2) 放 OneDrive + 要登入先睇，是否已符合保安？

**只做 OneDrive 登入未必足夠。**

你仲需要：

1. 身份管理：Entra ID SSO + MFA  
2. 權限分層：manager/member RBAC（已在 schema + 前端做）  
3. 傳輸加密：HTTPS only  
4. 資料保護：DB encryption at rest、備份策略  
5. 稽核：登入/改動/audit log 保留  
6. 外發控制：限制 webhook 目的地（allowlist）

本專案已做：

- `team_members` 強制 `@hkage.edu.hk` 網域
- `manager_whitelist` 白名單
- 通知 dispatch 僅允許 HTTPS + host allowlist (`ALLOWED_NOTIFY_HOSTS`)
- 通知內容敏感字遮罩（email、長數字識別碼）

## 3) 要唔要長開你部主機？

- **如果部署喺雲端**：唔使長開你部主機
- **如果你本機跑 server**：要長開先服務到同事

## 4) Email 會點自動讀？

標準流程：

Outlook/Graph webhook -> Middleware parser -> `email-ingest` Edge Function

- Middleware 提取 `internetMessageId`、subject、sender、附件摘要
- POST 到 `email-ingest`
- 系統寫入 `email_signals`，按規則自動建 task / reminder

## 5) 你唔想裝太多嘢，點做？

可用最少安裝方案：

- 前端：Vercel/Netlify（Git 部署）
- 後端：Supabase（託管）
- Email：現有 Microsoft Graph webhook + 輕量 middleware（可由 IT 管）

你本機主要只需：

- node（用於前端開發）
- 瀏覽器

## 6) 收到 email 點通知你？

而家系統支援三層：

1. **In-app**（dashboard 一開即見 reminders/signals）
2. **Teams webhook**（可推送群組頻道）
3. **Email webhook**（可接內部 mail relay）

已加資料表與 function：

- `notification_channels`
- `notification_delivery_logs`
- `notify-dispatch` function

## 7) 唔開 dashboard，可唔可以睇到提醒？

可以，透過：

- Teams 通知
- Email 通知（經 webhook relay）

即使你無開版面，都會收到外部通知。

## 8) 政府/公營環境額外建議（重要）

1. 優先用機構批准嘅雲/資料區域  
2. 對外 webhook 要走 allowlist + secrets vault  
3. 不得把學生個資放入測試 payload  
4. 日誌與匯出要有 retention policy（例如 90/180 日）  
5. 上線前做 DPIA / 資安審批流程  

## 9) 你部機需唔需要一直開？

- 生產環境部署在雲端：**唔需要**
- 你部機只用於開發與管理，不影響同事日常使用
