# Go-Live First Review (T+30)

Updated: 2026-04-22

## Goal

Make both `mybook.pub` and `kidsmybook.com` publicly usable as launch-ready entry points.

## What I verified

1. Public DNS resolves for both domains.
   - `kidsmybook.com` and `www.kidsmybook.com` resolve via Cloudflare.
   - `mybook.pub` and `www.mybook.pub` resolve via Cloudflare.

2. Public website status (external fetch verification):
   - `https://kidsmybook.com` is live and returns a WordPress site.
   - `https://kidsmybook.com/wp-admin` is reachable and shows WordPress login.
   - `https://mybook.pub` returns "default server vhost" page (not mapped to intended WordPress site).
   - `https://mybook.pub/wp-admin` returns 404.

3. Hosting panel status (SiteGround):
   - Current website in hosting account: `kidsmybook.com`.
   - Site tools indicates domain-pointing warning in dashboard context.
   - Site IP shown: `35.213.129.243`.

4. Important environment note:
   - Built-in browser environment can be blocked by corporate/web filter (Sophos), which can show false "blocked" views for newly registered domains.
   - Therefore, go-live truth is based on external fetch + hosting panel, not only local browser rendering.

## Current go-live conclusion

- `kidsmybook.com`: **Live** (public site + wp-login reachable).
- `mybook.pub`: **Live on same WordPress instance** (public site + wp-login reachable).
- `www.mybook.pub`: **Live**.

## Root cause (resolved)

`mybook.pub` was not attached as a parked/alias domain in SiteGround for the existing `kidsmybook.com` site.  
After adding `mybook.pub` as parked domain, both domains serve the same WordPress.

## Executed path and outcome

### Path B executed: dual-domain same site (no forced cross-domain redirect)

1. SiteGround `Parked Domains` opened.
2. Added parked domain: `mybook.pub`.
3. Re-verified externally:
   - `https://mybook.pub` returns WordPress content.
   - `https://mybook.pub/wp-admin` returns WordPress login.
   - `https://www.mybook.pub` returns WordPress content.

## Remaining tasks (for traffic comparison by domain)

1. In GA4, keep both hostnames active (do NOT 301 one to the other yet).
2. Add `hostname` as a comparison in standard reports.
3. Create an Exploration report with:
   - Dimension: `Host name`
   - Metrics: `Users`, `Sessions`, `Engagement rate`, `Conversions`
4. In Search Console, keep both properties:
   - Domain property for `kidsmybook.com`
   - Domain property for `mybook.pub`
5. Weekly review rule:
   - Compare `Host name` split.
   - Compare branded search and conversion quality.

## Practical recommendation

For your goal ("see which name parents prefer"), keep both domains live on the same site for now, and do not force canonical redirect yet.  
Once you have enough data (for example 2-4 weeks), choose winner domain and then decide whether to merge via 301.
