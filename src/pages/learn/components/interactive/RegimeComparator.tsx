import { Card, Col, Row, Segmented, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

function genTrending(n: number): number[] {
  let p = 3500;
  return Array.from({ length: n }, () => {
    p += 2 + (Math.random() - 0.3) * 5;
    return Math.round(p * 10) / 10;
  });
}

function genRanging(n: number): number[] {
  let p = 3500;
  return Array.from({ length: n }, (_, i) => {
    p = 3500 + Math.sin(i / 6) * 80 + (Math.random() - 0.5) * 20;
    return Math.round(p * 10) / 10;
  });
}

function genVolatile(n: number): number[] {
  let p = 3500;
  return Array.from({ length: n }, () => {
    p += (Math.random() - 0.5) * 30;
    return Math.round(p * 10) / 10;
  });
}

function runTrend(prices: number[]): number[] {
  let cash = 100;
  let pos = 0;
  return prices.map((price, i) => {
    if (i >= 21) {
      const fast = prices.slice(i - 5, i + 1).reduce((a, b) => a + b, 0) / 5;
      const slow = prices.slice(i - 20, i + 1).reduce((a, b) => a + b, 0) / 20;
      const prevFast = prices.slice(i - 6, i).reduce((a, b) => a + b, 0) / 5;
      const prevSlow = prices.slice(i - 21, i).reduce((a, b) => a + b, 0) / 20;
      if (prevFast <= prevSlow && fast > slow && pos === 0) {
        pos = cash / price;
        cash = 0;
      } else if (prevFast >= prevSlow && fast < slow && pos > 0) {
        cash = pos * price;
        pos = 0;
      }
    }
    return Math.round((cash + pos * price) * 10) / 10;
  });
}

function runMeanRev(prices: number[]): number[] {
  let cash = 100;
  let pos = 0;
  return prices.map((price, i) => {
    if (i >= 20) {
      const slice = prices.slice(i - 20, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      const std = Math.sqrt(slice.reduce((s, v) => s + (v - avg) ** 2, 0) / slice.length);
      if (price < avg - 2 * std && pos === 0) {
        pos = cash / price;
        cash = 0;
      } else if (price > avg && pos > 0) {
        cash = pos * price;
        pos = 0;
      }
    }
    return Math.round((cash + pos * price) * 10) / 10;
  });
}

type RegimeType = "trending" | "ranging" | "volatile";

const REGIMES: Record<RegimeType, number[]> = {
  trending: genTrending(100),
  ranging: genRanging(100),
  volatile: genVolatile(100),
};

const REGIME_LABELS: Record<RegimeType, string> = {
  trending: "单边趋势",
  ranging: "震荡横盘",
  volatile: "高波动随机",
};

export function RegimeComparator() {
  const [regime, setRegime] = useState<RegimeType>("trending");
  const prices = REGIMES[regime];

  const { trendEquity, meanRevEquity } = useMemo(
    () => ({
      trendEquity: runTrend(prices),
      meanRevEquity: runMeanRev(prices),
    }),
    [prices],
  );

  const trendReturn = (((trendEquity[trendEquity.length - 1] - 100) / 100) * 100).toFixed(1);
  const meanRevReturn = (((meanRevEquity[meanRevEquity.length - 1] - 100) / 100) * 100).toFixed(1);

  const option = {
    backgroundColor: "transparent",
    grid: [
      { left: 60, right: 20, top: 20, bottom: "38%", height: "50%" },
      { left: 60, right: 20, top: "68%", bottom: 20, height: "24%" },
    ],
    xAxis: [
      { type: "category", data: prices.map((_, i) => `${i}`), gridIndex: 0, axisLabel: { color: "#6b7280", interval: 19 } },
      { type: "category", data: prices.map((_, i) => `${i}`), gridIndex: 1, axisLabel: { color: "#6b7280", interval: 19 } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, scale: true, name: "价格", nameTextStyle: { color: "#6b7280" } },
      {
        type: "value",
        gridIndex: 1,
        axisLabel: { color: "#6b7280", fontSize: 10 },
        splitLine: { lineStyle: { color: "#e5e7eb" } },
        name: "资金",
        nameTextStyle: { color: "#6b7280", fontSize: 10 },
      },
    ],
    series: [
      { name: "价格", type: "line", data: prices, lineStyle: { color: "#6b7280", width: 1.5 }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
      { name: "趋势跟踪", type: "line", data: trendEquity, lineStyle: { color: "#1677ff", width: 2 }, showSymbol: false, xAxisIndex: 1, yAxisIndex: 1 },
      { name: "均值回归", type: "line", data: meanRevEquity, lineStyle: { color: "#f0883e", width: 2 }, showSymbol: false, xAxisIndex: 1, yAxisIndex: 1 },
    ],
    legend: { data: ["趋势跟踪", "均值回归"], textStyle: { color: "#6b7280" }, top: 0 },
    tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937", fontSize: 12 } },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🗺️ 策略范式对比器
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Text style={{ color: "#6b7280", fontSize: 13, display: "block", marginBottom: 12 }}>
        切换行情类型，观察趋势跟踪与均值回归策略各自的适用场景
      </Text>
      <Segmented
        value={regime}
        onChange={(v) => setRegime(v as RegimeType)}
        options={Object.entries(REGIME_LABELS).map(([k, v]) => ({ value: k, label: v }))}
        style={{ background: "#f6f8fb", marginBottom: 12 }}
      />

      <ReactECharts option={option} style={{ height: 380 }} />

      <Row gutter={16} style={{ marginTop: 8 }}>
        <Col xs={24} md={12}>
          <div style={{ background: "#f6f8fb", borderRadius: 6, padding: "8px 12px" }}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>📈 趋势跟踪</Text>
            <div>
              <Text strong style={{ color: parseFloat(trendReturn) >= 0 ? "#ef5350" : "#26a69a", fontSize: 18 }}>
                {trendReturn}%
              </Text>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ background: "#f6f8fb", borderRadius: 6, padding: "8px 12px" }}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>🔄 均值回归</Text>
            <div>
              <Text strong style={{ color: parseFloat(meanRevReturn) >= 0 ? "#ef5350" : "#26a69a", fontSize: 18 }}>
                {meanRevReturn}%
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
