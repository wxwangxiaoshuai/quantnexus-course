"""Shared helpers for offline capstone scripts (same-folder import)."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


def load_ohlcv(path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["datetime"])
    df = df.sort_values("datetime").set_index("datetime")
    for c in ("open", "high", "low", "close"):
        if c not in df.columns:
            raise SystemExit(f"missing column {c} in {path}")
    return df


def max_drawdown(equity: pd.Series) -> float:
    peak = equity.cummax()
    dd = (equity - peak) / peak.replace(0, np.nan)
    return float(dd.min())


def sharpe(returns: pd.Series, periods: int = 252) -> float:
    r = returns.dropna()
    if len(r) < 2 or r.std(ddof=1) == 0:
        return 0.0
    return float(np.sqrt(periods) * r.mean() / r.std(ddof=1))
