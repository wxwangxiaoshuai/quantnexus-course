**程序员类比**：回测 = 用历史数据跑单元测试。你有一段历史行情（测试数据集），把策略放进去模拟运行，看看假如当时这样操作，最终盈亏如何。

**事件驱动回测**（QuantNexus 使用的方式）：逐根 K 线喂给策略，策略输出信号，引擎模拟成交，更新账户状态。就像一个 for 循环：

```python
def backtest(strategy, bars, initial_capital):
    account = Account(cash=initial_capital)
    equity_curve = []  # 资金曲线
    
    for i, bar in enumerate(bars):
        history = bars[:i+1]
        signal = strategy(history, account.position)
        
        if signal == 'BUY' and account.position == 0:
            account.buy(bar.close)  # 以收盘价成交（理想化）
        elif signal == 'SELL' and account.position > 0:
            account.sell(bar.close)
        
        equity_curve.append(account.total_equity(bar.close))
    
    return equity_curve, account.trades
```

::interactive{type="backtestMetrics"}
## 回测绩效报告：你需要关注的 10+ 个核心指标

一个完整的回测报告就像一份体检单，不能只看一个数字就下结论。你需要从收益面、风险面、交易面三个维度综合评估。

### 一、收益面指标

**总收益率（Total Return）**：

$$
R_{\text{total}} = \frac{\text{FinalEquity} - \text{InitialCapital}}{\text{InitialCapital}} \times 100\%
$$

**年化收益率（Annualized Return）**：

$$
R_{\text{annual}} = \left(\frac{\text{FinalEquity}}{\text{InitialCapital}}\right)^{\frac{252}{N}} - 1
$$

其中 N 为交易日数，252 为年交易日数（国内期货约 240）。年化收益让你可以在不同时间段、不同策略间公平对比。

**年化波动率（Annualized Volatility）**：

$$
\sigma_{\text{annual}} = \sigma_{\text{daily}} \times \sqrt{252}
$$
$$
\sigma_{\text{daily}} = \sqrt{\frac{1}{N-1} \sum_{t=1}^{N} (r_t - \bar{r})^2}
$$

其中 $r_t = \frac{E_t}{E_{t-1}} - 1$ 为日收益率。$sqrt{252}$ 来自「波动率随时间平方根增长」的金融统计学规律。

### 二、风险调整收益指标

**夏普比率（Sharpe Ratio）**：

$$
\text{Sharpe} = \frac{R_{\text{annual}} - R_f}{\sigma_{\text{annual}}}
$$

$R_f$ 为无风险利率（国内可取 2%~3% 或直接取 0）。含义：「每承担一单位总风险，获得多少超额收益」。Sharpe > 1 尚可，> 2 优秀，> 3 极罕见。

**索提诺比率（Sortino Ratio）**：

$$
\text{Sortino} = \frac{R_{\text{annual}} - R_f}{\sigma_{\text{downside}}}
$$
$$
\sigma_{\text{downside}} = \sqrt{\frac{1}{N} \sum_{r_t < 0} r_t^2}
$$

其中 $N$ 是**总交易日数**（非仅亏损日数 $N_d$）：亏损日的收益平方求和，但分母用全部样本数。这样定义下，当收益分布对称时 $\text{Sortino} \approx \sqrt{2} \times \text{Sharpe}$（因约一半日子为亏损日，平方和约为全样本方差的 1/2，开方得 $\sqrt{2}$ 倍）。和夏普的区别：分母只用**下行波动率**（亏损日的波动），因为对投资者来说，上涨波动不是「风险」。索提诺比夏普更贴合实际心理感受。

**卡玛比率（Calmar Ratio）**：

$$
\text{Calmar} = \frac{R_{\text{annual}}}{\text{MaxDrawdown}}
$$

分母换成「最坏情况」（最大回撤），而不是平均波动。Calmar > 1 说明年化收益能覆盖最大回撤，比较健康。

### 三、回撤与风险面

**最大回撤（Max Drawdown）**：

$$
\text{MDD} = \max_{t \in [0,T]} \left( \frac{\max_{\tau \leq t} E_\tau - E_t}{\max_{\tau \leq t} E_\tau} \right) \times 100\%
$$

即资金曲线历史峰值到随后谷底的最大跌幅。公式的含义：对每根 K 线，找到「之前的历史最高峰值」，计算当前相对峰值的跌幅，取所有时间点的最大值。

**最长回撤期（Max Drawdown Duration）**：资金曲线从一次峰值回到新高所需要的最长天数。比最大回撤的深度更能反映心理压力——亏 20% 但一个月就回来了，和亏 15% 但两年回不了本，后者更痛苦。

**回撤深度分布**：不只关心最大回撤，还看回撤的分布：
- 有多少次回撤超过 5%
- 有多少次回撤超过 10%
- 大部分回撤能在多久内创新高（恢复时间的分布）？

### 四、交易面指标

**胜率（Win Rate）**：

$$
\text{WinRate} = \frac{N_{\text{win}}}{N_{\text{total}}} \times 100\%
$$

**盈亏比（Profit Factor）**：

$$
\text{ProfitFactor} = \frac{\text{GrossProfit}}{\text{GrossLoss}}
$$

> 1 说明总盈利大于总亏损。注意：Profit Factor ≠ 平均盈利/平均亏损（那是 Avg Win / Avg Loss Ratio），两者含义不同。

**期望值（Expectancy）**：

$$
E = \text{WinRate} \times \text{AvgWin} - (1 - \text{WinRate}) \times \text{AvgLoss}
$$

这是判断策略核心优势的公式。$E > 0$ 意味着长期来看每笔交易有正期望，赌场逻辑站在你这边。

$$
\text{Expectancy Ratio} = \frac{E}{|\text{AvgLoss}|}
$$

> 0.5 优秀，意味着平均每笔交易赚亏损额的 50%。

**平均持仓时间（Avg Holding Period）**：平均每笔交易持仓多少个交易日。判断策略是短线、中线还是长线风格。

### 五、实战示例：看一份回测报告

假设某策略回测 3 年（约 720 个交易日），报告如下：

| 指标 | 数值 | 评价 |
|------|------|------|
| 总收益率 | 48% | — |
| 年化收益率 | 14% | 尚可 |
| 年化波动率 | 18% | 中等 |
| 夏普比率 | 0.78 | 偏低 |
| 索提诺比率 | 1.35 | 良好 |
| 卡玛比率 | 0.7 | 偏弱 |
| 最大回撤 | 20% | 临界值 |
| 最长回撤期 | 180 天 | 较长 |
| 胜率 | 38% | 偏低 |
| 盈亏比（Profit Factor） | 1.8 | 良好 |
| 期望值 > 0 | ✅ | 有正优势 |
| 交易次数 | 150 次 | 低频 |

分析结论：收益中等，波动偏高（Sharpe 仅 0.78 偏低），但 Sortino 明显高于 Sharpe（1.35 vs 0.78），说明总波动里相当一部分来自**上行波动**（对投资者无害），真正的**下行风险控制尚可**。最大回撤达 20% 偏高，最长回撤期 6 个月对心理压力大。胜率仅 38% 但 Profit Factor 1.8 说明盈亏比好——这是典型趋势跟踪策略的特征：多数小亏 + 少数大赚。

::quiz{id="q_m6"}
