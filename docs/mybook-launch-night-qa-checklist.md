# MyBook Launch-Night QA Checklist

## A. 手機與頁面顯示

- [ ] 手機開啟首頁，文字不需放大即可閱讀
- [ ] 手機開啟 `/apply`、`/deposit`、`/faq`、`/thank-you` 無版面破圖
- [ ] 首屏可看到主 CTA 與 WhatsApp 按鈕

## B. 表單與通知

- [ ] `/apply` 表單 7 個欄位完整顯示
- [ ] 送出測試資料後 2 分鐘內收到 Email 通知
- [ ] 通知內容包含孩子主題與家長 WhatsApp

## C. 訂金與付款流程

- [ ] WooCommerce 商品名稱與價格為 `HKD 500`
- [ ] 商品為數位型（不出現運費欄位）
- [ ] 測試下單可進入 Stripe/PayPal 付款
- [ ] 付款完成後導向 `/thank-you`，非通用訂單頁

## D. 客服入口

- [ ] 浮動 WhatsApp 按鈕可點擊
- [ ] 按鈕開啟正確 WhatsApp 號碼
- [ ] 預填訊息內容符合 MyBook 諮詢情境

## E. 隱私與合規

- [ ] 全站搜尋無舊客戶真名
- [ ] 全站無可辨識舊客戶臉部圖像
- [ ] 案例頁只使用匿名文案（Young Author S）
- [ ] 媒體敘述使用泛稱（regional media）

## F. SEO 與技術基礎

- [ ] 首頁、`/apply`、`/deposit`、`/faq` 有 title/meta 描述
- [ ] `https://mybook.pub` 全站 HTTPS 正常（無 mixed content）
- [ ] `mybook.pub/sitemap.xml` 可讀取
- [ ] Search Console 已驗證並提交 sitemap
- [ ] SiteGround 快取與 HTTPS 強制已啟用
