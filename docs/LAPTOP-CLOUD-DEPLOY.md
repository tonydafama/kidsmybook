# Laptop → GitHub → live (Anthony workflow)

You asked to work on the **laptop** and have changes **sync to Cloud Agents** and **go live immediately**.

## One-time setup (≈2 minutes)

1. **GitHub repo secret**  
   Cloudflare Dashboard → My Profile → API Tokens → Create token with **Workers Scripts: Edit** (and account read).  
   GitHub → `tonydafama/kidsmybook` → Settings → Secrets and variables → Actions → **New repository secret**  
   Name: `CLOUDFLARE_API_TOKEN`

2. **Optional local fallback** (if Actions ever fail):  
   `npx wrangler login` then `npm run build && npx wrangler deploy`

## Every day on the laptop

```bash
git pull origin main
# … edit in Cursor …
git add -A && git commit -m "…" && git push origin main
```

Within a few minutes, **Deploy live** workflow should publish `dist/` + Worker to kidsmybook.com.

## Cloud Agent

Agents read `.cursor/rules/laptop-cloud-sync-deploy.mdc`: they pull `main`, push fixes, and **curl** the site before saying anything is live.

## Check deploy

- GitHub → Actions → **Deploy live**  
- Or: `curl -sL 'https://kidsmybook.com/' | rg 'hero-headline__primary'` (after hero redesign)