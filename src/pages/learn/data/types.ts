export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export type LessonContentBlock =
  | { type: "text"; content: string }
  | { type: "highlight"; content: string; color?: "blue" | "orange" | "green" }
  | { type: "code"; language: string; content: string }
  | { type: "interactive"; componentId: string; props?: Record<string, unknown> }
  | { type: "quiz"; quizId: string };

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  blocks: LessonContentBlock[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  /** 进阶/选修模块：不计入主线毕业条件与核心课程进度统计（如因子研究、统计学习） */
  elective?: boolean;
}

export interface LearnProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  lastVisited?: string;
}
