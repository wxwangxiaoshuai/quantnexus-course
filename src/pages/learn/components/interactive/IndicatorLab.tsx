import { Card, Col, Row, Segmented, Slider, Space, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

function generatePriceSeries(n: number): number[] {
  const prices: number[] = [3500];
  for (let i = 1; i < n; i++) {
    const trend = i < n / 2 ? 0.3 : -0.2;
    prices.push(prices[i - 1] + trend + (Math.random() - 0.5) * 8);
  }
  return prices.map((p) => Math.round(p * 10) / 10);
}

function sma(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) =>
    i < period - 1 ? null : prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period,
  );
}

function ema(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function bollinger(prices: number[], period: number, stdDev: number) {
  const mid = sma(prices, period);
  return prices.map((_, i) => {
    if (i < period - 1) return { mid: null, upper: null, lower: null };
    const slice = prices.slice(i - period + 1, i + 1);
    const avg = mid[i]!;
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - avg) ** 2, 0) / period);
    return { mid: avg, upper: avg + stdDev * std, lower: avg - stdDev * std };
  });
}

function macd(prices: number[], fast: number, slow: number, signal: number) {
  const fastEma = ema(prices, fast);
  const slowEma = ema(prices, slow);
  const macdLine = prices.map((_, i) => fastEma[i] - slowEma[i]);
  const k = 2 / (signal + 1);
  const signalLine = [macdLine[0]];
  for (let i = 1; i < macdLine.length; i++) {
    signalLine.push(macdLine[i] * k + signalLine[i - 1] * (1 - k));
  }
  const histogram = macdLine.map((m, i) => m - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

const PRICES = generatePriceSeries(120);
const xAxis = PRICES.map((_, i) => `Day ${i + 1}`);

type IndicatorType = "MA" | "EMA" | "BOLL" | "MACD";

export function IndicatorLab() {
  const [indicator, setIndicator] = useState<IndicatorType>("MA");
  const [period, setPeriod] = useState(20);
  const [fastPeriod, setFastPeriod] = useState(12);
  const [slowPeriod, setSlowPeriod] = useState(26);
  const [stdDev, setStdDev] = useState(2);

  const option = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series: any[] = [
      {
        name: "价格",
        type: "line",
        data: PRICES,
        lineStyle: { color: "#1f2937", width: 1.5 },
        showSymbol: false,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grids: any[] = [
      { left: 60, right: 20, top: 20, bottom: indicator === "MACD" ? "38%" : 50, height: indicator === "MACD" ? "52%" : undefined },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xAxes: any[] = [{ type: "category", data: xAxis, gridIndex: 0, axisLabel: { color: "#6b7280", interval: 19 } }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxes: any[] = [{ type: "value", gridIndex: 0, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, scale: true }];

    if (indicator === "MA") {
      series.push({
        name: `MA(${period})`,
        type: "line",
        data: sma(PRICES, period),
        lineStyle: { color: "#1677ff", width: 2 },
        showSymbol: false,
        connectNulls: true,
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    } else if (indicator === "EMA") {
      series.push({
        name: `EMA(${period})`,
        type: "line",
        data: ema(PRICES, period),
        lineStyle: { color: "#f0883e", width: 2 },
        showSymbol: false,
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    } else if (indicator === "BOLL") {
      const boll = bollinger(PRICES, period, stdDev);
      series.push(
        { name: "中轨", type: "line", data: boll.map((b) => b.mid), lineStyle: { color: "#1677ff", width: 1.5 }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
        { name: "上轨", type: "line", data: boll.map((b) => b.upper), lineStyle: { color: "#ef5350", width: 1, type: "dashed" }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
        { name: "下轨", type: "line", data: boll.map((b) => b.lower), lineStyle: { color: "#26a69a", width: 1, type: "dashed" }, showSymbol: false, xAxisIndex: 0, yAxisIndex: 0 },
      );
    } else if (indicator === "MACD") {
      const { macdLine, signalLine, histogram } = macd(PRICES, fastPeriod, slowPeriod, 9);
      grids.push({ left: 60, right: 20, top: "76%", bottom: 20, height: "18%" });
      xAxes.push({ type: "category", data: xAxis, gridIndex: 1, axisLabel: { color: "#6b7280", interval: 19 } });
      yAxes.push({ type: "value", gridIndex: 1, axisLabel: { color: "#6b7280", fontSize: 10 }, splitLine: { lineStyle: { color: "#e5e7eb" } } });
      series.push(
        { name: "MACD", type: "line", data: macdLine, lineStyle: { color: "#1677ff", width: 1.5 }, showSymbol: false, xAxisIndex: 1, yAxisIndex: 1 },
        { name: "Signal", type: "line", data: signalLine, lineStyle: { color: "#f0883e", width: 1.5 }, showSymbol: false, xAxisIndex: 1, yAxisIndex: 1 },
        {
          name: "Hist",
          type: "bar",
          data: histogram,
          itemStyle: { color: (params: { value: number }) => (params.value >= 0 ? "#ef5350" : "#26a69a") },
          xAxisIndex: 1,
          yAxisIndex: 1,
        },
      );
    }

    return {
      backgroundColor: "transparent",
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series,
      legend: { textStyle: { color: "#6b7280" }, top: 0 },
      tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937", fontSize: 12 } },
    };
  }, [indicator, period, fastPeriod, slowPeriod, stdDev]);

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          📈 指标实验室
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Space style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <Segmented
          value={indicator}
          onChange={(v) => setIndicator(v as IndicatorType)}
          options={["MA", "EMA", "BOLL", "MACD"]}
          style={{ background: "#f6f8fb" }}
        />
      </Space>

      {(indicator === "MA" || indicator === "EMA" || indicator === "BOLL") && (
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={12}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>周期 N = {period}</Text>
            <Slider min={5} max={60} value={period} onChange={setPeriod} trackStyle={{ background: "#1677ff" }} />
          </Col>
          {indicator === "BOLL" && (
            <Col span={12}>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>标准差倍数 = {stdDev}</Text>
              <Slider min={1} max={3} step={0.5} value={stdDev} onChange={setStdDev} trackStyle={{ background: "#1677ff" }} />
            </Col>
          )}
        </Row>
      )}

      {indicator === "MACD" && (
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={8}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>快线 = {fastPeriod}</Text>
            <Slider min={5} max={20} value={fastPeriod} onChange={setFastPeriod} trackStyle={{ background: "#1677ff" }} />
          </Col>
          <Col span={8}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>慢线 = {slowPeriod}</Text>
            <Slider min={15} max={50} value={slowPeriod} onChange={setSlowPeriod} trackStyle={{ background: "#1677ff" }} />
          </Col>
        </Row>
      )}

      <ReactECharts option={option} style={{ height: indicator === "MACD" ? 380 : 300 }} />
    </Card>
  );
}
