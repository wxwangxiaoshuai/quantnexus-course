双均线只是策略的冰山一角。量化交易的世界里有几大经典策略范式，每一个都有其数学内核。

:::highlight blue
范式地图与失效市况总览见 [L08-01](/curriculum/8/L08-01)。本节侧重**公式与伪代码**，方便你直接改造成可测策略函数。
:::

**本节目标**：掌握至少 4 种策略范式的核心公式，能写出对应的 Python 伪代码。

## 一、趋势跟踪策略（Trend Following）

**核心思想**：价格有惯性，趋势一旦形成会持续一段时间。顺势而为，截断亏损、让利润奔跑。

**数学公式（信号生成）**：

$$
S_t = 
\begin{cases}
+1 & \text{if } P_t > MA(P, N) \\
-1 & \text{if } P_t < MA(P, N) \\
0 & \text{otherwise}
\end{cases}
$$

其中 $P_t$ 为当前价格，$MA(P,N)$ 为 N 周期价格的移动平均。$S_t = +1$ 做多，$-1$ 做空，$0$ 观望。

**海龟交易法则公式**

入场信号（Donchian 通道突破）：

$$
\text{Entry}_{\text{long}} = \max(P_{t-N}, \dots, P_{t-1})
$$
$$
\text{Entry}_{\text{short}} = \min(P_{t-N}, \dots, P_{t-1})
$$

当价格突破 N 日最高价时做多，跌破 N 日最低价时做空（N 通常取 20）。

**ATR 仓位公式**：

$$
\text{Shares} = \frac{\text{Account} \times 1\%}{\text{ATR}(N) \times \text{合约乘数}}
$$

其中 ATR(N) 是**价格单位**（如元/吨），需 × 合约乘数（螺纹钢 10 吨/手）换算成「每手金额」，才能得到手数。每笔交易风险固定为账户的 1%，波动大时自动减少仓位。

**出场逻辑**：

$$
\text{Exit}_{\text{long}} = \min(P_{t-M}, \dots, P_{t-1})
$$

价格跌破 M 日最低价时平仓（M 通常取 10），比入场通道更窄，让利润奔跑。

```python
# 海龟交易法则简化版
def turtle_strategy(bars, position, N=20, M=10):
    if len(bars) < N:
        return 'HOLD'
    
    # 通道取前 N 日（排除当前 bar：bars[-1] 是当前 bar，含它会使 close > high_N 恒为假）
    high_N = max(b.high for b in bars[-(N + 1):-1])
    low_N = min(b.low for b in bars[-(N + 1):-1])
    low_M = min(b.low for b in bars[-(M + 1):-1])
    high_M = max(b.high for b in bars[-(M + 1):-1])
    close = bars[-1].close
    
    # 入场：突破 N 日通道
    if close > high_N and position <= 0:
        return 'BUY'
    if close < low_N and position >= 0:
        return 'SELL'
    
    # 出场：反向突破 M 日通道
    if position > 0 and close < low_M:
        return 'FLAT'  # 平多
    if position < 0 and close > high_M:
        return 'FLAT'  # 平空
    
    return 'HOLD'
```

## 二、均值回归策略（Mean Reversion）

**核心思想**：价格围绕某个均值波动，偏离后会回归。"涨多了要跌，跌多了要涨"的数学表达式。

**布林带回归公式**：

$$
\text{Mid}_t = \text{SMA}(P, N)
$$
$$
\text{Upper}_t = \text{Mid}_t + k \cdot \sigma(P, N)
$$
$$
\text{Lower}_t = \text{Mid}_t - k \cdot \sigma(P, N)
$$

信号逻辑（$k$ 通常取 2）：
- $P_t < \text{Lower}_t$：价格过低 → 买入做多
- $P_t > \text{Upper}_t$：价格过高 → 卖出做空
- 回归中轨时平仓

**Z-Score 均值回归**：

$$
Z_t = \frac{P_t - \text{SMA}(P, N)}{\sigma(P, N)}
$$

$|Z_t| > 2$ 时入场（价格偏离均值超过 2 个标准差），$Z_t \approx 0$ 时出场。Z-Score 把不同品种标准化到同一尺度，便于设定统一阈值。

**RSI 反转策略公式**：

$$
RSI_t = 100 - \frac{100}{1 + RS_t}
$$
$$
RS_t = \frac{\text{AvgGain}(N)}{\text{AvgLoss}(N)}
$$

当 $RSI_t < 30$（超卖）做多，$RSI_t > 70$（超买）做空。震荡市有效，趋势市中 RSI 会持续停留极端区域。

```python
# 布林带均值回归策略
def bollinger_reversal_strategy(bars, position, N=20, k=2.0):
    if len(bars) < N:
        return 'HOLD'
    closes = [b.close for b in bars]
    mid = sma(closes, N)[-1]
    std = stdev(closes[-N:])
    upper = mid + k * std
    lower = mid - k * std
    close = closes[-1]
    
    if close < lower and position <= 0:
        return 'BUY'   # 跌破下轨，做多
    if close > upper and position >= 0:
        return 'SELL'  # 涨破上轨，做空
    
    # 回归中轨时平仓
    if position > 0 and close >= mid:
        return 'FLAT'
    if position < 0 and close <= mid:
        return 'FLAT'
    return 'HOLD'
```

## 三、动量策略（Momentum）

**核心思想**：过去一段时间涨得好的品种，未来一段时间大概率继续涨得好。横截面动量在全球期货市场中被广泛证实有效。

**时间段动量公式**：

$$
M_t(N) = \frac{P_t}{P_{t-N}} - 1
$$

即过去 N 期的收益率。当 $M_t(N) > 0$ 做多，$M_t(N) < 0$ 做空。

**MACD 动量公式**：

$$
DIF_t = EMA(P, 12) - EMA(P, 26)
$$
$$
DEA_t = EMA(DIF, 9)
$$
$$
MACD_t = 2 \times (DIF_t - DEA_t)
$$

$DIF$ 反映短期 vs 长期趋势的差值（动量），$DEA$ 是 DIF 的平滑线（信号线），$MACD_t$（柱）反映动量的加速度。$DIF$ 上穿 $DEA$（金叉）做多，下穿（死叉）做空。

```python
# 时间段动量策略（多品种横截面）
def cross_sectional_momentum(bars_dict, top_k=5):
    """选过去 N 期涨幅最大的 k 个品种做多"""
    returns = {}
    N = 20  # 回看期（约一个月）
    for symbol, bars in bars_dict.items():
        if len(bars) > N:
            ret = bars[-1].close / bars[-N].close - 1
            returns[symbol] = ret
    # 排序，选收益率最高的 top_k 个
    ranked = sorted(returns.items(), key=lambda x: x[1], reverse=True)
    return [s for s, r in ranked[:top_k]]  # 做多列表
```

:::highlight blue
策略范式对比：趋势跟踪在趋势市爆发力强但震荡期连续止损；均值回归在震荡市稳定盈利但趋势反转时可能扛单巨亏；动量策略在多品种轮动时表现好但依赖交易标的够多。没有任何一个策略在所有市场环境下都有效——这就是为什么需要理解每个策略的数学原理和市场假设。
:::

## 行为金融学视角：为什么这些策略「应该」有效？

前面讲的都是策略「怎么做」。但作为量化交易者，你需要理解更深层的问题——**为什么这些策略在逻辑上应该赚钱？** 答案在行为金融学——研究市场参与者是如何系统性地偏离理性的。

**锚定效应（Anchoring）→ 趋势形成**

人们在决策时倾向于过度依赖某个初始值（「锚」）。比如交易者看到螺纹钢从 3500 涨到 3700，心理上仍锚定在 3500 的「合理价位」上，认为高了会跌回来——所以迟迟不敢追涨。这导致价格虽然已经启动了趋势，但新买盘入场缓慢，趋势的展开是渐进的而不是瞬间的，趋势跟踪策略因此能在趋势的中段继续获利。

**处置效应（Disposition Effect）→ 趋势加速**

人性中有一个被研究反复验证的偏误：人们倾向于过早卖出盈利头寸（拿不住利润），同时迟迟不肯卖出亏损头寸（不愿认错）。这个效应在趋势中的表现是：上涨过程中「应该获利了结」的人越多，上行阻力越大；但一旦价格突破了关键位置，那些「还没买但一直在等回调」的资金会恐慌性入场——推动趋势加速。

> 趋势跟踪策略得以盈利的行为金融学基础：不是市场能完美预测未来，而是其他参与者基于人性的惯性在重复犯错。你在别人「不敢买」的时候买入，在别人「终于敢买了」的时候卖出——你赚的是人类行为惯性的钱。

**过度反应与反应不足（Overreaction & Underreaction）→ 动量策略的根源**

学术界发现了一个稳定的现象：
- 短期（1-12 个月）：市场对新信息**反应不足**（underreaction），利好消息出来后价格缓慢上涨——这给了动量策略赚钱的空间
- 长期（3-5 年）：市场对连续利好**过度反应**（overreaction），价格推得太高之后会均值回归

这就是「短期动量 + 长期反转」的双重模式。你的趋势跟踪策略在 3-12 个月的时间尺度上可能有效，但不要指望它能在 5 年的时间尺度上也有效——市场会在不同时间尺度上表现出不同的行为金融学特征。

**羊群效应（Herding）→ 泡沫与崩盘**

当越来越多的交易者开始使用同一策略（或关注同一信号），价格会被集体行动推离均衡——这就是泡沫。但泡沫总会破裂——当最后一个买家进场后，没有更多资金推动价格上涨了。

> 这对你的策略意味着什么：你需要知道你的策略目前在「羊群的哪一侧」。如果所有人都在用双均线金叉买入（一个曾经有效的信号），那你可能已经在羊群的最末端了。这也是为什么模块 8 会讲「策略退化」——当太多人使用同一策略时，这个策略就变质了。

**关键启示**：好的量化策略不只是「找到正确的数学公式」，而是「找到市场中持续存在的人类行为偏误 + 用数学公式纪律性地从中获利」。数学公式本身不会创造 Alpha，行为金融学的洞见才是指南针。

::quiz{id="q_m5c"}
