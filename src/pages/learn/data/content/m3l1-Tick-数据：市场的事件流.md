---
id: m3l1
title: Tick 数据：市场的事件流
duration: 17 分钟
module: m3
moduleTitle: 第三模块：行情数据
elective: false
order: 11
interactive:
  - ref: TickToKBar
    slot: 1
quiz:
  - id: q_m3
    slot: 1
---

**程序员类比**：市场行情就是一条无限流式的事件流（Stream）。每一次成交或者盘口变化，都会产生一个 Tick 事件。

```typescript
interface TickData {
  symbol: string;       // 合约代码
  datetime: Date;       // 时间戳（精确到毫秒）
  lastPrice: number;    // 最新成交价
  volume: number;       // 本次成交量（手）
  openInterest: number; // 持仓量（全市场未平仓合约总量）
  bidPrice1: number;    // 买一价
  askPrice1: number;    // 卖一价
  bidVolume1: number;   // 买一量
  askVolume1: number;   // 卖一量
}
```

活跃合约每秒可能产生几十个 tick，一天交易时段（约 4 小时）下来，一个品种的 tick 数据可以达到数十万条。这就是为什么数据存储和处理效率对量化系统很重要。

**持仓量（Open Interest, OI）——期货特有的核心指标**：

持仓量 = 全市场所有未平仓合约的总量。一手多头必然对应一手空头，「一对」多空算作 1 手持仓——这叫**单边计量**。国内四大期货交易所（上期所、大商所、郑商所、中金所）目前**均采用单边计量**（历史上大商所、郑商所曾用双边计量，后已统一为单边）。所以你看到的持仓量数字，就是多头总量（= 空头总量），不需要再除以 2。

**程序员的 OI 模型**：
- 开多仓 + 开空仓同时成交 → OI +1（新钱进场）
- 平多仓 + 平空仓同时成交 → OI -1（资金离场）
- 平多仓 + 新多仓（换手） → OI 不变（只是换了人）

**如何使用 OI 判断市场情绪**：

| 价格变化 | OI 变化 | 市场含义 |
|----------|---------|----------|
| 价格上涨 | OI 增加 | 多头主动进场，趋势可能延续（新钱持续流入） |
| 价格上涨 | OI 减少 | 空头止损平仓推动的价格上涨，趋势可能尾声 |
| 价格下跌 | OI 增加 | 空头主动进场，下跌动能强 |
| 价格下跌 | OI 减少 | 多头恐慌平仓导致的下跌，可能接近底部 |

> OI 是你做量化分析时最有价值的「非价格」数据之一。价格告诉你「where the market is」，成交量告诉你「what happened」，持仓量告诉你「who is behind it」。三者结合看，胜率才能上去。

**Tick 数据的来源与处理流程**：

你的量化系统的「数据管道」大概是这样的：

```
交易所行情网关 → vn.py Gateway（CTP 等） → MainEngine on_tick 回调 → DataRecorder → 本地数据库（SQLite/ClickHouse/TimescaleDB）
```

每个环节都可能出问题：
- **网络丢包**：交易所推送的 tick 可能在网络层丢失（udp 尤其是）
- **时间戳乱序**：网络延迟导致 tick 到达顺序 ≠ 发生顺序
- **重复数据**：网关重连后可能重复发送历史 tick
- **非交易时段 ghost tick**：集合竞价期的试探委托产生的 tick 没有参考价值

> 数据清洗对量化策略来说，就像单元测试对代码一样重要。你用脏数据跑回测 = 你用 bug 的代码部署到生产环境。我们会在模块 6（回测）中展开数据质量检查的方法。

**盘口深度（Market Depth / Level 2 Data）**：

前面的 TickData 接口里，你看到了 `bidPrice1/askPrice1`——这表示买一价和卖一价。但真正的盘口深度远不止一层：

国内 CTP 接口一般提供**五档行情**（Level 1 × 5）：买一到买五、卖一到卖五的价格和挂单量。

盘口深度数据的价值：
- **挂单量分析**：卖五挂 5000 手 vs 卖五挂 5 手——前者意味着上方有巨大卖压，价格突破需要更多动能
- **大单识别**：突然出现或消失的大额挂单（Iceberg Order / 冰山委托）可能揭示机构的意图
- **Order Flow 分析**：通过盘口挂单量的变化速率判断买卖压力

> 注意：Level 2 数据量非常大。一个品种的五档行情每秒可能达百次更新，存储一天的完整 L2 数据比纯 tick 数据大 5-10 倍。合理选择数据粒度是量化系统架构的重要决策。

**VWAP（成交量加权平均价）**：

VWAP 是一个比简单均价更有意义的「公平价格」——它把成交量作为权重，大成交量的价位有更大的话语权。

```python
def vwap(trades: list[tuple[float, float]]) -> float:
    """
    trades: [(price, volume), ...]  — 一段时间内的所有成交
    返回: VWAP = Σ(price_i × volume_i) / Σ(volume_i)
    """
    total_value = sum(p * v for p, v in trades)
    total_volume = sum(v for _, v in trades)
    return total_value / total_volume if total_volume else 0
```

VWAP 的实战意义：
- 机构大单通常以 VWAP 为基准执行，目标是把订单拆散后以接近 VWAP 的价格成交
- 如果你的成交价比当日 VWAP 好（做多时成交价 < VWAP），说明你的执行质量优秀
- VWAP 本身可以作为动态支撑/阻力位

> 对于个人量化交易者，VWAP 不是必须的计算。但理解这个概念能帮你读懂市场上「聪明钱」是怎么执行交易的。

<!-- interactive:1 -->

<!-- quiz:1 -->
