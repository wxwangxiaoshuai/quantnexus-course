/**
 * learn-course-fix-p0 内容自检测试
 *
 * 断言 V5 审查报告 6 处 P0 修复后的不变量。
 * 这些是纯内容正确性校验，不是渲染逻辑测试。
 * 设计为"先红后绿"：当前课程未修时这些断言失败，修复后通过。
 *
 * 用 import.meta.glob 的 ?raw 模式读取 courseContent.ts 源码字符串，
 * 避免引入 node:fs / @types/node（前端 app tsconfig 不含 node 类型）。
 */
import { describe, expect, it } from "vitest";

import { COURSE_SOURCE } from "./__course_source";

const SOURCE = COURSE_SOURCE;

describe("learn-course-fix-p0 · P0-1 便利收益方向（m1l4）", () => {
  it("便利收益作为持仓成本的减项，而非同向相加", () => {
    // 旧表述（错误）："多出 200 = 持仓成本 150 + 便利收益 50" 同向相加
    expect(SOURCE).not.toContain("持仓成本 150 + 便利收益 50");
    expect(SOURCE).not.toContain("持仓成本 150 + 便利收益 50");
  });

  it("持有成本模型公式含便利收益减项", () => {
    // 新表述应含 cy 为减项的公式或文字
    expect(SOURCE).toContain("(r + storage");
    expect(SOURCE).toMatch(/convenience|便利收益/);
  });
});

describe("learn-course-fix-p0 · P0-2 DonchianBreakoutStrategy 通道排除当前 bar（m12l2）", () => {
  it("唐奇安通道不使用含当前 bar 的切片", () => {
    // 旧（错误）：self.am.high[-self.breakout_period:].max()
    expect(SOURCE).not.toContain(
      "self.am.high[-self.breakout_period:].max()",
    );
    expect(SOURCE).not.toContain(
      "self.am.low[-self.breakout_period:].min()",
    );
  });

  it("唐奇安通道使用排除当前 bar 的前 N 日切片", () => {
    // 新（正确）：[-breakout_period - 1 : -1]
    expect(SOURCE).toContain("self.am.high[-self.breakout_period - 1 : -1]");
    expect(SOURCE).toContain("self.am.low[-self.breakout_period - 1 : -1]");
  });
});

describe("learn-course-fix-p0 · P0-3 turtle_strategy 通道排除当前 bar（m5l4）", () => {
  it("turtle 不使用含当前 bar 的 bars[-N:]", () => {
    // 旧（错误）：max(b.high for b in bars[-N:])
    expect(SOURCE).not.toContain("max(b.high for b in bars[-N:])");
    expect(SOURCE).not.toContain("min(b.low for b in bars[-N:])");
  });

  it("turtle 使用排除当前 bar 的前 N 日切片", () => {
    // 新（正确）：bars[-(N + 1):-1]
    expect(SOURCE).toContain("bars[-(N + 1):-1]");
  });
});

describe("learn-course-fix-p0 · P0-4 PairTradingStrategy 配对腿方向（m13l2）", () => {
  it("zscore > entry 时做多 rb（buy），而非做空（short）", () => {
    // 找到 zscore > entry_zscore 分支，断言其为 buy
    const idx = SOURCE.indexOf("self.zscore > self.entry_zscore");
    expect(idx).toBeGreaterThan(-1);
    const window = SOURCE.slice(idx, idx + 200);
    expect(window).toContain("self.buy(bar.close_price, 1)");
    expect(window).not.toMatch(/self\.short\(bar\.close_price, 1\)/);
  });

  it("zscore < -entry 时做空 rb（short），而非做多（buy）", () => {
    const idx = SOURCE.indexOf("self.zscore < -self.entry_zscore");
    expect(idx).toBeGreaterThan(-1);
    const window = SOURCE.slice(idx, idx + 200);
    expect(window).toContain("self.short(bar.close_price, 1)");
    expect(window).not.toMatch(/self\.buy\(bar\.close_price, 1\)/);
  });
});

describe("learn-course-fix-p0 · P0-5 等风险分配 ERC + 组合收益（m14l3）", () => {
  it("等风险分配权重满足 w ∝ 1/σ（27/51/22 而非 33/25/42）", () => {
    // 旧（错误）ERC 表行：策略 B 行的分配比例是 25% 且策略 C 是 42%
    // 精确匹配旧 ERC 表的特征串（策略 B 8% 25% 12.5万 + 策略 C 18% 42% 21.0万）
    expect(SOURCE).not.toContain("| 8% | 25% | 12.5 万");
    expect(SOURCE).not.toContain("| 18% | 42% | 21.0 万");
    // 新（正确）ERC 权重出现在等风险分配表：27% / 51% / 22%
    expect(SOURCE).toContain("| 15% | 6.67 | 27% |");
    expect(SOURCE).toContain("| 8% | 12.50 | 51% |");
    expect(SOURCE).toContain("| 18% | 5.56 | 22% |");
  });

  it("组合年化收益为加权平均（约 15.7%），非 16.7%", () => {
    // 旧（错误）：组合年化收益：≈ 16.7%
    expect(SOURCE).not.toContain("16.7%");
    // 新（正确）：15.7%
    expect(SOURCE).toContain("15.7%");
  });
});

describe("learn-course-fix-p0 · P0-6 M14l4 归属 + 结业编号", () => {
  it("M14l4 不再误称 M12 的最后一课", () => {
    expect(SOURCE).not.toContain("这是 M12 的最后一课");
    expect(SOURCE).toContain("M14 的最后一课");
  });

  it("结业条件不引用不存在的 m12l6+", () => {
    // 旧（错误）：m12l6-m12l8 / m12l9-m12l11 / m12l12
    expect(SOURCE).not.toContain("m12l6-m12l8");
    expect(SOURCE).not.toContain("m12l9-m12l11");
    expect(SOURCE).not.toContain("m12l12");
  });

  it("结业条件引用真实存在的课节编号", () => {
    expect(SOURCE).toContain("m12l1-m12l5");
    expect(SOURCE).toContain("m13l1-m13l3");
    expect(SOURCE).toContain("m14l1-m14l4");
  });
});
