学到这里，你有了 Tick 数据认知（m3l1）、K 线聚合方法（m3l2）、收益率统计特征（m3l3）、时间序列探索工具（m3l4）。现在把所有串起来——一条完整的**数据管线（Data Pipeline）**。

**量化交易的核心竞争力从来不是「哪个因子牛逼」，而是「谁的数据更干净、更快、更可靠」**。信噪比不是在策略代码里产生的，而是在数据管线里决定的。

**数据管线全景图**：

```
行情源 → 录制(Gateway) → 原始存储 → 清洗&校验 → 聚合(K线) → 主题存储 → 回测/实盘
  |          |               |            |            |           |            |
 CTP/      vn.py           Raw DB    去重+排序   OHLCV聚合   Clean DB    Strategy
 数据商   on_tick()                     异常检测+                           Engine
                                    缺失处理+复权
```

**六种常见的「脏数据」形态**：

**问题 1：缺失数据** — 某分钟没成交 → K 线「不存在」。策略计算的 SMA 窗口内数据点数不对。
→ 前向填充，标记 is_imputed=True

**问题 2：价格异常** — 某个 tick 价格是正常的 10 倍。一根 K 线含了这个 tick，High/Low 被拉得极宽，ATR 和布林带全失真。
→ 价格波动阈值（涨跌停板 × 1.2），超出丢弃

**问题 3：重复数据** — 网关重连后重复发送 tick，成交量被重复计算。
→ (symbol, exchange, datetime, price, volume) 五元组唯一约束

**问题 4：时间戳乱序** — tick A 交易晚于 B，但因网络延迟 A 先到。
→ 以交易所时间戳为准，聚合前排序

**问题 5：非交易时段噪声** — 集合竞价的试探性委托产生 ghost tick
→ 过滤交易时段外。日盘：9:00-10:15, 10:30-11:30, 13:30-15:00

**问题 6：成交量异常** — 某个 tick 成交量极高（数据商重复计数）
→ 设成交量上限（合约总持仓量 5%），超出标记可疑

```python
import pandas as pd
import numpy as np

def full_data_quality_check(bars):
    """对K线数据做全维度质量检查"""
    issues = {
        'total_rows': len(bars),
        'missing_close': bars['close'].isna().sum(),
        'zero_volume': (bars['volume'] == 0).sum(),
        'high_lt_low': (bars['high'] < bars['low']).sum(),
        'duplicate_timestamps': bars.index.duplicated().sum(),
    }
    # 价格跳空检测
    returns = bars['close'].pct_change()
    issues['price_jumps'] = (returns.abs() > 5 * returns.std()).sum()
    # 极端成交量（>均值10倍）
    vol_mean = bars['volume'].mean()
    if vol_mean > 0:
        issues['extreme_volume'] = (bars['volume'] > vol_mean * 10).sum()
    total = sum(v for k, v in issues.items() if isinstance(v, (int, float)) and k != 'total_rows')
    issues['pass'] = total == 0
    print(f"数据质量: {'✅ 通过' if issues['pass'] else f'⚠ 发现 {total} 个问题'}")
    return issues
```

**复权——期货数据的「连续化手术」深度详解**

期货每几个月就换一个新主力合约，你不能直接把 rb2405 和 rb2501 的收盘价拼在一起。

**前复权**：保持最新（当前）合约价格不变，用新旧合约价差反向修正所有历史：
$$P_t^{\text{adj}} = P_t - \sum_{i=\text{roll}_t}^{\text{last roll}} \Delta_i$$
→ 当前价格与实时行情一致，适合**实盘策略**（CTA 回测最常用）

**后复权**：保持最早合约价格不变，向后修正所有后续价格：
$$P_t^{\text{adj}} = P_t + \sum_{i=\text{first roll}}^{\text{roll}_t} \Delta_i$$
→ 历史起点真实、当前价不等于市价，适合计算**长期累计收益率**

> 记忆口诀：「前」复权钉住当前价改历史，「后」复权钉住最早价改后面。
> 实务建议：日线策略用换月日收盘价差；分钟级策略用换月当日 VWAP 差。

**存储架构——为什么关系型数据库不适合 Tick 数据？**

螺纹钢一天 ~43,000 条 tick。3 年 = 3,200 万条。50 个品种 × 3 年 = 16 亿条。

**PostgreSQL 为什么吃力？** 行级事务的 ACID 开销在「每秒数百条 tick」场景下巨大。16 亿条数据的时间范围查询需要巨额索引扫描。

**时序数据库为什么更好？**
- **ClickHouse**：列式存储 + 向量化执行 → 聚合查询快 10-100 倍。国内量化圈广泛使用
- **InfluxDB**：专为时间序列设计的 TSM 存储引擎
- **QuestDB**：SQL 语法接近 PostgreSQL，迁移成本低
- **TimescaleDB**：PostgreSQL 扩展，自动时间分区——适合「不想换数据库但要提升性能」

> 先不要因为性能问题就疯狂学习 ClickHouse。如果你只存 5 分钟 K 线（约 48 根/天），3 年 = 3.6 万行——PostgreSQL 完全能搞定。**数据粒度选择决定了你的存储架构**。

:::highlight green
脏数据进 = 垃圾信号出。数据清洗不是可选项，是策略的起跑线。一个花三周调优的策略，如果喂进去的数据有 5% 价格异常和 10% 缺失填充——你优化的不是市场规律，是数据噪声。量化交易的两条起跑线：劣质线「回测完美，实盘亏钱」；优质线「数据干净，回测还行，实盘吻合」。选择哪个，决定你是「回测王者」还是「实盘赢家」。
:::

::quiz{id="q_m3e"}
