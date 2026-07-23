import { Card, Col, InputNumber, Row, Slider, Space, Typography } from "antd";
import { useState } from "react";

const { Text, Title } = Typography;

export function LeverageCalculator() {
  const [capital, setCapital] = useState(100000);
  const [leverage, setLeverage] = useState(10);
  const [changeRate, setChangeRate] = useState(5);

  const position = capital * leverage;
  const pnl = position * (changeRate / 100);
  const pnlRate = (pnl / capital) * 100;
  const marginRatio = (1 / leverage) * 100;
  const liquidationRate = -marginRatio * 0.8;

  const isGain = changeRate >= 0;
  const isLiquidated = pnlRate <= liquidationRate;

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🎮 杠杆 & 保证金计算器
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Row gutter={[24, 16]}>
        <Col span={24} md={12}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text style={{ color: "#6b7280" }}>本金（元）</Text>
              <InputNumber
                value={capital}
                onChange={(v) => v && setCapital(v)}
                min={10000}
                max={10000000}
                step={10000}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div>
              <Text style={{ color: "#6b7280" }}>杠杆倍数：{leverage}x</Text>
              <Slider
                min={1}
                max={20}
                value={leverage}
                onChange={setLeverage}
                marks={{ 1: "1x", 5: "5x", 10: "10x", 20: "20x" }}
                trackStyle={{ background: "#1677ff" }}
                handleStyle={{ borderColor: "#1677ff" }}
              />
            </div>
            <div>
              <Text style={{ color: "#6b7280" }}>
                价格变化：{changeRate > 0 ? "+" : ""}
                {changeRate}%
              </Text>
              <Slider
                min={-30}
                max={30}
                value={changeRate}
                onChange={setChangeRate}
                marks={{ "-30": "-30%", 0: "0", 30: "+30%" }}
                trackStyle={{ background: changeRate >= 0 ? "#ef5350" : "#26a69a" }}
                handleStyle={{ borderColor: changeRate >= 0 ? "#ef5350" : "#26a69a" }}
              />
            </div>
          </Space>
        </Col>
        <Col span={24} md={12}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div style={{ background: "#f6f8fb", borderRadius: 8, padding: 16 }}>
              <Row gutter={8}>
                <Col xs={24} sm={12}>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>控仓价值</Text>
                  <div>
                    <Text strong style={{ color: "#1f2937" }}>
                      ¥{position.toLocaleString()}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>保证金比例</Text>
                  <div>
                    <Text strong style={{ color: "#1f2937" }}>
                      {marginRatio.toFixed(1)}%
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              style={{
                background: isLiquidated ? "#fee2e2" : isGain ? "#e6faf0" : "#fef3c7",
                border: `2px solid ${isLiquidated ? "#ef5350" : isGain ? "#26a69a" : "#f0883e"}`,
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}
            >
              {isLiquidated ? (
                <>
                  <Text style={{ color: "#ef5350", fontSize: 20 }}>💥 爆仓！</Text>
                  <div>
                    <Text style={{ color: "#ef5350" }}>亏损超过保证金，账户归零</Text>
                  </div>
                </>
              ) : (
                <>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>盈亏金额</Text>
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 24,
                        color: isGain ? "#ef5350" : "#26a69a",
                      }}
                    >
                      {isGain ? "+" : ""}¥{Math.round(pnl).toLocaleString()}
                    </Text>
                  </div>
                  <div>
                    <Text
                      style={{
                        fontSize: 16,
                        color: isGain ? "#ef5350" : "#26a69a",
                      }}
                    >
                      {isGain ? "+" : ""}
                      {pnlRate.toFixed(1)}% 本金
                    </Text>
                  </div>
                </>
              )}
            </div>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>
              爆仓线：价格下跌约 {Math.abs(liquidationRate).toFixed(1)}% 时触发（保证金亏损 80%）
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
