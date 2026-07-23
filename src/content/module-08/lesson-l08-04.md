到目前为止，你学习了单一策略的开发和评价。但在实战中，职业量化团队从来不是只跑一个策略——他们同时运行 5-20 个策略，构成**策略组合（Strategy Portfolio）**。组合管理本身是可以被优化的，而且这个优化带来的收益往往不亚于策略本身。

## 为什么要优化策略组合？

你有两个策略：
- 策略 A：趋势跟踪，年化收益 15%，年化波动 12%
- 策略 B：统计套利，年化收益 12%，年化波动 8%
- 两个策略的日收益相关系数为 -0.2（弱负相关）

如果你各投 50%，组合的预期收益是 13.5%（加权平均），但组合的波动率**不是**加权平均——负相关使得组合波动低于加权平均波动，实际约 6.5%（$\sigma_p = \sqrt{0.25 \cdot 0.12^2 + 0.25 \cdot 0.08^2 + 2 \cdot 0.25 \cdot (-0.2) \cdot 0.12 \cdot 0.08} \approx 6.51\%$）。

**分散化的红利**：同样的收益率，更低的波动率 → 更高的 Sharpe。这就是组合优化的核心目标：在给定收益率水平下，最小化组合的风险。

:::highlight blue
组合管理的本质不是「选多少个策略」，而是「选多少对互补策略」。策略间的低相关性是唯一不会衰减的 Alpha——两个负相关的策略在一起，不论市场怎么变，总有一个能对冲另一个的亏损。
:::

## Markowitz 均值-方差优化

1952 年，Harry Markowitz 提出了投资组合理论的核心数学框架：

$$\begin{aligned}\min_{\mathbf{w}} \quad & \frac{1}{2} \mathbf{w}^T \Sigma \mathbf{w} \\\text{s.t.} \quad & \mathbf{w}^T \mathbf{1} = 1 \\& w_i \geq 0 \quad \forall i\end{aligned}$$

其中：
- $\mathbf{w}$ 是 $n \times 1$ 的权重向量（各策略分多少资金）
- $\Sigma$ 是 $n \times n$ 的协方差矩阵（策略间如何同涨同跌）
- $\mathbf{w}^T \Sigma \mathbf{w}$ 是组合的方差（需要最小化的风险指标）

## 有效前沿（Efficient Frontier）

对于每一组给定的目标收益率，求解上面的优化问题会得到一个最优权重向量的解。把所有这些「最优解」连接起来，就得到**有效前沿**。

- 曲线上的每个点代表「在给定收益率下风险最小」的组合
- 曲线左上方不存在任何可行组合（不可能在更低波动下获得同样收益率）
- 曲线右下方的组合是次优的

**切点组合（Tangency Portfolio）**：有效前沿上 Sharpe 比率最大的点，在风险和收益之间取得最优平衡。

:::highlight orange
方差-协方差优化最大的陷阱：输入数据中的小误差，经优化器放大后，会导致最优权重剧烈不稳定——这就是「误差最大化」现象。Markowitz 本人也承认这是他框架的根本局限性。
:::

## 协方差矩阵的估计与收缩

样本协方差有一个严重的问题：**太吵（noisy）**。10 个策略 × 252 天数据，需要估计 55 个独立参数，数据量不够。

**收缩估计器（Shrinkage Estimator）**：

$$\Sigma_{\text{shrink}} = \lambda \Sigma_{\text{target}} + (1-\lambda) \Sigma_{\text{sample}}$$

把样本协方差向「更稳定的结构」收缩（如对角线矩阵，假设策略间无相关）。Ledoit-Wolf (2004) 给出了最优 $\lambda$ 的封闭解。

```python
import numpy as np
from scipy.optimize import minimize

def mean_variance_optimize(expected_returns, cov_matrix, target_return=None):
    """均值-方差优化：给定目标收益率，求最小方差权重"""
    n = len(expected_returns)
    init_guess = np.ones(n) / n  # 从等权开始
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]
    if target_return is not None:
        constraints.append({'type': 'eq', 'fun': lambda w: np.dot(w, expected_returns) - target_return})
    bounds = [(0, 1) for _ in range(n)]
    result = minimize(lambda w: w @ cov_matrix @ w, init_guess,
                       method='SLSQP', bounds=bounds, constraints=constraints)
    return result.x

def shrink_covariance(returns_df, delta=0.3):
    """收缩协方差：Σ_shrink = δ×Σ_target + (1-δ)×Σ_sample"""
    sample_cov = returns_df.cov().values
    target_cov = np.diag(np.diag(sample_cov))  # 对角线协方差
    return delta * target_cov + (1 - delta) * sample_cov

def sharpe_ratio(weights, returns, cov, rf=0.02):
    return (np.dot(weights, returns) - rf) / np.sqrt(weights @ cov @ weights)

# 示例：4个策略的优化
np.random.seed(42)
n_days, n_strat = 252, 4
import pandas as pd
returns_df = pd.DataFrame(np.random.randn(n_days, n_strat) * 0.01 + [0.0003, 0.0001, 0.0002, 0.00005],
                           columns=[f'S{i}' for i in range(4)])
cov = shrink_covariance(returns_df, 0.3) * 252
exp_ret = returns_df.mean().values * 252
opt_w = mean_variance_optimize(exp_ret, cov)
print(f'最小方差组合权重: {np.round(opt_w, 3)}')
print(f'组合波动率: {np.sqrt(opt_w @ cov @ opt_w):.4f}')
print(f'组合 Sharpe: {sharpe_ratio(opt_w, exp_ret, cov):.3f}')
```

## 实战中的约束：理论 vs 工程

| 问题 | 原因 | 应对 |
|------|------|------|
| **整数手约束** | 期货按手交易，不能交易 0.73 手 | 优化后取整 |
| **换手限制** | 频繁调整权重产生成本 | 加入换手惩罚项 |
| **权重不稳定** | 优化器对历史数据极敏感 | 收缩协方差 + 滚动优化 |
| **再平衡频率** | 多久调整一次权重 | 月度最优 |

## 三种组合方法对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **等权重** | 最简单，不会过拟合 | 忽略策略质量差异 | 策略数量少 |
| **风险平价** | 平衡各策略风险贡献 | 可能低配高Sharpe策略 | 策略波动率差异大 |
| **均值-方差** | 理论上最优Sharpe | 对输入数据极敏感 | 协方差估计可靠时 |

> 实战派的组合管理往往是「等权重 + 每月检查」——大道至简。策略的「最优权重」本质上是不可预测的，不精确但稳健的解往往比精确但不稳定的解更有效。

:::highlight green
数学上的最优不一定是工程上的可行。均值-方差优化的精确解在理论上是最优的，但如果它的权重每周大幅变化、产生了巨额手续费——那这个「最优」在实际运行中就是个糟糕的选择。一个好的策略组合管理者，对数学原理理解足够深，但对工程约束诚实得足够多。
:::

::quiz{id="q_m8d"}
