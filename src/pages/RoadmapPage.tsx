import { Link } from "react-router-dom";
import { curriculum, stages } from "../data/curriculum";
import { DifficultyBadge } from "../components/Badges";
import { useLearnProgress } from "../hooks/useLearnProgress";

export function RoadmapPage() {
  const { isComplete, progress, getScore } = useLearnProgress();
  const coreModules = curriculum.modules.filter((m) => !m.elective && m.id < 12);
  const coreLessons = coreModules.flatMap((m) => m.lessons);
  const coreDone = coreLessons.filter((l) => isComplete(l.id)).length;
  const finalScore = getScore("q_final");
  const graduated = coreDone >= coreLessons.length && finalScore !== undefined && finalScore >= 60;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">学习路线图</span>
        <h1 className="section-title">你的成长路径</h1>
        <p className="mt-4 text-ink-400">
          从「读懂一张合约」到「上线生产级策略」的完整路径。主线进度：{coreDone}/{coreLessons.length}
          {progress.completedLessons.length > 0 ? `（含选修共完成 ${progress.completedLessons.length} 课）` : ""}
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <div className="relative">
          <div className="absolute bottom-2 left-6 top-2 w-px bg-gradient-to-b from-emerald-500 via-brand-500 to-amber-500 sm:left-8" />
          <div className="space-y-12">
            {stages.map((stage, si) => {
              const stageModules = curriculum.modules.filter(
                (m) => m.id >= stage.range[0] && m.id <= stage.range[1],
              );
              return (
                <div key={stage.id} className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${stage.color} text-lg font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-xl`}
                    >
                      {si + 1}
                    </div>
                    <div>
                      <h2
                        className={`bg-gradient-to-r ${stage.color} bg-clip-text text-2xl font-bold text-transparent`}
                      >
                        {stage.name}
                      </h2>
                      <p className="text-sm text-ink-400">
                        阶段 {si + 1} · 模块 {stage.range[0]}–{stage.range[1]}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 space-y-3 border-l-2 border-transparent pl-16 sm:pl-24">
                    {stageModules.map((m) => {
                      const done = m.lessons.filter((l) => isComplete(l.id)).length;
                      return (
                        <Link
                          key={m.id}
                          to={`/curriculum/${m.id}`}
                          className="card card-hover group flex items-center gap-4 p-4"
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[11px] text-ink-500">
                                M{String(m.id).padStart(2, "0")}
                              </span>
                              <span className="font-semibold text-ink-50">{m.title}</span>
                              {m.elective && (
                                <span className="text-[10px] text-fuchsia-300">选修</span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-ink-400">{m.subtitle}</p>
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-500">
                              <span>
                                📚 {done}/{m.lessons.length} 课
                              </span>
                              <span>·</span>
                              <span>⏱ {m.hours}h</span>
                              {m.project && (
                                <>
                                  <span>·</span>
                                  <span className="text-amber-400/80">🎯 含项目</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <DifficultyBadge level={m.difficulty} />
                            <span className="text-ink-600 group-hover:text-brand-400">→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="card bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center">
            <div className="text-4xl">{graduated ? "🏆" : "🎯"}</div>
            <h3 className="mt-3 text-xl font-bold text-ink-50">
              {graduated ? "恭喜 · 主线结业" : "毕业 · 量化交易准专家"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-ink-400">
              {graduated
                ? "你已完成主线课程。可继续选修因子/ML，或冲击三大生产级实战项目。"
                : "完成主线非选修模块（M1–M9）全部课节并通过结业测验，即可达成主线毕业。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
