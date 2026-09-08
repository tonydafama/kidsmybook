# Prompt for Cursor (laptop) — 幫 Kidsmybook blog 加簡體 + 英文版

## 背景
Kidsmybook 個 React + Vite + Cloudflare Worker 網站，blog 喺 `src/BlogPages.tsx` + `blog/*.md`。
而家 `BlogPages.tsx` 已經改好：用 `import.meta.glob("../blog/*.md", {eager:true})` 靜態讀晒所有 md，
`loadPostBody(slug, locale)` 會按 locale 搵：
- `../blog/<slug>.md` → 繁體（Traditional，預設）
- `../blog/<slug>.hans.md` → 簡體（Simplified）
- `../blog/<slug>.en.md` → 英文（English）
如果搵唔到 localized 版，fallback 去繁體。

網站語言 toggle 有三個：zhHant（繁）/ zhHans（簡）/ en（英），已經喺 `src/i18n/` 實現（UI 文字有翻譯，但 blog 正文之前冇）。

## 你的任務
幫下面 11 篇 blog 生成 **簡體版（.hans.md）** 同 **英文版（.en.md）**。
繁體原版已經喺 `blog/<slug>.md`（見下表），照佢嘅結構、front-matter、語氣（真人視角、唔好 list 式 SEO 廢文）翻譯。

### 11 篇 slug（file 名 = slug.md，喺 blog/ 資料夾）
1. hk-international-school-book-mainland-parents
2. gtp-family-child-book-portfolio
3. talent-admission-book-advantage
4. gaocaitong-yisheng-xue-you-shi
5. xing-qu-bian-chu-ban
6. zheng-shu-pi-juan
7. jiao-shou-chu-ban-shuo-fu-li
8. san-lian-shang-jia-yi-yi
9. portfolio-book-4-skills
10. gaocaitong-mom-burnout
11. school-ranking-myth

## 每篇要做
1. 讀 `blog/<slug>.md`（繁體原版）
2. 生成 `blog/<slug>.hans.md`：簡體中文，保留 front-matter（title 改簡體、description 簡體、date/slug/tags 不變），正文簡體，語氣保持真人視角（大陸家長 / 高才通家長口吻）
3. 生成 `blog/<slug>.en.md`：英文，front-matter title/description 英文，正文英文，target = mainland parents / GBA families considering HK schools
4. 唔好加 AI 味，唔好 list 式，保持原版嘅敘事風格

## 完成後
- `npm run build` 確認無 error（glob 會自動 bundle 新 md）
- `npx wrangler deploy` 上線
- 驗證：開 `https://kidsmybook.com/blog/<slug>`，toggle 簡體 / 英文，確認內容切換到對應語言

## 注意
- 唔好改 `src/BlogPages.tsx` 嘅 loadPostBody 邏輯（已經 work）
- 唔好改 slug（file 名必須 = slug.md / slug.hans.md / slug.en.md）
- front-matter 格式：---
title: "..."
description: "..."
date: YYYY-MM-DD
slug: "..."
tags: [...]
---
