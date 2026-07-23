## Summary

<!-- 这节课改了什么、为什么改。若修复审查报告某项，注明 P0/P1/P2 编号 -->

## 改动类型

- [ ] 课程正文修改（`content/*.md`）
- [ ] 新增/修改 quiz（`courseContent.ts` 的 `QUIZZES`）
- [ ] 新增/修改术语（`courseContent.ts` 的 `GLOSSARY`）
- [ ] 互动组件（`components/interactive/`）
- [ ] 渲染层（`LearnMarkdown` / `LessonContent` 等）
- [ ] 基建/文档

## Checklist

- [ ] `npm run test` 全绿（含内容自检 `learn-course-fix-*.test.ts`）
- [ ] `npm run lint` 0 错误
- [ ] 若改了 `content/*.md` 的 frontmatter（quiz/interactive），确认 `courseLoader` 能正确还原
- [ ] 数学公式 / 代码块 / 术语弹窗在 `npm run dev` 中渲染正常
- [ ] 无硬编码密钥

## Test plan

<!-- 如何验证：本地 `npm run dev` 打开对应课节抽查；或测试新增/修改的自检断言 -->

## 关联

<!-- 关联的 issue 或审查报告条目（如 V5 报告 P0-1） -->
