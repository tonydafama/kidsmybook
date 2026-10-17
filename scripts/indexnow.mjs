/**
 * Submit public sitemap URLs to IndexNow (Bing, Yandex, and other participants).
 *
 * The key is public: it is hosted at https://kidsmybook.com/{key}.txt
 * Run this only after that file is live as text/plain (deploy first).
 *
 *   npm run indexnow           # POST https://api.indexnow.org/indexnow
 *   npm run indexnow -- --dry-run
 *
 * urlList is every https://kidsmybook.com URL in public/sitemap.xml,
 * except /admin, /intake, /intake-form, and /api.
 */
import fs from "node:fs";
import path from "node:path";

const HOST = "kidsmybook.com";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const KEY = "1e01eada3661348254717ba011ce21d3";
const ROOT = path.resolve(import.meta.dirname, "..");
const KEY_FILE = path.join(ROOT, "public", `${KEY}.txt`);

function readKey() {
  const raw = fs.readFileSync(KEY_FILE, "utf8").replace(/^\uFEFF/, "").trim();
  if (raw !== KEY) {
    throw new Error(`public/${KEY}.txt must contain only the IndexNow key`);
  }
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(raw)) {
    throw new Error("IndexNow key must be 8–128 letters, digits, or dashes");
  }
  return raw;
}

function isExcluded(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return true;
  }
  if (url.protocol !== "https:" || url.hostname !== HOST) return true;
  const pathname = url.pathname.toLowerCase();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/intake" || pathname.startsWith("/intake/") || pathname.startsWith("/intake-form")) return true;
  if (pathname === "/api" || pathname.startsWith("/api/")) return true;
  return false;
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, "public/sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
  const urls = [];
  const seen = new Set();
  for (const loc of locs) {
    if (isExcluded(loc) || seen.has(loc)) continue;
    seen.add(loc);
    urls.push(loc);
  }
  return urls;
}

const dryRun = process.argv.includes("--dry-run");
const key = readKey();
const urlList = sitemapUrls();
if (!urlList.length) {
  console.error("sitemap has no public URLs to submit");
  process.exit(1);
}
if (!urlList.includes(`${ORIGIN}/sheng-xue-zuo-pin-ji-qing-dan`)) {
  console.error("sitemap is missing the checklist page");
  process.exit(1);
}
for (const blocked of ["/admin", "/intake", "/api"]) {
  if (urlList.some((url) => new URL(url).pathname.toLowerCase().startsWith(blocked))) {
    console.error(`urlList still contains ${blocked}`);
    process.exit(1);
  }
}

const payload = {
  host: HOST,
  key,
  keyLocation: `${ORIGIN}/${key}.txt`,
  urlList,
};

if (dryRun) {
  console.log(`dry-run: ${urlList.length} URLs, keyLocation ${payload.keyLocation}`);
  for (const url of urlList) console.log(url);
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
const body = await response.text();
console.log(`IndexNow HTTP ${response.status}`);
if (body) console.log(body.slice(0, 500));
if (response.status !== 200 && response.status !== 202) {
  process.exit(1);
}
console.log(`submitted ${urlList.length} URLs for ${HOST}`);
