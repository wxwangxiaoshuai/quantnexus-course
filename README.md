# 量化交易课程 · QuantNexus Course

> 一套中文量化交易课程——从期货基础到生产级策略，14 模块 / 68 课节 / 135 术语 / 52 组测验 / 11 个互动组件。

[![CI](https://github.com/<your-org>/quantnexus-course/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org>/quantnexus-course/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

📖 想贡献？请先读 [CONTRIBUTING.md](CONTRIBUTING.md)。
发现问题？提 [Issue](https://github.com/<your-org>/quantnexus-course/issues)。

## 这是什么

这是 [QuantNexus](https://github.com/your-org/quant-nexus) 平台中独立出来的量化交易教学子项目。课程面向**有编程背景、金融零基础**的学习者，目标是帮助一个人从小白成长为能独立研发、风控、运维量化策略的准专家。

课程不只是"读资料"——每个核心概念都配有互动组件（杠杆计算器、破产模拟器、过拟合演示、前视偏差挑战、订单簿模拟器等）让你动手体验，每课末尾有测验自检，最后三个模块是生产级实战项目（CTA 趋势跟踪 / 跨品种统计套利 / 多因子截面策略）。

## 课程目录

| 模块 | 主题 |
|------|------|
| M1 | 期货是什么 |
| M2 | 交易是怎么发生的 |
| M3 | 行情数据 |
| M4 | 技术指标 |
| M5 | 你的第一个策略 |
| M6 | 回测——策略的单元测试 |
| M7 | 风险管理 |
| M8 | 策略范式地图 |
| M9 | 通往实盘 |
| M10 | 因子研究（选修）|
| M11 | 统计学习入门（选修）|
| M12 | CTA 趋势跟踪实战 |
| M13 | 跨品种统计套利 |
| M14 | 多因子截面策略 |

## 本地运行

```bash
npm install
npm run dev      # 启动开发服务器 → http://localhost:5180/learn
```

其他命令：

```bash
npm run test     # 跑全部测试（内容自检 + 渲染）
npm run lint     # TypeScript 类型检查
npm run build    # 生产构建
```

## 项目结构

```
src/pages/learn/
├── data/
│   ├── content/          # 课程正文（每课一个 .md 文件，frontmatter + 正文）
│   │   ├── modules.json  # 模块→课节索引
│   │   └── m1-l1-*.md … m14-l4-*.md
│   ├── courseLoader.ts   # 从 .md 加载课程，产出 block 数组
│   ├── courseContent.ts  # re-export COURSE_MODULES + QUIZZES + GLOSSARY
│   └── types.ts
├── components/           # 渲染组件 + 11 个互动组件
└── hooks/                # 学习进度（localStorage）
```

## 如何贡献

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。要点：

- **改正文**：直接编辑 `src/pages/learn/data/content/<课节>.md`（frontmatter + Markdown 正文，支持 `:::highlight`、`$$公式$$`、`<!-- quiz:N -->` 占位）
- **改 quiz / 术语**：在 `courseContent.ts` 的 `QUIZZES` / `GLOSSARY` 中维护
- **提 PR 前**：`npm run test` 全绿 + `npm run lint` 0 错误 + `npm run dev` 浏览器抽查

### 从主项目同步内容（仅维护者）

若需从 QuantNexus 主项目同步课程内容到 `.md`：

```bash
# 1. 把主项目原始 courseContent.ts + types.ts 复制到 scripts/_tmp/
cp <主项目>/frontend/src/pages/learn/data/courseContent.ts scripts/_tmp/courseContent.full.ts
cp <主项目>/frontend/src/pages/learn/data/types.ts scripts/_tmp/types.ts
# 2. 重跑转换脚本
npm run convert:content
```

## 质量保证

课程经过 5 轮深度审查（见主项目 `docs/learn-course-review-v5.md`），修复了 6 P0 + 19 P1 + 12 P2 共 37 个问题。`src/pages/learn/components/learn-course-fix-*.test.ts` 是内容自检测试，机械保证课程内容的事实准确性、代码可运行性、跨模块一致性。

## License

MIT——自由使用、修改、分发。课程内容（`.md`）与代码同协议。
