/**
 * 课程内容源码合并字符串——供内容自检测试做不变量断言。
 *
 * 真相源：src/content 下全部 markdown，以及 src/data/quizzes.ts
 * （旧 pages/learn/data/content 仅作历史兼容，不再作为自检输入）
 */
const MD_RAW = import.meta.glob("../../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const QUIZ_RAW = (
  import.meta.glob("../../../data/quizzes.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>
)["../../../data/quizzes.ts"] ?? "";

export const COURSE_SOURCE: string =
  Object.values(MD_RAW).join("\n\n") + "\n\n" + QUIZ_RAW;
