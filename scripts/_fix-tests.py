"""把 4 个 learn-course-fix-*.test.ts 的内联 SOURCE 定义替换为 import COURSE_SOURCE。"""
import re

files = [
    "src/pages/learn/components/learn-course-fix-p0.test.ts",
    "src/pages/learn/components/learn-course-fix-m1-m8.test.ts",
    "src/pages/learn/components/learn-course-fix-m12-m14.test.ts",
    "src/pages/learn/components/learn-course-fix-consistency.test.ts",
]

# 匹配从 'import { describe, expect, it } from "vitest";' 到 SOURCE 定义结束（']\n' 或 ']);\n'）
# 用非贪婪匹配，替换为 import + const SOURCE = COURSE_SOURCE
pattern = re.compile(
    r'import \{ describe, expect, it \} from "vitest";\s*\n'
    r'\s*(?:/\*.*?\*/\s*\n)?'  # 可选注释
    r'const SOURCE = \(\s*\n'
    r'.*?\)\s*\n\)\s*\n',  # 非贪婪到第一个 )
    re.DOTALL,
)

replacement = (
    'import { describe, expect, it } from "vitest";\n'
    '\n'
    'import { COURSE_SOURCE } from "./__course_source";\n'
    '\n'
    'const SOURCE = COURSE_SOURCE;\n'
)

for fp in files:
    with open(fp, encoding="utf-8") as f:
        s = f.read()
    # 用更简单的策略：删掉 const SOURCE 定义块，加 import
    # 找 'import { describe' 到 'const SOURCE = ... ;' 结束
    # SOURCE 块结束标志：')[...)];' 行
    lines = s.split("\n")
    out = []
    skip = False
    for i, line in enumerate(lines):
        if 'const SOURCE = (' in line:
            skip = True
            # 在这里插入 import + const SOURCE = COURSE_SOURCE（若尚未插入）
            out.append('import { COURSE_SOURCE } from "./__course_source";')
            out.append('')
            out.append('const SOURCE = COURSE_SOURCE;')
            continue
        if skip:
            # 跳过 SOURCE 定义块直到结束（含 ']["../data/courseContent.ts"];' 行）
            if '"../data/courseContent.ts"]' in line or '"../data/courseContent.ts"];' in line:
                skip = False
            continue
        out.append(line)
    with open(fp, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"updated {fp}")
