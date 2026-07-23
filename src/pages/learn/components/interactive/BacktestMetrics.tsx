import { Card, Col, Popover, Row, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useState } from "react";

const { Text, Title } = Typography;

const EQUITY: number[] = (() => {
  const e = [100000];
  const changes = [0.8, 1.2, 2.1, -0.5, 1.8, 3.2, -2.1, 4.1, -5.3, -3.2, 2.8, 5.1, 3.2, -1.8, 6.3, 2.1, -0.9, 4.5, 2.8, 1.2];
  for (const c of changes) {
    e.push(e[e.length - 1] * (1 + c / 100));
  }
  return e.map((v) => Math.round(v));
})();

const XAXIS = EQUITY.map((_, i) => `月${i}`);

function calcMaxDrawdown(equity: number[]) {
  let maxDD = 0;
  let peak = equity[0];
  let ddStart = 0;
  let ddEnd = 0;
  let peakIdx = 0;

  for (let i = 1; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
      peakIdx = i;
    }
    const dd = (peak - equity[i]) / peak;
    if (dd > maxDD) {
      maxDD = dd;
      ddStart = peakIdx;
      ddEnd = i;
    }
  }
  return { maxDD, ddStart, ddEnd };
}

const { maxDD, ddStart, ddEnd } = calcMaxDrawdown(EQUITY);
const totalReturn = (EQUITY[EQUITY.length - 1] - EQUITY[0]) / EQUITY[0];
const annualReturn = (1 + totalReturn) ** (12 / (EQUITY.length - 1)) - 1;
const returns = EQUITY.slice(1).map((v, i) => (v - EQUITY[i]) / EQUITY[i]);
const avgReturn = returns.reduce((a, b) => a + b) / returns.length;
const stdReturn = Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length);
const sharpe = (avgReturn / stdReturn) * Math.sqrt(12);

interface Metric {
  label: string;
  value: string;
  color: string;
  explanation: string;
  highlight?: [number, number];
}

const METRICS: Metric[] = [
  {
    label: "总收益率",
    value: `+${(totalReturn * 100).toFixed(1)}%`,
    color: "#ef5350",
    explanation: "从期初资金到期末资金的增长百分比。(期末资金 - 期初资金) / 期初资金。只看总收益不全面，要结合时间长度和风险。",
  },
  {
    label: "年化收益率",
    value: `+${(annualReturn * 100).toFixed(1)}%`,
    color: "#ef5350",
    explanation: "将总收益折算成每年的等效收益率，便于跨时间周期比较。公式：(1+总收益)^(12/月数) - 1",
  },
  {
    label: "最大回撤",
    value: `-${(maxDD * 100).toFixed(1)}%`,
    color: "#f0883e",
    explanation: `从资金曲线的历史最高点（月${ddStart}）到随后最低点（月${ddEnd}）的跌幅。点击可在图上看到这段区间。衡量策略最坏情况下的账面亏损。`,
    highlight: [ddStart, ddEnd],
  },
  {
    label: "夏普比率",
    value: sharpe.toFixed(2),
    color: "#1677ff",
    explanation: "年化收益 / 年化波动率（标准差）。衡量每承担单位风险获得的收益。夏普 > 1 尚可，> 2 优秀。这里假设无风险利率为 0。",
  },
];

export function BacktestMetrics() {
  const [highlight, setHighlight] = useState<[number, number] | null>(null);

  const markArea = highlight
    ? {
        data: [[{ xAxis: XAXIS[highlight[0]] }, { xAxis: XAXIS[highlight[1]] }]],
        itemStyle: { color: "rgba(240,136,62,0.15)", borderColor: "#f0883e", borderWidth: 1 },
      }
    : undefined;

  const option = {
    backgroundColor: "transparent",
    grid: { left: 70, right: 20, top: 30, bottom: 40 },
    xAxis: { type: "category", data: XAXIS, axisLabel: { color: "#6b7280" } },
    yAxis: { type: "value", axisLabel: { color: "#6b7280", formatter: (v: number) => `¥${(v / 1000).toFixed(0)}k` }, splitLine: { lineStyle: { color: "#e5e7eb" } } },
    series: [
      {
        name: "资金曲线",
        type: "line",
        data: EQUITY,
        lineStyle: { color: "#1677ff", width: 2 },
        areaStyle: { color: "rgba(22,119,255,0.08)" },
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color: "#1677ff" },
        markArea,
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      textStyle: { color: "#1f2937", fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/>¥${p.value.toLocaleString()}`;
      },
    },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🧪 回测绩效指标解剖
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Text style={{ color: "#6b7280", fontSize: 13, display: "block", marginBottom: 12 }}>
        点击下方指标卡片，图表将高亮对应的数据区间
      </Text>
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {METRICS.map((m) => (
          <Col key={m.label} span={12}>
            <Popover content={<div style={{ maxWidth: 260, color: "#1f2937" }}>{m.explanation}</div>} title={<span style={{ color: m.color }}>{m.label}</span>}>
              <div
                style={{
                  background: highlight === m.highlight ? "#1a2332" : "#f6f8fb",
                  border: `1px solid ${highlight === m.highlight ? m.color : "#e5e7eb"}`,
                  borderRadius: 6,
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setHighlight(m.highlight ? (highlight === m.highlight ? null : m.highlight) : null)}
              >
                <Text style={{ color: "#6b7280", fontSize: 11 }}>{m.label}</Text>
                <div>
                  <Text strong style={{ color: m.color, fontSize: 18 }}>
                    {m.value}
                  </Text>
                </div>
              </div>
            </Popover>
          </Col>
        ))}
      </Row>
      <ReactECharts option={option} style={{ height: 300 }} />
    </Card>
  );
}
