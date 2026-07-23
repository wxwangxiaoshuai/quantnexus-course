---
id: m4l2
title: MACD、RSI 与布林带
duration: 15 分钟
module: m4
moduleTitle: 第四模块：技术指标
elective: false
order: 18
quiz:
  - id: q_m4b0
    slot: 1
---

**MACD（Moving Average Convergence Divergence）**：

= 快线 EMA（12）- 慢线 EMA（26）。

Signal 线 = MACD 的 EMA（9）。Histogram（柱）= MACD - Signal。

**使用场景**：MACD 柱由负转正（零轴上穿）通常视为做多信号。它本质上是**两条均线的差值**，测量趋势动量。

```python
def macd(prices, fast=12, slow=26, signal=9):
    ema_fast = ema(prices, fast)
    ema_slow = ema(prices, slow)
    macd_line = [f - s for f, s in zip(ema_fast, ema_slow)]
    signal_line = ema(macd_line, signal)
    histogram = [m - s for m, s in zip(macd_line, signal_line)]
    return macd_line, signal_line, histogram

# RSI 完整实现见下方「RSI 详解」段（采用 Wilder 平滑）

def bollinger(prices, period=20, std_dev=2):
    """布林带: 均值 ± N 个标准差"""
    mid = sma(prices, period)
    # upper = mid + std_dev * rolling_std
    # lower = mid - std_dev * rolling_std
```

:::highlight orange
重要认知：指标没有预测未来的能力，只是对历史价格的不同维度描述。「指标发出信号」≠「价格一定会涨/跌」。量化系统的价值在于纪律性地执行规则，而不是依赖指标的神秘力量。
:::

**RSI（相对强弱指数）详解**：

RSI 衡量的是「最近一段时间内，上涨的力量占总体波动的比例」。范围 0-100。

> 70 以上 = 超买区（overbought），可能回调
> 30 以下 = 超卖区（oversold），可能反弹

完整实现：

```python
def rsi(prices: list[float], period: int = 14) -> list[float]:
    """RSI = 100 - 100 / (1 + RS)，其中 RS = mean_gain / mean_loss。
    采用 Wilder 平滑（avg = (prev_avg*(period-1) + cur) / period），与文华/通达信/TA-Lib 默认一致。"""
    result = [float('nan')] * (period - 1)
    gains, losses = [], []
    for i in range(1, len(prices)):
        diff = prices[i] - prices[i - 1]
        gains.append(max(diff, 0))
        losses.append(max(-diff, 0))

    # 初始值用简单平均
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains) + 1):
        if avg_loss == 0:
            result.append(100.0)
        else:
            rs = avg_gain / avg_loss
            result.append(100 - 100 / (1 + rs))
        if i < len(gains):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period
    return result
```

:::highlight orange
RSI 背离（Divergence）——比超买超卖更有价值的信号：

**顶背离**：价格创新高，但 RSI 没有创新高（反而降低）→ 上涨动能衰减，可能见顶反转。这是做多的离场信号。

**底背离**：价格创新低，但 RSI 没有创新低（反而抬高）→ 下跌动能衰减，可能见底反弹。这是做空的离场信号或做多的入场参考。

> 背离信号的实战经验：背离本身不是交易信号——它是一个「警告灯」告诉你动能正在减弱。你应该等价格确认（比如跌破支撑或突破阻力）之后才行动。就像仪表盘上的警告灯亮了，不代表发动机马上要坏，但说明你需要减速检查。

**参数选择**：短线交易者常用 RSI(7) 或 RSI(9)，中线常用 RSI(14)。周期越短，RSI 越敏感，假信号也越多。与 K 线周期一样，取决于你的持仓时长。
:::

**布林带（Bollinger Bands）详解**：

布林带 = 中间线（MA20）+ 上轨（中轨 + 2×标准差）+ 下轨（中轨 - 2×标准差）。它的核心洞察不是「价格在带内震荡」，而是「带的宽窄反映了市场状态」：

- **布林带收缩（Squeeze）**：上下轨间距缩窄 → 波动率处于低点 → 即将爆发大行情（但方向不确定）。所有震荡策略都应该在 squeeze 结束、带开始扩张时进场。
- **布林带扩张**：上下轨间距扩大 → 波动率爆发，通常是趋势行情的特征。

**布林带带宽（Bandwidth）——量化收缩与扩张**：

```python
def bollinger_bandwidth(mid: list[float], upper: list[float], lower: list[float]) -> list[float]:
    """带宽 = (上轨 - 下轨) / 中轨，带宽越小说明波动率越低"""
    return [(u - l) / m for m, u, l in zip(mid, upper, lower)]
```

当带宽降到近 N 日最低时 = 布林带极限收缩 = 大概率要爆发。配合成交量放大确认方向后再入场。

**布林带突破**：当价格从带内突破上轨时，往往意味着强势趋势的延续（而非回落到中轨）。做突破策略时应配合成交量确认。

> 布林带不是用来判断「价格太高了还是太低了」的超买超卖指标——它是用来衡量「波动率的周期性」。低波动之后有高波动，高波动之后有低波动。这是所有市场的共性，也是布林带最核心的应用。

<!-- quiz:1 -->
