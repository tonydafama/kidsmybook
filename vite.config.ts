import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { prerenderAssetPath } from "./src/seo/meta";
import { englishSlugRedirect } from "./src/seo/slug-redirects";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

/** Same 301 map the Worker uses, so preview and dev do not serve retired pinyin URLs. */
function pinyinSlugRedirectPlugin(): Plugin {
  return {
    name: "pinyin-slug-redirect",
    configureServer(server) {
      server.middlewares.use(redirectRetiredSlug);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectRetiredSlug);
    },
  };
}

function redirectRetiredSlug(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (!req.url) return next();
  const q = req.url.indexOf("?");
  const pathname = q === -1 ? req.url : req.url.slice(0, q);
  const target = englishSlugRedirect(pathname);
  if (!target) return next();
  const search = q === -1 ? "" : req.url.slice(q);
  res.statusCode = 301;
  res.setHeader("Location", `${target}${search}`);
  res.setHeader("Cache-Control", "public, max-age=300");
  res.end();
}

/** Serve build-time route HTML from dist/ during `vite preview` (before the SPA fallback). */
function prerenderPreviewPlugin(): Plugin {
  return {
    name: "prerender-preview",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || (req.method !== "GET" && req.method !== "HEAD")) return next();
        const pathname = req.url.split("?")[0] || "/";
        const assetPath = prerenderAssetPath(pathname);
        if (!assetPath) return next();
        const file = path.join(process.cwd(), "dist", assetPath);
        if (!fs.existsSync(file)) return next();
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

function coverApiDevPlugin(): Plugin {
  return {
    name: "cover-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/cover-generate", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") return next();
        await readJsonBody(req).catch(() => undefined);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 503;
        res.end(
          JSON.stringify({
            error: "Cover generation runs on the Cloudflare Worker with Workers AI. Use wrangler dev for a local AI binding.",
            code: "not_configured",
          }),
        );
      });

      server.middlewares.use("/api/preview-lead", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") return next();
        res.setHeader("Content-Type", "application/json");
        try {
          const body = (await readJsonBody(req)) as {
            name?: string;
            previewUrl?: string;
            whatsapp?: string;
            wechat?: string;
          };
          if (!body.name?.trim() || !body.previewUrl?.trim() || (!body.whatsapp?.trim() && !body.wechat?.trim())) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "name, previewUrl, and a contact method are required." }));
            return;
          }
          console.log("preview-lead", body);
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, delivery: "studio" }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Invalid lead" }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), coverApiDevPlugin(), pinyinSlugRedirectPlugin(), prerenderPreviewPlugin()],
    base: "/",
  };
});
