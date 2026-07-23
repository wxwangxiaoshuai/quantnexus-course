import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "src/pages/learn/data/courseContent.ts"), "utf8");
const out = src
  .replace('import type { GlossaryTerm, Quiz } from "./types";', 'import type { GlossaryTerm, Quiz } from "./types";')
  .replace('export { COURSE_MODULES } from "./courseLoader";\n', "")
  .replace('export { COURSE_MODULES } from "./courseLoader";\r\n', "");
fs.writeFileSync(path.join(root, "src/data/quizzes.ts"), out);
console.log("wrote quizzes.ts", out.length);
