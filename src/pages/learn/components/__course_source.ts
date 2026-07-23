/**
 * 课程内容源码合并字符串——供内容自检测试做不变量断言。
 *
 * 内容已迁移至 content/*.md，QUIZZES/GLOSSARY 仍在 courseContent.ts。
 * 合并所有 md 源码 + courseContent.ts 源码为一个字符串，
 * 使原有"防内容回退"断言（如"rb2510.SHFE 不出现"、"便利收益减项存在"）继续生效。
 */
const MD_RAW = import.meta.glob("../data/content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const CC_RAW = (
  import.meta.glob("../data/courseContent.ts", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>
)["../data/courseContent.ts"] ?? "";

export const COURSE_SOURCE: string =
  Object.values(MD_RAW).join("\n\n") + "\n\n" + CC_RAW;
