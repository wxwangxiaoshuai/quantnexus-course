策略研发不是灵感闪现，而是一个可重复的**科学流程**：

$$\text{观察} \longrightarrow \text{假设} \longrightarrow \text{实验} \longrightarrow \text{结论} \longrightarrow \text{重复}$$

**1. 观察**：发现市场中的规律性现象
- 用例：你注意到螺纹钢在每年 3 月（建筑旺季）经常上涨

**2. 假设**：提出可检验的假说
- 「我假设铁矿价格的涨跌对螺纹钢有 3-5 天的领先效应，因为铁矿是主要原料成本」
- 好的假设必须是**可证伪的**

**3. 实验**：用历史数据检验假设
- 定义检验方法：计算铁矿日度收益率与螺纹钢滞后收益的相关性
- **预设成功标准**（在看到结果之前！）：IC > 0.03, IC t-stat > 2

**4. 结论**：接受或拒绝假设
- 达标 → 进入样本外验证
- 不达标 → 记录、反思、存档——「这个信号无效」也是有价值的信息

**5. 重复**：修改假设或设计新实验

:::highlight blue
假设驱动研发的核心原则：永远从「我认为 X 是对的，理由是 Y」出发，而不是从「让我随机测试十万个参数组合看看哪个赚钱」出发。前一条路通向可解释的研究体系；后一条路通向过拟合死角。
:::

## P-Hacking：测试 100 个假设后只报告「成功」的那个

如果你测试了 100 个不同的策略变体，你有：

$$P(\text{至少有一个假阳性}) = 1 - (1 - 0.05)^{100} \approx 99.4\%$$

**你几乎一定会找到至少一个看起来惊艳的策略——即使所有策略都没有真实预测力**。

## 样本外协议的正确做法

**三步协议**：

$$\underbrace{[2017 \texttt{-} 2020]}_{\text{训练集 (50%)}} \ \big| \ \underbrace{[2021 \texttt{-} 2022]}_{\text{验证集 (25%)}} \ \big| \ \underbrace{[2023 \texttt{-} 2024]}_{\text{测试集 (25%)}}$$

- **训练集**：尽情实验、调参
- **验证集**：只能用一次——用来从多个候选策略中选出最优的
- **测试集**：只能用一次——用于最终评价。一旦看过，不可回改任何东西

> 把测试集想象成「未来」。你不可能回到未来去改你的策略。如果你在测试集上看了结果——无论好坏，接受它。

```python
import pandas as pd
import numpy as np

def out_of_sample_protocol(df, date_col='date', train_ratio=0.6, val_ratio=0.2):
    """严格时序分割——时间顺序必须保持"""
    dates = sorted(df[date_col].unique())
    n = len(dates)
    train_dates = dates[:int(n * train_ratio)]
    val_dates = dates[int(n * train_ratio):int(n * (train_ratio + val_ratio))]
    test_dates = dates[int(n * (train_ratio + val_ratio)):]
    
    print(f"训练集: {len(train_dates)}天 ({train_dates[0]} ~ {train_dates[-1]})")
    print(f"验证集: {len(val_dates)}天 ({val_dates[0]} ~ {val_dates[-1]})")
    print(f"测试集: {len(test_dates)}天 ({test_dates[0]} ~ {test_dates[-1]})")
    print("\n⚠ 协议规则：")
    print("  - 训练集: 任意使用")
    print("  - 验证集: 只能用一次，用于策略选择")
    print("  - 测试集: 只能用一次，用于最终报告。看过不可回改！")
    
    return (
        df[df[date_col].isin(train_dates)],
        df[df[date_col].isin(val_dates)],
        df[df[date_col].isin(test_dates)]
    )
```

## 研究日志（Research Journal）

专业量化团队维护研究日志，记录每次实验：

| 记录项 | 内容示例 |
|--------|----------|
| **日期** | 2024-03-15 |
| **假设** | 铁矿对螺纹钢有3-5天领先效应 |
| **成功标准** | IC > 0.03 且 t-stat > 2 且 IS Sharpe > 0.8（三条全满足才算达标）|
| **结果** | Lag=4的IC=0.041, t-stat=2.21, IS Sharpe=0.72（未达标） |
| **结论** | 领先效应存在但预测力不足。归档为候选信号 |

**研究日志的意义**：防止重复劳动、防止幸存者偏误（失败的实验同样有信息量）、可审计、积累知识。

:::highlight green
好的量化研究员不是更聪明，而是更自律——他们用流程而非直觉来防止自欺欺人。P-hacking、数据窥探、选择性报告——这些不是技术缺陷，是人性缺陷。克服它们的方法是一套不可商量的流程纪律：写假设、预设标准、锁定样本外、记录一切尝试。
:::

::quiz{id="q_m8e"}
