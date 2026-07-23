/**
 * QuantNexus 课程数据模型（对齐 ai-agent-mastery，扩展测验/术语/进度）
 */

export type Difficulty = "入门" | "进阶" | "高级" | "专家";

export type LessonType = "理论" | "实战" | "项目" | "复盘";

export interface Lesson {
  /** 如 L01-01 */
  id: string;
  /** 旧 id，如 m1l1，用于进度迁移 */
  legacyId: string;
  title: string;
  summary: string;
  /** 预计学习时长（分钟） */
  duration: number;
  type: LessonType;
  objectives: string[];
  tags: string[];
  prerequisites?: string[];
  competency?: string;
  quizId?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  module: number;
  difficulty: Difficulty;
  deliverables: string[];
  stack: string[];
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  hours: number;
  icon: string;
  accent: string;
  elective?: boolean;
  lessons: Lesson[];
  project?: Project;
}

export interface Curriculum {
  title: string;
  tagline: string;
  description: string;
  modules: Module[];
}

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

export interface LearnProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  lastVisited?: string;
}

export interface Stage {
  id: number;
  name: string;
  range: [number, number];
  color: string;
}
