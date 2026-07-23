import type { Curriculum, Project } from "./types";
import { curriculum as generatedCurriculum } from "./curriculum.generated";

/** 项目扩展元数据（覆盖/补全 curriculum.generated 中的 project stub） */
export const PROJECT_META: Record<string, Omit<Project, "id" | "module">> = {
  P1: {
    title: "杠杆与保证金实战",
    summary: "用互动计算器理解杠杆、保证金比例与爆仓阈值，建立仓位直觉。",
    difficulty: "入门",
    durationMinutes: 30,
    objectives: [
      "理解初始保证金、维持保证金与强平触发条件",
      "用情景表量化「杠杆 × 价格波动 → 权益变化」",
      "写出个人仓位红线（单笔最大可承受亏损）",
    ],
    relatedLessons: ["L01-02", "L01-03"],
    interactive: "leverage",
    deliverables: ["杠杆情景对照表（≥4 组参数）", "强平阈值说明（200 字内）"],
    stack: ["保证金", "杠杆", "强平"],
    acceptanceCriteria: [
      "完成 L01-02 杠杆计算器 ≥4 组情景（不同本金/杠杆/涨跌幅）",
      "对照表包含：本金、杠杆、价格变化、保证金率、是否触及强平",
      "能解释为何高杠杆下小幅反向波动即可触发强平",
    ],
  },
  P2: {
    title: "订单簿撮合模拟",
    summary: "在模拟盘口上下市价/限价单，观察成交、滑点与盘口消耗。",
    difficulty: "入门",
    durationMinutes: 35,
    objectives: [
      "理解限价单与市价单在撮合优先级上的差异",
      "观察大单对盘口深度的消耗与滑点",
      "总结何时用限价、何时用市价",
    ],
    relatedLessons: ["L02-02", "L02-03"],
    interactive: "orderbook",
    deliverables: ["撮合实验观察记录", "市价 vs 限价对比总结（≥3 条）"],
    stack: ["订单簿", "撮合", "滑点"],
    acceptanceCriteria: [
      "在 L02-02 完成至少 1 次买单 + 1 次卖单侧实验",
      "记录至少 1 次市价单穿越多档价位的滑点观察",
      "总结中明确：价格优先/时间优先对成交的影响",
    ],
  },
  P3: {
    title: "Tick 聚合实验",
    summary: "把 Tick 事件流聚合成 OHLCV，理解 K 线字段含义与聚合边界。",
    difficulty: "入门",
    durationMinutes: 40,
    objectives: [
      "理解 Tick 与 K 线 OHLCV 各字段的定义",
      "在互动中观察时间窗口如何决定 K 线边界",
      "（可选）阅读 L03-02 理解主力合约拼接概念",
    ],
    relatedLessons: ["L03-01", "L03-02"],
    interactive: "tickToKBar",
    deliverables: ["Tick→K 线聚合实验记录", "单根 K 线字段释义"],
    stack: ["Tick", "OHLCV", "聚合窗口"],
    acceptanceCriteria: [
      "完成 L03-01 Tick→K 线互动，切换至少 2 种聚合节奏观察",
      "正确解释 Open/High/Low/Close/Volume 五个字段",
      "说明「当前未闭合 K 线」与「已闭合 K 线」的区别",
    ],
  },
  P4: {
    title: "指标实验室",
    summary: "调节均线/布林/MACD 参数，观察指标对价格序列的响应与滞后。",
    difficulty: "进阶",
    durationMinutes: 45,
    objectives: [
      "对比不同参数下 MA/BOLL/MACD 的信号密度与滞后",
      "识别假突破与滞后确认的典型形态",
      "建立「指标是滤波器」的直觉",
    ],
    relatedLessons: ["L04-02", "L04-03"],
    interactive: "indicatorLab",
    deliverables: ["参数对比观察表", "假信号/滞后现象记录"],
    stack: ["MA", "BOLL", "MACD"],
    acceptanceCriteria: [
      "至少对比 2 组 MA 参数（如 5/20 vs 10/60）",
      "至少对比 1 组 BOLL 或 MACD 参数",
      "记录 ≥2 条「假信号」或「滞后确认」实例并简要分析",
    ],
  },
  P5: {
    title: "双均线策略沙盒",
    summary: "分两步完成：沙盒单步推演双均线逻辑，再在代码关卡改写开仓条件。",
    difficulty: "进阶",
    durationMinutes: 60,
    objectives: [
      "在沙盒中单步理解金叉/死叉与持仓变化",
      "对比不同均线周期对资金曲线的影响",
      "在代码关卡实现一版自定义开仓逻辑",
    ],
    relatedLessons: ["L05-01", "L05-03"],
    interactive: "strategySandbox",
    deliverables: ["沙盒推演记录（周期对比）", "CodeChallenge 通过的 shouldBuy 改写"],
    stack: ["双均线", "信号", "策略函数"],
    acceptanceCriteria: [
      "L05-01 沙盒：至少对比 2 组快慢均线周期并记录曲线差异",
      "L05-03 CodeChallenge：通过全部测试用例",
      "说明改写后的开仓条件与默认双均线有何不同",
    ],
  },
  P6: {
    title: "过拟合与回测陷阱",
    summary: "用样本内/样本外对照体验参数过拟合，并对照 Walk-Forward 课节完善认知。",
    difficulty: "进阶",
    durationMinutes: 50,
    objectives: [
      "理解样本内优化与样本外表现的差异",
      "识别过拟合的典型症状",
      "列出自己策略可能踩的 4 大回测陷阱",
    ],
    relatedLessons: ["L06-02", "L06-03"],
    interactive: "overfitting",
    deliverables: ["IS/OOS 对比记录", "个人策略陷阱清单（≥4 条）"],
    stack: ["样本内/外", "过拟合", "Walk-Forward"],
    acceptanceCriteria: [
      "L06-02 过拟合演示：至少 2 组参数，记录 IS 与 OOS 收益差异",
      "阅读 L06-03 并写出 Walk-Forward 与 IS/OOS 演示的关系（3 句内）",
      "陷阱清单覆盖：过拟合、前视偏差、幸存者偏差、成本忽略中的至少 3 项",
    ],
  },
  P7: {
    title: "破产与仓位模拟",
    summary: "蒙特卡洛模拟不同单笔风险比例下的长期爆仓概率，内化仓位上限。",
    difficulty: "进阶",
    durationMinutes: 45,
    objectives: [
      "理解固定风险比例与长期生存率的关系",
      "用模拟结果推导个人仓位红线",
      "（可选）对照 L07-03 凯利公式理解差异",
    ],
    relatedLessons: ["L07-01", "L07-03"],
    interactive: "ruin",
    deliverables: ["多组风险比例实验记录", "仓位红线规则（书面）"],
    stack: ["风险比例", "蒙特卡洛", "爆仓概率"],
    acceptanceCriteria: [
      "L07-01 模拟：至少测试 3 种单笔风险比例（如 2%/5%/10%）",
      "记录各比例下 100 次模拟的破产率或权益分布",
      "写出明确规则，如「单笔风险 ≤ X%，若模拟破产率 > Y% 则降仓」",
    ],
  },
  P8: {
    title: "Regime 策略对比",
    summary: "在趋势、震荡、高波动三种市场状态下对比策略表现，给出切换时的仓位建议。",
    difficulty: "高级",
    durationMinutes: 50,
    objectives: [
      "理解 Regime 对策略选型的影响",
      "对比趋势跟踪与均值回归在不同状态下的曲线",
      "给出状态切换时的仓位调整原则",
    ],
    relatedLessons: ["L08-01", "L08-07"],
    interactive: "regime",
    deliverables: ["三种 Regime 对照记录", "状态切换仓位建议"],
    stack: ["Regime", "趋势", "均值回归"],
    acceptanceCriteria: [
      "L08-01 Regime 对比器：完成趋势/震荡/高波动三种状态观察",
      "每种状态记录哪种策略更优及原因",
      "写出切换 Regime 时至少 2 条仓位调整原则",
    ],
  },
  P9: {
    title: "实盘上线 SOP",
    summary: "整理从回测到模拟盘再到实盘的检查清单、故障预案与下架标准。",
    difficulty: "高级",
    durationMinutes: 60,
    objectives: [
      "输出可执行的上线前检查清单",
      "定义策略下架的量化阈值",
      "编写常见故障的响应预案",
    ],
    relatedLessons: ["L09-01", "L09-02", "L09-03", "L09-04"],
    deliverables: ["运维检查清单（Markdown）", "下架决策标准", "故障预案（≥3 条）"],
    stack: ["模拟盘", "监控", "SOP"],
    acceptanceCriteria: [
      "清单覆盖：数据、回测、风控、监控、告警、人工复核",
      "下架标准含至少 2 个可量化指标（如连续 N 日 Sharpe、最大回撤）",
      "故障预案覆盖：断线、滑点异常、风控误触中的至少 2 类",
    ],
  },
  P10: {
    title: "因子检验小项目",
    summary: "对指定期货 universe 计算 IC 并完成一层分层回测，验证动量或 Carry 因子。",
    difficulty: "高级",
    durationMinutes: 90,
    objectives: [
      "计算因子 IC 及 IC 均值/标准差",
      "完成 quintile 分层并观察单调性",
      "判断因子是否值得进入组合",
    ],
    relatedLessons: ["L10-01", "L10-02"],
    deliverables: ["IC 报告（表格）", "分层回测结果与结论"],
    stack: ["IC", "分层回测", "因子"],
    acceptanceCriteria: [
      "使用 public/samples/factor-panel-sample.csv（或自有数据）：≥4 品种、≥60 交易日",
      "报告含 IC 均值、IC_IR、分层 top-bottom 收益差",
      "结论明确：保留/观察/放弃，并给出 1 条理由",
    ],
  },
  P11: {
    title: "ML 陷阱复盘",
    summary: "完成前视偏差挑战，并输出 ML 策略防泄露检查表。",
    difficulty: "专家",
    durationMinutes: 45,
    objectives: [
      "识别特征工程中的前视偏差路径",
      "完成互动挑战并复盘错题",
      "建立 ML 策略上线前的检查习惯",
    ],
    relatedLessons: ["L11-04", "L06-02"],
    interactive: "lookAhead",
    deliverables: ["前视偏差挑战完成截图或记录", "防泄露检查表（≥8 项）"],
    stack: ["特征工程", "过拟合", "前视偏差"],
    acceptanceCriteria: [
      "完成 L11-04（或 L06-02）中的前视偏差挑战全部关卡",
      "检查表含：标签泄露、未来函数、错误对齐、Purged CV 等",
      "能举例说明 1 个「看起来合理但泄露」的特征",
    ],
  },
  P12: {
    title: "CTA 趋势跟踪全流程",
    summary: "唐奇安通道突破：数据准备 → 策略原型 → 回测验证 → 风控 → 上线演练。",
    difficulty: "专家",
    durationMinutes: 240,
    objectives: [
      "完成 Donchian 突破策略的数据准备与原型",
      "通过 Walk-Forward 与敏感性检验",
      "配置风控并输出上线 SOP",
    ],
    relatedLessons: ["L12-01", "L12-02", "L12-03", "L12-04", "L12-05"],
    deliverables: ["可回测的突破策略", "风控配置", "上线 SOP"],
    stack: ["Donchian", "Walk-Forward", "QuantNexus"],
    acceptanceCriteria: [
      "L12-01～05 全部课节标记完成",
      "L12-03：样本外 Sharpe 或回撤达到课内通过线",
      "L12-04：提交风控参数表；L12-05：模拟盘/纸交易检查清单",
    ],
  },
  P13: {
    title: "跨品种统计套利",
    summary: "rb+hc 卷螺差：价差研究 → 离线配对回测 → 双品种风控（非单腿 CTA 占位）。",
    difficulty: "专家",
    durationMinutes: 180,
    objectives: [
      "完成 rb/hc 价差统计特性分析",
      "运行离线配对回测脚本并解读结果",
      "输出双品种腿风险与风控方案",
    ],
    relatedLessons: ["L13-01", "L13-02", "L13-03"],
    deliverables: ["价差统计报告", "配对回测脚本/结果", "跨腿风控方案"],
    stack: ["协整", "配对交易", "腿风险"],
    acceptanceCriteria: [
      "L13-01～03 全部课节标记完成",
      "价差报告含均值、标准差、半衰期或协整检验结论",
      "明确说明：单腿 CTA 模板仅为占位，验收以离线配对脚本为准",
      "风控方案含单腿敞口上限与基差突变预案",
    ],
  },
  P14: {
    title: "多因子截面策略",
    summary: "8 品种因子库 → 截面回测 → 多策略组合 → 专家运维与结业。",
    difficulty: "专家",
    durationMinutes: 300,
    objectives: [
      "构建 8 品种因子库并完成 IC 检验",
      "实现截面调仓回测（或课内等价流程）",
      "完成三策略组合分配与运维结业",
    ],
    relatedLessons: ["L14-01", "L14-02", "L14-03", "L14-04"],
    deliverables: ["因子库", "截面回测结果", "组合资金分配方案", "运维/结业清单"],
    stack: ["截面", "多因子", "组合"],
    acceptanceCriteria: [
      "L14-01～04 全部课节标记完成",
      "因子库含 ≥2 个因子及 IC 摘要（可先完成 M10 或课内速成）",
      "L14-03 组合分配须基于**你自己**的回测/假设，不得照搬课内示例表",
      "L14-04 输出监控看板要点与下架标准",
    ],
  },
};

/** 模块级覆盖（如修正 hours） */
export const MODULE_OVERRIDES: Record<number, { hours?: number; lessonPatches?: Record<string, { prerequisites?: string[] }> }> = {
  13: { hours: 2.5 },
  14: {
    lessonPatches: {
      "L14-01": { prerequisites: ["L10-02"] },
    },
  },
};

export function enrichCurriculum(base: typeof generatedCurriculum): Curriculum {
  return {
    ...base,
    modules: base.modules.map((mod) => {
      const override = MODULE_OVERRIDES[mod.id];
      let lessons = mod.lessons;
      if (override?.lessonPatches) {
        lessons = lessons.map((l) => {
          const patch = override.lessonPatches![l.id];
          return patch ? { ...l, ...patch } : l;
        });
      }
      const stub = mod.project;
      const meta = stub ? PROJECT_META[stub.id] : undefined;
      const project: Project | undefined =
        stub && meta ? { id: stub.id, module: mod.id, ...meta } : undefined;
      return {
        ...mod,
        hours: override?.hours ?? mod.hours,
        lessons,
        project,
      };
    }),
  } as Curriculum;
}

export const curriculum = enrichCurriculum(generatedCurriculum);

export const allProjects = curriculum.modules
  .map((m) => m.project)
  .filter((p): p is Project => Boolean(p));
