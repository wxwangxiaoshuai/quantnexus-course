import { useCallback, useState } from "react";
import type { LearnProgress } from "../data/types";

const STORAGE_KEY = "qn_learn_progress";

function loadProgress(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LearnProgress;
  } catch {
    // ignore malformed storage
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
      const next = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
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

  return { progress, markComplete, saveScore, clearScore, setLastVisited, isComplete, getScore };
}
