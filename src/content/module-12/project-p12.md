# CTA 趋势跟踪全流程

> 预计 **4–8 小时**（含实操） · 难度 **专家** · 双路径：离线脚本 / QuantNexus

## 定位说明

本项目是 **M12 五节项目课的总览与验收索引**。

:::highlight amber
**默认推荐：离线路径**（本仓库可独立完成）。平台路径需本地 QuantNexus + 数据源，作为加分项。
:::

## 路径 A · 离线毕业（推荐）

1. 准备螺纹钢日线 CSV（列：`datetime,open,high,low,close,volume`）
2. 运行：

```bash
python scripts/offline_capstone/m12_donchian_backtest.py --csv rb_1d.csv --n 40
```

3. 将收益 / Sharpe / 最大回撤记入验收笔记
4. 完成 L12-02 逻辑阅读、L12-04 风控参数表、L12-05 SOP（可用 Markdown，不强制平台）

## 路径 B · QuantNexus（可选）

按 L12-01～L12-05 在平台完成数据→回测→风控→模拟盘。

## 验收清单（满足其一路径即可）

- [ ] L12-01～L12-05 课节完成（或等价笔记）
- [ ] 离线脚本跑通并保存指标；**或** 平台回测通过
- [ ] 提交风控参数（日亏上限、仓位、止损）
- [ ] 完成上线前检查清单（可复用 P9）

## 反思

Walk-Forward 失败时，优先「换参数」还是「换逻辑」？为什么？

:::highlight blue
对外口径为「生产形态流程演练」，非开箱即用投研系统。
:::
