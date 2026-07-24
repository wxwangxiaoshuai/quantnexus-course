# 量化交易课程 · QuantNexus Course

> 一套中文量化交易课程——从期货基础到生产形态策略流程。对齐「课程站点」信息架构：大纲 / 路线图 / 项目集。

## 这是什么

面向**有编程背景、金融零基础**的学习者。七阶段成长路径，**14 模块 / 68 课节 / 14 个递进实战项目**，配有互动组件、随堂测验与术语速查。

标称阅读时长约为十余小时；含练习、回测与结业项目时，建议按路线图预留 **约 60–80+ 小时**（见各模块 hours）。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:5180/quantnexus-course/
```

其他命令：

```bash
npm run test
npm run lint
npm run build
```

结业离线脚本（不依赖平台 UI）：

```bash
python scripts/offline_capstone/m12_donchian_backtest.py --csv rb_1d.csv
python scripts/offline_capstone/m13_pair_spread.py --rb rb_1d.csv --hc hc_1d.csv
python scripts/offline_capstone/m14_factor_ic.py --dir ./data/symbols
```

## 站点结构

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/curriculum` | 课程大纲 |
| `/curriculum/:moduleId` | 模块详情 |
| `/curriculum/:moduleId/:lessonId` | 课节正文 |
| `/curriculum/:moduleId/project/:projectId` | 模块实战项目 |
| `/roadmap` | 学习路线图 |
| `/projects` | 实战项目集 |
| `/glossary` | 术语表 |

旧路径 `/learn/*` 会自动重定向到新路由。

## 项目结构

```
src/
├── components/       # Layout、MarkdownRenderer、Quiz、互动注册
├── content/          # module-XX/lesson-*.md + project-*.md（正文真相源）
├── data/             # curriculum、quizzes、lessonOverrides、types
├── hooks/            # 学习进度（兼容旧 m1l1 id）
└── pages/            # Home / Curriculum / Module / Lesson / …
scripts/
└── offline_capstone/ # M12–M14 离线验收脚本
```

大纲真相源：`src/data/curriculum.ts`（由 `curriculum.generated.ts` + `projectMeta` / `lessonOverrides`  enrichment 导出）。
正文懒加载自 `src/content/`。

## 技术栈

Vite 5 · React 18 · TypeScript · Tailwind CSS · React Router 6 · KaTeX ·（互动组件内部仍用 Ant Design / ECharts / Monaco）
