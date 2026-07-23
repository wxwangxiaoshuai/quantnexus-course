import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Space, Tag, Typography } from "antd";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COURSE_MODULES } from "../data/courseContent";
import { useLearnProgress } from "../hooks/useLearnProgress";
import { GraduationCard } from "./GraduationCard";
import { LessonContent } from "./LessonContent";
import { LeverageCalculator } from "./interactive/LeverageCalculator";
import { OrderBookSimulator } from "./interactive/OrderBookSimulator";
import { TickToKBar } from "./interactive/TickToKBar";
import { IndicatorLab } from "./interactive/IndicatorLab";
import { StrategySandbox } from "./interactive/StrategySandbox";
import { BacktestMetrics } from "./interactive/BacktestMetrics";
import { OverfittingDemo } from "./interactive/OverfittingDemo";
import { RuinSimulator } from "./interactive/RuinSimulator";
import { RegimeComparator } from "./interactive/RegimeComparator";
import { CodeChallenge } from "./interactive/CodeChallenge";
import { LookAheadBiasChallenge } from "./interactive/LookAheadBiasChallenge";

const INTERACTIVE_COMPONENTS: Record<string, ComponentType> = {
  LeverageCalculator,
  OrderBookSimulator,
  TickToKBar,
  IndicatorLab,
  StrategySandbox,
  BacktestMetrics,
  OverfittingDemo,
  RuinSimulator,
  RegimeComparator,
  CodeChallenge,
  LookAheadBiasChallenge,
};

const { Title, Text } = Typography;

export function LessonView() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { markComplete, setLastVisited, isComplete } = useLearnProgress();

  const mod = COURSE_MODULES.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (moduleId && lessonId) setLastVisited(`${moduleId}/${lessonId}`);
  }, [moduleId, lessonId, setLastVisited]);

  if (!mod || !lesson) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Text style={{ color: "#6b7280" }}>课节不存在</Text>
      </div>
    );
  }

  const allLessons = COURSE_MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id })),
  );
  const currentIdx = allLessons.findIndex((x) => x.moduleId === moduleId && x.lessonId === lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const done = isComplete(lesson.id);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <Space style={{ marginBottom: 8 }}>
        <Text style={{ color: "#6b7280" }}>
          {mod.icon} {mod.title}
        </Text>
        {done && (
          <Tag color="success" icon={<CheckOutlined />}>
            已完成
          </Tag>
        )}
      </Space>

      <Title level={3} style={{ color: "#1f2937", marginTop: 0 }}>
        {lesson.title}
      </Title>
      <Text style={{ color: "#6b7280", marginBottom: 24, display: "block" }}>⏱ {lesson.duration}</Text>

      <LessonContent
        blocks={lesson.blocks}
        onQuizComplete={() => markComplete(lesson.id)}
        interactiveComponents={INTERACTIVE_COMPONENTS}
      />

      {!done && (
        <Button
          type="primary"
          style={{ marginTop: 24 }}
          onClick={() => {
            markComplete(lesson.id);
            if (next) navigate(`/learn/${next.moduleId}/${next.lessonId}`);
          }}
        >
          <CheckOutlined /> 标记完成
          {next ? "，进入下一课" : ""}
        </Button>
      )}

      <Space style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
        {prev ? (
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/learn/${prev.moduleId}/${prev.lessonId}`)}>
            上一课
          </Button>
        ) : (
          <div />
        )}
        {next ? (
          <Button icon={<ArrowRightOutlined />} onClick={() => navigate(`/learn/${next.moduleId}/${next.lessonId}`)}>
            下一课
          </Button>
        ) : (
          <Button onClick={() => navigate("/learn")}>返回课程首页</Button>
        )}
      </Space>

      {!next && <GraduationCard />}
    </div>
  );
}
