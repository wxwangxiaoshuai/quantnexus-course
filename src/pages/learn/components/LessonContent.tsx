import { Alert } from "antd";
import type { ComponentType } from "react";
import { QUIZZES } from "../data/courseContent";
import type { LessonContentBlock } from "../data/types";
import { LearnMarkdown } from "./LearnMarkdown";
import { QuizCard } from "./QuizCard";

function InteractivePlaceholder({ componentId }: { componentId: string }) {
  return (
    <Alert
      type="info"
      message={`交互组件「${componentId}」暂未加载`}
      description="该课时的交互演示尚未注册，请稍后重试或联系管理员。"
      style={{ marginTop: 16, marginBottom: 16 }}
    />
  );
}

interface Props {
  blocks: LessonContentBlock[];
  onQuizComplete?: () => void;
  interactiveComponents?: Record<string, ComponentType>;
}

export function LessonContent({ blocks, onQuizComplete, interactiveComponents = {} }: Props) {
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === "text") {
          return <LearnMarkdown key={i} content={block.content} />;
        }
        if (block.type === "highlight") {
          const colorMap = {
            blue: { bg: "#eaf3ff", border: "#1677ff" },
            orange: { bg: "#fef3c7", border: "#f0883e" },
            green: { bg: "#e6faf0", border: "#26a69a" },
          };
          const color = colorMap[block.color ?? "blue"];
          return (
            <div
              key={i}
              style={{
                background: color.bg,
                borderLeft: `4px solid ${color.border}`,
                padding: "12px 16px",
                margin: "16px 0",
                borderRadius: "0 6px 6px 0",
              }}
            >
              <LearnMarkdown content={block.content} />
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <pre
              key={i}
              style={{
                background: "#f6f8fa",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "16px",
                overflowX: "auto",
                fontSize: 13,
                color: "#1f2937",
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                margin: "16px 0",
                lineHeight: 1.6,
              }}
            >
              <code>{block.content}</code>
            </pre>
          );
        }
        if (block.type === "interactive") {
          const Comp = interactiveComponents[block.componentId];
          if (Comp) return <Comp key={i} {...(block.props ?? {})} />;
          return <InteractivePlaceholder key={i} componentId={block.componentId} />;
        }
        if (block.type === "quiz") {
          const quiz = QUIZZES[block.quizId as keyof typeof QUIZZES];
          if (!quiz) return null;
          return <QuizCard key={i} quiz={quiz} onComplete={onQuizComplete} />;
        }
        return null;
      })}
    </div>
  );
}
