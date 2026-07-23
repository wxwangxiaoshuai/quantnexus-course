/**
 * 一次性转换脚本：把 courseContent.ts 的 COURSE_MODULES 转成 content/*.md + modules.json
 *
 * 用法：npm run convert:content（tsx scripts/convert-content.ts）
 * 跑完即弃——产物是 src/pages/learn/data/content/ 下的 56 个 .md + modules.json。
 *
 * Block → Markdown 映射：
 * - text     → 正文（\n→真实换行，保留 $$ / 表格 / 引用）
 * - highlight → :::highlight <color> ... :::
 * - code     → ```lang ... ```
 * - interactive → frontmatter interactive[] + 正文 <!-- interactive:N -->
 * - quiz     → frontmatter quiz[] + 正文 <!-- quiz:N -->
 */
import fs from "node:fs";
import path from "node:path";
// 用主项目原始 courseContent 的本地副本（无 import.meta.glob，可在 node/tsx 运行）
import { COURSE_MODULES } from "./_tmp/courseContent.full";
import type { LessonContentBlock } from "./_tmp/types";

const OUT_DIR = path.resolve(
  import.meta.dirname,
  "../src/pages/learn/data/content",
);
const safeName = (s: string) =>
  s.replace(/[\/\\?%*:|"<>]/g, "").replace(/\s+/g, "-").slice(0, 40);

interface LessonMeta {
  id: string;
  title: string;
  module: string;
  duration: string;
  order: number;
  file: string;
}

function blockToMd(
  block: LessonContentBlock,
  ctx: { interactive: string[]; quiz: string[] },
): string {
  switch (block.type) {
    case "text":
      return block.content;
    case "highlight": {
      const color = block.color ?? "blue";
      return `:::highlight ${color}\n${block.content}\n:::`;
    }
    case "code":
      return "```" + block.language + "\n" + block.content + "\n```";
    case "interactive": {
      const idx = ctx.interactive.length + 1;
      ctx.interactive.push(block.componentId);
      return `<!-- interactive:${idx} -->`;
    }
    case "quiz": {
      const idx = ctx.quiz.length + 1;
      ctx.quiz.push(block.quizId);
      return `<!-- quiz:${idx} -->`;
    }
    default:
      return "";
  }
}

function blocksToMd(blocks: LessonContentBlock[]): {
  body: string;
  interactive: string[];
  quiz: string[];
} {
  const ctx = { interactive: [] as string[], quiz: [] as string[] };
  const parts: string[] = [];
  for (const b of blocks) {
    parts.push(blockToMd(b, ctx));
  }
  return { body: parts.join("\n\n"), interactive: ctx.interactive, quiz: ctx.quiz };
}

function frontmatter(obj: Record<string, unknown>): string {
  const lines: string[] = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      lines.push(`${k}:`);
      for (const item of v) {
        if (typeof item === "object" && item !== null) {
          const entries = Object.entries(item as Record<string, unknown>);
          entries.forEach(([ik, iv], idx) => {
            const prefix = idx === 0 ? "  - " : "    ";
            lines.push(`${prefix}${ik}: ${JSON.stringify(iv).replace(/^"|"$/g, "")}`);
          });
        } else {
          lines.push(`  - ${JSON.stringify(item).replace(/^"|"$/g, "")}`);
        }
      }
    } else {
      lines.push(`${k}: ${JSON.stringify(v).replace(/^"|"$/g, "")}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const index: LessonMeta[] = [];
  let globalOrder = 0;
  for (const mod of COURSE_MODULES) {
    for (const lesson of mod.lessons) {
      globalOrder += 1;
      const { body, interactive, quiz } = blocksToMd(lesson.blocks);
      const file = `${lesson.id}-${safeName(lesson.title)}.md`;
      const fm = frontmatter({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        module: mod.id,
        moduleTitle: mod.title,
        elective: mod.elective ?? false,
        order: globalOrder,
        interactive: interactive.map((ref, i) => ({ ref, slot: i + 1 })),
        quiz: quiz.map((id, i) => ({ id, slot: i + 1 })),
      });
      const content = `${fm}\n\n${body}\n`;
      fs.writeFileSync(path.join(OUT_DIR, file), content, "utf-8");
      index.push({
        id: lesson.id,
        title: lesson.title,
        module: mod.id,
        duration: lesson.duration,
        order: globalOrder,
        file,
      });
    }
  }
  fs.writeFileSync(
    path.join(OUT_DIR, "modules.json"),
    JSON.stringify(
      COURSE_MODULES.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        icon: m.icon,
        elective: m.elective ?? false,
        lessons: m.lessons.map((l) => l.id),
      })),
      null,
      2,
    ),
    "utf-8",
  );
  console.log(`✓ 生成 ${index.length} 个 .md 文件 + modules.json → ${OUT_DIR}`);
}

main();
