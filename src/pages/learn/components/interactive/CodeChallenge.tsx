import { CaretRightOutlined, ReloadOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import { Alert, Button, Card, Col, Row, Space, Statistic, Switch, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useState } from "react";

const COMMISSION_PER_UNIT = 2; // 元/手，每次开仓或平仓收取
const SLIPPAGE_PER_TRADE = 1; // 1 tick 滑点（价格单位），成交价不利变动

const { Text, Title, Paragraph } = Typography;

const DEFAULT_CODE = `// 修改下面的开仓条件，点击"运行"看资金曲线变化
// fast: 当前快线值, slow: 当前慢线值, prevFast/prevSlow: 上一根的快慢线值
function shouldBuy(fast, slow, prevFast, prevSlow) {
  return prevFast <= prevSlow && fast > slow; // 金叉买入（默认逻辑）
}

function shouldSell(fast, slow, prevFast, prevSlow) {
  return prevFast >= prevSlow && fast < slow; // 死叉卖出（默认逻辑）
}
`;

function generatePrices(n: number): number[] {
  const prices = [3500];
  for (let i = 1; i < n; i++) {
    const trend = Math.sin(i / 15) * 3;
    prices.push(Math.round((prices[i - 1] + trend + (Math.random() - 0.49) * 10) * 10) / 10);
  }
  return prices;
}

const PRICES = generatePrices(120);
const FAST_PERIOD = 5;
const SLOW_PERIOD = 20;

function sma(prices: number[], period: number, idx: number): number | null {
  if (idx < period - 1) return null;
  let sum = 0;
  for (let i = idx - period + 1; i <= idx; i++) sum += prices[i];
  return sum / period;
}

interface RunResult {
  equity: number[];
  trades: number;
  finalReturn: number;
  totalCost: number;
  error?: string;
}

function runUserStrategy(code: string, costEnabled: boolean): RunResult {
  try {
    // 用 new Function 而非 eval：限制作用域，只能访问传入的参数，不能访问外部闭包变量
    const factory = new Function(`
      ${code}
      return { shouldBuy, shouldSell };
    `);
    const { shouldBuy, shouldSell } = factory() as {
      shouldBuy: (f: number, s: number, pf: number, ps: number) => boolean;
      shouldSell: (f: number, s: number, pf: number, ps: number) => boolean;
    };

    let cash = 100000;
    let pos = 0;
    let trades = 0;
    let totalCost = 0;
    const equity: number[] = [];

    for (let i = SLOW_PERIOD; i < PRICES.length; i++) {
      const fast = sma(PRICES, FAST_PERIOD, i)!;
      const slow = sma(PRICES, SLOW_PERIOD, i)!;
      const prevFast = sma(PRICES, FAST_PERIOD, i - 1)!;
      const prevSlow = sma(PRICES, SLOW_PERIOD, i - 1)!;
      const price = PRICES[i];

      if (pos === 0 && shouldBuy(fast, slow, prevFast, prevSlow)) {
        const fillPrice = costEnabled ? price + SLIPPAGE_PER_TRADE : price;
        pos = Math.floor(cash / fillPrice);
        cash -= pos * fillPrice;
        if (costEnabled) {
          const commission = pos * COMMISSION_PER_UNIT;
          cash -= commission;
          totalCost += commission + pos * SLIPPAGE_PER_TRADE;
        }
        trades++;
      } else if (pos > 0 && shouldSell(fast, slow, prevFast, prevSlow)) {
        const fillPrice = costEnabled ? price - SLIPPAGE_PER_TRADE : price;
        cash += pos * fillPrice;
        if (costEnabled) {
          const commission = pos * COMMISSION_PER_UNIT;
          cash -= commission;
          totalCost += commission + pos * SLIPPAGE_PER_TRADE;
        }
        pos = 0;
        trades++;
      }
      equity.push(Math.round(cash + pos * price));
    }

    const finalReturn = ((equity[equity.length - 1] - 100000) / 100000) * 100;
    return { equity, trades, finalReturn, totalCost: Math.round(totalCost) };
  } catch (e) {
    return { equity: [], trades: 0, finalReturn: 0, totalCost: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export function CodeChallenge() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState<RunResult | null>(null);
  const [costEnabled, setCostEnabled] = useState(false);

  const handleRun = () => {
    setResult(runUserStrategy(code, costEnabled));
  };

  const option =
    result && !result.error
      ? {
          backgroundColor: "transparent",
          grid: { left: 60, right: 20, top: 20, bottom: 40 },
          xAxis: { type: "category", data: result.equity.map((_, i) => i), axisLabel: { color: "#6b7280" } },
          yAxis: { type: "value", axisLabel: { color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb" } } },
          series: [
            {
              type: "line",
              data: result.equity,
              lineStyle: { color: result.finalReturn >= 0 ? "#ef5350" : "#26a69a", width: 2 },
              areaStyle: { color: `rgba(${result.finalReturn >= 0 ? "239,83,80" : "38,166,154"},0.1)` },
              showSymbol: false,
            },
          ],
          tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#1f2937" } },
        }
      : null;

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          💻 代码关卡：动手改开仓条件
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Paragraph style={{ color: "#6b7280", fontSize: 13 }}>
        试试修改逻辑，比如把 <code>{"fast > slow"}</code> 改成 <code>{"fast > slow * 1.02"}</code>
        （要求快线明显超过慢线才买入，减少假信号），观察交易次数和收益的变化。
      </Paragraph>

      <Space style={{ marginBottom: 12 }}>
        <Switch checked={costEnabled} onChange={setCostEnabled} />
        <Text style={{ color: "#6b7280", fontSize: 13 }}>
          计入真实成本（每手 {COMMISSION_PER_UNIT} 元手续费 + {SLIPPAGE_PER_TRADE} tick 滑点，开平仓各收一次）
        </Text>
      </Space>

      <Row gutter={16}>
        <Col span={24} md={12}>
          <Editor
            height="280px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
          />
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" icon={<CaretRightOutlined />} onClick={handleRun}>
              运行
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setCode(DEFAULT_CODE);
                setResult(null);
              }}
            >
              重置代码
            </Button>
          </Space>
        </Col>
        <Col span={24} md={12}>
          {result?.error && <Alert type="error" message="代码运行出错" description={result.error} showIcon />}
          {result && !result.error && (
            <>
              <ReactECharts option={option!} style={{ height: 200 }} />
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={<Text style={{ color: "#6b7280", fontSize: 12 }}>总收益率</Text>}
                    value={`${result.finalReturn >= 0 ? "+" : ""}${result.finalReturn.toFixed(1)}%`}
                    valueStyle={{ color: result.finalReturn >= 0 ? "#ef5350" : "#26a69a", fontSize: 18 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={<Text style={{ color: "#6b7280", fontSize: 12 }}>交易次数</Text>}
                    value={result.trades}
                    valueStyle={{ color: "#1f2937", fontSize: 18 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={<Text style={{ color: "#6b7280", fontSize: 12 }}>累计成本</Text>}
                    value={costEnabled ? result.totalCost : 0}
                    suffix="元"
                    valueStyle={{ color: costEnabled ? "#f0883e" : "#9ca3af", fontSize: 18 }}
                  />
                </Col>
              </Row>
              {costEnabled && result.trades > 0 && (
                <Alert
                  style={{ marginTop: 8 }}
                  type={result.finalReturn < 0 ? "warning" : "info"}
                  showIcon
                  message={
                    result.finalReturn < 0
                      ? "计入成本后策略转亏——交易越频繁，固定成本吃掉的利润占比越高。"
                      : `扣除 ${result.totalCost} 元成本后仍然盈利，但交易次数越多、单笔利润越薄，成本占比会越吃紧。`
                  }
                />
              )}
            </>
          )}
          {!result && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#6b7280" }}>
              点击"运行"查看结果
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
}
