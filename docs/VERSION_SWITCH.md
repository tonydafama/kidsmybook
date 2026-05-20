# MyBook 網站版本切換

## 版本對照

| 版本 | Git 分支 | 說明 |
|------|----------|------|
| **CMO 新版（目前）** | `preview/cmo-homepage-v2` | 全案區、案例圖牆、Hero 主圖、私人報價、單頁 CTA 聚焦 |
| **CMO 新版前** | `snapshot/pre-cmo-v2` | AI 書預覽、Journey、單頁導覽；尚無全案區與案例圖牆 |
| **更早的 master** | `master`（`b627a77`） | 遠端同步的舊站結構 |

全案約 HK$200,000：**不在網站顯示**（僅顧問面談報價）。

---

## 切換到「新版」預覽

```powershell
Set-Location "c:\Users\anthonycheng\si-ops-dashboard"
git checkout preview/cmo-homepage-v2
npm install
npm run dev
```

瀏覽器開 `http://localhost:5173/`，硬刷新 `Ctrl+Shift+R`。

---

## 切回「舊版」（你說 get me old version 時）

```powershell
Set-Location "c:\Users\anthonycheng\si-ops-dashboard"
git checkout snapshot/pre-cmo-v2
npm run dev
```

若要回到最原始的 `master`：

```powershell
git checkout master
```

---

## 上線 SiteGround

在**目前所在分支**執行：

```powershell
npm run build
```

上傳 `dist` 內全部檔案到 `public_html`。

---

## 對 Cursor 說明

- 「**給我新版**」→ 使用分支 `preview/cmo-homepage-v2`
- 「**給我舊版**」→ 使用分支 `snapshot/pre-cmo-v2`
