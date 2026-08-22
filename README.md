# ATAXX-VarBench Viewer

公開的 Ataxx 對局查詢與回放介面。

## 直接使用

👉 **https://jjeremytang.github.io/ataxx-varbench-viewer/**

可直接設定：

- 任意 seed
- 棋盤大小
- 障礙比例
- 紅方 AI
- 藍方 AI
- Alpha-Beta 搜尋深度

雙方都可獨立選擇：

- Random
- Greedy
- Alpha-Beta

因此可以直接觀看 Random vs Greedy、Greedy vs Alpha-Beta、Alpha-Beta vs Alpha-Beta 等組合。

按下「開始／調閱對局」後，Viewer 會在瀏覽器中重建整場對局，支援播放、暫停、上一手、下一手、時間軸、播放速度，以及上一個／下一個 seed。

Alpha-Beta 深度目前支援 1–4；10×10 建議先使用深度 2–3，避免瀏覽器計算時間過長。

## 說明

此 repository 只放公開 Viewer，不包含 private `ataxx-varbench` 的研究程式碼。
