import { Link } from "react-router-dom";
import { curriculum, stages } from "../data/curriculum";
import type { Module } from "../data/types";
import { DifficultyBadge, LessonTypeBadge } from "../components/Badges";
import { useLearnProgress } from "../hooks/useLearnProgress";

function ModuleCard({ module }: { module: Module }) {
  const { isComplete } = useLearnProgress();
  const done = module.lessons.filter((l) => isComplete(l.id)).length;

  return (
    <div className="card card-hover overflow-hidden">
      <Link to={`/curriculum/${module.id}`} className="block border-b border-ink-800 p-6 transition-colors hover:border-brand-500/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-800 text-2xl">{module.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                <span>模块 {String(module.id).padStart(2, "0")}</span>
                <span>·</span>
                <span>{module.hours} 小时</span>
                {module.elective && <span className="chip border border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300">选修</span>}
              </div>
              <h3 className="mt-1 text-lg font-bold text-ink-50">{module.title}</h3>
              <p className="mt-0.5 text-sm text-ink-400">{module.subtitle}</p>
            </div>
          </div>
          <DifficultyBadge level={module.difficulty} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-400">{module.description}</p>
        <p className="mt-3 text-xs text-ink-500">
          进度 {done}/{module.lessons.length}
        </p>
      </Link>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            课程列表 · {module.lessons.length} 节
          </h4>
          {module.project && (
            <span className="chip border border-amber-500/30 bg-amber-500/15 text-amber-300">🎯 含实战项目</span>
          )}
        </div>
        <ul className="space-y-2.5">
          {module.lessons.map((lesson) => (
            <li key={lesson.id} className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-ink-800/50">
              <div className="mt-0.5 font-mono text-[11px] text-ink-600">{lesson.id}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/curriculum/${module.id}/${lesson.id}`}
                    className="text-sm font-medium text-ink-100 transition-colors hover:text-brand-400"
                  >
                    {isComplete(lesson.id) ? "✅ " : ""}
                    {lesson.title}
                  </Link>
                  <LessonTypeBadge type={lesson.type} />
                </div>
                <p className="mt-0.5 text-xs text-ink-500">{lesson.summary}</p>
              </div>
              <div className="shrink-0 text-xs font-mono text-ink-400">{lesson.duration}m</div>
            </li>
          ))}
        </ul>
        <Link
          to={`/curriculum/${module.id}`}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
        >
          查看模块详情 →
        </Link>
      </div>
    </div>
  );
}

export function CurriculumPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">完整大纲</span>
        <h1 className="section-title">课程大纲</h1>
        <p className="mt-4 text-ink-400">
          7 大阶段、14 个核心模块、{curriculum.modules.reduce((s, m) => s + m.lessons.length, 0)} 节课、
          每模块一个实战项目。理论 → 实战 → 项目闭环。
        </p>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`rounded-full bg-gradient-to-r ${stage.color} px-3 py-1 text-xs font-semibold text-white`}
          >
            {stage.name}
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-16">
        {stages.map((stage) => {
          const mods = curriculum.modules.filter((m) => m.id >= stage.range[0] && m.id <= stage.range[1]);
          return (
            <div key={stage.id}>
              <h2 className={`mb-6 bg-gradient-to-r ${stage.color} bg-clip-text text-xl font-bold text-transparent`}>
                {stage.name}
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {mods.map((m) => (
                  <ModuleCard key={m.id} module={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
