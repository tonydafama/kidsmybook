// Supabase Edge Function (optional): Monica proxy when not on Cloudflare Workers.

const MONICA_FLUX_URL = "https://openapi.monica.im/v1/image/gen/flux";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = { frontPrompt?: string; backPrompt?: string };

async function flux(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(MONICA_FLUX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt, model: "flux_dev", num_outputs: 1, size: "768x1344" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Monica HTTP ${res.status}`);
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image URL");
  return url;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const apiKey = Deno.env.get("MONICA_API_KEY")?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "MONICA_API_KEY not set" }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;
    const frontPrompt = body.frontPrompt?.trim();
    const backPrompt = body.backPrompt?.trim();
    if (!frontPrompt || !backPrompt) {
      return new Response(JSON.stringify({ error: "frontPrompt and backPrompt required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const [frontUrl, backUrl] = await Promise.all([flux(frontPrompt, apiKey), flux(backPrompt, apiKey)]);
    return new Response(JSON.stringify({ frontUrl, backUrl }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cover generation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
