上一节列出了十几项指标，但只知道定义还不够。知道怎么用这些指标来**判断策略好坏、发现问题、做决策**，才是关键。本节按实战判断的顺序，逐项告诉你每个指标怎么看。

## 判断流程（建议按这个顺序看报告）

**Step 1：先看风险，再看收益。** 一个策略如果最大回撤超过你心理承受能力的 2 倍，年化收益再高也不适合你。

**Step 2：判断策略是否「有优势」。** 核心看期望值 > 0 且 Profit Factor > 1.2。

**Step 3：看风险调整收益是否合理。** Sortino > 1 较好，Sharpe > 1 尚可。

**Step 4：看最大回撤是否可接受。** 一般要求 < 20%，< 10% 优秀。

**Step 5：翻交易记录，看分布的合理性。** 资金曲线是否平稳上升？收益是否集中在极少数交易？

:::highlight blue
核心认知：没有单个指标能全面评价一个策略。Sharpe 高但 Strategy A 可能靠频繁薄利勉强覆盖回撤风险；Sharpe 低但 Strategy B 的 Sortino 很高，说明它在真正重要的下行风险上控制得好。必须四五个指标交叉验证。
:::

## 各指标的实战判断门道

### 1. 年化收益率 vs 年化波动率

**理想组合**：高收益 + 低波动 → Sharpe 自然高。

**危险信号**：年化收益 30% 但年化波动 50% → Sharpe 仅 0.6，实际可能是赌出来的高收益，换个时间段可能巨亏。

**实用经验**：机构追求 15%-25% / 10%-20%，个人激进策略可以追求更高但必须有相应的风险承受力和心理准备。

### 2. Sharpe vs Sortino vs Calmar："三驾马车" 交叉验证

| 场景 | 含义 |
|------|------|
| Sharpe 低，Sortino 高 | 上行波动大（好事），下行波动小（好事），策略核心风险控制好 |
| Sharpe 高，Sortino 低 | 收益分布**负偏（左尾肥）**：多数时候小赚、偶尔一次大亏。典型如卖期权、网格、马丁格尔等「捡硬币」策略——平时曲线漂亮，尾部藏着爆仓风险。与频率高低无关 |
| Calmar 很低 | 最大回撤 > 年化收益，说明回撤深度问题严重，抗极端事件能力弱 |
| 三者都高（>2） | 过于完美大概率有问题（过拟合 / 前视偏差 / 幸存者偏差） |

> **判读基准**：当收益分布对称时，$\text{Sortino} \approx \sqrt{2} \times \text{Sharpe} \approx 1.41 \times \text{Sharpe}$。所以「Sortino 明显高于 Sharpe」是常态、算不上异常；真正值得警惕的是 **Sortino 反而低于 Sharpe**——这只能来自收益分布负偏（下行的尾巴比上行更肥）。看这组指标，本质是在读收益分布的**偏度**。

### 3. 最大回撤（MDD）的进阶分析

看回撤不只盯着一个数字 20%。实战中需要看：

**回撤的频率和深度分布**：
- 2 年内有 1 次 -25% 回撤，其余都是 -5%~-10%：一次深回撤可以接受，可能对应某次系统性风险事件
- 2 年内有 15 次 -10% 回撤：表面最大回撤才 -10%，但每次都让你心惊肉跳——这种策略心理折磨也很大

**恢复时间（Recovery Time）**：
- 从回撤谷底回到前高的平均天数
- 从回撤谷底回到前高的最大天数（最长回撤期）

**回撤期收益率**：回撤期间，策略少亏了多少？还是正好回撤就是策略造成的？

### 4. 胜率与盈亏比的关系 — 策选择题

| 策略 A | 策略 B |
|--------|--------|
| 胜率 60% | 胜率 30% |
| 每笔盈利 100 元 | 每笔盈利 500 元 |
| 每笔亏损 100 元 | 每笔亏损 100 元 |
| 期望值 = 0.6×100 - 0.4×100 = 20 | 期望值 = 0.3×500 - 0.7×100 = 80 |

谁更好？**策略 B。** 虽然胜率仅 30%（10 次亏 7 次），但每次亏的都是 100，赚的是 500，长期期望值 80 远超 A 的 20。这就是典型趋势跟踪策略的数学逻辑："多数小亏 + 少数大赚 > 多数小赚 + 少数大亏"。

### 5. 交易次数 — 你是在赌还是真在量化

- 3 年 20 笔交易 → 样本太少，统计上不可靠。任何指标都是幻觉。
- 3 年 200 笔交易 → 合理的量化策略频率
- 3 年 2000 笔交易 → 高频/日内策略，手续费和滑点模型至关重要

**经验法则**：至少 30 笔以上交易，统计才勉强可用。少于 30 笔的策略，所有指标请打问号。

### 6. 收益率来源分析

一个好的回测报告还能告诉你：
- **收益集中度**：前 5 笔最大盈利占总盈利的比例。如果 5 笔赚了 90%，剩余 195 笔在瞎折腾——这不是稳定策略，是运气好赌对了几笔。
- **连续亏损分析**：最长连续亏损几次？最大连续亏损金额？
- **月/季/年收益分布**：是月月正收益，还是 90% 的收益集中在少数几个月？

```python
# 回测绩效指标计算示例
def calculate_metrics(equity_curve, trades):
    # 日收益率
    daily_returns = []
    for i in range(1, len(equity_curve)):
        r = equity_curve[i] / equity_curve[i-1] - 1
        daily_returns.append(r)
    
    # 年化收益率
    total_return = equity_curve[-1] / equity_curve[0] - 1
    N = len(daily_returns)
    annual_return = (1 + total_return) ** (252 / N) - 1
    
    # 年化波动率
    import statistics
    daily_std = statistics.stdev(daily_returns)
    annual_vol = daily_std * (252 ** 0.5)
    
    # 夏普比率（假设无风险利率=0）
    sharpe = annual_return / annual_vol if annual_vol > 0 else 0
    
    # 索提诺比率（下行波动率：亏损日收益平方和 / 总日数 N，使 Sortino≈√2×Sharpe 成立）
    downside_filled = [r if r < 0 else 0.0 for r in daily_returns]  # 非亏损日填 0，分母为 N
    if any(r < 0 for r in daily_returns):
        downside_std = (sum(x * x for x in downside_filled) / N) ** 0.5
        sortino = annual_return / (downside_std * (252 ** 0.5)) if downside_std > 0 else float('inf')
    else:
        sortino = float('inf')
    
    # 最大回撤
    peak = equity_curve[0]
    max_dd = 0
    dd_start = dd_end = 0
    for i, e in enumerate(equity_curve):
        if e > peak:
            peak = e
        dd = (peak - e) / peak
        if dd > max_dd:
            max_dd = dd
    
    # Profit Factor
    gross_profit = sum(t.pnl for t in trades if t.pnl > 0)
    gross_loss = abs(sum(t.pnl for t in trades if t.pnl < 0))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    # 胜率
    win_trades = [t for t in trades if t.pnl > 0]
    win_rate = len(win_trades) / len(trades) if trades else 0
    
    # 期望值
    avg_win = sum(t.pnl for t in win_trades) / len(win_trades) if win_trades else 0
    loss_trades = [t for t in trades if t.pnl < 0]
    avg_loss = sum(t.pnl for t in loss_trades) / len(loss_trades) if loss_trades else 0
    expectancy = win_rate * avg_win + (1 - win_rate) * avg_loss
    
    return {
        'annual_return': annual_return,
        'annual_volatility': annual_vol,
        'sharpe': sharpe,
        'sortino': sortino,
        'max_drawdown': max_dd,
        'profit_factor': profit_factor,
        'win_rate': win_rate,
        'expectancy': expectancy,
        'total_trades': len(trades),
    }
```

::quiz{id="q_m6b"}
