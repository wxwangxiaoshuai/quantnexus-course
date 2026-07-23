import { useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { INTERACTIVE_COMPONENTS } from "./interactive/registry";
import { QuizCard } from "./QuizCard";
import { GlossaryPopover } from "./GlossaryPopover";
import { QUIZZES, GLOSSARY } from "../data/quizzes";

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
    if (m.index === GLOSSARY_PATTERN.lastIndex) GLOSSARY_PATTERN.lastIndex++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : [text];
}

function wrapChildrenWithGlossary(children: ReactNode): ReactNode {
  if (typeof children === "string") return wrapTerms(children);
  if (Array.isArray(children)) {
    return children.map((c, i) => (typeof c === "string" ? <span key={`w-${i}`}>{wrapTerms(c)}</span> : c));
  }
  return children;
}

type ContentSegment =
  | { kind: "markdown"; text: string }
  | { kind: "interactive"; type: string; props: Record<string, string> }
  | { kind: "quiz"; id: string }
  | { kind: "highlight"; color: string; text: string };

function parseProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of raw.split(/\s+/)) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq);
    let val = part.slice(eq + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    props[key] = val;
  }
  return props;
}

function splitContent(content: string): ContentSegment[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const segments: ContentSegment[] = [];
  const lines = normalized.split("\n");
  let i = 0;
  let buf: string[] = [];

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf.join("\n");
    if (text.trim()) segments.push({ kind: "markdown", text });
    buf = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const intMatch = line.match(/^::interactive\{([^}]+)\}$/);
    if (intMatch) {
      flush();
      const props = parseProps(intMatch[1]);
      segments.push({ kind: "interactive", type: props.type || "unknown", props });
      i++;
      continue;
    }
    const quizMatch = line.match(/^::quiz\{([^}]+)\}$/);
    if (quizMatch) {
      flush();
      const props = parseProps(quizMatch[1]);
      segments.push({ kind: "quiz", id: props.id || "" });
      i++;
      continue;
    }
    const hlStart = line.match(/^:::highlight\s+(\w+)\s*$/);
    if (hlStart) {
      flush();
      const color = hlStart[1];
      const hl: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) {
        hl.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      segments.push({ kind: "highlight", color, text: hl.join("\n").trim() });
      continue;
    }
    buf.push(line);
    i++;
  }
  flush();
  return segments.length ? segments : [{ kind: "markdown", text: normalized }];
}

const sharedComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-6 mt-10 text-3xl font-bold text-ink-50 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-4 mt-10 text-2xl font-bold text-ink-50 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-3 mt-8 text-xl font-semibold text-ink-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-relaxed text-ink-300" {...props}>
      {wrapChildrenWithGlossary(children)}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-6 text-ink-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-ink-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {wrapChildrenWithGlossary(children)}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-ink-100" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-brand-500/40 bg-brand-500/5 py-3 pl-5 pr-4 italic text-ink-300"
      {...props}
    >
      {wrapChildrenWithGlossary(children)}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full border-collapse border border-ink-700 text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-ink-700 bg-ink-800/50 px-4 py-2 text-left font-semibold text-ink-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-ink-700 px-4 py-2 text-ink-300" {...props}>
      {wrapChildrenWithGlossary(children)}
    </td>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded-md bg-ink-800/60 px-1.5 py-0.5 font-mono text-sm text-brand-300" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre: ({ children }: any) => {
    const codeChild = children?.props?.children;
    const lang = children?.props?.className?.replace("language-", "");
    const code = typeof codeChild === "string" ? codeChild : String(codeChild ?? "");
    return (
      <div className="mb-6">
        <CodeBlock code={code} lang={lang || "text"} />
      </div>
    );
  },
  hr: () => <hr className="my-8 border-ink-800" />,
};

const highlightBorder: Record<string, string> = {
  blue: "border-brand-500 bg-brand-500/10",
  orange: "border-amber-500 bg-amber-500/10",
  green: "border-emerald-500 bg-emerald-500/10",
};

export function MarkdownRenderer({ content }: { content: string }) {
  const segments = useMemo(() => splitContent(content), [content]);

  return (
    <div className="lesson-content">
      {segments.map((seg, i) => {
        if (seg.kind === "markdown") {
          return (
            <ReactMarkdown
              key={i}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={sharedComponents}
            >
              {seg.text}
            </ReactMarkdown>
          );
        }
        if (seg.kind === "highlight") {
          const border = highlightBorder[seg.color] ?? highlightBorder.blue;
          return (
            <div key={i} className={`my-6 rounded-r-xl border-l-4 px-4 py-3 ${border}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={sharedComponents}
              >
                {seg.text}
              </ReactMarkdown>
            </div>
          );
        }
        if (seg.kind === "quiz") {
          const quiz = QUIZZES[seg.id];
          if (!quiz) {
            return (
              <div key={i} className="card my-6 border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300">
                未找到测验「{seg.id}」
              </div>
            );
          }
          return (
            <div key={i} className="my-6">
              <QuizCard quiz={quiz} />
            </div>
          );
        }
        const Comp = INTERACTIVE_COMPONENTS[seg.type];
        if (!Comp) {
          return (
            <div key={i} className="card my-6 border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300">
              交互组件「{seg.type}」尚未注册
            </div>
          );
        }
        return (
          <div key={i} className="my-6">
            <Comp />
          </div>
        );
      })}
    </div>
  );
}
