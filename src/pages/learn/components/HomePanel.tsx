import { BookOutlined, ClockCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { COURSE_MODULES } from "../data/courseContent";
import { useLearnProgress } from "../hooks/useLearnProgress";

const { Title, Paragraph, Text } = Typography;

export function HomePanel() {
  const navigate = useNavigate();
  const { progress, isComplete } = useLearnProgress();

  const coreModules = COURSE_MODULES.filter((m) => !m.elective && m.id !== "m12" && m.id !== "m13" && m.id !== "m14");
  const totalLessons = coreModules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = progress.completedLessons.filter((id) =>
    coreModules.some((m) => m.lessons.some((l) => l.id === id)),
  ).length;

  const firstIncomplete = COURSE_MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id })),
  ).find(({ lessonId }) => !isComplete(lessonId));

  return (
    <div className="learn-page-content">
      <Title level={2} style={{ color: "#1f2937" }}>
        期货量化交易系统课程
      </Title>
      <Paragraph style={{ color: "#6b7280", fontSize: 16, marginBottom: 32 }}>
        面向有编程经验的金融零基础学习者。用程序员的视角，深入浅出地掌握期货量化交易的核心知识。包含 12 个模块、3 个生产级实战项目，从策略发现到实盘上线全流程。
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <Statistic
              title={<Text style={{ color: "#6b7280" }}>主线课程进度</Text>}
              value={completedCount}
              suffix={`/ ${totalLessons} 课节`}
              valueStyle={{ color: "#1677ff" }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <Statistic
              title={<Text style={{ color: "#6b7280" }}>主线预计时长</Text>}
              value="约 13"
              suffix="小时"
              valueStyle={{ color: "#26a69a" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <Statistic
              title={<Text style={{ color: "#6b7280" }}>互动组件</Text>}
              value={11}
              suffix="个"
              valueStyle={{ color: "#f0883e" }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        {firstIncomplete ? (
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(`/learn/${firstIncomplete.moduleId}/${firstIncomplete.lessonId}`)}
          >
            {completedCount === 0 ? "开始学习" : "继续学习"}
          </Button>
        ) : (
          <Button type="primary" size="large" disabled>
            🎉 课程已全部完成！
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {COURSE_MODULES.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => isComplete(l.id)).length;
          return (
            <Col xs={24} md={12} key={mod.id}>
              <Card
                hoverable
                style={{
                  background: (mod.id === "m12" || mod.id === "m13" || mod.id === "m14") ? "#fffbeb" : "#ffffff",
                  border: (mod.id === "m12" || mod.id === "m13" || mod.id === "m14") ? "2px solid #f0883e" : "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const firstLesson = mod.lessons[0];
                  if (firstLesson) navigate(`/learn/${mod.id}/${firstLesson.id}`);
                }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space>
                    <span style={{ fontSize: 20 }}>{mod.icon}</span>
                    <Text strong style={{ color: "#1f2937" }}>
                      {mod.title}
                    </Text>
                    {mod.elective && <Tag color="purple">选修</Tag>}
                  </Space>
                  <Text style={{ color: "#6b7280", fontSize: 13 }}>{mod.description}</Text>
                  <Space>
                    <Tag color={modCompleted === mod.lessons.length ? "success" : "default"}>
                      {modCompleted}/{mod.lessons.length} 已完成
                    </Tag>
                  </Space>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
