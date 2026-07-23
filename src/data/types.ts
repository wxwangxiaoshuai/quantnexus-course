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

export interface ProjectBase {
  id: string;
  title: string;
  summary: string;
  module: number;
  difficulty: Difficulty;
  deliverables: string[];
  stack: string[];
}

export interface Project extends ProjectBase {
  /** 预计完成时长（分钟） */
  durationMinutes: number;
  objectives: string[];
  /** 关联课节 id，如 L01-02 */
  relatedLessons: string[];
  /** 核心互动 registry type，无则省略 */
  interactive?: string;
  /** 核心概念标签 — stack 字段复用 ProjectBase.stack */
  acceptanceCriteria: string[];
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

/** curriculum.generated.ts 中 module.project 的 stub 形态 */
export type GeneratedModule = Omit<Module, "project"> & { project?: ProjectBase };

export interface Curriculum {
  title: string;
  tagline: string;
  description: string;
  modules: Module[];
}

/** scripts/migrate 生成的 curriculum 形态（project 为 stub） */
export interface GeneratedCurriculum extends Omit<Curriculum, "modules"> {
  modules: GeneratedModule[];
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
