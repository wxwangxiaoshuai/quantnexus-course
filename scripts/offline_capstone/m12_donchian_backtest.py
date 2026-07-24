"""M12 离线：Donchian 突破（排除当前 bar）+ 简单权益曲线。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd

from _common import load_ohlcv, max_drawdown, sharpe  # noqa: E402


def donchian_signals(df: pd.DataFrame, n: int = 40) -> pd.Series:
    high_ch = df["high"].shift(1).rolling(n).max()
    low_ch = df["low"].shift(1).rolling(n).min()
    pos = pd.Series(0, index=df.index, dtype=int)
    long_entry = df["close"] > high_ch
    short_entry = df["close"] < low_ch
    state = 0
    for i in range(len(df)):
        if long_entry.iloc[i]:
            state = 1
        elif short_entry.iloc[i]:
            state = -1
        pos.iloc[i] = state
    return pos


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True)
    p.add_argument("--n", type=int, default=40)
    p.add_argument("--cost_bps", type=float, default=2.0, help="往返成本（基点）")
    args = p.parse_args()

    df = load_ohlcv(args.csv)
    pos = donchian_signals(df, args.n)
    ret = df["close"].pct_change().fillna(0.0)
    strat = pos.shift(1).fillna(0) * ret
    trades = pos.diff().abs().fillna(0)
    strat = strat - trades * (args.cost_bps / 10000.0)
    equity = (1 + strat).cumprod()

    print(f"bars={len(df)} n={args.n}")
    print(f"total_return={equity.iloc[-1] - 1:.2%}")
    print(f"sharpe={sharpe(strat):.2f}")
    print(f"max_drawdown={max_drawdown(equity):.2%}")
    print("OK — 将本输出贴入 P12 验收笔记（离线路径）。")


if __name__ == "__main__":
    main()
