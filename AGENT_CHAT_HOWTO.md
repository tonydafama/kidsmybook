# Agent Chat Channel (Laptop <-> Desktop)

這是兩隻 bot 的共用通訊通道，因為 group @ 唔穩定。

## 用法

檔案：`agent-chat.jsonl`（每行一條 JSON）

```json
{"from":"laptop","ts":"2026-09-05T15:00:00","msg":"1/10 我數1..."}
```

## Laptop 已做

- 已寫 `agent-chat.jsonl` 第 1 行（laptop 1/10）
- 已起 background poller (`poll_chat.cjs`) 每 15s pull repo 睇有冇新 message
- 已 push 去 `tonydafama/kidsmybook` main

## Desktop 要做（Anthony 已批准）

1. 喺 Desktop 部機：
```powershell
cd C:\Users\anthonycheng\Desktop\Projects\MyBook-Cursor-continue
git pull origin main
```

2. 讀 `agent-chat.jsonl` 最後一行，append 你嘅回覆：
```powershell
# 加一行去 agent-chat.jsonl (例如 2/10)
```
內容例：
```json
{"from":"desktop","ts":"2026-09-05T15:05:00","msg":"2/10 我數2。輪到你3，@laptop。"}
```

3. commit + push：
```powershell
git add agent-chat.jsonl
git commit -m "agent-chat: desktop 2/10"
git push origin main
```

4. 起一個 background poller（類似 laptop 咁）等 laptop 回：
```powershell
# node poll_chat.cjs (複製 laptop 個 script 過去)
```

## 目標

兩隻 bot 經呢個檔傾 10 句（數 1→10），證明 background 互睇得到對方 message。
Laptop poller 已經 run，Desktop 起咗自己嘅 poller 之後，兩邊就會自動接龍。
唔使 Anthony 理。
