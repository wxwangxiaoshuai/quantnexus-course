---
id: m12l2
title: 项目一·策略原型：从 DualMa 模板改造为动量突破策略
duration: 40 分钟
module: m12
moduleTitle: 第十二模块：CTA 趋势跟踪实战
elective: false
order: 58
quiz:
  - id: q_m12c
    slot: 1
---

## 策略设计：为什么选唐奇安通道突破？

在 m5l4 中，你学习了双均线、动量突破、均值回归等策略类型。在 m12l3 中，你将在回测中验证这个策略。但首先——你需要理解**为什么**选这个策略，而不是随便试一个。

**唐奇安通道（Donchian Channel）** 是海龟交易法则的核心工具：
- 上轨 = 过去 N 日的最高价 → 突破做多
- 下轨 = 过去 N 日的最低价 → 跌破做空

**为什么在螺纹钢上用这个策略？**
1. 黑色系商品（螺纹钢、铁矿石、焦炭）具有明显的趋势性——产业链信息传递有滞后，价格趋势一旦形成会持续数周
2. 唐奇安通道天然带有「突破确认」和「止损」双重功能——下轨可以做多单的止损参考
3. 策略逻辑简单透明，不容易过拟合（参数只有 N 一个核心变量）

**我们的改进版**：在原始唐奇安通道基础上加入两个过滤器：
- **ADX 过滤器**：ADX > 25 才允许交易（过滤震荡市，减少假突破）
- **ATR 动态止损**：用 ATR 的倍数做止损距离（市场波动大时止损放宽，波动小时止损收紧）

> 关联课程：m4l3「ADX/ATR 唐奇安通道」→ m5l1「策略就是纯函数」→ m5l2「下单技术架构」

## 步骤 1：查看内置模板

打开「策略工作台」（/strategy），点击「从模板创建」。系统内置了 **DualMaStrategy（双均线交叉策略）** 模板。

先查看一下默认代码：
- `fast_window = 5`：快线周期
- `slow_window = 20`：慢线周期
- `on_bar()` 方法：每根 K 线回调，计算快慢均线，金叉买入、死叉卖出

这个模板的代码结构是所有 vn.py CTA 策略的标准骨架——`on_init` / `on_start` / `on_stop` / `on_bar` / `on_order` / `on_trade`。我们的策略也遵循完全相同的结构，只是 `on_bar` 里的逻辑不同。

## 步骤 2：Fork 模板并改造

在「策略模板」（/strategy-templates）页面，找到 DualMaStrategy，点击「Fork 内置模板」。这会创建一个可编辑的副本。

在 Monaco 编辑器中，将代码替换为下面的 DonchianBreakoutStrategy：

```python
from vnpy.trader.utility import ArrayManager
from vnpy_ctastrategy import CtaTemplate


class DonchianBreakoutStrategy(CtaTemplate):
    """
    唐奇安通道突破策略
    核心逻辑：价格突破 N 日最高价做多，跌破 N 日最低价做空
    过滤器：ADX > 25 确认趋势，避免震荡市假突破
    止损：ATR 动态止损，市场波动大时放宽
    """
    author = "QuantNexus-Student"
    
    # 策略参数（可在创建实例时修改）
    breakout_period = 40      # 突破周期（日）
    adx_period = 14           # ADX 计算周期
    adx_threshold = 25        # ADX 阈值（低于此值不交易）
    atr_period = 20           # ATR 计算周期
    atr_stop_mult = 2.0       # 止损 = ATR × 倍数
    
    parameters = [
        "breakout_period", "adx_period", "adx_threshold",
        "atr_period", "atr_stop_mult"
    ]
    variables = ["adx_value", "atr_value", "entry_price"]
    
    adx_value = 0.0
    atr_value = 0.0
    entry_price = 0.0

    def __init__(self, cta_engine, strategy_name, vt_symbol, setting):
        super().__init__(cta_engine, strategy_name, vt_symbol, setting)
        self.am = ArrayManager(size=100)

    def on_init(self):
        """策略初始化：加载历史数据"""
        self.load_bar(100)

    def on_start(self):
        pass

    def on_stop(self):
        pass

    def on_bar(self, bar):
        """每根 K 线回调——策略核心逻辑"""
        self.cancel_all()
        self.am.update_bar(bar)
        if not self.am.inited:
            return
        
        # 计算唐奇安通道（取前 N 日，排除当前 bar，否则 close ≤ 当日 high ≤ channel.max() 会使突破信号几乎永不触发）
        high_channel = self.am.high[-self.breakout_period - 1 : -1].max()
        low_channel = self.am.low[-self.breakout_period - 1 : -1].min()
        
        # 计算 ATR（用于动态止损）
        atr = self.am.atr(self.atr_period)
        self.atr_value = atr
        
        # 计算 ADX（趋势过滤器）
        self.adx_value = self.am.adx(self.adx_period)
        
        # ---- 交易逻辑 ----
        if self.pos == 0:
            # 空仓：等待突破信号
            if self.adx_value > self.adx_threshold:
                if bar.close_price > high_channel:
                    self.buy(bar.close_price, 1)
                    self.entry_price = bar.close_price
                elif bar.close_price < low_channel:
                    self.short(bar.close_price, 1)
                    self.entry_price = bar.close_price
        
        elif self.pos > 0:
            # 持有多头：通道下轨或 ATR 止损
            stop_price = self.entry_price - self.atr_stop_mult * atr
            if bar.close_price < low_channel or bar.close_price < stop_price:
                self.sell(bar.close_price, abs(self.pos))
                self.entry_price = 0.0
        
        elif self.pos < 0:
            # 持有空头：通道上轨或 ATR 止损
            stop_price = self.entry_price + self.atr_stop_mult * atr
            if bar.close_price > high_channel or bar.close_price > stop_price:
                self.cover(bar.close_price, abs(self.pos))
                self.entry_price = 0.0

    def on_order(self, order):
        """委托状态变化回调"""
        pass

    def on_trade(self, trade):
        """成交回调"""
        pass
```

:::highlight blue
**策略设计要点——与课程模块的对应**：

| 代码元素 | 对应课程 | 设计意图 |
|----------|----------|----------|
| `ArrayManager` | m4l1「均线」 | vn.py 的数组管理器，自动计算 SMA/ATR/ADX 等指标 |
| `breakout_period = 40` | m4l3「唐奇安通道」 | 40 日通道 = 约 2 个月的趋势判断周期 |
| `adx_threshold = 25` | m4l3「ADX 指标」 | ADX > 25 确认趋势可靠，< 20 为震荡市 |
| `atr_stop_mult = 2.0` | m4l3「ATR 指标」+ m7l2「止损」 | 2 倍 ATR 止损 = 给价格足够的「呼吸空间」|
| `self.buy() / self.short()` | m5l2「下单技术架构」 | 发送委托请求，不代表立刻成交 |
| `on_trade()` 回调 | m5l2「下单技术架构」 | 成交回报到达后才更新仓位 |

**关键认知**：`self.buy(bar.close_price, 1)` 只是「发送委托」，不是「立刻成交」。真正的仓位变化在 `on_trade` 回调触发之后。实盘中，委托可能被拒单、部分成交、或延迟成交——这就是回测和实盘之间永远存在的差距。
:::

## 步骤 3：保存模板

点击「保存」按钮。系统会自动记录版本（v1）。后续每次修改代码并保存，都会生成新版本（v2, v3...），你可以在版本历史中查看和对比。

## 步骤 4：创建策略实例

基于刚创建的模板，创建策略实例：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 名称 | `DonchianBreakout_rb` | 策略实例名称 |
| 合约 | `rb888.SHFE` | 螺纹钢主力连续合约（覆盖回测全程，避免单合约到期）|
| 参数 | 保持默认 | 回测阶段再调优 |
| bar_source | `shinny` | 数据源 |

创建后策略状态为 `draft`（草稿）。下一步——在回测系统中验证它。

:::highlight green
**课后任务**：将 `breakout_period` 改为 20 和 60，分别创建两个策略实例。思考：
- 周期越短（20 日），交易信号越多，手续费占比越高
- 周期越长（60 日），交易信号越少，但可能错过中期趋势
- 哪个更优？——下一课的回测会给你答案
:::

<!-- quiz:1 -->
