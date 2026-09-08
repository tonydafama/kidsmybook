# Kidsmybook agent rules

**Read this before any SEO, content, schema, llms.txt, blog, intake, or “AI search” work.**

Owner: Anthony. Live site: https://kidsmybook.com  
Repo: https://github.com/tonydafama/kidsmybook  
Canonical domain: `kidsmybook.com` (www / mybook.pub 301 here).

If you are a Hermes / Desktop / Laptop bot: you were **wrong** on 2026-09-08. Read `docs/HERMES-CORRECTION-2026-09-08.md`, `git pull`, and do **not** revert Cursor’s fix (`01fa645`).

---

## Hard rules (do not violate)

### Pricing

- **Do not publish prices.** No `HK$3,800`, `HKD 3800`, `入門價`, `starting price`, `priceRange: HKD 3800+`, JSON-LD `Offer.price`.
- Public copy: **私人報價 / quoted on private consultation**. WhatsApp or intake form only.
- This applies to: homepage, FAQ, `index.html` JSON-LD, `public/llms.txt`, blogs, posters, `kidsmybook-jsonld.json`, sitemap descriptions.

### Truth

- Do not invent professor names, school partnerships, guaranteed admission, fake NAP (street + hours), or fake customer names.
- Case study public name is **Hilary**. Never restore 徐多 / Xu Duo on the live site.
- Do not impersonate a parent (“我個仔…”) on brand Xiaohongshu / RedNote / social. Studio voice only.
- Do not tell the owner something is live unless you verified the **live URL** after deploy (not only `dist/` or git).

### Claims vs evidence

- Bing / Yandex / Ping-o-matic pings are **not** “SEO done”.
- Ping-ing Google AI Overview / Perplexity from a datacenter is **not** ranking monitoring.
- Cloudflare Worker cron is **not** enabled until a workers.dev subdomain exists. Do not report a weekly AI-search cron as live.
- Auto-posting Zhihu / LinkedIn / 知乎 with the owner’s account is **not allowed** (ToS + brand risk).

### Schema / AI files

- Homepage FAQ JSON-LD must match **visible** FAQ copy (locale-aware).
- Prefer `ProfessionalService` over a fake shopfront `LocalBusiness` (no street address, no invented 09:00–21:00).
- `llms.txt` must be valid UTF-8. No `??` mojibake. Tell crawlers **not** to invent prices.
- Blog posts: `BlogPosting` is required. Add `FAQPage` only if the article has real question headings. Do not fabricate per-post FAQs.

---

## Do

- `git pull` before editing. Build + `wrangler deploy` for Worker/site changes, then curl the live URL.
- Keep blogs trilingual (`.md` / `.hans.md` / `.en.md`) and `POSTS` in `src/BlogPages.tsx` in sync with `worker` sitemap + `public/sitemap.xml`.
- Intake: Telegram notify the studio. Email ack to the parent **only** if contact contains an email and `RESEND_API_KEY` is set. Do not WhatsApp-blast strangers without Meta templates.
- Xiaohongshu: copy-paste posts in `XIAOHONGSHU_POSTS.md` for the **official brand account**. Owner pastes. No fake identity.
- High-ROI items that need the **owner**: Google Business Profile, Search Console users, ChatGPT custom GPT login, workers.dev onboarding, YouTube / PR.

## Don’t

- Don’t put prices back “as a conversion hook”.
- Don’t report unfinished work as ✅ live.
- Don’t auto-spam social or email PTA lists without explicit written approval for that channel.
- Don’t commit secrets (`.env`, API tokens, WhatsApp Cloud tokens).

---

## After a task

Commit + push only when the change is real. Verify live. If you cannot verify, say so.
