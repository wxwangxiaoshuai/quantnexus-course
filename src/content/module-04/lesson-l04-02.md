**程序员类比**：指标 = 对价格序列的信号处理函数。没有魔法，只是数学。

**简单移动平均线（SMA/MA）**：过去 N 根 K 线收盘价的算术平均值。

```python
def sma(prices: list[float], period: int) -> list[float]:
    """简单移动平均线"""
    result = []
    for i in range(len(prices)):
        if i < period - 1:
            result.append(float('nan'))  # 数据不足
        else:
            window = prices[i - period + 1 : i + 1]
            result.append(sum(window) / period)
    return result

# EMA 给近期价格更高权重
def ema(prices: list[float], period: int) -> list[float]:
    """EMA。教学简化版：首值用 prices[0] 而非前 period 个值的 SMA 种子，前若干值会偏离标准 EMA；实盘请用 TA-Lib 的 EMA。"""
    k = 2 / (period + 1)  # 平滑系数
    result = [prices[0]]
    for price in prices[1:]:
        result.append(price * k + result[-1] * (1 - k))
    return result
```

**均线交叉策略的真相——它什么时候有效，什么时候无效**：

双均线「金叉买入 / 死叉卖出」是量化策略中最经典的范式。但你必须知道它的核心缺陷：**滞后性**。

均线是历史数据的平均值，所以交叉信号总是在价格已经走出一段之后才发生。这意味着：

- **在单边趋势中**：虽然延迟进场，但趋势延续带来的利润能覆盖延迟的成本 → **有效**
- **在震荡市中**：金叉发生时价格已经到了震荡区间上沿，你一买就跌；死叉时价格已到下沿，你一卖就涨 → **无效且频繁亏损**

**量化视角**：双均线策略在震荡市就像「追涨杀跌的疲劳机器人」——来回被市场打脸。因为它的开仓逻辑本质上是「追趋势」，但震荡市里没有趋势可追。

```python
def dual_ma_filtered(bars, position, params):
    """加了趋势过滤的双均线——减少震荡市的无意义交易"""
    closes = [b.close for b in bars]
    fast_ma = sma(closes, params['fast'])[-1]
    slow_ma = sma(closes, params['slow'])[-1]

    # 趋势过滤器：仅当价格在 60 日均线上方时（大趋势向上）才允许做多信号
    trend_filter = sma(closes, 60)[-1]
    price = closes[-1]

    if fast_ma > slow_ma and position <= 0 and price > trend_filter:
        return 'BUY'
    elif fast_ma < slow_ma and position > 0:
        return 'SELL'
    return 'HOLD'
```

> 加上趋势过滤器后，震荡市里的假信号会大幅减少。但代价是可能错过一些反弹或短线机会。这是所有量化策略的权衡：少亏 vs 多赚。

:::highlight blue
均线周期的选择哲学：

不同长度的均线代表不同的「市场参与者」的时间视角：

| 周期 | 时间视角 | 代表群体 | 适用场景 |
|------|---------|---------|----------|
| 5 日线 | 一周 | 日内交易者 | 短线进出场确认 |
| 10 日线 | 两周 | 短线交易者 | 短期趋势方向 |
| 20 日线 | 一个月 | 波段交易者 | 中期趋势定方向 |
| 60 日线 | 一个季度 | 机构/基金 | 大趋势过滤 |
| 120 日线 | 半年 | 长线资金 | 牛熊分界线（半年线） |
| 250 日线 | 一年 | 宏观配置 | 年线，被称为「牛熊分界线」 |

> 选择均线周期不是调参游戏，而是选择「你要和谁站在同一边」。用 5 日和 20 日均线交叉做策略 = 你假设短线资金的行为能反映趋势变化。用 20 日和 60 日交叉 = 你假设中期资金的行为更有信号价值。
:::

**成交量加权均线（VWMA）——让大成交量说话**：

传统均线把所有 K 线等权重对待，但同样的一根上涨 K 线，放量涨 3% 和缩量涨 3% 的意义完全不同——前者的多头力量远大于后者。VWMA 解决了这个问题：

```python
def vwma(bars: list[Bar], period: int) -> list[float]:
    """成交量加权移动平均线"""
    result = []
    for i in range(len(bars)):
        if i < period - 1:
            result.append(float('nan'))
        else:
            window = bars[i - period + 1 : i + 1]
            # Σ(价格 × 成交量) / Σ(成交量)
            numerator = sum(b.close * b.volume for b in window)
            denominator = sum(b.volume for b in window)
            result.append(numerator / denominator if denominator else window[-1].close)
    return result
```

VWMA 的一个实战信号：当价格上穿 VWMA 且 VWMA 大于普通均线时，说明「放量突破均线」——比普通均线交叉信号更可靠。

> 在你的策略中，可以把普通均线换成 VWMA。代码改动很小（替换一个函数调用），但信号质量可能明显提升——这就是「以小博大」的优化思路。

::interactive{type="indicatorLab"}
::quiz{id="q_m4"}
