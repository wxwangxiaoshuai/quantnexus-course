import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Alert, Button, Card, Radio, Space, Tag, Typography } from "antd";
import { useState } from "react";

const { Text, Title, Paragraph } = Typography;

interface CodeLine {
  text: string;
  isBug: boolean;
}

interface Challenge {
  title: string;
  lines: CodeLine[];
  explanation: string;
}

const CHALLENGES: Challenge[] = [
  {
    title: "案例 1：pandas 信号对齐",
    lines: [
      { text: "df['ma20'] = df['close'].rolling(20).mean()", isBug: false },
      { text: "df['signal'] = (df['close'] > df['ma20']).astype(int)", isBug: false },
      { text: "df['daily_return'] = df['close'].pct_change()", isBug: false },
      { text: "df['strategy_return'] = df['signal'] * df['daily_return']", isBug: true },
    ],
    explanation:
      "`signal` 用当天收盘价 close[t] 算出，而 `daily_return` 也是 close[t] 相对 close[t-1] 的涨跌幅——两者用的是同一天的信息，相乘等于「用今天收盘价决定的信号，去吃今天已经发生的涨跌」。现实中你要等收盘后才能算出信号，只能在下一天才能下单，所以应该写成 `df['signal'].shift(1) * df['daily_return']`：用昨天收盘算出的信号，去乘今天的收益。这是 pandas 回测里最常见的一类前视偏差，也是最容易被忽略的一行。",
  },
  {
    title: "案例 2：自制滚动指标",
    lines: [
      { text: "def compute_signal(closes, i, period=20):", isBug: false },
      { text: "    window = closes[i - period // 2 : i + period // 2]", isBug: true },
      { text: "    ma = sum(window) / len(window)", isBug: false },
      { text: "    return closes[i] > ma", isBug: false },
    ],
    explanation:
      "这是一个「居中窗口」的经典错误：`closes[i - period // 2 : i + period // 2]` 取的是以 i 为中心、向两侧各扩展 period/2 的区间——右边界 `i + period // 2` 已经跑到了「未来」的收盘价。统计学中居中滑动窗口（centered rolling window）常用于平滑历史数据做可视化，但绝对不能用在交易信号计算上。正确写法应该是只往回看：`closes[i - period + 1 : i + 1]`。",
  },
  {
    title: "案例 3：数据清洗阶段",
    lines: [
      { text: "df['close'] = df['close'].fillna(method='bfill')", isBug: true },
      { text: "df['ma20'] = df['close'].rolling(20).mean()", isBug: false },
      { text: "df['signal'] = df['close'] > df['ma20']", isBug: false },
      { text: "df['strategy_return'] = df['signal'].shift(1) * df['close'].pct_change()", isBug: false },
    ],
    explanation:
      "前视偏差不一定发生在信号计算那一行——这里的 bug 在**数据清洗阶段**：`fillna(method='bfill')`（backward fill）会用「后面」的数据去填补前面的缺失值，相当于给历史上的缺失日「泄露」了未来才知道的价格。正确做法是用 `ffill`（forward fill，只用过去的值向后填）或者直接对缺口做插值标记，而不是用未来数据回填历史。这也是 m3l5 数据管线课节强调「数据清洗本身也可能引入前视偏差」的具体案例。",
  },
];

export function LookAheadBiasChallenge() {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const challenge = CHALLENGES[round % CHALLENGES.length];
  const bugIndex = challenge.lines.findIndex((l) => l.isBug);
  const isCorrect = selected === bugIndex;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setAnsweredCount((c) => c + 1);
    if (selected === bugIndex) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    setRound((r) => r + 1);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          🕵️ 找 Bug：哪一行代码有前视偏差？
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Paragraph style={{ color: "#6b7280", fontSize: 13 }}>
        下面这段回测代码里藏着一处「前视偏差」（Look-Ahead Bias）——用到了在真实交易时刻还不知道的未来数据。点击你认为有问题的那一行，提交看看对不对。
      </Paragraph>

      <Space style={{ marginBottom: 12 }}>
        <Tag color="blue">{challenge.title}</Tag>
        <Text style={{ color: "#6b7280", fontSize: 12 }}>
          已答 {answeredCount} 题，答对 {correctCount} 题
        </Text>
      </Space>

      <div
        style={{
          background: "#f6f8fa",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: "8px 0",
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <Radio.Group
          style={{ display: "block" }}
          value={selected}
          onChange={(e) => !submitted && setSelected(e.target.value as number)}
          disabled={submitted}
        >
          {challenge.lines.map((line, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 16px",
                background:
                  submitted && idx === bugIndex
                    ? "rgba(38,166,154,0.12)"
                    : submitted && idx === selected && idx !== bugIndex
                      ? "rgba(239,83,80,0.12)"
                      : "transparent",
              }}
            >
              <Radio value={idx} />
              <Text style={{ color: "#6b7280", width: 24, flexShrink: 0 }}>{idx + 1}</Text>
              <Text style={{ color: "#1f2937", whiteSpace: "pre" }}>{line.text}</Text>
              {submitted && idx === bugIndex && (
                <CheckCircleFilled style={{ color: "#26a69a", marginLeft: 8 }} />
              )}
              {submitted && idx === selected && idx !== bugIndex && (
                <CloseCircleFilled style={{ color: "#ef5350", marginLeft: 8 }} />
              )}
            </div>
          ))}
        </Radio.Group>
      </div>

      {submitted && (
        <Alert
          type={isCorrect ? "success" : "error"}
          showIcon
          message={isCorrect ? "找对了！" : `没找对，正确答案是第 ${bugIndex + 1} 行`}
          description={challenge.explanation}
          style={{ marginBottom: 16 }}
        />
      )}

      <Space>
        {!submitted ? (
          <Button type="primary" disabled={selected === null} onClick={handleSubmit}>
            提交答案
          </Button>
        ) : (
          <Button type="primary" onClick={handleNext}>
            下一题
          </Button>
        )}
      </Space>
    </Card>
  );
}
