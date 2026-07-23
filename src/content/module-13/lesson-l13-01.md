## 项目二总览：从单品种到跨品种统计套利

项目一教你做单个品种的趋势跟踪——这是 CTA 策略最常见的形式。项目二带你进入另一个策略范式：**统计套利**。

**卷螺差是什么？**

螺纹钢（rb）和热轧卷板（hc）是钢铁产业链上的「兄弟品种」：
- 上游都是钢坯（由铁矿石 + 焦炭冶炼而成）
- 下游不同：螺纹钢 → 建筑工地（房地产、基建）；热卷 → 制造业（汽车、家电、机械）
- 正常情况下，热卷比螺纹钢贵 100-300 元/吨（热卷多了轧制工序）
- 价差 = hc - rb

**为什么价差会回归？**

如果卷螺差扩大到 400 元/吨（远超正常范围），钢厂会：
1. 多生产热卷（利润高）→ 热卷供给增加 → 热卷价格下跌
2. 少生产螺纹钢（利润低）→ 螺纹钢供给减少 → 螺纹钢价格上涨
3. 价差缩小回到正常范围

这是产业逻辑驱动的均值回归——比纯统计规律更可靠。

> 关联课程：m3l3「收益率分布」→ m3l4「时间序列」→ m8l1「套利范式」→ m10l2「因子检验」

## 步骤 1：下载两个品种数据

在数据中心（/data）分别下载：

| 品种 | 交易所 | 周期 | 时间范围 |
|------|--------|------|----------|
| rb（螺纹钢）| SHFE | 1d | 2023-01-01 ~ 2025-12-31 |
| hc（热轧卷板）| SHFE | 1d | 2023-01-01 ~ 2025-12-31 |

## 步骤 2：导出 CSV 做离线分析

在数据中心分别导出 rb 和 hc 的 CSV 文件。然后在 Python/Jupyter 中加载分析。

> 如果你在 m12l1 的课后任务中已经下载了 rb 数据，这一步只需要下载 hc。

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller, coint

# 1. 加载数据
rb = pd.read_csv("rb_1d.csv", parse_dates=["datetime"], index_col="datetime")
hc = pd.read_csv("hc_1d.csv", parse_dates=["datetime"], index_col="datetime")

# 2. 合并收盘价（只保留两个品种都有数据的日期）
df = pd.DataFrame({
    "rb_close": rb["close"],
    "hc_close": hc["close"]
}).dropna()

print(f"共有交易日: {len(df)} 天")
print(f"rb 价格范围: {df['rb_close'].min():.0f} ~ {df['rb_close'].max():.0f}")
print(f"hc 价格范围: {df['hc_close'].min():.0f} ~ {df['hc_close'].max():.0f}")

# 3. 估计 hedge ratio β（hc = α + β·rb + ε），用 OLS
from sklearn.linear_model import LinearRegression
beta = LinearRegression().fit(df[["rb_close"]], df["hc_close"]).coef_[0]
print(f"hedge ratio β = {beta:.3f}（若 β≈1 可近似 1:1 配对；β 偏离 1 时需按 β 配比）")

# 4. 计算价差（用 β 配比，而非隐含 1:1 的 hc - rb）
df["spread"] = df["hc_close"] - beta * df["rb_close"]

print(f"\n=== 卷螺差价差统计 ===")
print(f"均值: {df['spread'].mean():.0f} 元/吨")
print(f"标准差: {df['spread'].std():.0f} 元/吨")
print(f"最大值: {df['spread'].max():.0f} 元/吨")
print(f"最小值: {df['spread'].min():.0f} 元/吨")

# 4. 当前价差的 Z-score
current_spread = df["spread"].iloc[-1]
zscore = (current_spread - df["spread"].mean()) / df["spread"].std()
print(f"\n当前价差: {current_spread:.0f} 元/吨")
print(f"Z-score: {zscore:.2f}")
print(f"解读: ", end="")
if abs(zscore) > 2:
    print(f"⚠️ 价差异常偏离（{zscore:.1f}σ），存在交易机会")
elif abs(zscore) > 1:
    print(f"价差适度偏离（{zscore:.1f}σ），可以关注")
else:
    print(f"价差在正常范围（{zscore:.1f}σ），无交易信号")

# 5. 协整检验（rb 和 hc 是否存在长期均衡关系）
score, pvalue, _ = coint(df["rb_close"], df["hc_close"])
print(f"\n=== 协整检验 ===")
print(f"p-value: {pvalue:.4f}")
print(f"结论: {'✅ 协整关系成立，适合配对交易' if pvalue < 0.05 else '❌ 无协整关系，不适合配对交易'}")

# 6. 价差平稳性检验（ADF）
adf_stat, adf_pvalue, *_ = adfuller(df["spread"].dropna())
print(f"\n=== 价差平稳性检验 ===")
print(f"ADF p-value: {adf_pvalue:.4f}")
if adf_pvalue < 0.05:
    print("✅ 价差平稳（均值回归特性）——统计数据支持配对交易")
else:
    print("❌ 价差不平稳——不适合做均值回归策略")

# 7. 半衰期（均值回归速度，用于校准持仓周期与 exit_zscore）
# Ornstein-Uhlenbeck: spread_diff = φ · spread_lag + ε；half_life = ln(0.5)/ln(1-φ)
spread_lag = df["spread"].shift(1).dropna()
spread_diff = df["spread"].diff().dropna()
phi = LinearRegression().fit(
    spread_lag.values.reshape(-1, 1)[1:], spread_diff.values
).coef_[0]
half_life = np.log(0.5) / np.log(1 - phi) if phi < 1 else float("inf")
print(f"\n=== 半衰期 ===")
print(f"half_life = {half_life:.1f} 日（价差偏离衰减一半所需时间）")
print("解读: <3 日交易成本侵蚀、>20 日资金效率低；据此校准 exit_zscore 与预期持仓周期")

# 7. 价差分布的百分位数
df["spread_pct"] = df["spread"].rank(pct=True)
print(f"\n=== 价差分位数 ===")
print(f"当前价差处于历史 {df['spread_pct'].iloc[-1]:.0%} 分位")
print(f"90% 分位: {df['spread'].quantile(0.90):.0f}")
print(f"10% 分位: {df['spread'].quantile(0.10):.0f}")
```

## 步骤 3：判断价差是否适合配对交易

运行上面的代码后，看三个关键判断：

| 检验 | 判断标准 | 本案例预期 |
|------|----------|-----------|
| 协整检验 | p < 0.05 | ✅ p ≈ 0.02（rb 和 hc 有长期均衡关系）|
| 价差 ADF 平稳 | p < 0.05 | ✅ 价差有均值回归特性 |
| 价差波动范围 | 有足够交易空间 | ✅ σ ≈ 45 元/吨，±2σ = 90 元 |

**策略信号设计**：
- 价差 > 均值 + 2σ（约 270 元）：做空 hc + 做多 rb（等价差缩小）
- 价差 < 均值 - 2σ（约 90 元）：做多 hc + 做空 rb（等价差扩大）
- 价差回归均值 ± 0.5σ：平仓

> 配对交易的逻辑：买便宜的、卖贵的，等价差回归时两边都赚钱。

:::highlight blue
**卷螺差的经济学逻辑**：

- 螺纹钢 = 建筑用钢（受房地产和基建投资影响）
- 热卷 = 制造业用钢（受汽车、家电、机械制造影响）
- 当地产强、制造业弱 → 螺纹钢强、热卷弱 → 价差缩小
- 当制造业强、地产弱 → 热卷强、螺纹钢弱 → 价差扩大

**价差是「地产 vs 制造业」的宏观对冲**——你不是在赌钢价涨跌，而是在赌这两个产业的相对强弱变化。这是套利策略最优雅的地方：你不需要预测绝对价格，只需要预测相对关系。
:::

:::highlight green
**课后任务**：下载铁矿石 i（DCE）和焦炭 j（DCE）的数据，分析它们的价差是否适合配对交易。

提示：铁矿石和焦炭都是炼钢原料，但铁矿石是外矿（澳洲/巴西进口），焦炭是内矿（国内焦煤加工）。两者受不同因素影响——铁矿石受国际航运价格影响，焦炭受国内环保政策影响。
:::
