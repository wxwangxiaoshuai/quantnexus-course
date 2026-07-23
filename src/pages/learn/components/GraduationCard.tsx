import { CheckCircleFilled, TrophyOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { COURSE_MODULES } from "../data/courseContent";
import { useLearnProgress } from "../hooks/useLearnProgress";

const { Title, Text, Paragraph } = Typography;

export function GraduationCard() {
  const navigate = useNavigate();
  const { progress, getScore } = useLearnProgress();
  const finalScore = getScore("q_final");

  // 毕业条件只算主线模块（m1-m9）；m10/m11 为进阶选修、m12/m13/m14 为实战项目，均不阻塞主线毕业
  const coreModules = COURSE_MODULES.filter((m) => !m.elective && m.id !== "m12" && m.id !== "m13" && m.id !== "m14");
  const coreLessonIds = new Set(coreModules.flatMap((m) => m.lessons.map((l) => l.id)));
  const totalLessons = coreLessonIds.size;
  const completedCount = progress.completedLessons.filter((id) => coreLessonIds.has(id)).length;
  const allComplete = completedCount >= totalLessons;
  const passed = finalScore !== undefined && finalScore >= 60;

  // M12/M13/M14 进阶毕业：主线毕业 + 至少完成一个实战项目（4 课节）
  const projectModules = COURSE_MODULES.filter((m) => m.id === "m12" || m.id === "m13" || m.id === "m14");
  const projectLessonIds = new Set(projectModules.flatMap((m) => m.lessons.map((l) => l.id)));
  const projectCompleted = progress.completedLessons.filter((id) => projectLessonIds.has(id)).length;
  const projectDone = projectCompleted >= 4;
  const isAdvancedGraduate = allComplete && passed && projectDone;

  if (!allComplete || !passed) return null;

  return (
    <Card
      style={{
        background: isAdvancedGraduate
          ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          : "linear-gradient(135deg, #eaf3ff 0%, #e6faf0 100%)",
        border: isAdvancedGraduate ? "2px solid #f0883e" : "2px solid #26a69a",
        marginTop: 32,
        textAlign: "center",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <TrophyOutlined style={{ fontSize: 48, color: isAdvancedGraduate ? "#f0883e" : "#f0883e" }} />
        <Title level={3} style={{ color: "#1f2937", margin: 0 }}>
          {isAdvancedGraduate
            ? "🏆 恭喜！你已达到量化交易专家水平！"
            : "🎉 恭喜！你已完成主线课程"}
        </Title>
        <Paragraph style={{ color: "#6b7280", fontSize: 15 }}>
          {isAdvancedGraduate
            ? "你已完成全部主线课程 + 3 个生产级实战项目，具备独立研发、风控、运维量化策略的能力。"
            : "你已掌握期货量化交易的核心知识体系。"}
        </Paragraph>
        {isAdvancedGraduate && (
          <Paragraph style={{ color: "#374151", fontSize: 14 }}>
            📊 实战项目完成度：{projectCompleted}/{projectLessonIds.size} 课节
          </Paragraph>
        )}
        <Row gutter={[8, 8]} justify="center">
          {[
            "期货合约要素",
            "盘口与撮合",
            "Tick 与 K 线",
            "技术指标原理",
            "策略构建与下单架构",
            "回测与 Walk-Forward 调参",
            "仓位管理与止损",
            "策略范式",
            "实盘路径",
            "因子研究与截面思维",
            "统计学习入门",
            ...(isAdvancedGraduate ? ["CTA 趋势跟踪全流程", "跨品种统计套利", "多因子截面策略"] : []),
          ].map((item) => (
            <Col key={item}>
              <Space>
                <CheckCircleFilled style={{ color: "#26a69a" }} />
                <Text style={{ color: "#374151" }}>{item}</Text>
              </Space>
            </Col>
          ))}
        </Row>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate("/strategy")}>
            去策略页面实践 →
          </Button>
          <Button size="large" onClick={() => navigate("/backtest")}>
            跑第一个回测 →
          </Button>
        </Space>
        <Text style={{ color: "#6b7280", fontSize: 12 }}>结业测验得分：{finalScore} 分</Text>
        {!isAdvancedGraduate && (
          <>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              想继续深入？进阶选修模块「因子研究」与「统计学习入门」不计入以上毕业条件，随时可以在课程侧边栏继续学习。
            </Text>
            <Text style={{ color: "#f0883e", fontSize: 13 }}>
              ⭐ 完成「第十二模块：生产级实战项目」中的 3 个端到端项目，即可达到进阶毕业——量化交易专家水平。
            </Text>
          </>
        )}
      </Space>
    </Card>
  );
}
