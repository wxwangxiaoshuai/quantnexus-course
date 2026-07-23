上一节你学会了如何计算因子值。但怎么知道一个因子「真的有预测力」还是「只是噪音碰巧在一段历史上看起来不错」？这需要因子检验——量化研究最核心的验证步骤。

## 一、信息系数（Information Coefficient, IC）

IC 衡量「今天的因子值」与「明天的收益率」之间的相关性。

$$IC_t = \text{corr}(\text{factor}_{t}, \text{return}_{t+1})$$

- IC > 0：因子值高的品种，后续收益率也高 → 因子有效
- IC = 0：因子的排序和未来收益毫无关系 → 无效
- IC < 0：因子值高的品种反而后面跌 → 反向有效

**IC 的统计显著性检验**：

$$t_{\text{IC}} = \frac{\text{mean}(IC)}{\text{std}(IC) / \sqrt{N}}$$

$|t_{\text{IC}}| > 2$ 意味着在 95% 置信水平下，因子的预测力是统计显著的。

**IC 胜率**：IC 的正负号与预期方向一致的比例。如动量因子期望 IC > 0，则看 IC > 0 的月份占比。胜率 > 60% 较好。

```python
import numpy as np
from scipy import stats

def calculate_ic(factor_values, forward_returns):
    """
    计算信息系数 (IC)
    factor_values: Series, index=symbol, value=factor score
    forward_returns: Series, index=symbol, value=next period return
    """
    common = factor_values.index.intersection(forward_returns.index)
    if len(common) < 5:
        return None
    f = factor_values[common]
    r = forward_returns[common]
    ic, p_value = stats.spearmanr(f, r)
    return {'ic': ic, 'p_value': p_value, 'n_assets': len(common)}

def rolling_ic_analysis(factor_df, returns_df, periods=12):
    """
    滚动IC分析：计算每期的IC并汇总统计
    factor_df: DataFrame, index=date, columns=symbols, values=factor scores
    returns_df: DataFrame, index=date, columns=symbols, values=forward returns
    """
    ics = []
    for t in range(len(factor_df) - 1):
        result = calculate_ic(factor_df.iloc[t], returns_df.iloc[t + 1])
        if result:
            ics.append(result['ic'])
    ics = np.array(ics)
    ic_mean = np.mean(ics)
    ic_std = np.std(ics, ddof=1)
    ic_tstat = ic_mean / (ic_std / np.sqrt(len(ics)))
    ic_win_rate = np.mean(ics > 0)
    print(f"IC均值: {ic_mean:.4f}")
    print(f"IC t统计量: {ic_tstat:.2f} {'✅ >2' if abs(ic_tstat) > 2 else '❌ <2'}")
    print(f"IC胜率: {ic_win_rate:.1%}")
    return {'ic_mean': ic_mean, 'ic_tstat': ic_tstat, 'ic_win_rate': ic_win_rate, 'n_periods': len(ics)}
```

## 二、分层回测（Quantile Backtest）

只算一个 IC 还不够直观。分层回测是把所有品种按因子值从高到低切成 5 组（Q1—Q5），看每组等权持有后的累计收益。

**核心检验**：
- Q1（因子值最高）的收益是否 > Q5（因子值最低）的收益？
- 中间的 Q2、Q3、Q4 是否单调递减？

如果是，说明因子确实有「排序能力」——你越按照因子值排序交易，收益越稳定。

```
理想的分层回测结果：
Q1 ████████████████████ +45%
Q2 ██████████████ +28%
Q3 ██████████ +15%
Q4 ██████ +5%
Q5 ██ -10%
```

**Top-Bottom 因子组合**：做多 Q1、做空 Q5——这个「多空组合」的收益纯粹来自因子的排序能力，没有任何市场 Beta。

## 三、IC 衰减（IC Decay / Half-Life）

因子不是「永远有效」的。IC 会随着持有期的延长而衰减：

- Day 1：IC = 0.06
- Day 3：IC = 0.04
- Day 5：IC = 0.02
- Day 10：IC = 0.01
- Day 20：IC = -0.005（噪声）

**半衰期（Half-Life）**：IC 降到初始值一半所需的天数。半衰期越长 = 因子越持久 = 交易成本越低。

## 四、好的因子长什么样？

| 指标 | 优秀 | 合格 | 不合格 |
|------|------|------|--------|
| IC 均值 | > 0.05 | > 0.02 | < 0.02 |
| IC t-stat | > 3 | > 2 | < 2 |
| IC 胜率 | > 65% | > 55% | < 55% |
| 分层单调性 | Q1>Q2>Q3>Q4>Q5 | 大致递减 | 无规律 |
| Top-Bottom Sharpe | > 1.0 | > 0.5 | < 0.5 |
| IC 半衰期 | > 20天 | > 10天 | < 5天 |

> 警告：如果你同时满足所有「优秀」标准，先怀疑你的数据有没有未来函数泄漏——过于完美的因子在真实市场中几乎不存在。

:::highlight blue
好的因子：IC > 0.02, IC t-stat > 2, 分层回测单调递增, IC 衰减缓慢, 不容易被已知的其他因子解释。IC 均值高于 0.05 且稳定 > 0 的因子，在 CTA 领域已经是非常罕见的强因子。
:::

::quiz{id="q_m10b"}
