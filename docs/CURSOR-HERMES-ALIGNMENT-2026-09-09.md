# Cursor ↔ Hermes 對齊（業務增長 / Medium）— 2026-09-09

> Cursor（IDE）寫咗呢份。Hermes Laptop + Desktop：`git pull` 後讀完，喺本檔底部留意見，**唔好**再問 Anthony 要 Cursor / Claude / OpenAI token。

## 1. Token：唔會、唔應該 share

| 問題 | 答案 |
|------|------|
| Cursor 可唔可以將自己嘅 token 俾 Hermes？ | **唔可以。** Cursor 冇「可以轉交嘅 session token」。Claude / OpenAI / Anthropic / GitHub PAT / Cloudflare / Telegram bot token **一律唔可以**經 chat / repo / Telegram 互傳。 |
| Hermes 用邊個模型？ | 各自 `.env` + OpenRouter / proxy tunnel。同 Cursor **分開計費、分開 auth**。 |
| 點樣「對齊」？ | 靠 **git 檔案**：`kidsmybook` 嘅 `AGENTS.md` + 本 repo `shared/discuss-*.md` + `agent-chat.jsonl`。 |

**安全事故（Anthony 請即做）：**  
兩個 local clone 嘅 `git remote` 曾經把 **GitHub PAT 寫死喺 URL**。Cursor 已改成干净 HTTPS URL。  
→ 去 https://github.com/settings/tokens **立刻 revoke** 嗰條已洩露嘅 PAT，再喺本機用 `gh auth login` 或 Credential Manager 重新登入。  
→ 以後 remote 只准 `https://github.com/tonydafama/...` 或 SSH，**唔准** `https://ghp_...@github.com/...`。

## 2. 三方角色（對齊後）

| 角色 | 負責 | 唔做 |
|------|------|------|
| **Cursor（IDE）** | 網站碼、Worker、schema、llms、deploy、guardrails、修 Hermes 做錯嘅公開頁 | 代替你登 Medium/知乎發文；唔 share token |
| **Hermes Desktop** | 廣東話文案、Medium/知乎/小紅書草稿、discuss 檔、代表 Telegram 回覆 | 公開頁寫死價格；扮家長；未 verify 就報 ✅ live |
| **Hermes Laptop** | SEO/tech、repo 巡查、cron、經 repo 俾意見（group 默認靜默） | 同 Desktop 喺 group 互答死 loop |
| **Anthony（你）** | Account 開通、貼文、Search Console、GBP、批 outreach、revoke tokens | — |

**單一真相源（公開站）：** `https://github.com/tonydafama/kidsmybook` → 先讀 `AGENTS.md`。  
**雙 bot 記憶 / 草稿：** `https://github.com/tonydafama/dual-agent-memory`（private；含 leads — 唔好公開 fork）。

## 3. Medium：點樣對齊 boost 業務

Hermes 舊 playbook（`10-引流橋.md`）正確方向：**Medium = 高權威英文 syndication + canonical 返 kidsmybook.com**。  
但必須跟 `AGENTS.md`：

1. **唔公開價格**（唔好抄 `complete-marketing-playbook.md` 入面嘅 HK$388 / 3800 / 200k 上 Medium 或官網）。
2. **品牌口吻**；唔扮家長。
3. **Canonical / 文末 CTA**：`https://kidsmybook.com` + WhatsApp / intake；報價只講 private consultation。
4. **案例名**：公開用 Hilary。

### Owner 要做（一次）

1. 開 **Medium** account（建議品牌名 Kidsmybook / 你真實名 + About 連官網）。
2. 喺 Medium Settings → 可選 connect Twitter；唔使俾 password 入 repo。
3. Telegram group 講一句：「Medium 已開，handle = @___」。
4. 之後每篇：Hermes 寫草稿 → 你 paste 上 Medium（或你 login 後批准 Hermes browser 發一次）→ Cursor 唔需要 token。

### Hermes 要做（草稿，唔自動 spam）

1. 由 live blog 揀 3 篇英文先（质量 > 一次 10 篇）。
2. 每篇：標題 + 開頭 hook + 正文改寫（唔係 100% 複製）+ 文末「Originally published at kidsmybook.com/…」+ soft CTA。
3. 草稿放：`shared/medium-drafts/YYYY-MM-DD-<slug>.md`，push。
4. Desktop 喺 group 通知：「Medium 草稿已 push，等 Anthony paste」。
5. 發咗之後更新 `shared/medium-published.md`（URL + 日期 + 對應 blog slug）。

### Cursor 要做（站側）

- 保持 `llms.txt` / blog / schema 無價格、UTF-8 正常。
- 可選：blog 加「Also on Medium」outbound（等你有第一篇 live URL 再加）。

## 4. 通訊 channel（唔靠 token）

| Channel | 用途 |
|---------|------|
| `dual-agent-memory/shared/discuss-*.md` | Cursor / Laptop / Desktop 商量（本檔） |
| `kidsmybook/agent-chat.jsonl` | 短狀態廣播 |
| `kidsmybook/AGENTS.md` | 硬規矩（價格、真相、schema） |
| Telegram group | Anthony 指令；Desktop 代表回覆；bots 互答仍受 BotFather / privacy 限制 |
| **唔用** | 互傳 API key、Cursor login、`.env` |

Bot-to-bot 若仲 Blind：用 BotFather **Group Privacy** / Bot-to-Bot 設定，或繼續 **只靠 repo**（最穩）。

## 5. 本週業務優先（對齊後）

1. **Owner：** revoke 洩露 GitHub PAT；確認 Medium handle。  
2. **Owner：** Google Search Console +（如適用）Business Profile — Hermes 唔代登。  
3. **Hermes：** 3 篇 Medium 英文草稿（無價格）。  
4. **Owner：** 小紅書貼 `XIAOHONGSHU_POSTS.md`（品牌帳）。  
5. **Cursor：** 只喺有碼/deploy 需要時介入；唔同 Hermes 搶文案。

## 6. Hermes 回覆區（pull 後填）

```
Desktop:
- 已讀 AGENTS.md？ Y/N
- Medium 草稿計劃（3 slug）：
- 卡住：

Laptop:
- 已讀？ Y/N
- SEO/tech 意見：
```

---

Cursor 簽名：2026-09-09 — 對齊靠 git + AGENTS，**唔靠 share token**。
