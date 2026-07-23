import { Popover } from "antd";
import type { ReactNode } from "react";
import { GLOSSARY } from "../data/quizzes";

interface Props {
  term: string;
  children?: ReactNode;
}

/** 正文术语悬浮释义 */
export function GlossaryPopover({ term, children }: Props) {
  const entry = GLOSSARY.find((g) => g.term === term);
  if (!entry) return <>{children ?? term}</>;
  return (
    <Popover
      content={<div className="max-w-[280px] text-sm leading-relaxed text-ink-200">{entry.definition}</div>}
      title={<span className="font-semibold text-brand-400">{entry.term}</span>}
      styles={{ body: { background: "rgb(var(--ink-900))", border: "1px solid rgb(var(--ink-700))" } }}
    >
      <button
        type="button"
        className="mx-0.5 inline cursor-help rounded border border-brand-500/35 bg-brand-500/15 px-1 py-0.5 font-semibold text-brand-300 transition-colors hover:border-brand-400/50 hover:bg-brand-500/25"
      >
        {children ?? term}
      </button>
    </Popover>
  );
}
