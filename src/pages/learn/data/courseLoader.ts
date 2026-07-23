/**
 * courseLoader —— 从 content/*.md 加载课程内容，产出与原 COURSE_MODULES 同构的结构。
 *
 * 设计：markdown 文件经 frontmatter + 正文解析后，还原为 LessonContentBlock[]，
 * 使 LessonContent.tsx 的 block 分发逻辑零改动。
 *
 * Block → Markdown 反向映射：
 * - 正文段落          → { type: "text", content }
 * - :::highlight color ... :::  → { type: "highlight", content, color }
 * - ```lang ... ```   → { type: "code", language, content }
 * - <!-- interactive:N --> → frontmatter interactive[N-1] → { type:"interactive", componentId }
 * - <!-- quiz:N -->     → frontmatter quiz[N-1] → { type:"quiz", quizId }
 */
import matter from "gray-matter";
import type { CourseModule, Lesson, LessonContentBlock } from "./types";

interface LessonFrontmatter {
  id: string;
  title: string;
  duration: string;
  module: string;
  moduleTitle?: string;
  elective?: boolean;
  order: number;
  interactive?: { ref: string; slot: number }[];
  quiz?: { id: string; slot: number }[];
}

// 用 ?raw 一次性加载所有 md 源码字符串
const RAW = import.meta.glob("./content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

interface ParsedLesson {
  fm: LessonFrontmatter;
  blocks: LessonContentBlock[];
  file: string;
}

/**
 * 把 md 正文解析为 block 数组。
 * 顺序扫描，识别 fenced code / :::highlight 容器 / HTML 注释占位 / 普通文本。
 */
function parseBody(body: string, fm: LessonFrontmatter): LessonContentBlock[] {
  const blocks: LessonContentBlock[] = [];
  const lines = body.split("\n");
  let i = 0;
  let textBuf: string[] = [];

  const flushText = () => {
    if (textBuf.length === 0) return;
    const content = textBuf.join("\n").trim();
    if (content) blocks.push({ type: "text", content });
    textBuf = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const codeMatch = line.match(/^```(\w*)/);
    if (codeMatch) {
      flushText();
      const lang = codeMatch[1] || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结尾 ```
      blocks.push({ type: "code", language: lang, content: codeLines.join("\n") });
      continue;
    }

    // :::highlight <color> 容器
    const hlStart = line.match(/^:::highlight\s+(\w+)/);
    if (hlStart) {
      flushText();
      const color = hlStart[1] as "blue" | "orange" | "green";
      const hlLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) {
        hlLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结尾 :::
      blocks.push({
        type: "highlight",
        content: hlLines.join("\n").trim(),
        color,
      });
      continue;
    }

    // HTML 注释占位 <!-- interactive:N --> / <!-- quiz:N -->
    const intMatch = line.match(/^<!--\s*interactive:(\d+)\s*-->/);
    if (intMatch) {
      flushText();
      const slot = Number(intMatch[1]);
      const entry = fm.interactive?.find((x) => x.slot === slot);
      if (entry) blocks.push({ type: "interactive", componentId: entry.ref });
      i++;
      continue;
    }
    const quizMatch = line.match(/^<!--\s*quiz:(\d+)\s*-->/);
    if (quizMatch) {
      flushText();
      const slot = Number(quizMatch[1]);
      const entry = fm.quiz?.find((x) => x.slot === slot);
      if (entry) blocks.push({ type: "quiz", quizId: entry.id });
      i++;
      continue;
    }

    // 普通文本行（含空行，保留段落结构）
    textBuf.push(line);
    i++;
  }
  flushText();
  return blocks;
}

function parseAll(): Map<string, ParsedLesson> {
  const map = new Map<string, ParsedLesson>();
  for (const [path, raw] of Object.entries(RAW)) {
    if (path.endsWith("modules.json")) continue;
    const { data, content } = matter(raw);
    const fm = data as LessonFrontmatter;
    if (!fm.id) continue;
    const blocks = parseBody(content, fm);
    map.set(fm.id, { fm, blocks, file: path });
  }
  return map;
}

const PARSED = parseAll();

// modules.json 提供模块顺序与课节归属
interface ModulesIndex {
  id: string;
  title: string;
  description: string;
  icon: string;
  elective?: boolean;
  lessons: string[];
}
const MODULES_INDEX: ModulesIndex[] = (
  import.meta.glob("./content/modules.json", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>
)["./content/modules.json"]
  ? JSON.parse(
      (import.meta.glob("./content/modules.json", {
        query: "?raw",
        import: "default",
        eager: true,
      }) as Record<string, string>)["./content/modules.json"],
    )
  : [];

export const COURSE_MODULES: CourseModule[] = MODULES_INDEX.map((m) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  icon: m.icon,
  elective: m.elective,
  lessons: m.lessons
    .map((lid) => {
      const p = PARSED.get(lid);
      if (!p) return null;
      const lesson: Lesson = {
        id: p.fm.id,
        title: p.fm.title,
        duration: p.fm.duration,
        blocks: p.blocks,
      };
      return lesson;
    })
    .filter((l): l is Lesson => l !== null),
}));
