import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, List, Typography } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GLOSSARY } from "../data/courseContent";

const { Title, Text } = Typography;

export function GlossaryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter((g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="learn-page-content learn-page-content--glossary">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/learn")} style={{ marginBottom: 16 }}>
        返回课程首页
      </Button>
      <Title level={3} style={{ color: "#1f2937" }}>
        📖 术语速查表
      </Title>
      <Input
        prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
        placeholder="搜索术语，如「夏普比率」「保证金」"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 24, background: "#ffffff", borderColor: "#e5e7eb" }}
        size="large"
        allowClear
      />
      {filtered.length === 0 ? (
        <Empty description={<Text style={{ color: "#6b7280" }}>没有找到匹配的术语</Text>} />
      ) : (
        <List
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 0" }}>
              <div>
                <Text strong style={{ color: "#1677ff", fontSize: 16 }}>
                  {item.term}
                </Text>
                <div>
                  <Text style={{ color: "#374151" }}>{item.definition}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
