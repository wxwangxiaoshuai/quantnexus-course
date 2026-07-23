import sys

path = "src/pages/learn/data/courseContent.ts"
with open(path, encoding="utf-8") as f:
    lines = f.readlines()

# 边界校验（0-index）：index 0 = import，1 = 空行，2 = COURSE_MODULES 开始，2589 = QUIZZES 开始
assert "export const COURSE_MODULES" in lines[2], lines[2]
assert "export const QUIZZES" in lines[2589], lines[2589]

# 保留 index 0（import 行）+ 从 index 2589（export const QUIZZES）起
tail = lines[2589:]

new_head = (
    'import type { GlossaryTerm, Quiz } from "./types";\n'
    "\n"
    "// 课程内容已迁移至 content/*.md，由 courseLoader 加载。\n"
    "// QUIZZES 与 GLOSSARY 仍为结构化数据（按 key 查询），保留在此。\n"
    'export { COURSE_MODULES } from "./courseLoader";\n'
    "\n"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_head)
    f.writelines(tail)

print("done, new line count:", new_head.count("\n") + len(tail))

