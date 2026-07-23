---
id: m6l6
title: 回测进阶：你的 Sharpe 真的显著吗？
duration: 20 分钟
module: m6
moduleTitle: 第六模块：回测——策略的单元测试
elective: false
order: 29
quiz:
  - id: q_m6f
    slot: 1
---

在模块 6 的前面部分，你学会了计算 Sharpe Ratio 并解读它的含义（>1 尚可，>2 优秀）。但有一个致命的问题没人告诉你：**你怎么知道你的 Sharpe=1.5 是基于真实的策略优势，而不是在 100 个策略中挑出来的恰好效果最好的那个？**

这就是回测统计显著性的核心问题——也是学术圈和专业量化团队最严肃的课题。本节从入门到进阶，帮你建立统计学检验的直觉。

## 1. 多重比较问题（Multiple Comparisons Problem）

假设你回测了 100 个策略变体（不同的参数组合、不同的指标组合），在样本内调参后你选出了 Sharpe 最高的那个——Sharpe=1.8。你觉得「这个策略很好，Sharpe 接近 2」。

现在换一个角度：如果市场完全是随机游走（没有任何可预测性），你随机测试 100 个策略——按照概率规律，总会有一个「看起来」Sharpe 很高（纯粹因为运气好碰上了一段适合它的数据）。这就是**多重比较问题**。

**经典类比**：你抛 100 次硬币，每次都做 20 笔假想交易（随机买卖），其中总有几个看起来有「交易天赋」。不是因为他们真的有预测能力，而是你测试了足够多次，统计学允许你在纯粹的噪音中找到「看起来不纯的噪音」。

> 经验法则：如果没有对多重比较做校正，任何声称「我的策略 Sharpe=1.8」的声明在没有说明测试了多少个策略之前，都不可信。如果你测试了 200 个策略找到了一个 Sharpe=1.8 的，它的统计意义和一个一次测试就 Sharpe=0.4 的策略差不多。

:::highlight blue
Deflated Sharpe Ratio（DSR, 降噪夏普比率）

由 David H. Bailey 和 Marcos López de Prado 在 2014 年提出。DSR 回答的核心问题是：「在测试了 N 个策略后，找到的最优 Sharpe 比率是否统计上显著高于纯粹的数据挖掘噪音？」

DSR 的直觉：与其比较「你的 Sharpe 是否 > 0」，不如问「你的 Sharpe 是否 > 随机从噪声中能获得的最高 Sharpe」。如果答案是「是」，你的策略才有统计可信度；如果「否」，你的策略可能不过是一只幸运的猴子。
:::

## 2. PBO（Probability of Backtest Overfitting，回测过拟合概率）

PBO 衡量的是「样本内最优策略在样本外退化的概率」。它的计算逻辑：

1. 把历史数据切成很多重叠的段（类似 Walk-Forward 但更多段）
2. 在每一段中选择样本内的最优参数
3. 比较这些参数在样本外的表现和随机参数的样本外表现
4. 如果最优参数的样本外表现还不如随机参数的平均水平 → 策略很可能过拟合了

**PBO 值的含义**：
- PBO < 0.1（10%）：策略稳健，过拟合概率低，可信
- PBO 0.1-0.3（10%-30%）：中等风险，需要额外证据
- PBO > 0.3（30%）：过拟合风险高，策略需要更多验证

> PBO 不是「你的策略一定过拟合了」的判决，而是「就你现在的验证方法而言，样本内表现有多少可能只是记忆了历史噪音」。PBO 高不代表策略一定不好，但代表你目前的验证方法不足以证明它好。

## 3. 样本内 vs 样本外：正确的切割方式

大多数新手犯的错误是：

❌ 错误做法：在整个历史上调出最优参数 Sharpe=2.0，然后用同样的历史复盘说「这个策略跑得很好」——你既当教练又当裁判，当然看起来什么成绩都好。

✅ 正确做法：
1. 在 2020 年之前的数据上调参（样本内，In-Sample）
2. 用 2020 年以后的数据测试这些参数（样本外，Out-of-Sample）
3. 样本外的 Sharpe 是策略在「没见过」的数据上的表现——这才是更接近实盘表现的指标

**样本内外的 Sharpe 差距**：
- 差距 < 20%：策略稳健（如样内 1.5，样外 1.2）
- 差距 20%-50%：策略有一定退化，需要进一步验证
- 差距 > 50%：策略很可能过拟合（如样内 2.0，样外 0.5）

**Purged Cross-Validation**（进阶方法，由 López de Prado 提出）：在时间序列数据上做交叉验证时，不能像普通 ML 那样随机切分，因为相邻的 K 线高度相关。需要在每一段验证集前后留出一段「间隔期」来消除信息泄露。这叫 **Purging** 和 **Embargoing**——本质是防止训练数据和测试数据之间有重叠导致的非法信息泄露。

```python
# 简化版：样本内/外 Sharpe 对比

def compare_is_oos(bars, strategy_func, param_ranges):
    """比较样本内和样本外的 Sharpe"""
    split = int(len(bars) * 0.7)  # 70% 样本内
    in_sample = bars[:split]
    out_sample = bars[split:]

    # 遍历参数网格，选样本内最优
    best_sharpe = -999
    best_params = None
    for fast in param_ranges['fast']:
        for slow in param_ranges['slow']:
            if fast >= slow:
                continue
            params = {'fast': fast, 'slow': slow}
            equity, trades = backtest(strategy_func, in_sample, params, 100000)
            metrics = calculate_metrics(equity, trades)
            if metrics['sharpe'] > best_sharpe:
                best_sharpe = metrics['sharpe']
                best_params = params

    # 用最优参数在样本外（从未见过的数据）验证
    equity_os, trades_os = backtest(strategy_func, out_sample, best_params, 100000)
    metrics_os = calculate_metrics(equity_os, trades_os)

    print(f"样本内最优参数: {best_params}, Sharpe: {best_sharpe:.2f}")
    print(f"样本外 (同参数): Sharpe: {metrics_os['sharpe']:.2f}")
    print(f"退化率: {(best_sharpe - metrics_os['sharpe']) / best_sharpe * 100:.1f}%")

    return best_params, best_sharpe, metrics_os['sharpe']

# Haircut Sharpe Ratio（一个简单的实用修正）
# 如果你测试了 N_trials 个策略，最优 Sharpe 要打个折扣
def haircut_sharpe(observed_sharpe, n_trials, n_obs):
    """
    n_trials: 测试了多少个策略/参数组合
    n_obs: 用的历史数据有多少个收益率点
    注意：这是一个简单近似，精确的 DSR 计算更复杂
    """
    import math
    # 鸿沟：你测试越多次，最高 Sharpe 的期望值越高（即使全随机）
    expected_max = math.sqrt(2 * math.log(n_trials))
    # 信号：超过期望噪音的部分才是真信号
    haircut = observed_sharpe - expected_max / math.sqrt(n_obs / 252)
    return max(0, haircut)
```

:::highlight orange
职业量化团队的底线：不只看回测 Sharpe，要同时报告「测试了多少个策略/参数组合」。如果一个人说他找到了一个 Sharpe=2.5 的策略但是省略了他是从 500 个候选策略中选出来的事实，你完全可以礼貌地质疑。一个好的策略应该能在「合理的测试次数内 + 合理的样本外验证」中仍然展现出优势。
:::

<!-- quiz:1 -->
