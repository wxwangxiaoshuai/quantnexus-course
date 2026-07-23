import { Card, Col, Row, Segmented, Slider, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

function genData(n: number, seed: number, trendStrength: number): number[] {
  let price = 3500;
  let s = seed;
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s / 0xffffffff - 0.5) * 2;
  };
  const prices = [];
  for (let i = 0; i < n; i++) {
    const trend = Math.sin(i / 8) * trendStrength;
    price += trend + next() * 5;
    prices.push(Math.round(price * 10) / 10);
  }
  return prices;
}

const IN_SAMPLE = genData(60, 42, 3);
const OUT_SAMPLE = genData(40, 99, 0.5);

function runDualMa(prices: number[], fast: number, slow: number): number[] {
  let cash = 100000;
  let pos = 0;
  const equity = [cash];

  for (let i = slow; i < prices.length; i++) {
    const fastMa = prices.slice(i - fast + 1, i + 1).reduce((a, b) => a + b) / fast;
    const prevFastMa = prices.slice(i - fast, i).reduce((a, b) => a + b) / fast;
    const slowMa = prices.slice(i - slow + 1, i + 1).reduce((a, b) => a + b) / slow;
    const prevSlowMa = prices.slice(i - slow, i).reduce((a, b) => a + b) / slow;

    if (prevFastMa <= prevSlowMa && fastMa > slowMa && pos === 0) {
      pos = Math.floor(cash / prices[i]);
      cash -= pos * prices[i];
    } else if (prevFastMa >= prevSlowMa && fastMa < slowMa && pos > 0) {
      cash += pos * prices[i];
      pos = 0;
    }
    equity.push(Math.round(cash + pos * prices[i]));
  }
  return equity;
}

export function OverfittingDemo() {
  const [fast, setFast] = useState(3);
  const [slow, setSlow] = useState(8);
  const [view, setView] = useState<"in" | "out">("in");

  const inEquity = useMemo(() => runDualMa(IN_SAMPLE, fast, slow), [fast, slow]);
  const outEquity = useMemo(() => runDualMa(OUT_SAMPLE, fast, slow), [fast, slow]);

  const inReturn = (((inEquity[inEquity.length - 1] - 100000) / 100000) * 100).toFixed(1);
  const outReturn = (((outEquity[outEquity.length - 1] - 100000) / 100000) * 100).toFixed(1);

  const activeEquity = view === "in" ? inEquity : outEquity;
  const activePrices = view === "in" ? IN_SAMPLE : OUT_SAMPLE;

  const option = {
    backgroundColor: "transparent",
    grid: [
      { left: 70, right: 20, top: 20, bottom: "38%", height: "50%" },
      { left: 70, right: 20, top: "70%", bottom: 20, height: "22%" },
    ],
    xAxis: [
      { type: "category", data: activePrices.map((_, i) => `${i + 1}`), gridIndex: 0, axisLabel: { color: "#6b7280", interval: 9 } },
      { type: "category", data: activeEquity.map((_, i) => `${i + 1}`), gridIndex: 1, axisLabel: { color: "#6b7280", interval: 9 } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, scale: true },
      { type: "value", gridIndex: 1, axisLabel: { color: "#6b7280", fontSize: 10 }, splitLine: { lineStyle: { color: "#e5e7eb" } } },
    ],
    series: [
      { name: "价格", type: "line", data: activePrices, lineStyle: { color: "#1f2937", width: 1.5 }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
      {
        name: "资金曲线",
        type: "line",
        data: activeEquity,
        lineStyle: { color: view === "in" ? "#26a69a" : "#ef5350", width: 2 },
        areaStyle: { color: `rgba(${view === "in" ? "38,166,154" : "239,83,80"},0.1)` },
        showSymbol: false,
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
    ],
    tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937", fontSize: 12 } },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🔬 过拟合演示
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Text style={{ color: "#6b7280", fontSize: 13, display: "block", marginBottom: 12 }}>
        调整均线参数让样本内表现最好，然后切到「样本外」看效果
      </Text>

      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={24} md={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>快线 = {fast}</Text>
          <Slider min={2} max={10} value={fast} onChange={setFast} trackStyle={{ background: "#1677ff" }} />
        </Col>
        <Col xs={24} md={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>慢线 = {slow}</Text>
          <Slider min={5} max={30} value={slow} onChange={setSlow} trackStyle={{ background: "#1677ff" }} />
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <Segmented
          value={view}
          onChange={(v) => setView(v as "in" | "out")}
          options={[
            { label: `📈 样本内（+${inReturn}%）`, value: "in" },
            { label: `📉 样本外（${outReturn}%）`, value: "out" },
          ]}
          style={{ background: "#f6f8fb" }}
        />
      </div>

      <ReactECharts option={option} style={{ height: 360 }} />

      <div
        style={{
          background: "#f6f8fb",
          borderRadius: 6,
          padding: "8px 12px",
          marginTop: 8,
          display: "flex",
          gap: 24,
        }}
      >
        <div>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>样本内收益</Text>
          <div>
            <Text strong style={{ color: "#26a69a" }}>
              +{inReturn}%
            </Text>
          </div>
        </div>
        <div>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>样本外收益</Text>
          <div>
            <Text strong style={{ color: parseFloat(outReturn) >= 0 ? "#26a69a" : "#ef5350" }}>
              {outReturn}%
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
