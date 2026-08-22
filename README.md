# ATAXX-VarBench Viewer

公開的 Ataxx Master Seed 對局查詢與回放介面。

## 直接使用

👉 **https://jjeremytang.github.io/ataxx-varbench-viewer/**

Viewer 採用類似 Minecraft world seed 的概念：

> 一個 Master Seed 直接決定完整實驗設定與對局。

目前 Seed Spec v1 會由 Master Seed 固定決定：

- 棋盤大小：10×10、12×12、15×15
- 障礙比例：10%、15%、20%、25%、30%
- 障礙布局
- 紅方 Agent
- 藍方 Agent
- Alpha-Beta depth
- Random Agent 的 RNG seed

### Seed Spec v1 Agent profiles

- Random
- Greedy
- Alpha-Beta d=2
- Alpha-Beta d=3
- Alpha-Beta d=4

因此同一個 Master Seed 在 Seed Spec v1 下會得到同一組設定與同一場可重現對局。

## Seed 產生器

除了直接輸入 Master Seed，也可以先指定條件，再要求 Viewer 找出符合條件的 seed。目前可以篩選：

- 棋盤大小
- 障礙比例
- 紅方方法
- 藍方方法
- 要產生的 seed 數量

找到 seed 後，直接點 seed 即可載入該場對局。

## 未來擴充

Seed Spec v1 規格固定，不會因為日後加入新模型而改寫舊 seed 的意義。

目前已預留未來方法名稱，例如：

- CNN
- GNN
- Self-play
- PLR
- topology-aware PLR

未來若加入新的 Agent 組合，應建立新版 Seed Spec，而不是修改 v1 的映射。

## Viewer

完整對局計算由 Web Worker 執行，避免 Alpha-Beta 搜尋阻塞頁面。Viewer 支援：

- 播放／暫停
- 上一手／下一手
- 時間軸
- 播放速度
- Seed - 1 / Seed + 1
- URL 保存 Master Seed

## 說明

此 repository 只放公開 Viewer，不包含 private `ataxx-varbench` 的研究程式碼。
