import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Progress, Radio, Space, Typography } from "antd";
import { useState } from "react";
import type { Quiz } from "../data/types";
import { useLearnProgress } from "../hooks/useLearnProgress";
import { LearnMarkdown } from "./LearnMarkdown";

const { Text, Title } = Typography;

interface Props {
  quiz: Quiz;
  onComplete?: () => void;
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
      <Card style={{ background: "#ffffff", border: "1px solid #e5e7eb", marginTop: 24 }}>
        <Space>
          <TrophyOutlined style={{ color: existingScore >= 60 ? "#26a69a" : "#ef5350" }} />
          <Text style={{ color: "#1f2937" }}>
            本节测验已完成，得分：
            <Text strong style={{ color: existingScore >= 60 ? "#26a69a" : "#ef5350", marginLeft: 4 }}>
              {existingScore} 分
            </Text>
          </Text>
          <Button size="small" onClick={() => { clearScore(quiz.id); setAnswers({}); setSubmitted(false); }}>
            重新作答
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          随堂测验
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", marginTop: 24 }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {quiz.questions.map((q, qi) => {
          const answered = answers[q.id] !== undefined;
          const isCorrect = answered && answers[q.id] === q.correctIndex;
          return (
            <div key={q.id}>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <Text strong style={{ color: "#1f2937", flexShrink: 0 }}>
                  {qi + 1}.
                </Text>
                <LearnMarkdown content={q.question} compact />
              </div>
              <Radio.Group
                style={{ display: "block", marginTop: 8 }}
                value={answers[q.id]}
                onChange={(e) =>
                  !submitted && setAnswers((prev) => ({ ...prev, [q.id]: e.target.value as number }))
                }
                disabled={submitted}
              >
                <Space direction="vertical">
                  {q.options.map((opt, oi) => (
                    <Radio
                      key={oi}
                      value={oi}
                      style={{
                        color:
                          submitted && oi === q.correctIndex
                            ? "#26a69a"
                            : submitted && answers[q.id] === oi && oi !== q.correctIndex
                              ? "#ef5350"
                              : "#1f2937",
                      }}
                    >
                      <LearnMarkdown content={opt} compact />
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
              {submitted && (
                <Alert
                  type={isCorrect ? "success" : "error"}
                  icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  showIcon
                  message={<LearnMarkdown content={q.explanation} compact />}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          );
        })}

        {!submitted ? (
          <Button type="primary" disabled={!allAnswered} onClick={handleSubmit}>
            提交答案
          </Button>
        ) : (
          (() => {
            const correct = quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length;
            const score = Math.round((correct / quiz.questions.length) * 100);
            return (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Progress percent={score} strokeColor={score >= 60 ? "#26a69a" : "#ef5350"} format={(p) => `${p}分`} />
                <Text style={{ color: score >= 60 ? "#26a69a" : "#ef5350" }}>
                  {score >= 60
                    ? `✅ 通过！答对 ${correct}/${quiz.questions.length} 题`
                    : `❌ 未通过，答对 ${correct}/${quiz.questions.length} 题，请复习后重试`}
                </Text>
                {score < 60 && (
                  <Button
                    onClick={() => {
                      clearScore(quiz.id);
                      setAnswers({});
                      setSubmitted(false);
                    }}
                  >
                    重新作答
                  </Button>
                )}
              </Space>
            );
          })()
        )}
      </Space>
    </Card>
  );
}
