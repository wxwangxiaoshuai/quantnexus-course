---
id: m4l3
title: 指标进阶：KDJ、ATR、ADX 与唐奇安通道
duration: 21 分钟
module: m4
moduleTitle: 第四模块：技术指标
elective: false
order: 19
quiz:
  - id: q_m4b
    slot: 1
---

**KDJ — 国内交易者最常用的摆动指标**：

KDJ 源自随机指标（Stochastic Oscillator），它比较的是「当前收盘价在最近 N 根 K 线价格范围中的位置」。

- K 值：快线，对价格变化敏感
- D 值：慢线，K 值的均线
- J 值：3K - 2D，最敏感的线，提前反映 K/D 的交叉

**经典信号**：
- K 线上穿 D 线 = 金叉（买入参考）
- K 线下穿 D 线 = 死叉（卖出参考）
- J 值 > 100 = 超买，J 值 < 0 = 超卖

> KDJ 在震荡市中表现好（和布林带类似），但在单边趋势中会频繁给出反向信号（价格一直在涨但 KDJ 一直提示超买）。所以 KDJ 的合理用法是和趋势指标（如均线或 MACD）配合——趋势指标给方向，KDJ 给出入场时机。

**ATR（Average True Range）——波动率的标尺**：

ATR 衡量的是「近期 K 线平均振幅」，不判断方向，只告诉你市场当前的躁动程度。

```python
def true_range(high: float, low: float, prev_close: float) -> float:
    """真实波幅 = max(当日高-当日低, |当日高-昨收|, |当日低-昨收|)"""
    return max(high - low, abs(high - prev_close), abs(low - prev_close))

def atr(bars: list[Bar], period: int = 14) -> list[float]:
    """平均真实波幅"""
    tr_values = []
    for i in range(1, len(bars)):
        tr_values.append(true_range(bars[i].high, bars[i].low, bars[i-1].close))
    return sma(tr_values, period)  # 对 TR 序列求均线
```

ATR 在量化系统中的三大用途：

1. **动态止损**：止损距离 = ATR × N（如 N=2，则止损设在开仓价 ± 2×ATR 的位置）
2. **仓位计算**：最大风险金额 ÷ (ATR × 合约乘数) = 可开仓手数
3. **市场活跃度监测**：ATR 攀升 = 波动加大 = 可能有大行情

> ATR 是「波动率适配」的基石——它让你的策略参数根据市场环境自动调节。昨天 ATR 是 10 点，今天是 30 点，同样的一笔交易风险完全不一样。用固定的点数做止损在 ATR 大时太紧、ATR 小时太松。

**ADX（Average Directional Index）——趋势的「强度检测仪」**：

MA 告诉你方向，RSI 告诉你动能，但没人告诉你「这个趋势值不值得跟」。ADX 填补了这个空白：它不判断方向，只判断**趋势够不够强**。

ADX 由三条线组成：
- **+DI（正向指标）**：衡量上涨方向的强度
- **-DI（负向指标）**：衡量下跌方向的强度
- **ADX**：+DI 和 -DI 的差值取绝对值再做平滑——值越大 = 趋势越强（不管涨跌）

```python
def adx(bars: list[Bar], period: int = 14) -> tuple[list[float], list[float], list[float]]:
    """返回 (plus_di, minus_di, adx)"""
    plus_dm, minus_dm, tr = [], [], []
    for i in range(1, len(bars)):
        up = bars[i].high - bars[i-1].high
        down = bars[i-1].low - bars[i].low
        plus_dm.append(up if up > down and up > 0 else 0)
        minus_dm.append(down if down > up and down > 0 else 0)
        tr.append(true_range(bars[i].high, bars[i].low, bars[i-1].close))

    atr_vals = sma(tr, period)
    plus_di = [100 * (sma(plus_dm, period)[i] / atr_vals[i]) if atr_vals[i] else 0
               for i in range(len(atr_vals))]
    minus_di = [100 * (sma(minus_dm, period)[i] / atr_vals[i]) if atr_vals[i] else 0
                for i in range(len(atr_vals))]
    dx = [100 * abs(p - m) / (p + m) if (p + m) else 0
          for p, m in zip(plus_di, minus_di)]
    adx_vals = sma(dx, period)
    return plus_di, minus_di, adx_vals
```

> ⚠️ **这段代码是教学简化版**：真正的 ADX 用的是 **Wilder 平滑**（一种带记忆的递推移动平均），而这里用普通 SMA 代替；同时 `sma(plus_dm, period)` 与 `atr_vals` 的索引没有严格对齐。因此它算出的数值会与文华、TradingView、通达信等行情软件**不一致**——理解思路即可，实盘请用 TA-Lib / vn.py 内置的 ADX，别拿这段去对数。

**ADX 的实战用法**：

| ADX 值 | 含义 | 你应该做什么 |
|--------|------|-------------|
| < 20 | 无明显趋势（震荡） | 使用布林带、KDJ 等震荡策略；避免趋势跟踪策略 |
| 20-25 | 趋势正在形成 | 可以开始关注，但还不确定 |
| 25-40 | 趋势较强 | 适合双均线、MACD 等趋势跟踪策略 |
| 40-60 | 趋势非常强 | 顺势而为，别逆势抄底摸顶 |
| > 60 | 趋势极端（罕见） | 警惕趋势衰竭，准备止盈 |

**ADX 交叉信号的辅助判断**：
- +DI 上穿 -DI 且 ADX > 25 → 做多信号更可靠
- -DI 上穿 +DI 且 ADX > 25 → 做空信号更可靠
- +DI 和 -DI 频繁交叉且 ADX < 20 → 震荡市，这些交叉信号不可信

> ADX 是量化 CTA 策略的「标配」过滤器。双均线金叉 + ADX > 25 → 一个简单但有效的开仓条件。很多趋势跟踪策略在震荡市亏钱就是因为没有用 ADX 过滤——加一个 ADX 判断，可能让你的胜率在没有增加复杂度的前提下显著提升。

**唐奇安通道（Donchian Channel）——海龟交易法则的核心工具**：

Donchian Channel 是历史上最著名的趋势跟踪策略之一「海龟交易法则（Turtle Trading）」的核心工具。它的原理极其简单：

- **上轨**：过去 N 天（通常 N=20）的最高价
- **下轨**：过去 N 天的最低价
- **中轨**：(上轨 + 下轨) / 2

```python
def donchian_channel(bars: list[Bar], period: int = 20):
    """唐奇安通道：上轨 = N日最高价，下轨 = N日最低价"""
    upper, lower = [], []
    for i in range(len(bars)):
        if i < period - 1:
            upper.append(float('nan'))
            lower.append(float('nan'))
        else:
            window = bars[i - period + 1 : i + 1]
            upper.append(max(b.high for b in window))
            lower.append(min(b.low for b in window))
    return upper, lower
```

**海龟交易法则的核心规则**（简化版）：

1. 当价格突破 20 日唐奇安通道上轨时，**买入开仓**
2. 当价格跌破 10 日唐奇安通道下轨时，**卖出平仓**（做多离场）
3. 每笔交易最大风险 = 总资金的 2%，用 ATR 计算仓位大小

**为什么 Donchian Channel 这么简单却有效？**

它本质上是「突破新高买入」的量化实现。单边趋势中价格会连续创阶段新高，所以你自然就在趋势里了；震荡市中价格在通道内来回振荡，你不会被触发入场。与均线交叉不同，Donchian Channel 的入场信号是「价格驱动」而非「均线驱动」——它对突破的反应更快，但假信号也可能更多。

> 唐奇安通道和 ATR 是绝配：通道告诉你「什么时候进场」和「什么时候离场」，ATR 告诉你「该下多大仓位」。海龟法则之所以成为传奇，不在于入场规则多精妙，而在于**仓位管理**——入场信号只是触发，真正赚钱的是在正确趋势中逐步加仓、在错误交易中严格止损。我们在模块 7 会展开这个主题。

**OBV（On-Balance Volume）——「量在价先」的最简实现**：

OBV 的思想很简单：如果今天是阳线（收盘 > 开盘），就把今天的成交量累加到 OBV 上；如果是阴线，就减去成交量。累积的 OBV 曲线如果和价格走势同向 = 量价配合；如果背离 = 趋势可能反转。

```python
def obv(bars: list[Bar]) -> list[float]:
    """OBV 累积成交量方向"""
    result = [0.0]
    for i in range(1, len(bars)):
        if bars[i].close > bars[i-1].close:
            result.append(result[-1] + bars[i].volume)   # 阳线：累加
        elif bars[i].close < bars[i-1].close:
            result.append(result[-1] - bars[i].volume)   # 阴线：累减
        else:
            result.append(result[-1])                    # 平盘：不变
    return result
```

**OBV 的实战信号**：

| 价格 | OBV | 含义 |
|------|-----|------|
| 上涨 | 同步上涨 | 量价配合，上涨有资金支撑 |
| 上涨 | 横盘或下跌 | OBV 背离：价格上涨但资金在撤离，警惕回调 |
| 下跌 | 同步下跌 | 量价配合，下跌有资金推动 |
| 下跌 | 横盘或上涨 | OBV 背离：价格下跌但资金在流入，可能见底 |

> OBV 的优势是**简单到极致**——一个循环几行代码，不需要任何参数。劣势也明显：它只看阴阳不看涨幅，一根涨 0.01% 的 K 线和涨 5% 的 K 线在 OBV 中权重相同（只看成交量）。所以 OBV 适合用来**过滤假信号**——比如双均线金叉 + OBV 同步上涨 → 这个突破有成交量确认，可靠度更高。

:::highlight green
指标组合使用的黄金法则：

永远不要只用单一指标做决策。组合的核心原则是「不同维度交叉验证」：

| 维度 | 代表指标 | 回答的问题 |
|------|---------|-----------|
| 趋势方向 | MA、MACD、+DI/-DI | 现在市场是涨还是跌？ |
| 趋势强度 | ADX | 这个趋势值不值得跟？ |
| 动能强弱 | RSI、MACD Histogram | 涨跌的力量有多大？在加速还是衰减？ |
| 波动率 | 布林带带宽、ATR、Donchian Channel | 市场的「安静程度」如何？适合进场吗？ |
| 成交量 | OBV、Volume、VWAP | 价格运动的背后有多少资金参与？ |

**经典组合示例**：
- 趋势跟踪进场 = 价格突破 Donchian 上轨（入场） + ADX > 25（趋势够强） + OBV 同步新高（量确认）
- 震荡市反转 = 价格触碰布林带下轨 + RSI < 30（超卖） + KDJ 金叉（入场时机）
- 双均线过滤版 = 双均线金叉 + ADX > 20 + OBV 向上

> 不要在这个阶段掉入「指标越多越好」的陷阱。多指标组合确实能提高信号质量，但也意味着开仓次数减少，可能错过很多行情。建议从一个简单的组合开始（比如 MA 金叉 + ADX 过滤），回测验证后再逐步添加其他条件。复杂的系统需要在「足够的交易机会」和「足够高的信号质量」之间找到你自己的平衡点。
:::

<!-- quiz:1 -->
