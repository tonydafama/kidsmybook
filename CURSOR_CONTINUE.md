# MyBook — 在另一台電腦用 Cursor 接續

## 1. 解壓

解壓到任意資料夾，例如 `C:\Projects\si-ops-dashboard`。

## 2. 用 Cursor 開啟

**File → Open Folder** → 選解壓後的資料夾。

## 3. 安裝與預覽

```powershell
Set-Location "路徑\si-ops-dashboard"
npm install
npm run dev
```

瀏覽器：`http://localhost:5173/`

建置上線用：

```powershell
npm run build
```

上傳 `dist` 全部內容到 SiteGround `public_html`。

## 4. 環境變數（可選）

複製 `.env.example` 為 `.env.local`，設定：

- `VITE_WHATSAPP_NUMBER` — 真實 WhatsApp 號碼（含國碼，無 +）
- `VITE_WECHAT_ID`

## 5. 版本分支

此包來自分支 **`preview/cmo-homepage-v2`**（CMO 新版首頁）。

若資料夾內有 `.git`，切換版本：

| 版本 | 指令 |
|------|------|
| 新版（CMO v2） | `git checkout preview/cmo-homepage-v2` |
| 舊版快照 | `git checkout snapshot/pre-cmo-v2` |

詳見 `docs/VERSION_SWITCH.md`。

若無 `.git`，即為純原始碼快照，直接改 `src/` 即可。

## 6. 對 Cursor 說

- 「給我舊版」→ 切 `snapshot/pre-cmo-v2`
- 「給我新版」→ 切 `preview/cmo-homepage-v2`

全案價格不在網站顯示（私人報價）。
