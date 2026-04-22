# WordPress 手動執行清單（照做即上線）

## 1) 基礎設定

- [ ] SiteGround 已安裝 WordPress 到 `mybook.pub`
- [ ] `mybook.pub/wp-admin` 可登入
- [ ] SSL 已啟用
- [ ] Cloudflare DNS 指向正確 IP

## 2) 外掛安裝（免費版可先上）

- [ ] Elementor
- [ ] WooCommerce
- [ ] Fluent Forms
- [ ] Join.chat 或 WP Social Chat
- [ ] Rank Math SEO
- [ ] Wordfence
- [ ] UpdraftPlus
- [ ] WP Webhooks

## 3) 永久連結與語系

- [ ] Permalink 設為 `/%postname%/`
- [ ] 網站語系設為繁中（必要時加英文）

## 4) 套用交付代碼

- [ ] 將 `deliverables/wordpress/functions-snippets.php` 內容加入主題 `functions.php`
- [ ] 上傳 `deliverables/wordpress/mybook-3d-preview` 為外掛並啟用

## 5) 付款與表單

- [ ] 建立商品：`MyBook Discovery Session Deposit`
- [ ] 價格：HKD 500
- [ ] 產品類型：Digital（不收運費）
- [ ] Fluent Forms 建立 Apply 表單
- [ ] 提交通知寄送到你的主信箱

## 6) 上線前驗收

- [ ] 手機開啟首頁與 `contact/deposit` 正常
- [ ] 表單可提交且收到通知
- [ ] 訂金可下單至付款頁
- [ ] WhatsApp 浮動按鈕正常
- [ ] 無舊客戶識別姓名/臉部素材
