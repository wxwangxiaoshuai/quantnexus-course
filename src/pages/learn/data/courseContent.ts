/**
 * 旧 learn 路径兼容层。
 * QUIZZES / GLOSSARY 统一自 src/data/quizzes.ts 导出，避免双份题库漂移。
 */
export { COURSE_MODULES } from "./courseLoader";
export { QUIZZES, GLOSSARY } from "../../../data/quizzes";
