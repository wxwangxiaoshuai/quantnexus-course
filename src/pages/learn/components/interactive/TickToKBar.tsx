import { Button, Card, Progress, Space, Tag, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useEffect, useRef, useState } from "react";

const { Text, Title } = Typography;

interface Tick {
  time: number;
  price: number;
  volume: number;
}

interface KBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  barIndex: number;
}

function generateTicks(count: number, basePrice: number): Tick[] {
  const ticks: Tick[] = [];
  let price = basePrice;
  let t = 0;
  for (let i = 0; i < count; i++) {
    price += (Math.random() - 0.5) * 2;
    price = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, price));
    t += Math.floor(Math.random() * 3000 + 500);
    ticks.push({ time: t, price: Math.round(price * 10) / 10, volume: Math.floor(Math.random() * 20 + 1) });
  }
  return ticks;
}

function ticksToKBar(ticks: Tick[], barDurationMs: number): KBar[] {
  const bars: KBar[] = [];
  let barIdx = 0;
  let currentBar: Omit<KBar, "barIndex"> | null = null;

  for (const tick of ticks) {
    const idx = Math.floor(tick.time / barDurationMs);
    if (idx !== barIdx || !currentBar) {
      if (currentBar) bars.push({ ...currentBar, barIndex: barIdx });
      barIdx = idx;
      currentBar = { open: tick.price, high: tick.price, low: tick.price, close: tick.price, volume: tick.volume };
    } else {
      currentBar.high = Math.max(currentBar.high, tick.price);
      currentBar.low = Math.min(currentBar.low, tick.price);
      currentBar.close = tick.price;
      currentBar.volume += tick.volume;
    }
  }
  if (currentBar) bars.push({ ...currentBar, barIndex: barIdx });
  return bars;
}

const ALL_TICKS = generateTicks(120, 3500);
const BAR_DURATION = 30000;

export function TickToKBar() {
  const [playIdx, setPlayIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setPlayIdx((i) => {
          if (i >= ALL_TICKS.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 80);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const visibleTicks = ALL_TICKS.slice(0, playIdx + 1);
  const bars = ticksToKBar(visibleTicks, BAR_DURATION);
  const currentTick = ALL_TICKS[playIdx];

  const candleData = bars.map((b) => [b.open, b.close, b.low, b.high]);
  const candleXAxis = bars.map((b) => `K${b.barIndex + 1}`);

  const option = {
    backgroundColor: "transparent",
    grid: [
      { left: 60, right: 20, top: 20, bottom: 60, height: "55%" },
      { left: 60, right: 20, top: "70%", bottom: 20, height: "20%" },
    ],
    xAxis: [
      { type: "category", data: candleXAxis, gridIndex: 0, axisLabel: { color: "#6b7280" } },
      { type: "category", data: candleXAxis, gridIndex: 1, axisLabel: { color: "#6b7280" } },
    ],
    yAxis: [
      { type: "value", gridIndex: 0, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } }, scale: true },
      { type: "value", gridIndex: 1, axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } } },
    ],
    series: [
      {
        type: "candlestick",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: candleData,
        itemStyle: { color: "#ef5350", color0: "#26a69a", borderColor: "#ef5350", borderColor0: "#26a69a" },
      },
      {
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: bars.map((b) => b.volume),
        itemStyle: { color: "#1677ff" },
      },
    ],
    tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937" } },
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          📊 Tick → K 线聚合演示
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Space style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <Button type="primary" onClick={() => setPlaying((p) => !p)} disabled={playIdx >= ALL_TICKS.length - 1 && !playing}>
          {playing ? "⏸ 暂停" : "▶ 播放"}
        </Button>
        <Button
          onClick={() => {
            setPlayIdx(0);
            setPlaying(false);
          }}
        >
          重置
        </Button>
        <Tag color="blue">
          已推送 {playIdx + 1} / {ALL_TICKS.length} Tick
        </Tag>
        <Tag color="geekblue">已生成 {bars.length} 根 K 线</Tag>
        {currentTick && (
          <Tag color={currentTick.price >= (ALL_TICKS[Math.max(0, playIdx - 1)]?.price ?? currentTick.price) ? "red" : "green"}>
            最新 Tick: {currentTick.price}
          </Tag>
        )}
      </Space>
      <Progress
        percent={Math.round((playIdx / (ALL_TICKS.length - 1)) * 100)}
        strokeColor="#1677ff"
        trailColor="#e5e7eb"
        style={{ marginBottom: 8 }}
      />
      <ReactECharts option={option} style={{ height: 340 }} />
      <Text style={{ color: "#6b7280", fontSize: 12 }}>
        每 30 秒的 Tick 聚合为一根 K 线（演示用，实盘通常用 1 分钟/5 分钟）
      </Text>
    </Card>
  );
}
