import assert from "node:assert/strict";
import fs from "node:fs";
import {
  FLUX_ATTEMPT_TIMEOUT_MS,
  FLUX_MAX_ATTEMPTS,
  FLUX_MIN_ATTEMPT_MS,
  FLUX_OVERALL_BUDGET_MS,
  FLUX_RETRY_BACKOFF_MS,
  generateFluxImage,
} from "../worker/fluxImage.ts";

const MONICA_URL = "https://openapi.monica.im/v1/image/gen/flux";
const IMAGE = "https://cdn.example/rabbit-cover.png";

const originalFetch = globalThis.fetch;
globalThis.fetch = () => {
  throw new Error("live Monica fetch blocked");
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function okImage() {
  return jsonResponse(200, { data: [{ url: IMAGE }] });
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
    get t() {
      return t;
    },
  };
}

function withClock(fetchImpl, extra = {}) {
  const time = clock();
  const timeouts = [];
  const calls = [];
  const run = generateFluxImage("Rabbit academic cover", "test-key", {
    now: time.now,
    sleep: time.sleep,
    onAttempt: (info) => timeouts.push(info),
    fetch: async (input, init) => {
      calls.push({ input, init, t: time.t });
      return fetchImpl({ time, calls, input, init });
    },
    ...extra,
  });
  return { time, timeouts, calls, run };
}

async function rejects(run, check) {
  await assert.rejects(run, (err) => {
    check(err);
    return true;
  });
}

async function main() {
  assert.equal(FLUX_ATTEMPT_TIMEOUT_MS, 180_000);
  assert.equal(FLUX_OVERALL_BUDGET_MS, 180_000);
  assert.equal(FLUX_MAX_ATTEMPTS, 3);
  const monicaSource = fs.readFileSync(new URL("../src/lib/monica.ts", import.meta.url), "utf8");
  const clientMatch = monicaSource.match(/COVER_CLIENT_TIMEOUT_MS = ([\d_]+)/);
  assert.ok(clientMatch, "browser cover timeout constant missing");
  const clientTimeoutMs = Number(clientMatch[1].replaceAll("_", ""));
  assert.equal(clientTimeoutMs, 200_000);
  assert.ok(
    clientTimeoutMs >= FLUX_OVERALL_BUDGET_MS + 10_000 && clientTimeoutMs <= FLUX_OVERALL_BUDGET_MS + 20_000,
    "browser wait must stay 10–20s above the 180s worker budget",
  );
  assert.match(monicaSource, /The cover request timed out after 180 seconds\./);
  const translations = fs.readFileSync(new URL("../src/i18n/translations.ts", import.meta.url), "utf8");
  assert.match(translations, /timeoutNotice: "AI 繪圖逾時，插圖沒有在 180 秒內生成。"/);
  assert.match(translations, /timeoutNotice: "AI 绘图超时，插图没有在 180 秒内生成。"/);
  assert.match(translations, /timeoutNotice: "AI illustration timed out after 180 seconds\."/);
  const workerSource = fs.readFileSync(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(workerSource, /AI illustration timed out after \$\{FLUX_ATTEMPT_TIMEOUT_MS \/ 1000\} seconds\./);

  {
    const seen = withClock(({ time, calls }) => {
      if (calls.length === 1) {
        time.advance(1_000);
        return new Response("error code: 504", { status: 504 });
      }
      time.advance(2_000);
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
    assert.equal(seen.calls[0].input, MONICA_URL);
    assert.equal(seen.calls[1].input, MONICA_URL);
    const body = JSON.parse(seen.calls[0].init.body);
    assert.equal(body.prompt, "Rabbit academic cover");
    assert.equal(body.model, "flux_dev");
    assert.equal(body.num_outputs, 1);
    assert.equal(body.size, "768x1344");
    assert.equal(seen.calls[0].init.method, "POST");
    assert.equal(seen.calls[0].init.headers.Authorization, "Bearer test-key");
    assert.equal(seen.calls[0].init.headers["Content-Type"], "application/json");
    assert.ok(seen.calls[0].init.signal);
    assert.equal(seen.time.t, 1_000 + FLUX_RETRY_BACKOFF_MS + 2_000);
    assert.equal(seen.timeouts[0].timeoutMs, FLUX_ATTEMPT_TIMEOUT_MS);
    assert.equal(seen.timeouts[1].timeoutMs, FLUX_OVERALL_BUDGET_MS - 1_000 - FLUX_RETRY_BACKOFF_MS);
  }

  {
    let n = 0;
    const seen = withClock(({ time }) => {
      n += 1;
      time.advance(50);
      return new Response("error code: 504", { status: 504 });
    });
    await rejects(seen.run, (err) => {
      assert.equal(err.message, "Monica API returned unexpected response (504): error code: 504");
    });
    assert.equal(n, FLUX_MAX_ATTEMPTS);
    assert.equal(seen.calls.length, FLUX_MAX_ATTEMPTS);
  }

  {
    const seen = withClock(({ time, calls }) => {
      if (calls.length < 3) {
        time.advance(20);
        return new Response("<html>502</html>", { status: 502 });
      }
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 3);
  }

  {
    const seen = withClock(({ time, calls }) => {
      if (calls.length === 1) {
        time.advance(30);
        return new Response("upstream reset", { status: 503 });
      }
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
  }

  {
    const seen = withClock(({ calls }) => {
      if (calls.length === 1) return new Response("plain 500", { status: 500 });
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
  }

  {
    const seen = withClock(() => jsonResponse(504, { error: { message: "gateway timeout" } }));
    const second = withClock(({ calls }) => {
      if (calls.length === 1) return jsonResponse(504, { error: { message: "gateway timeout" } });
      return okImage();
    });
    assert.equal(await second.run, IMAGE);
    assert.equal(second.calls.length, 2);
    await rejects(seen.run, (err) => {
      assert.equal(err.message, "gateway timeout");
    });
    assert.equal(seen.calls.length, FLUX_MAX_ATTEMPTS);
  }

  {
    const late = FLUX_OVERALL_BUDGET_MS - FLUX_RETRY_BACKOFF_MS - FLUX_MIN_ATTEMPT_MS + 1;
    const seen = withClock(({ time }) => {
      time.advance(late);
      return new Response("error code: 504", { status: 504 });
    });
    await rejects(seen.run, (err) => {
      assert.match(err.message, /unexpected response \(504\): error code: 504/);
    });
    assert.equal(seen.calls.length, 1);
  }

  {
    const edge = FLUX_OVERALL_BUDGET_MS - FLUX_RETRY_BACKOFF_MS - FLUX_MIN_ATTEMPT_MS;
    const seen = withClock(({ time, calls }) => {
      if (calls.length === 1) {
        time.advance(edge);
        return new Response("error code: 504", { status: 504 });
      }
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
    assert.equal(seen.timeouts[1].timeoutMs, FLUX_MIN_ATTEMPT_MS);
  }

  {
    const seen = withClock(({ time }) => {
      time.advance(FLUX_ATTEMPT_TIMEOUT_MS);
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      throw err;
    });
    await rejects(seen.run, (err) => {
      assert.equal(err.name, "AbortError");
    });
    assert.equal(seen.calls.length, 1);
  }

  {
    const seen = withClock(({ time, calls }) => {
      if (calls.length === 1) {
        time.advance(30_000);
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        throw err;
      }
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
    assert.ok(seen.timeouts[1].timeoutMs >= FLUX_MIN_ATTEMPT_MS);
    assert.ok(seen.timeouts[1].timeoutMs < FLUX_ATTEMPT_TIMEOUT_MS);
  }

  const permanent = [
    [401, { error: { code: "invalid_api_key", message: "Invalid API key" } }, "Invalid API key"],
    [403, { error: { message: "Forbidden" } }, "Forbidden"],
    [402, { error: { message: "nope" } }, "nope"],
    [429, { error: { message: "slow down" } }, "slow down"],
    [503, { error: { code: "insufficient_quota", message: "Insufficient quota" } }, "Insufficient quota"],
    [500, { error: { message: "internal explosion" } }, "internal explosion"],
    [200, { data: [{}] }, "Monica API returned no image URL"],
  ];

  for (const [status, body, message] of permanent) {
    const seen = withClock(() => jsonResponse(status, body));
    await rejects(seen.run, (err) => {
      assert.equal(err.message, message);
    });
    assert.equal(seen.calls.length, 1, `status ${status} must not retry`);
  }

  {
    const seen = withClock(({ calls }) => {
      if (calls.length === 1) return new Response("error code: 504", { status: 504 });
      return jsonResponse(401, { error: { message: "Invalid API key" } });
    });
    await rejects(seen.run, (err) => {
      assert.equal(err.message, "Invalid API key");
    });
    assert.equal(seen.calls.length, 2);
  }

  {
    const seen = withClock(({ calls }) => {
      if (calls.length === 1) throw new TypeError("fetch failed");
      return okImage();
    });
    assert.equal(await seen.run, IMAGE);
    assert.equal(seen.calls.length, 2);
  }

  {
    const huge = "e".repeat(180);
    const seen = withClock(() => new Response(huge, { status: 504 }));
    await rejects(seen.run, (err) => {
      assert.equal(err.message, `Monica API returned unexpected response (504): ${"e".repeat(100)}`);
    });
  }

  {
    let calls = 0;
    const url = await Promise.race([
      generateFluxImage("p", "k", {
        config: {
          attemptTimeoutMs: 80,
          overallBudgetMs: 1_000,
          backoffMs: 15,
          minAttemptMs: 40,
          maxAttempts: 2,
        },
        fetch: (_input, init) => {
          calls += 1;
          if (calls === 1) {
            return new Promise((_resolve, reject) => {
              init.signal.addEventListener("abort", () => {
                const err = new Error("aborted");
                err.name = "AbortError";
                reject(err);
              });
            });
          }
          return Promise.resolve(okImage());
        },
      }),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error("abort-path test hung")), 2_000)),
    ]);
    assert.equal(url, IMAGE);
    assert.equal(calls, 2);
  }

  console.log("flux retry tests passed");
}

const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.join(" "));
};

try {
  await main();
  assert.ok(warnings.length > 0, "retries should be logged");
  assert.ok(warnings.every((line) => !line.includes("test-key")));
  assert.ok(warnings.every((line) => !line.includes("Rabbit academic cover")));
} finally {
  console.warn = originalWarn;
  globalThis.fetch = originalFetch;
}
