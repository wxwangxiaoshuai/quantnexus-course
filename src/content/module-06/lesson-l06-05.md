一个回测「好看」只是起点。真正的量化交易者会再用三类验证方法，确认策略不是在历史数据上碰运气，而是真的有稳定的优势。

## 一、参数敏感性分析

你的策略有参数（如双均线的 5 和 20）。如果换一换参数——比如用 4/18 或 6/22——策略还赚钱吗？如果参数稍微变化就巨亏，说明策略高度不稳定，可能只是过拟合了某个特定参数组合。

**分析方法**：热力图。横轴和纵轴是两个关键参数，颜色是策略绩效（如年化收益或 Sharpe）。

理想热力图：中间一片深蓝色（高绩效），边缘不会突然变红（亏钱）。这意味着策略对参数合理范围内的变化不敏感。

危险热力图：只有正中间一像素点是蓝的，旁边全是红的——典型的过拟合。

**敏感度指标**：

$$
\text{Sensitivity} = \frac{\max(\text{Metric}) - \min(\text{Metric})}{\text{Mean}(\text{Metric})}
$$

敏感度 > 2 意味着参数变化对结果影响极大，策略不稳定。

```python
# 参数敏感性分析热力图数据
def parameter_sensitivity(bars, fast_range, slow_range):
    """遍历参数网格，返回绩效矩阵"""
    results = []
    for fast in fast_range:  # e.g., range(3, 11)
        for slow in slow_range:  # e.g., range(15, 30)
            if fast >= slow:
                continue
            params = {'fast_period': fast, 'slow_period': slow}
            equity, trades = backtest(dual_ma_strategy, bars, params, 100000)
            metrics = calculate_metrics(equity, trades)
            results.append({
                'fast': fast, 'slow': slow,
                'sharpe': metrics['sharpe'],
                'annual_return': metrics['annual_return']
            })
    return results  # 可绘制为 heatmap (fast × slow → sharpe)
```

## 二、蒙特卡洛模拟（Monte Carlo Simulation）

**核心思想**：用随机化的方法，看看「运气」对你的策略有多大影响——历史上盈亏发生的那个特定顺序，只是无数种可能中的一种。

**为什么需要它**：历史回测中你的交易是按特定顺序发生的。如果最大亏损恰好出现在第一笔，你可能扛不住直接放弃。如果最大亏损出现在第 200 笔，那时候你已经积累了足够的利润来承受。蒙特卡洛模拟就是要量化「顺序运气」的影响。

**⚠️ 一个必须先讲清的关键点：洗牌 vs 有放回抽样**

很多教程（包括很多现成代码）会告诉你「把每笔交易的 PnL 列表 `shuffle` 打乱重排，看最终收益分布」。**这是错的**——只要你用的是加法累加盈亏（`equity += pnl`），那么 `sum(pnl_list)` 对排列是不变的：无论怎么洗牌，1000 次模拟的**最终资金完全相同**，「中位数收益」「盈利概率」「95% VaR」全部退化成一个常数，毫无意义。

洗牌唯一能改变的是**路径**——即回撤的深度、回撤出现的时点、连亏的长度。所以两种方法各有正确用途：

| 方法 | 做法 | 能回答什么问题 | 不能回答什么 |
|------|------|---------------|-------------|
| **重排（Shuffle）** | `random.shuffle(pnl_list)` | 最大回撤分布、连亏分布、回撤出现时点——「顺序运气」 | ❌ 最终收益分布（恒定不变） |
| **有放回抽样（Bootstrap）** | `random.choices(pnl_list, k=n)` | 最终收益分布、盈利概率、95% VaR——「样本运气」 | 会略微改变交易笔数结构 |

直觉：重排是「同样一副牌换个发牌顺序」，总和不变；bootstrap 是「从这副牌里有放回地重新抽一手牌」，可能抽到 3 张大赚、也可能一张大赚都没抽到，终值才会变。

**操作步骤**：

1. 从历史回测中提取每笔交易的盈亏列表（PnL list）
2. 想研究**回撤/顺序风险** → 用 shuffle；想研究**终值/收益分布** → 用 bootstrap
3. 重复 1000 次，每次算一条「新的资金曲线」
4. 看 1000 条资金曲线的分布：最差情况、中位情况、最好情况
5. 如果最差情况仍然可接受 → 策略比较稳健
6. 如果 bootstrap 后只有 < 50% 的模拟盈利 → 策略可能靠运气

**关键指标**：
- VaR 95%（Value at Risk 95%）：95% 的模拟中，最终资金不低于多少（**必须用 bootstrap 算**）
- 盈利概率：1000 次 bootstrap 模拟中最终盈利的比例
- 最大回撤分布的 95 分位数（shuffle 或 bootstrap 都可以算）

```python
import random

def _equity_path(pnl_seq, initial=100000):
    """给定一串盈亏，走一遍资金曲线，返回 (最终收益率, 最大回撤)"""
    equity, peak, max_dd = initial, initial, 0.0
    for pnl in pnl_seq:
        equity += pnl
        peak = max(peak, equity)
        max_dd = max(max_dd, (peak - equity) / peak)
    return (equity - initial) / initial, max_dd

def mc_shuffle(trades, simulations=1000):
    """重排法：只改变顺序，用来研究【回撤/连亏】分布。
    注意：加法累加下 sum(pnl) 对排列不变 → 最终收益恒定，
    所以这个函数【只】看 max_drawdown，不看 total_return。"""
    pnl_list = [t.pnl for t in trades]
    dds = []
    for _ in range(simulations):
        shuffled = pnl_list[:]        # 复制，避免原地修改
        random.shuffle(shuffled)
        _, max_dd = _equity_path(shuffled)
        dds.append(max_dd)
    dds.sort()
    print(f"最终收益（所有模拟相同）: {_equity_path(pnl_list)[0]:.1%}")
    print(f"最大回撤中位数: {dds[len(dds)//2]:.1%}")
    print(f"最大回撤 95 分位: {dds[int(len(dds)*0.95)]:.1%}")
    return dds

def mc_bootstrap(trades, simulations=1000):
    """有放回抽样法：重新抽一手牌，用来研究【最终收益】分布。
    每次从 pnl_list 中有放回地抽 n 笔，终值才会真正变化。"""
    pnl_list = [t.pnl for t in trades]
    n = len(pnl_list)
    returns = []
    for _ in range(simulations):
        sample = random.choices(pnl_list, k=n)   # 有放回抽样
        total_return, _ = _equity_path(sample)
        returns.append(total_return)
    returns.sort()
    print(f"中位数收益: {returns[len(returns)//2]:.1%}")
    print(f"95% VaR: {returns[int(len(returns)*0.05)]:.1%}")  # 5% 最差情况
    print(f"盈利概率: {sum(1 for r in returns if r > 0) / simulations:.0%}")
    return returns
```

:::highlight orange
蒙特卡洛模拟的风险提示：如果 1000 次 **bootstrap 有放回抽样**后有超过 30% 的模拟是亏损的，说明你的策略历史盈利很可能依赖于那少数几笔大赚——一旦抽样时没抽中它们就转亏，换个运气差一点的市场环境可能就不行了。（记住：判断「盈利概率」必须用 bootstrap，用 shuffle 得到的终值恒定，这个比例只会是 0% 或 100%。）
:::

## 三、样本外测试（补充）

除了之前讲的 Walk-Forward，还有几个常用的补充方法：

**时间分段测试**：
- 样本内（In-Sample）：前 70% 的历史数据
- 样本外（Out-of-Sample）：后 30% 的历史数据
- 核心原则：样本外的数据策略**从未见过**——调参只能在样本内做

**跨品种测试**：
- 某种策略在螺纹钢上表现好，在同板块的热卷、铁矿石上也试试
- 如果只在单一品种上有效，可能过拟合了该品种的历史特征

**跨市场环境测试**：
- 人为把历史切成「牛市段」「熊市段」「震荡段」
- 分别看策略在各段的表现
- 如果在某一段巨亏，说明策略高度依赖市场环境

**稳定性评级**（个人/团队的快速判断标准）：

| 验证项 | 优秀 | 勉强可用 | 危险 |
|--------|------|----------|------|
| Walk-Forward 样本外 Sharpe | > 0.8 | > 0.3 | < 0 |
| 参数敏感度 | < 1.0 | 1.0-2.0 | > 2.0 |
| 蒙特卡洛盈利概率 | > 85% | 65%-85% | < 65% |
| 跨品种表现 | 3+ 品种 | 1-2 品种 | 仅 1 个 |
| 各市场环境 | 全部盈利 | 仅两种 | 仅一种 |

::quiz{id="q_m6c"}
