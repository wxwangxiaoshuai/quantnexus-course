**策略的本质**：一个确定性函数，输入历史数据和当前状态，输出交易信号。

```python
# 策略 = 纯函数（相同输入 → 相同输出，无副作用）
def strategy(
    bars: list[Bar],      # 历史K线数据
    position: int,        # 当前持仓（正数=多头，负数=空头，0=空仓）
    params: dict,         # 策略参数
) -> Signal:              # 输出：BUY / SELL / HOLD
    ...

# 双均线策略（DualMaStrategy）
def dual_ma_strategy(bars, position, params):
    fast = params["fast_period"]  # 快线周期，如 5
    slow = params["slow_period"]  # 慢线周期，如 20
    
    closes = [b.close for b in bars]
    fast_ma = sma(closes, fast)[-1]
    slow_ma = sma(closes, slow)[-1]
    
    if fast_ma > slow_ma and position <= 0:
        return "BUY"   # 金叉，买入
    elif fast_ma < slow_ma and position > 0:
        return "SELL"  # 死叉，卖出
    return "HOLD"
```

::interactive{type="strategySandbox"}
::quiz{id="q_m5"}
