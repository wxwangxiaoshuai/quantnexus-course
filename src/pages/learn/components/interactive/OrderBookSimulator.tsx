import { Button, Card, Col, InputNumber, Row, Space, Tag, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

const { Text, Title } = Typography;

interface Order {
  price: number;
  volume: number;
  side: "bid" | "ask";
}

function generateOrderBook(midPrice: number): { bids: Order[]; asks: Order[] } {
  const bids: Order[] = [];
  const asks: Order[] = [];
  for (let i = 0; i < 5; i++) {
    bids.push({ price: midPrice - (i + 1), volume: Math.floor(Math.random() * 30 + 5), side: "bid" });
    asks.push({ price: midPrice + (i + 1), volume: Math.floor(Math.random() * 30 + 5), side: "ask" });
  }
  return { bids, asks };
}

interface TradeRecord {
  price: number;
  volume: number;
  side: "buy" | "sell";
  vwap?: number;
  remaining?: number;
  rejected?: boolean;
}

export function OrderBookSimulator() {
  const midPriceRef = useRef(3500);
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [orderType, setOrderType] = useState<"limit" | "market">("market");
  const [limitPrice, setLimitPrice] = useState(3500);
  const [orderVolume, setOrderVolume] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // Initialize order book once (single generateOrderBook call)
  useEffect(() => {
    if (!initialized.current) {
      const book = generateOrderBook(midPriceRef.current);
      setBids(book.bids);
      setAsks(book.asks);
      initialized.current = true;
    }
  }, []);

  // Random volume jitter to simulate market activity
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBids((prev) =>
        prev.map((b) => ({
          ...b,
          volume: Math.max(1, b.volume + Math.floor(Math.random() * 5 - 2)),
        })),
      );
      setAsks((prev) =>
        prev.map((a) => ({
          ...a,
          volume: Math.max(1, a.volume + Math.floor(Math.random() * 5 - 2)),
        })),
      );
    }, 1500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const bestBid = bids.length > 0 ? bids[0] : null;
  const bestAsk = asks.length > 0 ? asks[0] : null;
  const spread = bestBid && bestAsk ? bestAsk.price - bestBid.price : 0;

  const executeBuy = () => {
    if (asks.length === 0) return;

    if (orderType === "market") {
      // Market buy: eat through ask levels from cheapest
      let remaining = orderVolume;
      const fills: { price: number; volume: number }[] = [];
      const newAsks = [...asks];

      for (let i = 0; i < newAsks.length && remaining > 0; i++) {
        const available = newAsks[i].volume;
        const taken = Math.min(remaining, available);
        fills.push({ price: newAsks[i].price, volume: taken });
        remaining -= taken;
        newAsks[i] = { ...newAsks[i], volume: available - taken };
      }

      // Remove fully consumed levels
      const filteredAsks = newAsks.filter((a) => a.volume > 0);

      const totalVolume = fills.reduce((sum, f) => sum + f.volume, 0);
      const vwap = fills.reduce((sum, f) => sum + f.price * f.volume, 0) / totalVolume;

      setAsks(filteredAsks);
      setTrades((prev) =>
        [
          {
            price: fills[fills.length - 1].price,
            volume: totalVolume,
            side: "buy" as const,
            vwap,
            remaining: remaining > 0 ? remaining : undefined,
          },
          ...prev,
        ].slice(0, 8),
      );
    } else {
      // Limit buy: match against asks <= limitPrice, if not fully filled add to bids
      const newAsks = [...asks];
      let remaining = orderVolume;
      const fills: { price: number; volume: number }[] = [];

      for (let i = 0; i < newAsks.length && remaining > 0; i++) {
        if (newAsks[i].price > limitPrice) break; // Can't cross the spread at limit
        const available = newAsks[i].volume;
        const taken = Math.min(remaining, available);
        fills.push({ price: newAsks[i].price, volume: taken });
        remaining -= taken;
        newAsks[i] = { ...newAsks[i], volume: available - taken };
      }

      const filteredAsks = newAsks.filter((a) => a.volume > 0);

      if (fills.length > 0) {
        // At least partially filled
        const totalFilled = fills.reduce((sum, f) => sum + f.volume, 0);
        const vwap = fills.reduce((sum, f) => sum + f.price * f.volume, 0) / totalFilled;

        setAsks(filteredAsks);
        setTrades((prev) =>
          [
            {
              price: fills[fills.length - 1].price,
              volume: totalFilled,
              side: "buy" as const,
              vwap,
              remaining: remaining > 0 ? remaining : undefined,
            },
            ...prev,
          ].slice(0, 8),
        );
      } else {
        // All or nothing — limit price too low to match any ask
        // Add to bid book
        addBid(limitPrice, remaining);
        setTrades((prev) =>
          [
            {
              price: limitPrice,
              volume: 0,
              side: "buy" as const,
              rejected: true,
            },
            ...prev,
          ].slice(0, 8),
        );
      }

      if (remaining > 0 && fills.length > 0) {
        // Partially filled, add remaining to bid book
        addBid(limitPrice, remaining);
      }
    }
  };

  const executeSell = () => {
    if (bids.length === 0) return;

    if (orderType === "market") {
      // Market sell: eat through bid levels from highest
      let remaining = orderVolume;
      const fills: { price: number; volume: number }[] = [];
      const newBids = [...bids];

      for (let i = 0; i < newBids.length && remaining > 0; i++) {
        const available = newBids[i].volume;
        const taken = Math.min(remaining, available);
        fills.push({ price: newBids[i].price, volume: taken });
        remaining -= taken;
        newBids[i] = { ...newBids[i], volume: available - taken };
      }

      const filteredBids = newBids.filter((b) => b.volume > 0);

      const totalVolume = fills.reduce((sum, f) => sum + f.volume, 0);
      const vwap = fills.reduce((sum, f) => sum + f.price * f.volume, 0) / totalVolume;

      setBids(filteredBids);
      setTrades((prev) =>
        [
          {
            price: fills[fills.length - 1].price,
            volume: totalVolume,
            side: "sell" as const,
            vwap,
            remaining: remaining > 0 ? remaining : undefined,
          },
          ...prev,
        ].slice(0, 8),
      );
    } else {
      // Limit sell: match against bids >= limitPrice
      const newBids = [...bids];
      let remaining = orderVolume;
      const fills: { price: number; volume: number }[] = [];

      for (let i = 0; i < newBids.length && remaining > 0; i++) {
        if (newBids[i].price < limitPrice) break; // Bid too low compared to our limit
        const available = newBids[i].volume;
        const taken = Math.min(remaining, available);
        fills.push({ price: newBids[i].price, volume: taken });
        remaining -= taken;
        newBids[i] = { ...newBids[i], volume: available - taken };
      }

      const filteredBids = newBids.filter((b) => b.volume > 0);

      if (fills.length > 0) {
        const totalFilled = fills.reduce((sum, f) => sum + f.volume, 0);
        const vwap = fills.reduce((sum, f) => sum + f.price * f.volume, 0) / totalFilled;

        setBids(filteredBids);
        setTrades((prev) =>
          [
            {
              price: fills[fills.length - 1].price,
              volume: totalFilled,
              side: "sell" as const,
              vwap,
              remaining: remaining > 0 ? remaining : undefined,
            },
            ...prev,
          ].slice(0, 8),
        );
      } else {
        // Not filled — add to ask book
        addAsk(limitPrice, remaining);
        setTrades((prev) =>
          [
            {
              price: limitPrice,
              volume: 0,
              side: "sell" as const,
              rejected: true,
            },
            ...prev,
          ].slice(0, 8),
        );
      }

      if (remaining > 0 && fills.length > 0) {
        // Partially filled, add remaining to ask book
        addAsk(limitPrice, remaining);
      }
    }
  };

  // Helper: add a limit buy order to bids, maintaining descending price order
  const addBid = (price: number, volume: number) => {
    setBids((prev) => {
      const next = [...prev, { price, volume, side: "bid" as const }];
      next.sort((a, b) => b.price - a.price);
      return next;
    });
  };

  // Helper: add a limit sell order to asks, maintaining ascending price order
  const addAsk = (price: number, volume: number) => {
    setAsks((prev) => {
      const next = [...prev, { price, volume, side: "ask" as const }];
      next.sort((a, b) => a.price - b.price);
      return next;
    });
  };

  const highlightIndex = bids.length > 0 ? (bids[0].volume > 0 ? 0 : null) : null;

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#1f2937", margin: 0 }}>
          模拟盘口与撮合
        </Title>
      }
      style={{ background: "#ffffff", border: "1px solid #e5e7eb", margin: "16px 0" }}
    >
      <Row gutter={16}>
        <Col span={24} md={10}>
          <div style={{ fontFamily: "monospace" }}>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>卖盘（Ask）</Text>
            {asks.length > 0 ? (
              [...asks].reverse().map((a, i) => (
                <div
                  key={`a-${a.price}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 4px",
                    background: `rgba(38,166,154,${0.04 * (asks.length - i)})`,
                  }}
                >
                  <Text style={{ color: "#26a69a", fontSize: 13, fontWeight: 600 }}>{a.price}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 13 }}>{a.volume}</Text>
                </div>
              ))
            ) : (
              <div style={{ padding: "4px 0", color: "#9ca3af", fontSize: 12 }}>— 卖盘已清空 —</div>
            )}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                padding: "6px 0",
                textAlign: "center",
              }}
            >
              <Text style={{ color: "#1f2937", fontSize: 12 }}>
                价差 {spread} 元
                {bestAsk && bestBid
                  ? `（${((spread / ((bestAsk.price + bestBid.price) / 2)) * 100).toFixed(3)}%）`
                  : ""}
              </Text>
            </div>
            {bids.length > 0 ? (
              bids.map((b, i) => (
                <div
                  key={`b-${b.price}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 4px",
                    background: `rgba(239,83,80,${0.04 * (bids.length - i)})`,
                    fontWeight: highlightIndex === i ? 700 : undefined,
                  }}
                >
                  <Text style={{ color: "#ef5350", fontSize: 13, fontWeight: 600 }}>{b.price}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 13 }}>{b.volume}</Text>
                </div>
              ))
            ) : (
              <div style={{ padding: "4px 0", color: "#9ca3af", fontSize: 12 }}>— 买盘已清空 —</div>
            )}
            <Text style={{ color: "#6b7280", fontSize: 12 }}>买盘（Bid）</Text>
          </div>
        </Col>

        <Col span={24} md={14}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Button
                size="small"
                type={orderType === "market" ? "primary" : "default"}
                onClick={() => setOrderType("market")}
              >
                市价单
              </Button>
              <Button
                size="small"
                type={orderType === "limit" ? "primary" : "default"}
                onClick={() => setOrderType("limit")}
              >
                限价单
              </Button>
            </Space>

            {orderType === "limit" && (
              <Space>
                <Text style={{ color: "#6b7280" }}>限价：</Text>
                <InputNumber
                  value={limitPrice}
                  onChange={(v) => v && setLimitPrice(v)}
                  min={3480}
                  max={3520}
                  style={{ width: 100 }}
                />
                <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                  {spread > 0
                    ? `买一 ${bestBid?.price ?? "—"} / 卖一 ${bestAsk?.price ?? "—"}`
                    : ""}
                </Text>
              </Space>
            )}

            <Space>
              <Text style={{ color: "#6b7280" }}>手数：</Text>
              <InputNumber
                value={orderVolume}
                onChange={(v) => v && setOrderVolume(v)}
                min={1}
                max={100}
                style={{ width: 80 }}
              />
            </Space>

            <Space>
              <Button
                style={{ background: "#ef5350", color: "#fff", border: "none" }}
                onClick={executeBuy}
                disabled={orderType === "market" && asks.length === 0}
              >
                买入
              </Button>
              <Button
                style={{ background: "#26a69a", color: "#fff", border: "none" }}
                onClick={executeSell}
                disabled={orderType === "market" && bids.length === 0}
              >
                卖出
              </Button>
            </Space>

            <div>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>最近成交</Text>
              {trades.length === 0 && (
                <div style={{ color: "#9ca3af", fontSize: 12, padding: "4px 0" }}>
                  暂无成交，点击买入或卖出试试
                </div>
              )}
              {trades.slice(0, 5).map((t, i) => (
                <div key={i} style={{ fontSize: 12, padding: "2px 0", lineHeight: 1.8 }}>
                  {t.rejected ? (
                    <>
                      <Tag color="default" style={{ fontSize: 11 }}>未成交</Tag>
                      <Text style={{ color: "#9ca3af" }}>
                        {t.side === "buy" ? "限价买单" : "限价卖单"} @ {t.price}
                        {" — 已加入"}
                        {t.side === "buy" ? "买盘" : "卖盘"}挂单
                      </Text>
                    </>
                  ) : (
                    <>
                      <Tag color={t.side === "buy" ? "red" : "green"} style={{ fontSize: 11 }}>
                        {t.side === "buy" ? "买入" : "卖出"}
                      </Tag>
                      <Text style={{ color: "#1f2937" }}>
                        {t.vwap && t.vwap !== t.price ? `均价 ${t.vwap.toFixed(1)}` : `${t.price}`}
                      </Text>
                      <Text style={{ color: "#6b7280" }}> × {t.volume}手</Text>
                      {t.vwap && t.vwap !== t.price && (
                        <Text style={{ color: "#f59e0b", fontSize: 11, marginLeft: 4 }}>
                          (多级成交)
                        </Text>
                      )}
                      {t.remaining && t.remaining > 0 ? (
                        <Text style={{ color: "#ef5350", fontSize: 11, marginLeft: 4 }}>
                          剩{t.remaining}手未成交
                        </Text>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.6, borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
              <Text strong style={{ color: "#6b7280" }}>提示：</Text>
              <br />
              • 市价买单 = 从卖一价开始吃，量不够继续吃卖二、卖三...（产生滑点）
              <br />
              • 限价买单 = 只在 ≤ 限价的卖单上成交；不满足则挂到买盘等待
              <br />
              • 限价卖单 = 只在 ≥ 限价的买单上成交；不满足则挂到卖盘等待
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
