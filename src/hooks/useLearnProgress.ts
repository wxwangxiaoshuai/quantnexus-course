import { useCallback, useState } from "react";
import type { LearnProgress } from "../data/types";
import { LEGACY_LESSON_ID_MAP } from "../data/curriculum";

const STORAGE_KEY = "qn_learn_progress";

function migrateIds(ids: string[]): string[] {
  const mapped = ids.map((id) => LEGACY_LESSON_ID_MAP[id] ?? id);
  return [...new Set(mapped)];
}

function loadProgress(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearnProgress;
      return {
        ...parsed,
        completedLessons: migrateIds(parsed.completedLessons ?? []),
      };
    }
  } catch {
    // ignore
  }
  return { completedLessons: [], quizScores: {} };
}

function saveProgress(p: LearnProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useLearnProgress() {
  const [progress, setProgress] = useState<LearnProgress>(loadProgress);

  const markComplete = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const next = { ...prev, completedLessons: [...prev.completedLessons, lessonId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const unmarkComplete = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (!prev.completedLessons.includes(lessonId)) return prev;
      const next = {
        ...prev,
        completedLessons: prev.completedLessons.filter((id) => id !== lessonId),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const saveScore = useCallback((quizId: string, score: number) => {
    setProgress((prev) => {
      const next = { ...prev, quizScores: { ...prev.quizScores, [quizId]: score } };
      saveProgress(next);
      return next;
    });
  }, []);

  const setLastVisited = useCallback((path: string) => {
    setProgress((prev) => {
      const next = { ...prev, lastVisited: path };
      saveProgress(next);
      return next;
    });
  }, []);

  const isComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress],
  );

  const clearScore = useCallback((quizId: string) => {
    setProgress((prev) => {
      const { [quizId]: _, ...remaining } = prev.quizScores;
      const next = { ...prev, quizScores: remaining };
      saveProgress(next);
      return next;
    });
  }, []);

  const getScore = useCallback(
    (quizId: string): number | undefined => progress.quizScores[quizId],
    [progress],
  );

  return {
    progress,
    markComplete,
    unmarkComplete,
    saveScore,
    clearScore,
    setLastVisited,
    isComplete,
    getScore,
  };
}
