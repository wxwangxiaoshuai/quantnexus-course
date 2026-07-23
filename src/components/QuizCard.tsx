import { useState } from "react";
import type { Quiz } from "../data/types";
import { useLearnProgress } from "../hooks/useLearnProgress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  quiz: Quiz;
  onComplete?: () => void;
}

function Md({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content}
    </ReactMarkdown>
  );
}

export function QuizCard({ quiz, onComplete }: Props) {
  const { saveScore, getScore, clearScore } = useLearnProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const existingScore = getScore(quiz.id);

  const handleSubmit = () => {
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    const score = Math.round((correct / quiz.questions.length) * 100);
    saveScore(quiz.id, score);
    setSubmitted(true);
    if (score >= 60) onComplete?.();
  };

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  if (existingScore !== undefined && !submitted) {
    return (
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={existingScore >= 60 ? "text-emerald-400" : "text-red-400"}>🏆</span>
          <span className="text-ink-100">
            本节测验已完成，得分：
            <strong className={existingScore >= 60 ? "text-emerald-400" : "text-red-400"}> {existingScore} 分</strong>
          </span>
          <button
            type="button"
            className="btn-ghost !px-3 !py-1 text-xs"
            onClick={() => {
              clearScore(quiz.id);
              setAnswers({});
              setSubmitted(false);
            }}
          >
            重新作答
          </button>
        </div>
      </div>
    );
  }

  const correctCount = quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const score = submitted ? Math.round((correctCount / quiz.questions.length) * 100) : 0;

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="mb-5 text-lg font-semibold text-ink-50">随堂测验</h3>
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const isCorrect = answers[q.id] === q.correctIndex;
          return (
            <div key={q.id}>
              <div className="mb-2 flex gap-2 text-ink-100">
                <span className="shrink-0 font-semibold">{qi + 1}.</span>
                <div className="prose-invert text-sm">
                  <Md content={q.question} />
                </div>
              </div>
              <div className="ml-5 space-y-2">
                {q.options.map((opt, oi) => {
                  let cls = "border-ink-700 hover:border-brand-500/40";
                  if (submitted) {
                    if (oi === q.correctIndex) cls = "border-emerald-500/50 bg-emerald-500/10";
                    else if (answers[q.id] === oi) cls = "border-red-500/50 bg-red-500/10";
                  } else if (answers[q.id] === oi) {
                    cls = "border-brand-500 bg-brand-500/10";
                  }
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm text-ink-200 ${cls}`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name={q.id}
                        disabled={submitted}
                        checked={answers[q.id] === oi}
                        onChange={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      />
                      <span>
                        <Md content={opt} />
                      </span>
                    </label>
                  );
                })}
              </div>
              {submitted && (
                <div
                  className={`mt-2 ml-5 rounded-lg px-3 py-2 text-sm ${
                    isCorrect ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
                  }`}
                >
                  <Md content={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button type="button" className="btn-primary mt-6" disabled={!allAnswered} onClick={handleSubmit}>
          提交答案
        </button>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full ${score >= 60 ? "bg-emerald-500" : "bg-red-500"}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className={score >= 60 ? "text-emerald-400" : "text-red-400"}>
            {score >= 60
              ? `通过！答对 ${correctCount}/${quiz.questions.length} 题（${score} 分）`
              : `未通过，答对 ${correctCount}/${quiz.questions.length} 题（${score} 分），请复习后重试`}
          </p>
          {score < 60 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                clearScore(quiz.id);
                setAnswers({});
                setSubmitted(false);
              }}
            >
              重新作答
            </button>
          )}
        </div>
      )}
    </div>
  );
}
