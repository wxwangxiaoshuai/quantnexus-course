/**
 * learn-course-fix-m12-m14 内容自检测试
 *
 * 断言 V5 审查报告 M12-M14 实战项目 9 处 P1 修复后的不变量。
 * 用 import.meta.glob ?raw 读源码字符串。
 */
import { describe, expect, it } from "vitest";

import { COURSE_SOURCE as SOURCE } from "./__course_source";
import { COURSE_MODULES } from "../data/courseContent";

function quizIds(lessonId: string): string[] {
  for (const m of COURSE_MODULES) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) {
      return l.blocks
        .filter((b) => b.type === "quiz")
        .map((b) => (b as { type: "quiz"; quizId: string }).quizId);
    }
  }
  return [];
}

function lessonBlocksJson(lessonId: string): string {
  for (const m of COURSE_MODULES) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return JSON.stringify(l.blocks);
  }
  return "";
}

describe("m12-m14 · Step1 quiz 均匀分配", () => {
  it("新增 q_m12c（策略原型）与 q_m12d（数据准备）", () => {
    expect(SOURCE).toMatch(/id:\s*"q_m12c"/);
    expect(SOURCE).toMatch(/id:\s*"q_m12d"/);
  });
  it("m12l1 不再引用 q_m12a（改 q_m12d）", () => {
    expect(quizIds("m12l1")).not.toContain("q_m12a");
    expect(quizIds("m12l1")).toContain("q_m12d");
  });
  it("m12l2 末尾有 quiz（q_m12c）", () => {
    expect(quizIds("m12l2")).toContain("q_m12c");
  });
  it("m12l3 保留 q_m12a", () => {
    expect(quizIds("m12l3")).toContain("q_m12a");
  });
});

describe("m12-m14 · Step2 配对交易离线回测", () => {
  it("m13l2 含离线 pandas 回测脚本", () => {
    expect(SOURCE).toContain("离线");
    expect(SOURCE).toContain("pd.read_csv");
  });
  it("m13l2 不再要求 CtaTemplate 系统回测并预期年化 10-15%", () => {
    // 旧的"步骤3 解读回测结果...年化收益 10-15%"应被改为离线脚本记录
    expect(SOURCE).not.toContain("年化收益 10-15%：正常（套利策略天然收益较低");
  });
  it("PairTradingStrategy 注释说明 CtaTemplate 单品种局限", () => {
    expect(SOURCE).toContain("CtaTemplate 绑定单合约");
  });
});

describe("m12-m14 · Step3 协整严谨性", () => {
  it("m13l1 协整代码估计 hedge ratio β", () => {
    expect(SOURCE).toContain("LinearRegression");
    expect(SOURCE).toContain("beta");
    expect(SOURCE).toContain("hc_close");
    expect(SOURCE).toContain("beta *");
  });
  it("含半衰期计算", () => {
    expect(SOURCE).toContain("半衰期");
    expect(SOURCE).toMatch(/log\(0\.5\)|np\.log\(0\.5\)/);
  });
  it("np.std 统一 ddof=1", () => {
    expect(SOURCE).toContain("np.std(self.spread_history, ddof=1)");
  });
});

describe("m12-m14 · Step4 rb2510 → rb888", () => {
  it("M12-M14 课节 blocks 不再用 rb2510.SHFE", () => {
    for (const id of ["m12l2", "m12l3", "m12l4", "m12l5", "m13l2", "m13l3"]) {
      const json = lessonBlocksJson(id);
      expect(json).not.toContain("rb2510.SHFE");
      if (json.includes(".SHFE")) {
        expect(json).toContain("rb888.SHFE");
      }
    }
  });
  it("m12l5 实盘 SOP 用当前主力 + 换月规则", () => {
    expect(SOURCE).toContain("当前主力");
    expect(SOURCE).toContain("换月");
  });
});

describe("m12-m14 · Step5 load_bar 与 ArrayManager 匹配", () => {
  it("DonchianBreakoutStrategy load_bar(100) 而非 load_bar(10)", () => {
    // 全课程统一 load_bar(100)，无残留 load_bar(10)
    expect(SOURCE).toContain("self.load_bar(100)");
    expect(SOURCE).not.toContain("self.load_bar(10)");
  });
  it("m12l5 说明改为约 100 个交易日", () => {
    expect(SOURCE).toContain("约 100 个交易日");
    expect(SOURCE).not.toContain("`load_bar(10)` 需要至少 10 根 K 线");
  });
});

describe("m12-m14 · Step6 截面策略诚实标注", () => {
  it("CrossSectionalMomentum 注释说明单品种骨架", () => {
    expect(SOURCE).toContain("单品种动量骨架");
    expect(SOURCE).toContain("PortfolioStrategyTemplate");
  });
  it("限价单加点 1.001", () => {
    expect(SOURCE).toContain("bar.close_price * 1.001");
  });
});

describe("m12-m14 · Step7 风控表述", () => {
  it("m12l4 自成交防护阈值语义明确（启用/禁用）", () => {
    expect(SOURCE).toContain("启用(1)/禁用(0)");
    expect(SOURCE).toContain("自成交防护无数值阈值");
  });
  it("m13l3 FOK 表述修正（IOC + 跨腿监控 + 已成交只能平仓）", () => {
    expect(SOURCE).toContain("IOC");
    expect(SOURCE).toContain("已成交不可撤销");
    expect(SOURCE).toContain("反向平仓");
  });
});
