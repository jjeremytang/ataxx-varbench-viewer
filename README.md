# ATAXX-VarBench Viewer

公開的 Ataxx Master Seed 對局查詢與回放介面。

## 直接使用

https://jjeremytang.github.io/ataxx-varbench-viewer/

## 現在的正式架構

Viewer 已改成 **read-only**：它不再自己執行 Alpha-Beta 或模擬完整對局。

正式流程是：

```text
條件 + case_id
→ Seed Spec v2 公式產生 Master Seed
→ private ataxx-varbench 的 C++ ataxx_seed_runner
→ 正式模擬完整對局
→ 儲存 JSON
→ 上傳 viewer/data/runs/
→ Viewer 讀取與回放
```

這樣研究結果只有一個權威來源：private repo 的 C++ `Game / LevelGenerator / SearchEngine`。

## Seed Spec v2

v2 不再「隨機找一個符合條件的 seed」。

Master Seed 直接編碼：

- 棋盤大小
- 障礙比例
- 紅方 Agent
- 藍方 Agent
- case_id

因此：

> 相同條件 + 相同 case_id 永遠產生相同 Master Seed。

目前 profiles：

- Random
- Greedy
- Alpha-Beta d=2
- Alpha-Beta d=3
- Alpha-Beta d=4

## Viewer 的 Seed 產生器

網頁上的 Seed 產生器只做數學公式編碼，不掃描 candidate、不用亂數碰運氣。

若產生的 seed 尚未存在於：

```text
data/runs/<seed>.json
```

Viewer 會顯示「尚未發布正式模擬資料」，而不在瀏覽器自行重算。

## 正式產生一筆資料

在 private `ataxx-varbench` build 完成後，例如：

```powershell
.\build\ataxx_seed_runner.exe generate-run 10 20 ab2 ab4 37 ..\ataxx-varbench-viewer\data\runs
```

這個指令會：

1. 由條件與 case_id 公式算出 Master Seed
2. 解碼該 seed
3. 建立固定棋盤
4. 使用正式 C++ Agent 跑完整對局
5. 儲存 `data/runs/<seed>.json`

之後把新增 JSON commit / push 到本 repo，GitHub Pages 就能查詢。

## 設計原則

`SeedSpec ≠ Simulation ≠ Viewer`

- SeedSpec：定義實驗 ID / 條件
- Simulation：正式計算結果
- SeedStore：保存 JSON
- Viewer：只負責查詢與回放

這樣避免 browser JavaScript engine 與研究 C++ engine 逐漸產生差異。
