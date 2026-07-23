import type { CSSProperties, ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { GlossaryPopover } from "./GlossaryPopover";
import { GLOSSARY } from "../data/courseContent";

const BODY_STYLE: CSSProperties = {
  color: "#374151",
  lineHeight: 1.8,
  fontSize: 15,
};

/**
 * 术语自动 popover：对正文文本节点中出现的 GLOSSARY 术语包裹 GlossaryPopover。
 * - 按术语长度降序匹配，避免短词吃掉长词（如"风险"不抢占"风险平价"）
 * - code/pre 内不包裹（由 components.code/pre 不调用 wrap 保证）
 * - 合并正则一次编译，每个 string 节点一次匹配
 */
const GLOSSARY_SORTED = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length);
const GLOSSARY_PATTERN = new RegExp(
  `(${GLOSSARY_SORTED.map((g) => g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g",
);

function wrapTerms(text: string): ReactNode[] {
  if (!text) return [text];
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  GLOSSARY_PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = GLOSSARY_PATTERN.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(<GlossaryPopover key={`g-${key++}`} term={m[0]} />);
    last = m.index + m[0].length;
    // 防止零宽匹配死循环
    if (m.index === GLOSSARY_PATTERN.lastIndex) GLOSSARY_PATTERN.lastIndex++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : [text];
}

function wrapChildrenWithGlossary(children: ReactNode): ReactNode {
  if (typeof children === "string") return wrapTerms(children);
  if (Array.isArray(children)) {
    return children.map((c, i) =>
      typeof c === "string" ? <span key={`w-${i}`}>{wrapTerms(c)}</span> : c,
    );
  }
  return children;
}

const MATH_COMPONENTS = {
  math: ({ value }: { value?: string }) => (
    <div
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        padding: "8px 0",
        margin: "12px 0",
        textAlign: "center",
      }}
    >
      {value}
    </div>
  ),
  inlineMath: ({ value }: { value?: string }) => (
    <span
      style={{
        display: "inline",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  ),
} as Partial<Components>;

const LEARN_MD_COMPONENTS: Components = {
  p: ({ children }) => (
    <p style={{ ...BODY_STYLE, margin: "0 0 12px" }}>{wrapChildrenWithGlossary(children)}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: "#1f2937" }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul style={{ ...BODY_STYLE, margin: "0 0 12px", paddingLeft: 24 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ ...BODY_STYLE, margin: "0 0 12px", paddingLeft: 24 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: 6 }}>{wrapChildrenWithGlossary(children)}</li>,
  h1: ({ children }) => (
    <h3 style={{ color: "#1f2937", fontSize: 18, fontWeight: 600, margin: "16px 0 8px" }}>{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 style={{ color: "#1f2937", fontSize: 16, fontWeight: 600, margin: "14px 0 8px" }}>{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 style={{ color: "#1f2937", fontSize: 15, fontWeight: 600, margin: "12px 0 6px" }}>{children}</h5>
  ),
  code: ({ className, children }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          style={{
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontSize: "0.9em",
            background: "#f6f8fa",
            border: "1px solid #e5e7eb",
            padding: "1px 6px",
            borderRadius: 4,
            color: "#1f2937",
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={className}
        style={{
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontSize: 13,
          color: "#1f2937",
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      style={{
        background: "#f6f8fa",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: 16,
        overflowX: "auto",
        fontSize: 13,
        margin: "12px 0",
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "12px 0",
        paddingLeft: 12,
        borderLeft: "3px solid #1677ff",
        color: "#6b7280",
      }}
    >
      {wrapChildrenWithGlossary(children)}
    </blockquote>
  ),
  hr: () => <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />,
  table: ({ children }) => (
    <div className="learn-markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: "#f6f8fa" }}>{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>{children}</tr>
  ),
  th: ({ children }) => (
    <th
      style={{
        padding: "8px 12px",
        textAlign: "left",
        fontWeight: 600,
        color: "#1f2937",
        borderBottom: "2px solid #d1d5db",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>{wrapChildrenWithGlossary(children)}</td>
  ),
};

interface Props {
  content: string;
  style?: CSSProperties;
  compact?: boolean;
}

export function LearnMarkdown({ content, style, compact }: Props) {
  if (!content.trim()) return null;

  const components = compact
    ? {
        ...LEARN_MD_COMPONENTS,
        ...MATH_COMPONENTS,
        p: ({ children }: { children?: ReactNode }) => (
          <span style={{ ...BODY_STYLE, fontSize: 14 }}>{children}</span>
        ),
      }
    : { ...LEARN_MD_COMPONENTS, ...MATH_COMPONENTS };

  return (
    <div style={style}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
