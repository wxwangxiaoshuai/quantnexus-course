import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GLOSSARY } from "../data/quizzes";

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">术语速查</span>
        <h1 className="section-title">术语表</h1>
        <p className="mt-4 text-ink-400">共 {GLOSSARY.length} 条术语。边学边查，建立量化词汇量。</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索术语，如「夏普比率」「保证金」"
          className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 outline-none placeholder:text-ink-500 focus:border-brand-500"
        />

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-ink-500">没有找到匹配的术语</p>
        ) : (
          <ul className="mt-8 divide-y divide-ink-800">
            {filtered.map((item) => (
              <li key={item.term} className="py-4">
                <div className="font-semibold text-brand-400">{item.term}</div>
                <p className="mt-1 text-sm leading-relaxed text-ink-300">{item.definition}</p>
              </li>
            ))}
          </ul>
        )}

        <Link to="/curriculum" className="btn-ghost mt-10 inline-flex">
          ← 返回课程大纲
        </Link>
      </div>
    </div>
  );
}
