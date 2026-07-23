import { Button, Card, Col, Row, Slider, Statistic, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;
const RUNS = 200;
const BARS = 200;

function monteCarlo(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  riskPct: number,
  runs: number,
  bars: number,
): { ruinCount: number; curves: number[][] } {
  const curves: number[][] = [];
  let ruinCount = 0;

  for (let r = 0; r < runs; r++) {
    let equity = 100;
    const curve = [equity];
    let ruined = false;

    for (let b = 0; b < bars; b++) {
      if (equity <= 5) {
        ruined = true;
        break;
      }
      const risk = equity * (riskPct / 100);
      if (Math.random() < winRate) {
        equity += risk * avgWin;
      } else {
        equity -= risk * avgLoss;
      }
      curve.push(Math.max(0, Math.round(equity * 10) / 10));
    }

    if (ruined || equity <= 5) ruinCount++;
    curves.push(curve);
  }

  return { ruinCount, curves };
}

export function RuinSimulator() {
  const [winRate, setWinRate] = useState(50);
  const [avgWin, setAvgWin] = useState(1.5);
  const [avgLoss] = useState(1);
  const [riskPct, setRiskPct] = useState(10);
  const [seed, setSeed] = useState(0);

  const { ruinCount, curves } = useMemo(() => {
    void seed;
    return monteCarlo(winRate / 100, avgWin, avgLoss, riskPct, RUNS, BARS);
  }, [winRate, avgWin, avgLoss, riskPct, seed]);

  const ruinRate = (ruinCount / RUNS) * 100;
  const medianFinal = [...curves.map((c) => c[c.length - 1])].sort((a, b) => a - b)[Math.floor(RUNS / 2)];

  const sampleCurves = curves.filter((_, i) => i % 20 === 0);

  const option = {
    backgroundColor: "transparent",
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "category", data: Array.from({ length: BARS + 1 }, (_, i) => i), axisLabel: { color: "#6b7280", interval: 49 } },
    yAxis: { type: "value", axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, name: "资金(%)", nameTextStyle: { color: "#6b7280" } },
    series: [
      ...sampleCurves.map((curve, i) => ({
        type: "line" as const,
        data: curve,
        lineStyle: { color: curve[curve.length - 1] <= 5 ? "rgba(239,83,80,0.3)" : "rgba(38,166,154,0.25)", width: 1 },
        showSymbol: false,
        silent: true,
        z: i,
      })),
      {
        type: "line" as const,
        data: Array.from({ length: BARS + 1 }, () => 100),
        lineStyle: { color: "#6b7280", type: "dashed", width: 1 },
        showSymbol: false,
        silent: true,
      },
    ],
    tooltip: { show: false },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          💥 爆仓概率模拟器（蒙特卡洛）
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Text style={{ color: "#6b7280", fontSize: 13, display: "block", marginBottom: 12 }}>
        模拟 {RUNS} 条随机交易路径，观察不同仓位比例下的爆仓概率
      </Text>
      <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>胜率 = {winRate}%</Text>
          <Slider min={30} max={70} value={winRate} onChange={setWinRate} trackStyle={{ background: "#1677ff" }} />
        </Col>
        <Col span={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>每次风险比例 = {riskPct}%</Text>
          <Slider
            min={1}
            max={50}
            value={riskPct}
            onChange={setRiskPct}
            marks={{ 2: "2%", 10: "10%", 25: "25%", 50: "50%" }}
            trackStyle={{ background: "#f0883e" }}
          />
        </Col>
        <Col span={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            盈亏比（赢/输）= {avgWin}/{avgLoss}
          </Text>
          <Slider min={0.5} max={3} step={0.1} value={avgWin} onChange={setAvgWin} trackStyle={{ background: "#26a69a" }} />
        </Col>
        <Col span={12} style={{ display: "flex", alignItems: "flex-end" }}>
          <Button onClick={() => setSeed((s) => s + 1)}>重新模拟</Button>
        </Col>
      </Row>

      <ReactECharts option={option} style={{ height: 280 }} />

      <Row gutter={16} style={{ marginTop: 12 }}>
        <Col span={8}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>爆仓概率</Text>}
            value={`${ruinRate.toFixed(0)}%`}
            valueStyle={{ color: ruinRate > 30 ? "#ef5350" : "#26a69a", fontSize: 20 }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>中位数最终资金</Text>}
            value={`${medianFinal.toFixed(0)}%`}
            valueStyle={{ color: medianFinal > 100 ? "#ef5350" : "#26a69a", fontSize: 20 }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>期望值/笔</Text>}
            value={`${((((winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss) * riskPct)).toFixed(2)}%`}
            valueStyle={{ color: "#1f2937", fontSize: 20 }}
          />
        </Col>
      </Row>
    </Card>
  );
}
