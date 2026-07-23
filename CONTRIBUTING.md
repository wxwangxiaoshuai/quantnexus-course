# 贡献指南

感谢你对量化交易课程的兴趣！这份指南帮你快速参与。

## 开发环境

```bash
git clone <repo-url>
cd quantnexus-course
npm install
npm run dev   # http://localhost:5180/learn
```

要求：Node 20+。

## 贡献流程

1. Fork → 新建分支：`git checkout -b fix/m1l4-basis-direction`
2. 改内容（见下方"如何修改课程内容"）
3. 本地验证：
   ```bash
   npm run test   # 必须全绿（含内容自检）
   npm run lint   # 0 错误
   npm run dev    # 浏览器抽查改动课节
   ```
4. 提交（commit message 说明 why，如 `fix(m1l4): 便利收益方向改反为减项`）
5. 开 PR，按 PR 模板填写

## 如何修改课程内容

### 改一节课的正文

编辑 `src/pages/learn/data/content/<课节>.md`，如 `m1l4-基差与升贴水.md`。

**frontmatter**（`---` 之间）：

```yaml
---
id: m1l4              # 课节唯一 id，勿改
title: 基差与升贴水
duration: 12 分钟
module: m1            # 所属模块 id
order: 4              # 课节顺序
quiz:                 # 本课 quiz（按正文占位顺序）
  - id: q_m1d
    slot: 1
interactive:          # 本课互动组件
  - ref: LeverageCalculator
    slot: 1
---
```

**正文** Markdown 语法：

```markdown
普通段落，支持 **加粗**、`行内代码`、表格、> 引用块。

$$数学公式$$（块级）与 $行内公式$（用 remark-math）。

:::highlight blue
提示框（color: blue | orange | green）。
:::

```python
# 标准 fenced code block
```

<!-- quiz:1 -->        ← 渲染为 frontmatter quiz[0] 对应的 QuizCard
<!-- interactive:1 -->  ← 渲染为 frontmatter interactive[0] 对应的组件
```

### 新增 / 修改 quiz

测验在 `src/pages/learn/data/courseContent.ts` 的 `QUIZZES` 中（结构化数据，按 key 查询）：

```ts
q_m1d: {
  id: "q_m1d",
  questions: [
    {
      id: "q_m1d_1",
      question: "问题文本",
      options: ["选项A", "选项B", "选项C", "选项D"],
      correctIndex: 1,   // 正确选项的索引（0-based）
      explanation: "为什么选 B",
    },
  ],
},
```

新增 quiz 后，在对应课节 `.md` 的 frontmatter `quiz:` 声明 + 正文 `<!-- quiz:N -->` 占位。

### 新增 / 修改术语

术语表在 `courseContent.ts` 的 `GLOSSARY`：

```ts
{ term: "基差", definition: "Basis，现货价格与期货价格之差。" },
```

术语会通过 `LearnMarkdown` 的 GlossaryPopover 在正文首次出现时自动弹出（按长度降序匹配，代码块内不匹配）。

## 内容自检测试

`src/pages/learn/components/learn-course-fix-*.test.ts` 是 4 套内容自检，机械保证课程的事实准确性、代码可运行性、跨模块一致性（源自 V5 审查报告的 37 处修复）。

- **改正文后**：若改动涉及自检断言的特征串（如"便利收益减项""rb888"），同步更新对应自检断言
- **新增自检**：若修复了新的事实错误，鼓励加一条自检断言防回退

## 互动组件

`src/pages/learn/components/interactive/*.tsx` 是 11 个互动组件（BacktestMetrics、RuinSimulator、OverfittingDemo 等）。新增互动组件：

1. 在 `components/interactive/` 建 `.tsx`（纯前端，依赖 antd/echarts/monaco，无平台耦合）
2. 在 `LessonContent.tsx` 的 `interactiveComponents` 注册表注册（或通过 props 注入）
3. 在课节 `.md` frontmatter `interactive:` 声明 + 正文占位

## 代码风格

- TypeScript strict
- React 18 函数组件 + hooks
- 互动组件纯前端计算（无后端依赖，公开站点无需鉴权）

## 开 PR 前

- [ ] `npm run test` 全绿
- [ ] `npm run lint` 0 错误
- [ ] `npm run dev` 浏览器抽查
- [ ] 无硬编码密钥

有问题？先开 Issue 讨论。
