# Kidsmybook 諮詢表 — Microsoft Forms 設定（Anthony 直接開）

> 你 login 咗 kidsmybook@outlook.com。MS Form 我 drive 唔到你 browser（HKAGE Chrome 禁 remote debug），所以呢份係你親手開嘅 step-by-step。欄位已經寫好，你 copy 就得。

## 開 Form（2 分鐘）
1. 瀏覽器開 https://forms.office.com （用 kidsmybook@outlook.com login 嗰個）
2. 撳「新增表單」→ 改名：**Kidsmybook 興趣出版諮詢表**
3. 逐個加以下題目（複製中文落去）：

### 題目清單（直接 copy）
1. [必答/文字] 學員姓名
2. [必答/文字] 家長姓名（中文）
3. [必答/選擇] 就讀年級 / 階段
   - 幼稚園 / 小學 / 初中（中一至中三）/ 高中（中四至中六 DSE IB A-Level）/ 大學或已畢業
4. [必答/選擇] 出版用途
   - 升小學（叩門面試 portfolio）/ 升中學 / 升大學（海外或本地）/ 以防不時之需 / 純粹留念
5. [必答/文字] 興趣主題（一）
6. [文字] 興趣主題（二）
7. [文字] 興趣主題（三）
8. [文字/長] 比賽經驗 / 獎項
9. [必答/選擇] 預期完成時間
   - 3 個月內 / 6 個月內 / 1 年內 / 未確定
10. [必答/文字] 聯絡方式（WhatsApp 或 Email）
11. [文字/長] 備註

## 收件設定
- Settings → 開「限公司/組織內」或「任何人」（你搵客要開「任何人」）
- 開「在送出後顯示訊息」：多謝，Anthony 會盡快聯絡你約時間傾。
- 結果會自動入你 Outlook / Excel（forms.office.com → 開啟結果 → 開啟 Excel）

## 拎 share link
- 撳「分享」→ 複製 **填表連結**（forms.office.com/Pages/...）
- 貼俾 Laptop → 佢 embed 落 kidsmybook.com/intake-form.html + 首頁加 CTA 按鈕

## 我（Laptop）嘅下一步
收到 link 後：
1. 改 /intake-form.html → 變 redirect 去 MS Form（或者 embed iframe）
2. 首頁加「填寫諮詢表」按鈕
3. build + deploy
4. 你 share link 去 David 個家長

## 注意
- MS Form 資料去咗你 Microsoft 365，Laptop 讀唔到（要你 export csv 俾我，或 set Power Automate 轉去我 worker KV）
- 如果你想我讀到即時通知，你開 Form 後 set 一個 Power Automate flow：Forms 新回應 → HTTP POST 去 https://kidsmybook.com/api/intake（我 worker 已經接咗呢個 endpoint，會寫落 KV + 發你 WhatsApp）
