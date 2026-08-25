# Ataxx-VarBench Public Research Portal

Public Pages：<https://jjeremytang.github.io/ataxx-varbench-viewer/>

本 repository 是 **read-only presentation layer**，不是正式研究引擎。正式 C++ simulation、frozen protocol、model/artifact SHA 與 raw formal results 保存在 private `ataxx-varbench` repository。

## Pages structure

- `index.html` — 研究入口／正式結果摘要／文件與核心程式導覽。
- `reader.html` — 將 private repo 的指定 Markdown snapshot 轉成友善 HTML article。
- `code.html` — 核心 C++ source snapshot 靜態閱讀器，含行號與來源 commit。
- `viewer.html` — 已發布 Seed / game replay viewer。
- `content/catalog.json` — public snapshot 目錄、private source path 與 source commit。
- `content/docs/` — 唯讀研究文件 snapshots。
- `content/code/` — 唯讀核心程式 snapshots。
- `data/runs/` — 已由 private authoritative C++ engine 產生並發布的 persisted game JSON。

## Seed Spec

### Current: Seed Spec v3

新 Master Seed 使用 **Seed Spec v3**。最高 bit 為 v3 version marker；其餘 payload 編碼 board / density / agents / case id。

v3 的重要性是：

> 同一 `(board, density, case_id)` 使用相同 `world_key`，所以更換 agent 組合不會改變 world layout。

因此方法比較可以共享同一 world，而不會因為 agent identity 意外換到不同障礙棋盤。

Supported values：

- board：`10, 12, 15`
- density：`10, 15, 20, 25, 30`%
- agents：`random, greedy, ab2, ab3, ab4`

### Legacy compatibility: Seed Spec v2

v2 只保留給既有 published pilot runs 解碼／回放。新的 seed generation 以 v3 為準。

## Cross-language regression vectors

Viewer JavaScript 與 private C++ 必須共同通過以下 v3 vectors：

| board | density | Red | Blue | case | seed |
|---:|---:|---|---|---:|---:|
| 10 | 10 | random | random | 0 | `9223372036854775808` |
| 10 | 20 | ab2 | ab4 | 37 | `9223372036854852680` |
| 15 | 30 | ab4 | greedy | 123456 | `9223372037107614098` |
| 12 | 25 | greedy | ab3 | 999 | `9223372036856822573` |

`tests/seed-spec.test.js` 在 Pages deploy 前驗證這些 vectors。

## Static snapshot rule

`content/catalog.json` 的 `private_source_commit` 指出目前公開文件／程式 snapshot 對應的 private commit。

- public snapshot 適合閱讀、展示、分享；
- snapshot 不會在瀏覽器重新跑 Alpha-Beta 或 volatility detector；
- 若 public snapshot 與 private repo 後續狀態不同，以 private `SPEC.md`、task-specific frozen protocol 與 formal artifacts 為準。

## Deploy validation

GitHub Pages workflow 在 deploy 前執行：

```bash
node tests/seed-spec.test.js
node tests/site.test.js
```

只有 Seed Spec regression 與所有 catalog/local navigation 檔案都存在時才部署。
