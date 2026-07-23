import { Link } from "react-router-dom";
import { allProjects, curriculum } from "../data/curriculum";
import { DifficultyBadge, Tag } from "../components/Badges";

export function ProjectsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">实战项目</span>
        <h1 className="section-title">14 个递进式项目</h1>
        <p className="mt-4 text-ink-400">
          每个模块收尾都有可交付项目。从杠杆直觉到 CTA / 配对 / 截面全流程，构成你的作品集骨架。
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((p) => {
          const mod = curriculum.modules.find((m) => m.id === p.module);
          return (
            <Link
              key={p.id}
              to={`/curriculum/${p.module}/project/${p.id}`}
              className="card card-hover flex flex-col p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-amber-400">{p.id}</span>
                <DifficultyBadge level={p.difficulty} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink-50">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-400">{p.summary}</p>
              <p className="mt-2 text-xs text-brand-400/80">
                预计 {p.durationMinutes >= 60 ? `${Math.round(p.durationMinutes / 60 * 10) / 10} 小时` : `${p.durationMinutes} 分钟`}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 4).map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
              <div className="mt-4 text-xs text-ink-500">
                {mod?.icon} 模块 {p.module} · {mod?.title}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
