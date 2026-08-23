# Published Seed Runs

Viewer 不自行模擬對局，只讀取已由 private `ataxx-varbench` 的 C++ `ataxx_seed_runner` 產生並驗證的 JSON。

正式資料放在：

```text
data/runs/<master_seed>.json
```

本機兩個 repository 若放在同一層，可直接由 core repo 執行：

```powershell
.\build\ataxx_seed_runner.exe generate-run 10 20 ab2 ab4 37 ..\ataxx-varbench-viewer\data\runs
```

流程：

```text
條件 + case_id
→ Seed Spec v2 公式產生 Master Seed
→ C++ Ataxx engine 正式模擬
→ JSON 寫入 viewer/data/runs/
→ git add / commit / push viewer
→ GitHub Pages 只讀並回放
```

Viewer 不接受尚未發布的 seed 作為正式結果，也不在瀏覽器重新計算，以避免研究結果來自兩套不同 engine。
