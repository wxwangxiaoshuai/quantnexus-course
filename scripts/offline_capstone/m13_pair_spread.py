"""M13 离线：rb-hc 价差统计 + 简易 Z-score 回测。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from _common import load_ohlcv, max_drawdown, sharpe  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--rb", required=True)
    p.add_argument("--hc", required=True)
    p.add_argument("--window", type=int, default=60)
    p.add_argument("--entry", type=float, default=2.0)
    p.add_argument("--exit", type=float, default=0.5)
    args = p.parse_args()

    rb = load_ohlcv(args.rb)["close"].rename("rb")
    hc = load_ohlcv(args.hc)["close"].rename("hc")
    df = pd.concat([rb, hc], axis=1).dropna()
    beta = float(LinearRegression().fit(df[["rb"]], df["hc"]).coef_[0])
    spread = df["hc"] - beta * df["rb"]
    mu = spread.rolling(args.window).mean()
    sd = spread.rolling(args.window).std()
    z = (spread - mu) / sd

    pos = pd.Series(0.0, index=df.index)
    state = 0.0
    for i in range(len(z)):
        zi = z.iloc[i]
        if np.isnan(zi):
            pos.iloc[i] = state
            continue
        if state == 0:
            if zi > args.entry:
                state = -1.0
            elif zi < -args.entry:
                state = 1.0
        elif state > 0 and zi >= -args.exit:
            state = 0.0
        elif state < 0 and zi <= args.exit:
            state = 0.0
        pos.iloc[i] = state

    d_spread = spread.diff().fillna(0.0)
    strat = pos.shift(1).fillna(0) * d_spread / df["rb"]
    equity = (1 + strat).cumprod()

    print(f"n={len(df)} beta={beta:.4f}")
    print(f"spread_mean={spread.mean():.2f} spread_std={spread.std():.2f}")
    print(f"sharpe={sharpe(strat):.2f} max_drawdown={max_drawdown(equity):.2%}")
    print("OK — 将统计与回测指标写入 P13 价差报告（离线路径）。")


if __name__ == "__main__":
    main()
