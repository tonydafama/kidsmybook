import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";

const MONICA_FLUX_URL = "https://openapi.monica.im/v1/image/gen/flux";

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

async function fluxImage(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(MONICA_FLUX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt, model: "flux_dev", num_outputs: 1, size: "768x1344" }),
  });
  const data = (await res.json()) as { data?: { url?: string }[]; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? `Monica HTTP ${res.status}`);
  const url = data.data?.[0]?.url;
  if (!url) throw new Error("Monica returned no image URL");
  return url;
}

function coverApiDevPlugin(apiKey: string): Plugin {
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

        res.setHeader("Content-Type", "application/json");
        if (!apiKey) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: "Set MONICA_API_KEY or VITE_MONICA_API_KEY in .env.local" }));
          return;
        }

        try {
          const body = (await readJsonBody(req)) as { frontPrompt?: string; backPrompt?: string };
          const frontPrompt = body.frontPrompt?.trim();
          const backPrompt = body.backPrompt?.trim();
          if (!frontPrompt || !backPrompt) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "frontPrompt and backPrompt are required." }));
            return;
          }
        const [frontUrl, backUrl] = await (async () => {
          const front = await fluxImage(frontPrompt, apiKey);
          return [front, front];
        })();
          res.statusCode = 200;
          res.end(JSON.stringify({ frontUrl, backUrl }));
        } catch (err) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Cover generation failed" }));
        }
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const monicaKey = env.MONICA_API_KEY || env.VITE_MONICA_API_KEY || "";

  return {
    plugins: [react(), coverApiDevPlugin(monicaKey)],
    base: "/",
  };
});
