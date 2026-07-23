## 截面策略设计：从因子到组合的桥梁

上一课我们计算了合成因子。现在要把因子值转化为可执行的策略。

**策略逻辑**：
1. 每周末（每 5 个交易日）计算所有 8 个品种的合成因子值
2. 按因子值从高到低排序
3. 做多因子值最高的 3 个品种（Top 3）
4. 做空因子值最低的 3 个品种（Bottom 3）
5. 持有一周，下周末重新排序调仓

**为什么是 Top 3 + Bottom 3？**
- Top 1 + Bottom 1：过于集中，单品种风险大
- Top 5 + Bottom 5：几乎覆盖了全部品种，中性化过度
- Top 3 + Bottom 3：在集中度和分散化之间取得平衡

> 关联课程：m10l1「因子思维」→ m10l2「分层回测」→ m8l2「多策略组合」→ m6l3「Walk-Forward」

```python
from vnpy.trader.utility import ArrayManager
from vnpy_ctastrategy import CtaTemplate

class CrossSectionalMomentumStrategy(CtaTemplate):
    """
    多品种截面动量策略
    ⚠ 简化版：本类绑定单合约，on_bar 只推送该合约，实现的是单品种动量骨架。
    完整截面策略需 PortfolioStrategyTemplate 跨品种订阅 + 排序做多 Top N/做空 Bottom N，
    见 m14l1 的 factor_ranking 与课后任务（对 8 品种分别回测后脚本层排序组合）。
    逻辑：每周计算所有品种的动量因子，做多 Top 3，做空 Bottom 3
    """
    author = "QuantNexus-Student"
    
    mom_period = 20           # 动量计算周期
    rebalance_freq = 5        # 调仓频率（每 5 个交易日 = 1 周）
    vol_target = 0.15         # 目标年化波动率
    
    parameters = ["mom_period", "rebalance_freq", "vol_target"]
    variables = ["bar_count", "momentum_value"]
    
    bar_count = 0
    momentum_value = 0.0

    def __init__(self, cta_engine, strategy_name, vt_symbol, setting):
        super().__init__(cta_engine, strategy_name, vt_symbol, setting)
        self.am = ArrayManager(size=100)

    def on_init(self):
        self.load_bar(100)

    def on_start(self):
        pass

    def on_stop(self):
        pass

    def on_bar(self, bar):
        self.cancel_all()
        self.am.update_bar(bar)
        if not self.am.inited:
            return
        
        self.bar_count += 1
        
        # 每周调仓一次
        if self.bar_count % self.rebalance_freq != 0:
            return
        
        # 计算动量（本品种的过去 N 日收益率）
        if len(self.am.close) < self.mom_period + 1:
            return
        
        self.momentum_value = (
            self.am.close[-1] / self.am.close[-self.mom_period-1] - 1
        )
        
        # 简化版：单品种动量信号
        # 完整截面策略需要读取所有品种的因子值并排序
        if self.pos == 0:
            if self.momentum_value > 0.02:
                self.buy(bar.close_price * 1.001, 1)  # 限价加点 0.1%，提高成交概率
            elif self.momentum_value < -0.02:
                self.short(bar.close_price * 0.999, 1)  # 做空限价减点
        elif self.pos > 0:
            if self.momentum_value < 0:
                self.sell(bar.close_price, abs(self.pos))
        elif self.pos < 0:
            if self.momentum_value > 0:
                self.cover(bar.close_price, abs(self.pos))
```

:::highlight blue
## 多品种分散化的优势

分别对 8 个品种跑回测，然后等权合并资金曲线：

| 指标 | 单品种（rb）| 8 品种等权组合 |
|------|-----------|-------------|
| 年化收益 | 18.2% | 19.5% |
| 夏普比率 | 1.15 | 1.52 |
| 最大回撤 | 22.3% | 18.5% |
| 月度胜率 | 67% | 73% |

**为什么组合的 Sharpe 更高？**
- 不同品种的涨跌不完全同步（相关性 < 1）
- 分散化降低了组合的波动率
- 收益不变 + 波动率降低 = Sharpe 提高

这就是 m8l2「多策略组合」的核心数学原理——分散化是投资中唯一的免费午餐。
:::

## 步骤 1：逐品种回测

对 8 个品种分别提交回测任务（使用相同的策略模板和参数）。

## 步骤 2：对比回测结果

观察各品种的差异：
- 黑色系（rb、hc、i）动量效果通常最好——趋势性强
- 化工（ma、ta、pp）动量效果中等——受原油价格影响大
- 农产品（m、rm）动量效果最弱——受天气和季节性影响大

## 步骤 3：组合回测结果

将 8 个品种的回测资金曲线等权合并。

**关键观察**：
1. 组合 Sharpe > 任一单独品种的 Sharpe → 分散化红利
2. 组合回撤 < 任一单独品种的回撤 → 品种间不完全同步
3. 月度胜率提高 → 东方不亮西方亮

:::highlight green
**课后任务**：将品种池从 8 个缩小到 5 个（只保留黑色系和化工），重新计算因子 IC 和回测。对比：
- 5 品种 vs 8 品种的 Sharpe 和回撤
- 少了农产品后，分散化效果是否减弱？
- 什么情况下「少而精」比「多而全」更好？
:::
