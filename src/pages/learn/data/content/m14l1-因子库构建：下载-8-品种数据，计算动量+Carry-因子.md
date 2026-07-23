---
id: m14l1
title: 因子库构建：下载 8 品种数据，计算动量+Carry 因子
duration: 40 分钟
module: m14
moduleTitle: 第十四模块：多因子截面策略
elective: false
order: 65
quiz:
  - id: q_m14
    slot: 1
---

## 项目三总览：从单策略到多策略组合

项目一教你做单品种趋势跟踪，项目二教你做双品种套利。项目三把视野扩大到 **8 个品种的多因子截面策略**——这是职业量化基金的标准做法。

**截面策略 vs 时间序列策略**：
- 时间序列（项目一）：这个品种什么时候买？→ 回答 **WHEN**
- 截面（项目三）：在 8 个品种中，哪些更值得做多？哪些应该做空？→ 回答 **WHICH**

截面策略的优势：
- 多品种分散化 → 降低单一品种的特定风险
- 因子思维 → 系统性搜索 alpha，而不是一个一个试策略
- 职业量化基金的标准操作模式

**品种池**（8 个活跃期货品种）：

| 板块 | 品种 | 代码 | 交易所 |
|------|------|------|--------|
| 黑色系 | 螺纹钢 | rb | SHFE |
| 黑色系 | 热轧卷板 | hc | SHFE |
| 黑色系 | 铁矿石 | i | DCE |
| 化工 | 甲醇 | ma | CZCE |
| 化工 | PTA | ta | CZCE |
| 化工 | 聚丙烯 | pp | DCE |
| 农产品 | 豆粕 | m | DCE |
| 农产品 | 菜粕 | rm | CZCE |

> 跨板块的品种选择是有意为之——同板块品种相关性高，不同板块之间相关性低，能提供更好的分散化效果。

> 关联课程：m10l1「因子思维」→ m10l2「因子检验」→ m10l3「因子合成」→ m3l5「数据管线」

## 步骤 1：下载 8 个品种的 3 年日线数据

在数据中心（/data）逐品种下载，全部使用：
- 周期：`1d`（日线）
- 时间范围：`2023-01-01 ~ 2025-12-31`

> 如果你在项目一和项目二中已经下载了 rb、hc、i，这一步只需要下载 ma、ta、pp、m、rm 五个品种。

## 步骤 2：导出所有品种数据

逐个导出 CSV，合并为统一格式的 DataFrame（date × symbols）。

```python
import pandas as pd
import numpy as np
from scipy import stats

# 1. 加载并合并所有品种的收盘价
symbols = ["rb", "hc", "i", "ma", "ta", "pp", "m", "rm"]
prices = {}
for sym in symbols:
    df = pd.read_csv(f"{sym}_1d.csv", parse_dates=["datetime"], index_col="datetime")
    prices[sym] = df["close"]

prices_df = pd.DataFrame(prices).dropna()
print(f"共有交易日: {len(prices_df)} 天")
print(f"品种数量: {len(symbols)}")

# 2. 计算动量因子（20 日和 60 日）
def momentum_factor(prices_df, lookback=20):
    """过去 N 日的收益率"""
    return prices_df.pct_change(lookback)

mom_20 = momentum_factor(prices_df, 20)
mom_60 = momentum_factor(prices_df, 60)

# 3. 计算波动率因子（低波动率 = 高因子值）
def volatility_factor(prices_df, window=20):
    """负波动率：低波动品种得高分"""
    return -prices_df.pct_change().rolling(window).std()

vol_20 = volatility_factor(prices_df, 20)

# 4. 计算下期收益率
forward_returns = prices_df.pct_change().shift(-1)

# 5. 因子 IC 计算
def calculate_ic(factor_df, forward_returns):
    """计算每个截面上的 IC（Spearman 秩相关）"""
    ics = []
    for date in factor_df.index[:-1]:
        f = factor_df.loc[date].dropna()
        r = forward_returns.loc[date].dropna()
        common = f.index.intersection(r.index)
        if len(common) < 5:  # 至少需要 5 个品种（与 m10l2 一致，n=4 时 Spearman 无统计意义）
            continue
        ic, pvalue = stats.spearmanr(f[common], r[common])
        ics.append({"date": date, "ic": ic, "pvalue": pvalue})
    return pd.DataFrame(ics)

ic_mom20 = calculate_ic(mom_20, forward_returns)
ic_mom60 = calculate_ic(mom_60, forward_returns)
ic_vol20 = calculate_ic(vol_20, forward_returns)

# 6. 因子 IC 汇总
print("\n=== 因子 IC 汇总（8 品种截面）===")
for name, ic_df in [("动量 20 日", ic_mom20), ("动量 60 日", ic_mom60), ("波动率 20 日", ic_vol20)]:
    ic_mean = ic_df["ic"].mean()
    ic_std = ic_df["ic"].std()
    n = len(ic_df)
    tstat = ic_mean / (ic_std / np.sqrt(n)) if ic_std > 0 else 0
    win_rate = (ic_df["ic"] > 0).mean()
    print(f"{name}: IC={ic_mean:.4f}, t-stat={tstat:.2f}, 胜率={win_rate:.1%}")

# 7. 因子间相关性
factor_vals = pd.DataFrame({
    "mom_20": mom_20.iloc[-1].dropna(),
    "mom_60": mom_60.iloc[-1].dropna(),
    "vol_20": vol_20.iloc[-1].dropna(),
})
print("\n=== 因子间相关系数矩阵 ===")
print(factor_vals.corr().round(3))
```

:::highlight blue
## 因子筛选标准

计算出所有因子的 IC 后，按以下标准筛选：

| 标准 | 阈值 | 说明 |
|------|------|------|
| IC 绝对值 | \|IC\| > 0.03 | 因子有最起码的预测力 |
| IC t-statistic | \|t-stat\| > 2 | 预测力在 95% 置信水平下统计显著 |
| IC 胜率 | > 55% | IC 的正负号与预期方向一致的比例 |
| 因子间相关性 | < 0.7 | 与其他保留因子不高度冗余 |

**淘汰标准**：
- ❌ t-stat < 2 → 预测力未达 95% 显著，放弃
- ❌ 胜率 < 55% → 方向不稳定，放弃
- ❌ 与已保留因子相关性 > 0.7 → 冗余，保留 IC 更高的那个

最终保留 3-4 个独立因子，做等权合成。

> 这对应 m10l3「因子合成」的内容——合成因子的 IC 通常高于任一单独因子，因为不同因子捕捉了不同的 alpha 来源。
:::

## 步骤 3：合成因子

将筛选后的因子等权合成：

`combined_factor = (mom_20_zscore + mom_60_zscore + vol_20_zscore) / 3`

注意：合成前需要将每个因子标准化（Z-score），消除量纲差异。

计算合成因子的 IC：通常高于任一单独因子（因为不同因子捕捉了不同的 alpha 来源，合成后信号更稳定）。

## 为什么选 8 个品种？

- 太少（< 5 个）：截面排序的统计效力不足
- 太多（> 20 个）：数据下载和管理工作量太大，且部分品种流动性差
- 8 个跨板块品种：在分散化和可管理性之间取得平衡

:::highlight green
**课后任务**：尝试加入一个自己的因子——比如 RSI 因子（14 日 RSI 的倒数，RSI 越低 = 越超卖 = 因子值越高）。计算 IC 并判断是否有效、是否与现有因子冗余。

提示：如果 RSI 因子与动量因子相关性 > 0.7，说明它没有提供新的信息——它只是在重复动量因子已经捕捉到的信号。
:::

<!-- quiz:1 -->
