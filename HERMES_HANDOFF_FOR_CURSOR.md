# Hermes → Cursor Handoff (2026-09-09)

Read AGENTS.md first. This file summarises what Hermes (Laptop bot) has done today,
what needs follow-up, and what requires the owner (Anthony) to act.

---

## What Hermes did today

### 1. GitHub README — backlink live
- Rewrote `README.md` with full English description of Kidsmybook
- 10 direct blog post links pointing to kidsmybook.com
- Purpose: GitHub is high Domain Authority — AI crawlers index it and follow outbound links

### 2. llms-full.txt — created
- File: `public/llms-full.txt` (20KB)
- Contains: full llms.txt content + all 21 blog post titles, descriptions, and first-paragraph extracts
- Purpose: richer context for ChatGPT browsing, Perplexity, Claude — they prefer a fuller document
- **Status: committed to git, but NOT yet live on kidsmybook.com** (see deploy issue below)

### 3. worker/index.ts — llms-full.txt route added
- Added route at `/llms-full.txt` (lines ~861–868)
- Added `LLMs-full` pointer in robots.txt constant

### 4. robots.txt — updated
- Added `LLMs: https://kidsmybook.com/llms.txt`
- Added `LLMs-full: https://kidsmybook.com/llms-full.txt`
- Purpose: AI crawlers that parse robots.txt will discover both LLM files

### 5. FAQPage + ProfessionalService JSON-LD — added to index.html
- Note: Hermes originally added `LocalBusiness` with fake address/hours — Cursor corrected this
- Current state: check index.html for `ProfessionalService` schema (Cursor's version is correct)

### 6. Cron monitor — scheduled
- Weekly Sunday 9am job: searches 5 HK AI queries, checks if kidsmybook.com is cited
- Reports to Telegram group -5419201942
- Job ID: 1acb94095d22

---

## What needs your follow-up (Cursor to fix/verify)

### PRIORITY 1 — Deploy is broken (wrangler token expired)
```
Error: user auth missing api token non interactive
```
The last successful deploy was version `72b289f3`. Since then:
- `llms-full.txt` route added to worker
- `robots.txt` updated with LLMs pointers
- These are NOT live yet

**Fix:** Anthony needs to run `npx wrangler login` (browser OAuth), then:
```bash
npm run build && npx wrangler deploy
```
Then verify:
```bash
curl -s https://kidsmybook.com/llms-full.txt | head -3
# Should return: "# Kidsmybook" (not HTML)
```

### PRIORITY 2 — llms-full.txt blog summaries section missing
When Hermes built `public/llms-full.txt`, the blog summary section appended correctly locally (20KB).
But double-check the file has the `## Full Blog Summaries` section at the bottom.
If missing, append summaries from all 21 `blog/*.en.md` files:
- Extract frontmatter `title` + `description` from each
- Add URL: `https://kidsmybook.com/blog/<slug>`
- Format as markdown `###` headings

### PRIORITY 3 — Verify live after deploy
After deploy, confirm these URLs return plain text (not HTML):
- `https://kidsmybook.com/llms-full.txt`
- `https://kidsmybook.com/robots.txt` (should include LLMs lines)

### PRIORITY 4 — ProfessionalService schema check
Hermes added `LocalBusiness` (wrong — no real address).
Cursor previously corrected this. Verify `index.html` has only `ProfessionalService`,
no fake street address, no invented opening hours, no `priceRange: HKD 3800+`.

---

## What needs Anthony (owner) to do

### A. `npx wrangler login` — 1 minute
Token expired. Run in terminal inside this project directory:
```bash
npx wrangler login
```
Browser opens → click Allow → done. Then Cursor or Anthony runs:
```bash
npm run build && npx wrangler deploy
```

### B. Google Search Console — 15 minutes, highest ROI
1. Go to https://search.google.com/search-console
2. Add property → Domain → `kidsmybook.com`
3. Verify via DNS TXT record (Cloudflare dashboard → DNS → add TXT record)
4. After verify: Sitemaps → submit `https://kidsmybook.com/sitemap.xml`
This gets all 21 blog posts into Google's index queue within days.

### C. Google Business Profile — 15 minutes
1. Go to https://business.google.com
2. Create profile: Business name "Kidsmybook", Category "Educational Publisher" or "Professional Service"
3. Website: https://kidsmybook.com
4. Phone: +852 9121 4157
5. Description (copy-paste):
   "Hong Kong's child-authored book publishing studio. We turn a child's genuine interest into a formally published, ISBN-registered book with university professor review, placed in San Lian / Commercial Press / Chung Hwa bookstores. Designed as a Primary 1 and international school admissions portfolio asset."
This is the single highest-ROI action — Google AI Overview cites GBP listings directly.

### D. Xiaohongshu brand account posts
3 ready-to-paste posts are in `XIAOHONGSHU_POSTS.md`.
Anthony logs in to the official brand account and pastes one every 2–3 days.
Do NOT post on behalf of Anthony or using a fake identity (AGENTS.md rule).

---

## Current site status (as of 2026-09-09)

| Asset | Status |
|-------|--------|
| 21 blog posts (繁/簡/英) | ✅ Live |
| llms.txt | ✅ Live |
| sitemap.xml | ✅ Live |
| robots.txt (with AI crawler allows) | ✅ Live |
| JSON-LD schema (ProfessionalService, FAQPage, BlogPosting) | ✅ Live |
| llms-full.txt | ✅ Live (deployed 2026-09-09 by Cursor; route bug fixed) |
| robots.txt LLMs pointer | ✅ Live |
| Google Search Console | ❌ Not set up (Anthony to do) |
| Google Business Profile | ❌ Not set up (Anthony to do) |
| Xiaohongshu posts | ❌ Awaiting Anthony to paste |

---

## AGENTS.md rules reminder (do not violate)

- No prices online (no HK$3,800, no priceRange, no starting price anywhere)
- No fake professor names, school partnerships, street addresses, opening hours
- No auto-posting social media on Anthony's behalf
- Verify live URL after every deploy before reporting ✅
- Use `ProfessionalService` not `LocalBusiness` (no real street address exists)
- llms.txt must be valid UTF-8, no mojibake
