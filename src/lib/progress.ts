import type { Curriculum, LearnProgress, Module } from "../data/types";

export interface ProgressCount {
  done: number;
  total: number;
  percent: number;
}

export function isLessonDone(progress: LearnProgress, lessonId: string): boolean {
  return progress.completedLessons.includes(lessonId);
}

export function moduleLessonProgress(module: Module, progress: LearnProgress): ProgressCount {
  const total = module.lessons.length;
  const done = module.lessons.filter((l) => isLessonDone(progress, l.id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** 课节总进度（用于首页 / 顶栏） */
export function lessonOverallProgress(curriculum: Curriculum, progress: LearnProgress): ProgressCount {
  const total = curriculum.modules.reduce((s, m) => s + m.lessons.length, 0);
  const validIds = new Set(curriculum.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  const done = progress.completedLessons.filter((id) => validIds.has(id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function hasStarted(progress: LearnProgress): boolean {
  return progress.completedLessons.length > 0 || Boolean(progress.lastVisited);
}

/** lastVisited 存的是完整路径，如 /curriculum/1/L01-01 */
export function getContinuePath(progress: LearnProgress): string | null {
  const lv = progress.lastVisited?.trim();
  if (!lv) return null;
  if (lv.startsWith("/curriculum")) return lv;
  return null;
}

/** 未开始时的默认入口 */
export function getStartPath(curriculum: Curriculum): string {
  const first = curriculum.modules[0];
  if (!first?.lessons[0]) return "/curriculum";
  return `/curriculum/${first.id}/${first.lessons[0].id}`;
}
