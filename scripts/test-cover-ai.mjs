import assert from "node:assert/strict";
import fs from "node:fs";
import {
  COVER_ATTEMPT_TIMEOUT_MS,
  COVER_HEIGHT,
  COVER_IMAGE_TTL_SECONDS,
  COVER_MODEL,
  COVER_OVERALL_BUDGET_MS,
  COVER_WIDTH,
  coverImageHttpResponse,
  coverImageIdFromPath,
  generateStoredCover,
  kvCoverStore,
  loadCoverImage,
} from "../worker/coverImage.ts";

const TINY_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function memoryStore() {
  const saved = new Map();
  return {
    saved,
    async put(id, image, ttlSeconds) {
      saved.set(id, { image, ttlSeconds });
    },
    async get(id) {
      return saved.get(id)?.image ?? null;
    },
  };
}

function clock() {
  let t = 0;
  return {
    now: () => t,
    sleep: async (ms) => {
      t += ms;
    },
    advance(ms) {
      t += ms;
    },
  };
}

async function readForm(inputs) {
  const multipart = inputs.multipart;
  const response = new Response(multipart.body, { headers: { "content-type": multipart.contentType } });
  return response.formData();
}

async function main() {
  assert.equal(COVER_MODEL, "@cf/black-forest-labs/flux-2-klein-4b");
  assert.equal(COVER_WIDTH, 768);
  assert.equal(COVER_HEIGHT, 1344);
  assert.ok(COVER_WIDTH % 16 === 0 && COVER_HEIGHT % 16 === 0);
  assert.ok(COVER_WIDTH >= 256 && COVER_WIDTH <= 1920);
  assert.ok(COVER_HEIGHT >= 256 && COVER_HEIGHT <= 1920);
  assert.equal(COVER_ATTEMPT_TIMEOUT_MS, 45_000);
  assert.equal(COVER_OVERALL_BUDGET_MS, 45_000);
  assert.equal(COVER_IMAGE_TTL_SECONDS, 30 * 24 * 60 * 60);

  const monica = fs.readFileSync(new URL("../src/lib/monica.ts", import.meta.url), "utf8");
  const clientMatch = monica.match(/COVER_CLIENT_TIMEOUT_MS = ([\d_]+)/);
  assert.ok(clientMatch);
  const clientTimeoutMs = Number(clientMatch[1].replaceAll("_", ""));
  assert.equal(clientTimeoutMs, 55_000);
  assert.ok(clientTimeoutMs >= COVER_OVERALL_BUDGET_MS + 5_000);
  assert.match(monica, /The cover request timed out after 45 seconds\./);

  const translations = fs.readFileSync(new URL("../src/i18n/translations.ts", import.meta.url), "utf8");
  assert.match(translations, /timeoutNotice: "AI 繪圖逾時，插圖沒有在 45 秒內生成。"/);
  assert.match(translations, /timeoutNotice: "AI 绘图超时，插图没有在 45 秒内生成。"/);
  assert.match(translations, /timeoutNotice: "AI illustration timed out after 45 seconds\."/);

  const worker = fs.readFileSync(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.equal(worker.includes("openapi.monica.im"), false);
  assert.equal(worker.includes("MONICA_API_KEY"), false);
  assert.match(worker, /AI illustration timed out after \$\{COVER_ATTEMPT_TIMEOUT_MS \/ 1000\} seconds\./);

  {
    const store = memoryStore();
    const time = clock();
    const calls = [];
    const pair = await generateStoredCover({
      prompt: "Rabbit academic cover",
      origin: "https://kidsmybook.com/",
      now: time.now,
      sleep: time.sleep,
      newId: () => "cover-id-rabbit-01",
      ai: {
        async run(model, inputs) {
          calls.push({ model, form: await readForm(inputs) });
          if (calls.length === 1) throw new Error("Workers AI HTTP 503");
          return { image: TINY_PNG };
        },
      },
      store,
    });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].model, COVER_MODEL);
    assert.equal(calls[1].model, COVER_MODEL);
    assert.equal(calls[0].form.get("prompt"), "Rabbit academic cover");
    assert.equal(calls[0].form.get("width"), "768");
    assert.equal(calls[0].form.get("height"), "1344");
    assert.equal(pair.frontUrl, "https://kidsmybook.com/api/cover-image/cover-id-rabbit-01");
    assert.equal(pair.backUrl, pair.frontUrl);
    assert.ok(pair.frontUrl.length < 120);
    assert.equal(pair.frontUrl.includes(TINY_PNG), false);
    assert.equal(store.saved.size, 1);
    assert.equal(store.saved.get(pair.id).ttlSeconds, COVER_IMAGE_TTL_SECONDS);
    const loaded = await loadCoverImage(store, pair.id);
    assert.equal(loaded.contentType, "image/png");
    assert.ok(loaded.bytes.byteLength > 8);
    const response = coverImageHttpResponse(loaded, "GET");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.equal(coverImageIdFromPath(new URL(pair.frontUrl).pathname), pair.id);
    assert.equal(coverImageIdFromPath("/api/cover-image/../secret"), null);
  }

  {
    const store = memoryStore();
    let calls = 0;
    await assert.rejects(
      () =>
        generateStoredCover({
          prompt: "quota",
          origin: "https://kidsmybook.com",
          newId: () => "should-not-store",
          ai: {
            async run() {
              calls += 1;
              throw new Error("insufficient quota");
            },
          },
          store,
        }),
      (err) => {
        assert.match(err.message, /quota/);
        return true;
      },
    );
    assert.equal(calls, 1);
    assert.equal(store.saved.size, 0);
  }

  {
    let calls = 0;
    await assert.rejects(
      () =>
        Promise.race([
          generateStoredCover({
            prompt: "slow",
            origin: "https://kidsmybook.com",
            config: { attemptTimeoutMs: 30, overallBudgetMs: 30, maxAttempts: 1, backoffMs: 1, minAttemptMs: 10 },
            ai: {
              run() {
                calls += 1;
                return new Promise(() => {});
              },
            },
            store: memoryStore(),
          }),
          new Promise((_resolve, reject) => setTimeout(() => reject(new Error("timeout test hung")), 2_000)),
        ]),
      (err) => {
        assert.equal(err.name, "AbortError");
        return true;
      },
    );
    assert.equal(calls, 1);
  }

  assert.equal(coverImageHttpResponse(null, "GET").status, 404);

  {
    const bag = new Map();
    const store = kvCoverStore({
      async put(key, value, options) {
        bag.set(key, { value, metadata: options?.metadata ?? null });
      },
      async getWithMetadata(key) {
        const row = bag.get(key);
        if (!row) return { value: null, metadata: null };
        return row;
      },
    });
    const bytes = Uint8Array.from([0xff, 0xd8, 0xff, 9, 8, 7]);
    await store.put("jpeg-id-12345678", { bytes, contentType: "image/jpeg" }, 60);
    const loaded = await loadCoverImage(store, "jpeg-id-12345678");
    assert.equal(loaded.contentType, "image/jpeg");
    assert.deepEqual([...loaded.bytes], [...bytes]);
    assert.equal(bag.has("cover-img:jpeg-id-12345678"), true);
  }

  console.log("cover ai tests passed");
}

const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args.join(" "));
try {
  await main();
  assert.ok(warnings.some((line) => line.includes("503")));
  assert.ok(warnings.every((line) => !line.includes("Rabbit academic cover")));
} finally {
  console.warn = originalWarn;
}
