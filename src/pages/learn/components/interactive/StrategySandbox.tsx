import { CaretLeftOutlined, CaretRightOutlined, FastForwardOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Slider, Space, Statistic, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

function generatePrices(n: number): number[] {
  const prices = [3500];
  for (let i = 1; i < n; i++) {
    const noise = (Math.random() - 0.49) * 10;
    const trend = Math.sin(i / 15) * 3;
    prices.push(Math.round((prices[i - 1] + trend + noise) * 10) / 10);
  }
  return prices;
}

function calcSma(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) =>
    i < period - 1 ? null : prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period,
  );
}

const PRICES = generatePrices(100);
const X_AXIS = PRICES.map((_, i) => `Bar${i + 1}`);

export function StrategySandbox() {
  const [currentBar, setCurrentBar] = useState(30);
  const [fastPeriod, setFastPeriod] = useState(5);
  const [slowPeriod, setSlowPeriod] = useState(20);

  const fastMa = useMemo(() => calcSma(PRICES, fastPeriod), [fastPeriod]);
  const slowMa = useMemo(() => calcSma(PRICES, slowPeriod), [slowPeriod]);

  const { trades, equity } = useMemo(() => {
    let cash = 100000;
    let pos = 0;
    let entryPrice = 0;
    const tradeList: { bar: number; type: "buy" | "sell"; price: number; pnl?: number }[] = [];
    const equityCurve: number[] = [];

    for (let i = 0; i <= currentBar && i < PRICES.length; i++) {
      const f = fastMa[i];
      const fPrev = fastMa[i - 1];
      const s = slowMa[i];
      const sPrev = slowMa[i - 1];
      const price = PRICES[i];

      if (f !== null && s !== null && fPrev !== null && sPrev !== null) {
        if (fPrev <= sPrev && f > s && pos === 0) {
          pos = Math.floor(cash / price);
          entryPrice = price;
          cash -= pos * price;
          tradeList.push({ bar: i, type: "buy", price });
        } else if (fPrev >= sPrev && f < s && pos > 0) {
          const pnl = (price - entryPrice) * pos;
          cash += pos * price;
          tradeList.push({ bar: i, type: "sell", price, pnl });
          pos = 0;
        }
      }

      equityCurve.push(Math.round(cash + pos * price));
    }

    return { trades: tradeList, equity: equityCurve };
  }, [currentBar, fastMa, slowMa]);

  const currentF = fastMa[currentBar];
  const currentS = slowMa[currentBar];
  const lastEquity = equity[equity.length - 1] ?? 100000;
  const totalPnl = lastEquity - 100000;

  const option = {
    backgroundColor: "transparent",
    grid: [
      { left: 60, right: 20, top: 20, bottom: "38%", height: "52%" },
      { left: 60, right: 20, top: "70%", bottom: 20, height: "22%" },
    ],
    xAxis: [
      { type: "category", data: X_AXIS.slice(0, currentBar + 1), gridIndex: 0, axisLabel: { color: "#6b7280", interval: 9 } },
      { type: "category", data: X_AXIS.slice(0, equity.length), gridIndex: 1, axisLabel: { color: "#6b7280", interval: 9 } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, scale: true },
      { type: "value", gridIndex: 1, axisLabel: { color: "#6b7280", fontSize: 10 }, splitLine: { lineStyle: { color: "#e5e7eb" } } },
    ],
    series: [
      { name: "价格", type: "line", data: PRICES.slice(0, currentBar + 1), lineStyle: { color: "#1f2937", width: 1.5 }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
      {
        name: `MA(${fastPeriod})`,
        type: "line",
        data: fastMa.slice(0, currentBar + 1),
        lineStyle: { color: "#1677ff", width: 2 },
        showSymbol: false,
        connectNulls: true,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: `MA(${slowPeriod})`,
        type: "line",
        data: slowMa.slice(0, currentBar + 1),
        lineStyle: { color: "#f0883e", width: 2 },
        showSymbol: false,
        connectNulls: true,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        type: "scatter",
        data: trades.filter((t) => t.bar <= currentBar).map((t) => [t.bar, PRICES[t.bar]]),
        itemStyle: { color: (p: { dataIndex: number }) => (trades[p.dataIndex]?.type === "buy" ? "#ef5350" : "#26a69a") },
        symbolSize: 10,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: "资金曲线",
        type: "line",
        data: equity,
        lineStyle: { color: "#26a69a", width: 1.5 },
        areaStyle: { color: "rgba(38,166,154,0.1)" },
        showSymbol: false,
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
    ],
    legend: { textStyle: { color: "#6b7280" }, top: 0, left: "right" },
    tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937", fontSize: 12 } },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🎯 策略沙盒 — 双均线单步执行
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>快线周期 = {fastPeriod}</Text>
          <Slider min={3} max={15} value={fastPeriod} onChange={setFastPeriod} trackStyle={{ background: "#1677ff" }} />
        </Col>
        <Col span={12}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>慢线周期 = {slowPeriod}</Text>
          <Slider min={15} max={40} value={slowPeriod} onChange={setSlowPeriod} trackStyle={{ background: "#f0883e" }} />
        </Col>
      </Row>

      <Space style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <Button icon={<CaretLeftOutlined />} onClick={() => setCurrentBar((b) => Math.max(slowPeriod, b - 1))} disabled={currentBar <= slowPeriod}>
          上一根
        </Button>
        <Button
          icon={<CaretRightOutlined />}
          onClick={() => setCurrentBar((b) => Math.min(PRICES.length - 1, b + 1))}
          disabled={currentBar >= PRICES.length - 1}
        >
          下一根
        </Button>
        <Button icon={<FastForwardOutlined />} onClick={() => setCurrentBar(PRICES.length - 1)}>
          跑完全部
        </Button>
        <Button onClick={() => setCurrentBar(slowPeriod)}>重置</Button>
        <Text style={{ color: "#6b7280", fontSize: 12 }}>
          当前：Bar {currentBar + 1} / {PRICES.length}
        </Text>
      </Space>

      <ReactECharts option={option} style={{ height: 380 }} />

      <Row gutter={16} style={{ marginTop: 12 }}>
        <Col span={6}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>当前快线</Text>}
            value={currentF?.toFixed(1) ?? "--"}
            valueStyle={{ color: "#1677ff", fontSize: 16 }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>当前慢线</Text>}
            value={currentS?.toFixed(1) ?? "--"}
            valueStyle={{ color: "#f0883e", fontSize: 16 }}
          />
        </Col>
        <Col span={6}>
          <Statistic title={<Text style={{ color: "#6b7280", fontSize: 12 }}>交易次数</Text>} value={trades.length} valueStyle={{ color: "#1f2937", fontSize: 16 }} />
        </Col>
        <Col span={6}>
          <Statistic
            title={<Text style={{ color: "#6b7280", fontSize: 12 }}>累计盈亏</Text>}
            value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}`}
            valueStyle={{ color: totalPnl >= 0 ? "#ef5350" : "#26a69a", fontSize: 16 }}
          />
        </Col>
      </Row>
    </Card>
  );
}
