# 贡献指南

感谢你对量化交易课程的兴趣！这份指南帮你快速参与。

## 开发环境

```bash
git clone <repo-url>
cd quantnexus-course
npm install
npm run dev   # http://localhost:5180/quantnexus-course/
```

要求：Node 20+。

## 贡献流程

1. Fork → 新建分支：`git checkout -b fix/m1l4-basis-direction`
2. 改内容（见下方「如何修改课程内容」）
3. 本地验证：
   ```bash
   npm run test   # 必须全绿（含内容自检）
   npm run lint   # 0 错误
   npm run dev    # 浏览器抽查改动课节
   ```
4. 提交（commit message 说明 why）
5. 开 PR

## 如何修改课程内容

### 改一节课的正文

编辑 **`src/content/module-XX/lesson-lXX-YY.md`**（站点与自检的真相源）。

正文支持 Markdown、KaTeX、`:::highlight`、以及：

```markdown
::interactive{type="leverage"}
::quiz{id="q_m1"}
```

互动 `type` 见 `src/components/interactive/registry.ts`。测验定义在 `src/data/quizzes.ts`。

### 改大纲元数据

- 课节列表 / quizId / duration：`src/data/curriculum.generated.ts`（或迁移脚本再生后手改）
- **学习目标 / 模块学时**：优先改 `src/data/lessonOverrides.ts`（由 `projectMeta.enrichCurriculum` 合并）
- 项目验收元数据：`src/data/projectMeta.ts`

### 新增 / 修改 quiz

编辑 `src/data/quizzes.ts`。每个课节应使用**独立** `quizId`（勿多课共用同一 id）。

旧路径 `src/pages/learn/data/courseContent.ts` 仅 re-export 同一题库，勿再维护第二份。

### 新增 / 修改术语

`src/data/quizzes.ts` 的 `GLOSSARY`。

## 内容自检测试

`src/pages/learn/components/learn-course-fix-*.test.ts` 通过 `__course_source.ts` 合并 **`src/content/**/*.md` + `src/data/quizzes.ts`** 做不变量断言。

- 改正文后：同步更新相关断言
- 修复事实错误后：鼓励加自检防回退

## 开 PR 前

- [ ] `npm run test` 全绿
- [ ] `npm run lint` 0 错误
- [ ] `npm run dev` 浏览器抽查
- [ ] 无硬编码密钥
- [ ] 未引入重复 quizId
