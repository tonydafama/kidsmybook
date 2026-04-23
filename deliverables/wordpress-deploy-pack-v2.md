# MyBook WordPress Deploy Pack V2

Use this pack when wp-admin is accessible. Paste each block into the corresponding WordPress page using a Custom HTML block.

## 1) Homepage (`/`)

```html
<style>
  .mb-wrap{font-family:Inter,Segoe UI,PingFang TC,Microsoft JhengHei,sans-serif;color:#e2e8f0;background:radial-gradient(circle at 10% -10%,rgba(59,130,246,.2),transparent 35%),radial-gradient(circle at 100% 0%,rgba(168,85,247,.2),transparent 40%),linear-gradient(180deg,#050713 0%,#070b1c 100%);padding:24px;border-radius:20px}
  .mb-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}
  .mb-eyebrow{margin:0;color:#93c5fd;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
  .mb-h1{margin:10px 0;font-size:clamp(34px,5vw,58px);line-height:1.06;color:#f8fafc}
  .mb-lead{margin:0;color:#cbd5e1;line-height:1.72}
  .mb-en{margin-top:8px;color:#a5b4fc}
  .mb-card{border:1px solid rgba(148,163,184,.25);background:linear-gradient(155deg,rgba(30,41,59,.78),rgba(15,23,42,.6));border-radius:16px;padding:20px}
  .mb-btns{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
  .mb-btn{display:inline-flex;text-decoration:none;border-radius:10px;padding:10px 14px;font-weight:700;font-size:14px}
  .mb-btn-primary{color:#fff;background:linear-gradient(130deg,#3b82f6,#8b5cf6)}
  .mb-btn-ghost{color:#dbeafe;background:rgba(30,41,59,.7);border:1px solid rgba(148,163,184,.35)}
  .mb-section{margin-top:14px;border:1px solid rgba(148,163,184,.28);background:linear-gradient(165deg,rgba(15,23,42,.86),rgba(30,41,59,.62));border-radius:14px;padding:18px}
  .mb-section h3{margin:0 0 10px;color:#f8fafc}
  .mb-grid{display:grid;gap:10px;grid-template-columns:repeat(3,minmax(0,1fr))}
  .mb-item{border:1px solid rgba(148,163,184,.3);border-radius:12px;padding:12px;background:rgba(15,23,42,.45)}
  .mb-item h4{margin:0 0 6px;color:#dbeafe}
  .mb-item p{margin:0;color:#cbd5e1;font-size:13px;line-height:1.6}
  .mb-list{margin:0;padding-left:20px;display:grid;gap:8px;line-height:1.6}
  .mb-media{display:flex;flex-wrap:wrap;gap:8px}
  .mb-pill{border:1px solid rgba(148,163,184,.4);border-radius:999px;padding:6px 10px;font-size:12px;background:rgba(15,23,42,.52);color:#dbeafe}
  .mb-quote{margin:0;border-left:3px solid rgba(96,165,250,.85);border-radius:8px;padding:10px 12px;background:rgba(15,23,42,.45)}
  @media(max-width:980px){.mb-hero,.mb-grid{grid-template-columns:1fr}}
</style>

<section class="mb-wrap">
  <div class="mb-hero">
    <div>
      <p class="mb-eyebrow">Child Achievement Publishing · Exhibition · PR</p>
      <h1 class="mb-h1">把孩子的熱愛，變成值得被世界看見的成就</h1>
      <p class="mb-lead">出版 · 發布會 · 展覽 · 媒體報導 · 一站式全案服務</p>
      <p class="mb-lead mb-en">Turn your child's passion into a published achievement the world can see.</p>
      <div class="mb-btns">
        <a class="mb-btn mb-btn-primary" href="https://wa.me/85200000000?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%83%B3%E9%A0%90%E7%B4%84%20MyBook%20%E5%85%92%E7%AB%A5%E6%88%90%E5%B0%B1%E5%87%BA%E7%89%88%E7%A7%81%E4%BA%BA%E8%AB%AE%E8%A9%A2%E3%80%82" target="_blank" rel="noreferrer">預約私人諮詢</a>
        <a class="mb-btn mb-btn-ghost" href="/services/">查看服務</a>
      </div>
    </div>
    <div class="mb-card">
      <p style="margin:0;color:#bae6fd;font-size:12px;">徐多案例</p>
      <p style="margin:8px 0 0;line-height:1.7;">8 歲 · 歷時 1 年 · 新書發布會 · 媒體報導 · 3,569 人次線上觀看</p>
    </div>
  </div>

  <section class="mb-section">
    <h3>What We Do</h3>
    <div class="mb-grid">
      <a class="mb-item" href="/services/author-programme/"><h4>Author Programme</h4><p>由興趣出發，1 對 1 指導完成正式出版成果。</p></a>
      <a class="mb-item" href="/services/book-launch/"><h4>Book Launch Event</h4><p>為孩子作品打造有儀式感的新書發布會。</p></a>
      <a class="mb-item" href="/services/exhibition/"><h4>Exhibition</h4><p>讓創作被看見，從作品到空間完整呈現。</p></a>
      <a class="mb-item" href="/services/media-pr/"><h4>Media & PR</h4><p>把孩子故事轉化成可被報導的內容。</p></a>
      <a class="mb-item" href="/services/live-streaming/"><h4>Live Streaming</h4><p>活動當日即時直播與線上互動。</p></a>
      <a class="mb-item" href="/services/portfolio-package/"><h4>Portfolio Package</h4><p>整理成升學可用的作品集成果包。</p></a>
    </div>
  </section>

  <section class="mb-section">
    <h3>Featured Case Study</h3>
    <p style="margin:0;">徐多《蝴蝶雙語圖鑑》：8 歲 · 歷時 1 年 · 新書發布會 · 媒體報導 · 3,569 人次線上觀看</p>
    <div class="mb-btns"><a class="mb-btn mb-btn-ghost" href="/case-studies/xu-duo-butterfly-guide/">查看完整案例</a></div>
  </section>

  <section class="mb-section">
    <h3>The Journey</h3>
    <ol class="mb-list">
      <li>發現興趣</li><li>規劃項目</li><li>創作內容</li><li>設計出版</li><li>發布展覽</li><li>媒體傳播</li>
    </ol>
  </section>

  <section class="mb-section">
    <h3>3D Book Preview</h3>
    <p style="margin:0;">建議在正式網站使用你 React 版的 3D 模組嵌入（避免 WordPress 純 HTML 受限）。此區先放功能說明與 CTA。</p>
    <div class="mb-btns">
      <a class="mb-btn mb-btn-primary" href="https://wa.me/85200000000?text=%E6%88%91%E6%83%B3%E7%9D%87%203D%20Book%20Preview%20Demo" target="_blank" rel="noreferrer">查看 3D Demo</a>
    </div>
  </section>

  <section class="mb-section"><h3>For Whom</h3><ul class="mb-list"><li>孩子有明確興趣或特長</li><li>重視 PBL 項目制學習</li><li>希望孩子成就被完整記錄</li><li>有升學 portfolio 需求</li></ul></section>

  <section class="mb-section"><h3>Testimonial</h3><blockquote class="mb-quote">「孩子第一次覺得自己真係有作品，仲願意主動向同學介紹。」— 徐多家長</blockquote><blockquote class="mb-quote" style="margin-top:8px;">「唔只一本書，而係完整成就項目，發布會、媒體、作品集一次整合。」— 國際學校家長</blockquote></section>

  <section class="mb-section"><h3>Media Coverage</h3><div class="mb-media"><span class="mb-pill">深圳特區報</span><span class="mb-pill">南方+</span><span class="mb-pill">Regional Parenting Media</span></div></section>

  <section class="mb-section">
    <h3>開始你孩子的出版之旅</h3>
    <div class="mb-btns">
      <a class="mb-btn mb-btn-primary" href="https://wa.me/85200000000?text=%E6%88%91%E6%83%B3%E9%96%8B%E5%A7%8B%E5%AD%A9%E5%AD%90%E7%9A%84%E5%87%BA%E7%89%88%E4%B9%8B%E6%97%85" target="_blank" rel="noreferrer">WhatsApp 聯繫</a>
      <a class="mb-btn mb-btn-ghost" href="/services/">查看 6 大服務</a>
    </div>
  </section>
</section>
```

## 2) Services index (`/services/`)

```html
<h2>Services</h2>
<ul>
  <li><a href="/services/author-programme/">Author Programme</a> - From HKD XX,XXX</li>
  <li><a href="/services/book-launch/">Book Launch Event</a> - From HKD XX,XXX</li>
  <li><a href="/services/exhibition/">Exhibition</a> - From HKD XX,XXX</li>
  <li><a href="/services/media-pr/">Media & PR</a> - Custom quote</li>
  <li><a href="/services/live-streaming/">Live Streaming</a> - From HKD X,XXX</li>
  <li><a href="/services/portfolio-package/">Portfolio Package</a> - From HKD X,XXX</li>
</ul>
```

## 3) Service detail template (use for all 6 child pages)

```html
<h1>{{SERVICE_TITLE}}</h1>
<p>{{SERVICE_DESCRIPTION}}</p>
<p><strong>{{PRICE_LABEL}}</strong></p>

<h3>適合對象</h3>
<ul>
  <li>{{AUDIENCE_1}}</li>
  <li>{{AUDIENCE_2}}</li>
  <li>{{AUDIENCE_3}}</li>
</ul>

<h3>服務流程</h3>
<ol>
  <li>{{STEP_1}}</li>
  <li>{{STEP_2}}</li>
  <li>{{STEP_3}}</li>
  <li>{{STEP_4}}</li>
</ol>

<p><a href="https://wa.me/85200000000?text=%E6%88%91%E6%83%B3%E4%BA%86%E8%A7%A3%20{{SERVICE_TITLE}}">WhatsApp 預約諮詢</a></p>
```

## 4) Case studies index (`/case-studies/`)

```html
<h2>Case Studies</h2>
<ul>
  <li><a href="/case-studies/xu-duo-butterfly-guide/">徐多蝴蝶圖鑑</a></li>
  <li>[future cases]</li>
</ul>
```

## 5) Case study page (`/case-studies/xu-duo-butterfly-guide/`)

```html
<h1>徐多｜《蝴蝶雙語圖鑑》</h1>
<p>8 歲 · 歷時 1 年</p>

<h3>Project overview</h3>
<ul>
  <li>Topic: 蝴蝶生態與雙語科普</li>
  <li>Services: 出版計劃 + 新書發布會 + 媒體公關 + 直播</li>
  <li>Format: 中英雙語圖鑑 + 活動紀錄素材</li>
</ul>

<h3>The story</h3>
<p>孩子由日常觀察蝴蝶出發，逐步建立研究習慣，完成圖像與文字內容，最終成功出版並公開發表。</p>

<h3>Gallery</h3>
<p>Book spreads / Event photos / Exhibition photos / Media coverage screenshots</p>

<h3>Results</h3>
<ul>
  <li>Media mentions：深圳特區報、南方+（示例）</li>
  <li>Event attendance：現場家庭與嘉賓參與</li>
  <li>Online views：3,569+</li>
  <li>Parent testimonial：孩子更有自信，亦更主動分享成果</li>
</ul>

<p><a href="https://wa.me/85200000000?text=Start%20your%20child%27s%20publishing%20journey">Start your child's publishing journey</a></p>
```

## 6) Immediate verify checklist

1. Set homepage to static page in WordPress reading settings.
2. Publish all `/services/*` and `/case-studies/*` pages.
3. In Cloudflare set forwarding rule: `mybook.pub/*` -> `https://kidsmybook.com/$1` (301).
4. Purge Cloudflare cache.
5. Verify:
   - `https://kidsmybook.com/`
   - `https://mybook.pub/`
   - `https://mybook.pub/services/`
