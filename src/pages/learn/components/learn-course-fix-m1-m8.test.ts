/**
 * learn-course-fix-m1-m8 内容自检测试
 *
 * 断言 V5 审查报告 M1-M8 基础模块 P1+P2 修复后的不变量。
 * 用 import.meta.glob ?raw 读源码字符串，避免引入 node:fs。
 */
import { describe, expect, it } from "vitest";

import { COURSE_SOURCE } from "./__course_source";

const SOURCE = COURSE_SOURCE;

describe("m1-m8 · P1-1 涨跌停规则全文一致", () => {
  it("m1l2 不再用旧的'只能平多不能开多'表述", () => {
    expect(SOURCE).not.toContain("只能平多不能开多");
    expect(SOURCE).not.toContain("只能平空不能开空");
  });
  it("m1l2 采用与 m2l3 一致的口径（可卖出开仓/不可买入开仓）", () => {
    expect(SOURCE).toContain("涨停板可卖出平仓/卖出开仓");
    expect(SOURCE).toContain("不可买入开仓");
  });
});

describe("m1-m8 · P1-2 螺纹钢无夜盘已修正", () => {
  it("m2l4 隔夜示例不再标螺纹钢无夜盘", () => {
    expect(SOURCE).not.toContain("螺纹钢，无夜盘");
  });
  it("改用真正无夜盘品种（股指 IF）", () => {
    expect(SOURCE).toContain("股指期货 IF，无夜盘");
  });
});

describe("m1-m8 · P1-3 海龟 ATR 仓位公式含合约乘数", () => {
  it("公式分母含合约乘数", () => {
    // md 文件里 LaTeX 是单反斜杠（\text），JS 断言匹配单反斜杠用 \\。
    expect(SOURCE).toContain("\\text{ATR}(N) \\times \\text{合约乘数}");
  });
});

describe("m1-m8 · P1-4 Sortino 下行波动率分母为总日数 N", () => {
  it("公式分母用 N 而非 N_d", () => {
    expect(SOURCE).toContain("\\frac{1}{N} \\sum_{r_t < 0} r_t^2");
    expect(SOURCE).not.toContain("\\frac{1}{N_d} \\sum_{r_t < 0} r_t^2");
  });
  it("代码用全样本下行波动率（非亏损日填0，分母 N）", () => {
    expect(SOURCE).toContain(
      "downside_filled = [r if r < 0 else 0.0 for r in daily_returns]",
    );
    expect(SOURCE).not.toContain("statistics.stdev(downside_returns)");
  });
});

describe("m1-m8 · P1-5 RSI 口径统一 + 删占位", () => {
  it("m4l2 简化版占位 rsi 函数已删除", () => {
    // 旧的占位：def rsi(prices, period=14): ... # ... 用 EMA 平滑
    expect(SOURCE).not.toContain("# ... 用 EMA 平滑 gains/losses");
  });
  it("m4l2 完整版注明 Wilder 平滑", () => {
    expect(SOURCE).toContain("Wilder 平滑");
  });
  it("m11l2 compute_rsi 注明 SMA 近似", () => {
    expect(SOURCE).toContain("SMA 近似");
  });
});

describe("m1-m8 · P1-6 m8l5 协议比例 50/25/25", () => {
  it("训练集标注 50% 而非 60%", () => {
    expect(SOURCE).toContain("训练集 (50%)");
    expect(SOURCE).not.toContain("训练集 (60%)");
  });
  it("验证集/测试集标注 25% 而非 20%", () => {
    expect(SOURCE).toContain("验证集 (25%)");
    expect(SOURCE).toContain("测试集 (25%)");
    expect(SOURCE).not.toContain("验证集 (20%)");
  });
});

describe("m1-m8 · P1-7 m8l5 研究日志标准完整", () => {
  it("成功标准含 IS Sharpe 阈值", () => {
    expect(SOURCE).toContain("IS Sharpe > 0.8");
  });
});

describe("m1-m8 · P1-9 峰度统一超额口径", () => {
  it("正文用超额峰度（正态=0）", () => {
    expect(SOURCE).toContain("超额峰度");
    expect(SOURCE).not.toContain("正态分布峰度 = 3。峰度 > 3");
  });
  it("q_m3c_2 选项用超额口径", () => {
    expect(SOURCE).toContain("超额峰度大于 0");
  });
});

describe("m1-m8 · P2-1 滑点均价算对", () => {
  it("均价 3551.6 而非 3552.4", () => {
    expect(SOURCE).toContain("3551.6 元");
    expect(SOURCE).not.toContain("3552.4 元");
  });
  it("滑点 1.6 元 而非 2.4 元", () => {
    expect(SOURCE).toContain("每吨多花 1.6 元");
    expect(SOURCE).not.toContain("每吨多花 2.4 元");
  });
});

describe("m1-m8 · P2-2 回测成本倍数 8 倍", () => {
  it("'好看 15 倍' 已改为 '低估成本约 8 倍'", () => {
    expect(SOURCE).not.toContain("回测会比实盘好看 15 倍");
    expect(SOURCE).toContain("低估成本约 8 倍");
  });
});

describe("m1-m8 · P2-3 回撤恢复用复利", () => {
  it("15% 年化恢复年限 1.6 而非 1.7", () => {
    expect(SOURCE).toContain("约 1.6 年");
    expect(SOURCE).not.toContain("需要约 1.7 年才能恢复");
  });
  it("10% 年化恢复年限 2.3 而非 2.5", () => {
    expect(SOURCE).toContain("约 2.3 年");
    expect(SOURCE).not.toContain("需要约 2.5 年");
  });
});

describe("m1-m8 · P2-4 出金规则口径一致", () => {
  it("不再用 150% 阈值与示例矛盾", () => {
    expect(SOURCE).not.toContain("初始资金的 150% → 取出超出部分");
  });
  it("改为超初始即提取利润 50%", () => {
    expect(SOURCE).toContain("取出**利润部分**的 50%");
  });
});

describe("m1-m8 · P2-5 组合波动率 6.5%", () => {
  it("'7%-8%' 已改为 6.5%", () => {
    expect(SOURCE).not.toContain("实际可能只有 7%-8%");
    expect(SOURCE).toContain("实际约 6.5%");
  });
});

describe("m1-m8 · P2-6 on_trade 不手动累加 pos", () => {
  it("不再有 self.pos += trade.volume", () => {
    expect(SOURCE).not.toContain(
      "self.pos += trade.volume if trade.direction == Direction.LONG else -trade.volume",
    );
  });
  it("注明引擎自动维护 pos", () => {
    expect(SOURCE).toContain("self.pos 由引擎");
  });
});

describe("m1-m8 · P2-7 q_m6b_2 选项数值互斥", () => {
  it("options[1] 与 options[2] 数值不同（0.5 vs 0.3）", () => {
    // 不再有两个选项都是 0.5
    const idx = SOURCE.indexOf("q_m6b_2");
    expect(idx).toBeGreaterThan(-1);
    const window = SOURCE.slice(idx, idx + 500);
    const count05 = (window.match(/卡玛比率 = 0\.5/g) || []).length;
    expect(count05).toBe(1); // 只有一个 0.5 选项
    expect(window).toContain("卡玛比率 = 0.3");
  });
});

describe("m1-m8 · P2-8 逐日盯市按结算价", () => {
  it("说明按当日结算价（非收盘价）", () => {
    expect(SOURCE).toContain("当日结算价");
    expect(SOURCE).toContain("非最后一笔收盘价");
  });
});
