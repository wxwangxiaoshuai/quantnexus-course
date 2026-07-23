import { Link, useParams } from "react-router-dom";
import { curriculum } from "../data/curriculum";
import { DifficultyBadge, LessonTypeBadge, Tag } from "../components/Badges";
import { useLearnProgress } from "../hooks/useLearnProgress";

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = curriculum.modules.find((m) => m.id === Number(moduleId));
  const { isComplete } = useLearnProgress();

  if (!module) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-400">未找到该模块。</p>
        <Link to="/curriculum" className="btn-ghost mt-6">
          返回课程大纲
        </Link>
      </div>
    );
  }

  const idx = curriculum.modules.findIndex((m) => m.id === module.id);
  const prev = idx > 0 ? curriculum.modules[idx - 1] : null;
  const next = idx < curriculum.modules.length - 1 ? curriculum.modules[idx + 1] : null;
  const totalMin = module.lessons.reduce((s, l) => s + l.duration, 0);
  const done = module.lessons.filter((l) => isComplete(l.id)).length;

  return (
    <div className="container-page py-12 sm:py-16">
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink-500">
        <Link to="/curriculum" className="hover:text-ink-200">
          课程大纲
        </Link>
        <span>/</span>
        <span className="text-ink-300">{module.title}</span>
      </nav>

      <div className="card relative overflow-hidden p-8 sm:p-10">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl">{module.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              模块 {String(module.id).padStart(2, "0")}
            </span>
            <DifficultyBadge level={module.difficulty} />
            {module.elective && (
              <span className="chip border border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300">选修</span>
            )}
            <span className="chip border border-ink-700 text-ink-300">
              ⏱ {module.hours}h · {totalMin}m · 进度 {done}/{module.lessons.length}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-50 sm:text-4xl">{module.title}</h1>
          <p className="mt-2 text-lg text-ink-300">{module.subtitle}</p>
          <p className="mt-5 max-w-3xl leading-relaxed text-ink-400">{module.description}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-ink-50">
            <span className="text-brand-400">●</span> 课程内容
            <span className="text-sm font-normal text-ink-500">（{module.lessons.length} 节）</span>
          </h2>
          <div className="space-y-4">
            {module.lessons.map((lesson, i) => (
              <Link key={lesson.id} to={`/curriculum/${module.id}/${lesson.id}`} className="card card-hover block p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 font-mono text-sm font-bold text-brand-300">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-500">{lesson.id}</span>
                      <LessonTypeBadge type={lesson.type} />
                      <span className="text-xs text-ink-500">{lesson.duration} 分钟</span>
                      {isComplete(lesson.id) && <span className="text-xs text-emerald-400">已完成</span>}
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-ink-50">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-ink-400">{lesson.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {lesson.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {module.project && (
            <div className="mt-10">
              <h2 className="mb-5 text-xl font-bold text-ink-50">🎯 模块实战项目</h2>
              <Link
                to={`/curriculum/${module.id}/project/${module.project.id}`}
                className="card card-hover block border-amber-500/30 bg-amber-500/5 p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-amber-400">{module.project.id}</span>
                  <DifficultyBadge level={module.project.difficulty} />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-ink-50">{module.project.title}</h3>
                <p className="mt-2 text-sm text-ink-400">{module.project.summary}</p>
              </Link>
            </div>
          )}

          <div className="mt-10 flex justify-between border-t border-ink-800 pt-6">
            {prev ? (
              <Link to={`/curriculum/${prev.id}`} className="text-sm text-ink-400 hover:text-brand-400">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/curriculum/${next.id}`} className="text-sm text-ink-400 hover:text-brand-400">
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-100">快速开始</h3>
            <Link to={`/curriculum/${module.id}/${module.lessons[0].id}`} className="btn-primary mt-4 w-full">
              从第一课开始
            </Link>
            {module.project && (
              <Link
                to={`/curriculum/${module.id}/project/${module.project.id}`}
                className="btn-ghost mt-2 w-full"
              >
                查看项目
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
