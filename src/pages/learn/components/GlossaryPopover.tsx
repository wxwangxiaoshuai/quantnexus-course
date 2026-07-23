import { Popover, Tag } from "antd";
import type { ReactNode } from "react";
import { GLOSSARY } from "../data/courseContent";

interface Props {
  term: string;
  children?: ReactNode;
}

export function GlossaryPopover({ term, children }: Props) {
  const entry = GLOSSARY.find((g) => g.term === term);
  if (!entry) return <>{children ?? term}</>;
  return (
    <Popover
      content={<div style={{ maxWidth: 280, color: "#1f2937" }}>{entry.definition}</div>}
      title={<span style={{ color: "#1677ff" }}>{entry.term}</span>}
      overlayStyle={{ background: "#ffffff" }}
    >
      <Tag color="blue" style={{ cursor: "pointer", fontSize: "inherit", fontWeight: "bold" }}>
        {children ?? term}
      </Tag>
    </Popover>
  );
}
