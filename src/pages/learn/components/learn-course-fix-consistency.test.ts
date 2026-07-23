/**
 * learn-course-fix-consistency 内容自检测试（markdown 迁移版）
 *
 * 内容已迁移至 content/*.md，COURSE_MODULES 由 courseLoader 从 md 加载。
 * 课节级属性（quiz 引用/duration）改用 courseLoader 数据断言；
 * 正文级字符串不变量用 COURSE_SOURCE（md+courseContent.ts 合并源码）断言。
 */
import { describe, expect, it } from "vitest";

import { COURSE_MODULES } from "../data/courseContent";
import { COURSE_SOURCE as SOURCE } from "./__course_source";

function findLesson(lessonId: string) {
  for (const m of COURSE_MODULES) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return l;
  }
  return null;
}

function quizIds(lessonId: string): string[] {
  const l = findLesson(lessonId);
  if (!l) return [];
  return l.blocks
    .filter((b) => b.type === "quiz")
    .map((b) => (b as { type: "quiz"; quizId: string }).quizId);
}

function interactiveIds(lessonId: string): string[] {
  const l = findLesson(lessonId);
  if (!l) return [];
  return l.blocks
    .filter((b) => b.type === "interactive")
    .map((b) => (b as { type: "interactive"; componentId: string }).componentId);
}

describe("consistency · Step2 quiz 主题拆分", () => {
  it("m8l5 引用 q_m8e（科学方法）", () => {
    expect(quizIds("m8l5")).toContain("q_m8e");
  });
  it("m8l6 引用 q_m8f（套利）而非 q_m8e", () => {
    expect(quizIds("m8l6")).toContain("q_m8f");
    expect(quizIds("m8l6")).not.toContain("q_m8e");
  });
  it("m8l7 引用 q_m8g（状态切换）", () => {
    expect(quizIds("m8l7")).toContain("q_m8g");
  });
  it("m9l4 引用 q_m9c（下架）而非 q_m9b", () => {
    expect(quizIds("m9l4")).toContain("q_m9c");
    expect(quizIds("m9l4")).not.toContain("q_m9b");
  });
  it("q_m8f/q_m8g/q_m9c 已定义", () => {
    expect(SOURCE).toMatch(/id:\s*"q_m8f"/);
    expect(SOURCE).toMatch(/id:\s*"q_m8g"/);
    expect(SOURCE).toMatch(/id:\s*"q_m9c"/);
  });
});

describe("consistency · Step3 术语清理", () => {
  it("策略管道 仅 1 条定义", () => {
    const count = (SOURCE.match(/term: "策略管道"/g) || []).length;
    expect(count).toBe(1);
  });
  it("正文从你的「策略管道」选择候选（非因子管道）", () => {
    expect(SOURCE).toContain("从你的「策略管道」中选择候选策略替换");
    expect(SOURCE).not.toContain("从你的「因子管道」中选择候选策略替换");
  });
});

describe("consistency · Step4 IC 门槛统一", () => {
  it("M14l1 IC t-stat 门槛 > 2 而非 > 1.5", () => {
    expect(SOURCE).toContain("t-stat < 2 → 预测力未达 95% 显著");
    expect(SOURCE).not.toContain("t-stat < 1.5 → 预测力不显著");
  });
  it("calculate_ic 截面下限 < 5", () => {
    expect(SOURCE).toContain("len(common) < 5");
    expect(SOURCE).not.toContain("len(common) < 4:  # 至少需要 4");
  });
  it("q_m14_1 explanation 模块标 M14l1 + 门槛 > 2", () => {
    expect(SOURCE).toContain("在 M14l1 中，我们要求 t-stat > 2");
    expect(SOURCE).not.toContain("在 M12 中，我们要求 t-stat > 1.5");
  });
});

describe("consistency · Step5 duration", () => {
  it("m12l2 duration 上调（40 分钟）", () => {
    expect(findLesson("m12l2")?.duration).toBe("40 分钟");
  });
  it("m12l3 duration 上调（45 分钟）", () => {
    expect(findLesson("m12l3")?.duration).toBe("45 分钟");
  });
  it("m14l1 duration 上调（40 分钟）", () => {
    expect(findLesson("m14l1")?.duration).toBe("40 分钟");
  });
  it("M12 全局说明已加（含代码实践课节实际耗时翻倍）", () => {
    expect(SOURCE).toContain("含代码实践");
    expect(SOURCE).toContain("1.5-2 倍");
  });
});

describe("consistency · Step1 GlossaryPopover 接线（代码层）", () => {
  it("courseContent 导出 GLOSSARY", () => {
    expect(SOURCE).toContain("export const GLOSSARY");
  });
});

describe("consistency · markdown 迁移完整性", () => {
  it("interactive 占位正确还原（m1l2 含 LeverageCalculator）", () => {
    expect(interactiveIds("m1l2")).toContain("LeverageCalculator");
  });
  it("所有课节均加载（68 课节）", () => {
    const total = COURSE_MODULES.reduce((s, m) => s + m.lessons.length, 0);
    expect(total).toBe(68);
  });
});
