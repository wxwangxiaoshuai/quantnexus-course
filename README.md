# 量化交易课程 · QuantNexus Course

> 一套中文量化交易课程——从期货基础到生产级策略。对齐「课程站点」信息架构：大纲 / 路线图 / 项目集。

## 这是什么

面向**有编程背景、金融零基础**的学习者。七阶段成长路径，14 模块 / 68 课节 / 14 个递进实战项目，配有互动组件、随堂测验与术语速查。

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
├── content/          # module-XX/lesson-*.md + project-*.md
├── data/             # curriculum、quizzes、types
├── hooks/            # 学习进度（兼容旧 m1l1 id）
└── pages/            # Home / Curriculum / Module / Lesson / …
```

大纲真相源：`src/data/curriculum.ts`（由 `curriculum.generated.ts` 导出）。
正文懒加载自 `src/content/`。重新从旧 md 迁移可运行：

```bash
npx tsx scripts/migrate-content-to-modules.ts
```

## 技术栈

Vite 5 · React 18 · TypeScript · Tailwind CSS · React Router 6 · KaTeX ·（互动组件内部仍用 Ant Design / ECharts / Monaco）
