/**
 * 一次性迁移：旧 content/*.md → src/content/module-XX/
 * 并生成 src/data/curriculum.generated.ts（由 curriculum.ts re-export）
 *
 * 运行：npx tsx scripts/migrate-content-to-modules.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OLD_DIR = path.join(ROOT, "src/pages/learn/data/content");
const OUT_DIR = path.join(ROOT, "src/content");
const CURRICULUM_OUT = path.join(ROOT, "src/data/curriculum.generated.ts");

const INTERACTIVE_MAP: Record<string, string> = {
  LeverageCalculator: "leverage",
  OrderBookSimulator: "orderbook",
  TickToKBar: "tickToKBar",
  IndicatorLab: "indicatorLab",
  StrategySandbox: "strategySandbox",
  BacktestMetrics: "backtestMetrics",
  OverfittingDemo: "overfitting",
  RuinSimulator: "ruin",
  RegimeComparator: "regime",
  CodeChallenge: "codeChallenge",
  LookAheadBiasChallenge: "lookAhead",
};

const PROJECTS: Record<
  number,
  {
    id: string;
    title: string;
    summary: string;
    difficulty: string;
    deliverables: string[];
    stack: string[];
  }
> = {
  1: {
    id: "P1",
    title: "杠杆与保证金实战",
    summary: "用互动计算器理解杠杆、保证金比例与爆仓阈值，建立仓位直觉。",
    difficulty: "入门",
    deliverables: ["完成杠杆情景推演", "写出本金/杠杆/价格变化对照表"],
    stack: ["保证金", "杠杆", "强平"],
  },
  2: {
    id: "P2",
    title: "订单簿撮合模拟",
    summary: "在模拟盘口上下市价/限价单，观察成交、滑点与盘口消耗。",
    difficulty: "入门",
    deliverables: ["完成买卖两侧撮合实验", "总结市价 vs 限价差异"],
    stack: ["订单簿", "撮合", "滑点"],
  },
  3: {
    id: "P3",
    title: "Tick 聚合实验",
    summary: "把 Tick 事件流聚合成 OHLCV，理解主力合约与 K 线边界。",
    difficulty: "入门",
    deliverables: ["跑通 Tick→K 线聚合", "解释一根 K 线的字段含义"],
    stack: ["Tick", "OHLCV", "主力合约"],
  },
  4: {
    id: "P4",
    title: "指标实验室",
    summary: "调节均线/布林/MACD 参数，观察指标对价格序列的响应。",
    difficulty: "进阶",
    deliverables: ["对比至少两组参数", "记录假信号与滞后现象"],
    stack: ["MA", "BOLL", "MACD"],
  },
  5: {
    id: "P5",
    title: "双均线策略沙盒",
    summary: "单步执行双均线逻辑，或改写开仓条件看资金曲线变化。",
    difficulty: "进阶",
    deliverables: ["完成沙盒全路径推演", "提交一版开仓条件改写"],
    stack: ["双均线", "信号", "策略函数"],
  },
  6: {
    id: "P6",
    title: "过拟合与回测陷阱",
    summary: "用样本内/样本外对照，体验参数过拟合与回测偏差。",
    difficulty: "进阶",
    deliverables: ["完成过拟合演示", "列出你策略会踩的陷阱清单"],
    stack: ["Walk-Forward", "过拟合", "绩效指标"],
  },
  7: {
    id: "P7",
    title: "破产与仓位模拟",
    summary: "蒙特卡洛模拟不同风险比例下的爆仓概率，内化仓位上限。",
    difficulty: "进阶",
    deliverables: ["跑多组风险比例实验", "写出你的仓位红线规则"],
    stack: ["凯利", "止损", "爆仓概率"],
  },
  8: {
    id: "P8",
    title: "Regime 策略对比",
    summary: "在不同市场状态下对比趋势跟踪与均值回归的资金曲线。",
    difficulty: "高级",
    deliverables: ["完成三种 Regime 对照", "给出状态切换时的仓位建议"],
    stack: ["Regime", "趋势", "均值回归"],
  },
  9: {
    id: "P9",
    title: "实盘上线 SOP",
    summary: "整理从回测到模拟盘再到实盘的检查清单与故障预案。",
    difficulty: "高级",
    deliverables: ["完成运维清单草稿", "写出下架决策标准"],
    stack: ["模拟盘", "监控", "SOP"],
  },
  10: {
    id: "P10",
    title: "因子检验小项目",
    summary: "计算 IC / 分层回测，验证一个动量或 Carry 因子是否有效。",
    difficulty: "高级",
    deliverables: ["产出 IC 报告", "完成一层分层回测"],
    stack: ["IC", "分层回测", "因子"],
  },
  11: {
    id: "P11",
    title: "ML 陷阱复盘",
    summary: "识别特征泄露与过拟合路径，总结 ML 策略正确使用边界。",
    difficulty: "专家",
    deliverables: ["完成前视偏差挑战", "写下防泄露检查表"],
    stack: ["特征工程", "过拟合", "前视偏差"],
  },
  12: {
    id: "P12",
    title: "CTA 趋势跟踪全流程",
    summary: "唐奇安通道突破：数据准备 → 策略原型 → 回测验证 → 风控 → 上线演练。",
    difficulty: "专家",
    deliverables: ["可回测的突破策略", "风控配置", "上线 SOP"],
    stack: ["Donchian", "Walk-Forward", "QuantNexus"],
  },
  13: {
    id: "P13",
    title: "跨品种统计套利",
    summary: "rb+hc 卷螺差：价差研究 → 离线回测 → 双品种风控。",
    difficulty: "专家",
    deliverables: ["价差统计报告", "配对回测脚本", "跨腿风控方案"],
    stack: ["协整", "配对交易", "腿风险"],
  },
  14: {
    id: "P14",
    title: "多因子截面策略",
    summary: "8 品种因子库 → 截面回测 → 多策略组合 → 专家运维与结业。",
    difficulty: "专家",
    deliverables: ["因子库", "截面回测", "组合资金分配"],
    stack: ["截面", "多因子", "组合"],
  },
};

const DIFFICULTY_BY_MODULE: Record<number, string> = {
  1: "入门",
  2: "入门",
  3: "入门",
  4: "进阶",
  5: "进阶",
  6: "进阶",
  7: "进阶",
  8: "高级",
  9: "高级",
  10: "高级",
  11: "专家",
  12: "专家",
  13: "专家",
  14: "专家",
};

const SUBTITLES: Record<number, string> = {
  1: "从零建立期货市场的正确心智模型",
  2: "理解交易所、盘口、委托与微观结构",
  3: "掌握 Tick、K 线与数据质量工程",
  4: "用程序员视角理解经典技术指标",
  5: "把策略写成可测试的纯函数",
  6: "把回测当单元测试，警惕四大陷阱",
  7: "仓位、止损与生存比收益更重要",
  8: "趋势、均值回归、套利与状态切换",
  9: "从回测到实盘的正确路径",
  10: "从策略思维升级到因子思维",
  11: "用统计学习增强策略，保持可控",
  12: "端到端 CTA：数据到上线",
  13: "端到端配对：价差到风控",
  14: "端到端截面：因子到组合运维",
};

interface ModulesIndex {
  id: string;
  title: string;
  description: string;
  icon: string;
  elective?: boolean;
  lessons: string[];
}

function parseScalar(s: string): string | number | boolean {
  const t = s.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+$/.test(t)) return Number(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines[0].trim() !== "---") {
    return { data: {}, content: raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n") };
  }
  const data: Record<string, unknown> = {};
  let endLine = lines.length;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endLine = i;
      break;
    }
  }
  const fmLines = lines.slice(1, endLine);
  let k = 0;
  while (k < fmLines.length) {
    const line = fmLines[k];
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) {
      k++;
      continue;
    }
    const key = m[1];
    const val = m[2].trim();
    if (val === "") {
      const arr: Record<string, unknown>[] = [];
      k++;
      let cur: Record<string, unknown> | null = null;
      while (k < fmLines.length) {
        const al = fmLines[k];
        const itemMatch = al.match(/^\s+-\s+(\w+):\s*(.*)$/);
        if (itemMatch) {
          cur = {};
          cur[itemMatch[1]] = parseScalar(itemMatch[2]);
          arr.push(cur);
          k++;
          continue;
        }
        const subMatch = al.match(/^\s{4}(\w+):\s*(.*)$/);
        if (subMatch && cur) {
          cur[subMatch[1]] = parseScalar(subMatch[2]);
          k++;
          continue;
        }
        break;
      }
      data[key] = arr;
    } else {
      data[key] = parseScalar(val);
      k++;
    }
  }
  return { data, content: lines.slice(endLine + 1).join("\n") };
}

function firstSummary(body: string): string {
  const lines = body.split("\n").map((l) => l.trim());
  for (const line of lines) {
    if (!line || line.startsWith("#") || line.startsWith(":::") || line.startsWith("```") || line.startsWith("<!--")) {
      continue;
    }
    const plain = line.replace(/\*\*/g, "").replace(/`/g, "");
    if (plain.length > 12) return plain.slice(0, 80) + (plain.length > 80 ? "…" : "");
  }
  return "完成本课学习目标。";
}

function parseDurationMinutes(s: unknown): number {
  if (typeof s === "number") return s;
  const m = String(s ?? "15").match(/(\d+)/);
  return m ? Number(m[1]) : 15;
}

function legacyToLessonId(legacyId: string, moduleNum: number, orderInModule: number): string {
  // m1l1 → L01-01; m4l0 → keep order from modules.json index
  const mod = String(moduleNum).padStart(2, "0");
  const lesson = String(orderInModule).padStart(2, "0");
  return `L${mod}-${lesson}`;
}

function transformBody(
  body: string,
  interactive?: { ref: string; slot: number }[],
  quiz?: { id: string; slot: number }[],
): string {
  let out = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  out = out.replace(/^<!--\s*interactive:(\d+)\s*-->\s*$/gm, (_, slotStr) => {
    const slot = Number(slotStr);
    const entry = interactive?.find((x) => x.slot === slot);
    if (!entry) return "";
    const type = INTERACTIVE_MAP[entry.ref] ?? entry.ref;
    return `::interactive{type="${type}"}`;
  });
  out = out.replace(/^<!--\s*quiz:(\d+)\s*-->\s*$/gm, (_, slotStr) => {
    const slot = Number(slotStr);
    const entry = quiz?.find((x) => x.slot === slot);
    if (!entry) return "";
    return `::quiz{id="${entry.id}"}`;
  });
  // collapse excessive blank lines
  out = out.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  return out;
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function main() {
  const modulesIndex: ModulesIndex[] = JSON.parse(
    fs.readFileSync(path.join(OLD_DIR, "modules.json"), "utf8"),
  );

  const mdFiles = fs.readdirSync(OLD_DIR).filter((f) => f.endsWith(".md"));
  const byLegacy = new Map<string, { file: string; raw: string }>();
  for (const f of mdFiles) {
    const raw = fs.readFileSync(path.join(OLD_DIR, f), "utf8");
    const { data } = parseFrontmatter(raw);
    const id = String(data.id ?? "");
    if (id) byLegacy.set(id, { file: f, raw });
  }

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const moduleBlocks: string[] = [];
  const legacyMapEntries: string[] = [];

  for (const mod of modulesIndex) {
    const moduleNum = Number(mod.id.replace(/^m/, ""));
    const dirName = `module-${String(moduleNum).padStart(2, "0")}`;
    const modDir = path.join(OUT_DIR, dirName);
    fs.mkdirSync(modDir, { recursive: true });

    const lessonObjs: string[] = [];
    let totalMinutes = 0;

    mod.lessons.forEach((legacyId, idx) => {
      const entry = byLegacy.get(legacyId);
      if (!entry) {
        console.warn(`missing lesson ${legacyId}`);
        return;
      }
      const { data, content } = parseFrontmatter(entry.raw);
      const interactive = data.interactive as { ref: string; slot: number }[] | undefined;
      const quiz = data.quiz as { id: string; slot: number }[] | undefined;
      const body = transformBody(content, interactive, quiz);
      const lessonId = legacyToLessonId(legacyId, moduleNum, idx + 1);
      const fileName = `lesson-${lessonId.toLowerCase()}.md`;
      fs.writeFileSync(path.join(modDir, fileName), body, "utf8");

      const duration = parseDurationMinutes(data.duration);
      totalMinutes += duration;
      const hasInteractive = Boolean(interactive?.length);
      const lessonType = moduleNum >= 12 ? "项目" : hasInteractive ? "实战" : "理论";
      const quizId = quiz?.[0]?.id;
      const title = String(data.title ?? legacyId);
      const summary = firstSummary(body);

      legacyMapEntries.push(`  "${legacyId}": "${lessonId}"`);

      lessonObjs.push(`      {
        id: "${lessonId}",
        legacyId: "${legacyId}",
        title: ${JSON.stringify(title)},
        summary: ${JSON.stringify(summary)},
        duration: ${duration},
        type: "${lessonType}",
        objectives: [
          ${JSON.stringify(`掌握「${title}」的核心概念`)},
          ${JSON.stringify("能用自己的话向他人解释本课要点")},
        ],
        tags: ${JSON.stringify(
          [mod.title.replace(/^第.+模块：/, ""), lessonType].filter(Boolean),
        )},
        competency: ${JSON.stringify(mod.title.replace(/^第.+模块：/, ""))},${
          quizId ? `\n        quizId: "${quizId}",` : ""
        }
      }`);
    });

    const proj = PROJECTS[moduleNum];
    const hours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);
    const titleClean = mod.title.replace(/^第.+模块：/, "");

    // project markdown stub pointing learners to module lessons / interactive
    const projectMd = `# ${proj.title}\n\n${proj.summary}\n\n## 交付物\n\n${proj.deliverables.map((d) => `- ${d}`).join("\n")}\n\n## 技术栈\n\n${proj.stack.map((s) => `- ${s}`).join("\n")}\n\n完成本模块全部课节与互动实验后，即可视为完成本项目。\n`;
    fs.writeFileSync(path.join(modDir, `project-${proj.id.toLowerCase()}.md`), projectMd, "utf8");

    moduleBlocks.push(`    {
      id: ${moduleNum},
      title: ${JSON.stringify(titleClean)},
      subtitle: ${JSON.stringify(SUBTITLES[moduleNum] ?? mod.description)},
      description: ${JSON.stringify(mod.description)},
      difficulty: "${DIFFICULTY_BY_MODULE[moduleNum]}",
      hours: ${hours},
      icon: ${JSON.stringify(mod.icon)},
      accent: "brand",
      elective: ${mod.elective ? "true" : "false"},
      lessons: [
${lessonObjs.join(",\n")}
      ],
      project: {
        id: "${proj.id}",
        title: ${JSON.stringify(proj.title)},
        summary: ${JSON.stringify(proj.summary)},
        module: ${moduleNum},
        difficulty: "${proj.difficulty}",
        deliverables: ${JSON.stringify(proj.deliverables)},
        stack: ${JSON.stringify(proj.stack)},
      },
    }`);
  }

  const generated = `/* eslint-disable */
/** 由 scripts/migrate-content-to-modules.ts 自动生成，请勿手改 */
import type { Curriculum, Stage } from "./types";

export const curriculum: Curriculum = {
  title: "量化交易课程",
  tagline: "从期货基础到生产级策略 · 程序员视角的系统化路径",
  description:
    "面向有编程经验、金融零基础的学习者。用工程师的方式掌握期货量化：" +
    "合约与撮合、行情与指标、策略与回测、风控与范式、实盘路径，以及三个生产级实战项目。",
  modules: [
${moduleBlocks.join(",\n")}
  ],
};

export const stages: Stage[] = [
  { id: 1, name: "筑基：期货与交易机制", range: [1, 2], color: "from-emerald-500 to-teal-500" },
  { id: 2, name: "行情数据与技术指标", range: [3, 4], color: "from-cyan-500 to-brand-500" },
  { id: 3, name: "策略构建与回测", range: [5, 6], color: "from-brand-500 to-teal-600" },
  { id: 4, name: "风控与策略范式", range: [7, 8], color: "from-violet-500 to-purple-500" },
  { id: 5, name: "通往实盘", range: [9, 9], color: "from-amber-500 to-orange-500" },
  { id: 6, name: "进阶选修", range: [10, 11], color: "from-fuchsia-500 to-pink-500" },
  { id: 7, name: "生产级实战项目", range: [12, 14], color: "from-rose-500 to-red-500" },
];

/** legacy lesson id → new lesson id */
export const LEGACY_LESSON_ID_MAP: Record<string, string> = {
${legacyMapEntries.join(",\n")},
};

export const totalLessons = curriculum.modules.reduce((s, m) => s + m.lessons.length, 0);
export const totalMinutes = curriculum.modules.reduce(
  (s, m) => s + m.lessons.reduce((a, l) => a + l.duration, 0),
  0,
);
export const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
export const totalProjects = curriculum.modules.filter((m) => m.project).length;
export const allProjects = curriculum.modules
  .map((m) => m.project)
  .filter((p): p is NonNullable<typeof p> => Boolean(p));
`;

  fs.writeFileSync(CURRICULUM_OUT, generated, "utf8");
  console.log(`Wrote content to ${OUT_DIR}`);
  console.log(`Wrote ${CURRICULUM_OUT}`);
  console.log(`Modules: ${modulesIndex.length}, map entries: ${legacyMapEntries.length}`);
}

main();
