# MyBook Dashboard 任務完成狀態

更新時間：2026-04-22

## 已由本機專案完成（可直接上線到前端）

1. 設計系統與首頁高端視覺
2. Hero 區塊與主 CTA
3. 6 大服務區塊
4. 匿名案例區塊（隱私合規）
5. The Journey 6-step 流程
6. 3D 書本預覽互動
7. Monica API 封面生成串接
8. 高潛力家庭評分模型
9. HKD 500 訂金入口與條件開關
10. Apply intake 區塊（WhatsApp 提交）
11. FAQ 區塊
12. Testimonials 區塊
13. Media coverage wall 區塊
14. 浮動 WhatsApp 按鈕
15. 隱私合規規則區塊
16. Monica 任務看板區塊

## 已準備交付包（可貼到 WordPress）

1. `deliverables/wordpress/functions-snippets.php`
   - 自訂文章類型：`case_study`、`book_project`
   - Fluent Forms webhook
   - WooCommerce 新訂單 webhook
   - Webhook URL 後台設定欄位
2. `deliverables/wordpress/mybook-3d-preview/`
   - 可打包為 WordPress 外掛的 3D 預覽 short code
3. `deliverables/wordpress/mybook-intake-form.json`
   - Apply 表單欄位結構（可直接照欄位建表）
4. `deliverables/wordpress/mybook-child/`
   - Child theme `style.css` + `functions.php`
5. `deliverables/wordpress/redirects-htaccess-snippet.txt`
   - `/book` 與 `/pay` 快捷路徑導向
6. `docs/mybook-launch-night-qa-checklist.md`
   - 上線夜完整驗收清單

## 需你在 WordPress / SiteGround / Cloudflare 手動完成

1. SiteGround：WordPress 安裝、SSL、DNS 檢查
2. WordPress 外掛安裝：Elementor / WooCommerce / Fluent Forms / Join.chat / Rank Math / Wordfence / UpdraftPlus / WPWebhooks
3. 建立 WooCommerce 訂金商品頁（HKD 500）
4. 設定付款閘道（Stripe 或 PayPal）
5. 設定表單通知 Email
6. Search Console 驗證與 sitemap 提交
7. 手機端最終 QA（付款、表單、WhatsApp、頁面速度）

## 隱私規則（強制）

- 不可公開舊客戶可識別姓名
- 不可公開任何可識別臉部影像
- 媒體截圖需打碼或改為文字敘述
