"""M14 离线：多品种动量因子 IC 摘要。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np
import pandas as pd
from scipy import stats

from _common import load_ohlcv  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dir", required=True, help="目录内多个 *.csv，文件名作品种代码")
    p.add_argument("--lookback", type=int, default=20)
    p.add_argument("--horizon", type=int, default=5)
    args = p.parse_args()

    root = Path(args.dir)
    closes = {}
    for path in sorted(root.glob("*.csv")):
        closes[path.stem] = load_ohlcv(path)["close"]
    if len(closes) < 5:
        raise SystemExit("need >=5 csv files for cross-section IC")

    px = pd.DataFrame(closes).dropna(how="all")
    factor = px.pct_change(args.lookback)
    fwd = px.pct_change(args.horizon).shift(-args.horizon)

    ics = []
    for dt in factor.index:
        f = factor.loc[dt].dropna()
        r = fwd.loc[dt].reindex(f.index).dropna()
        common = f.index.intersection(r.index)
        if len(common) < 5:
            continue
        ic, _ = stats.spearmanr(f[common], r[common])
        if np.isfinite(ic):
            ics.append(ic)

    ics = np.array(ics)
    mean = float(ics.mean()) if len(ics) else 0.0
    tstat = (
        mean / (ics.std(ddof=1) / np.sqrt(len(ics))) if len(ics) > 2 else 0.0
    )
    win = float((ics > 0).mean()) if len(ics) else 0.0
    print(f"symbols={len(closes)} ic_n={len(ics)}")
    print(f"ic_mean={mean:.4f} ic_tstat={tstat:.2f} win_rate={win:.1%}")
    print("门槛提示: |t-stat| > 2 视为 95% 显著（与课内一致）")
    print("OK — 将 IC 表写入 P14 因子库验收（离线路径）。")


if __name__ == "__main__":
    main()
