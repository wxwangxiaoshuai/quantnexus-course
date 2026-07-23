import { Link } from "react-router-dom";
import { curriculum, totalLessons, totalHours, totalProjects, stages } from "../data/curriculum";
import { DifficultyBadge } from "../components/Badges";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="gradient-text text-3xl font-extrabold sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs text-ink-400 sm:text-sm">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card card-hover p-6">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-xl">{icon}</div>
      <h3 className="mb-2 text-base font-semibold text-ink-50">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-400">{desc}</p>
    </div>
  );
}

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              QuantNexus · 中文量化交易课程
            </div>
            <h1 className="animate-fade-up font-display text-4xl font-extrabold tracking-tight text-ink-50 sm:text-6xl">
              从<span className="gradient-text">期货基础</span>
              <br className="hidden sm:block" />
              到<span className="gradient-text">生产级策略</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-ink-300 sm:text-lg [animation-delay:0.1s]">
              {curriculum.description}
            </p>
            <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:0.2s]">
              <Link to="/curriculum" className="btn-primary">
                查看课程大纲 <span aria-hidden>→</span>
              </Link>
              <Link to="/roadmap" className="btn-ghost">
                🗺️ 学习路线图
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={`${curriculum.modules.length}`} label="核心模块" />
            <Stat value={`${totalLessons}`} label="节精讲课" />
            <Stat value={`${totalHours}h`} label="学习时长" />
            <Stat value={`${totalProjects}`} label="实战项目" />
          </div>
        </div>
      </section>

      <section className="border-t border-ink-800/60 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">为什么是这门课</span>
            <h2 className="section-title">不是科普，是工程</h2>
            <p className="mt-4 text-ink-400">
              面向有编程背景、金融零基础的学习者。每个核心概念配有互动组件，每课末尾可自测，每个模块都有可交付实战项目。
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon="🪜" title="七阶段成长路径" desc="从合约要素到生产级实战，阶段清晰、前置明确，不会突然跳跃。" />
            <FeatureCard icon="🛠️" title="每模块一个项目" desc="14 个递进项目：杠杆直觉 → 回测陷阱 → CTA / 配对 / 截面全流程。" />
            <FeatureCard icon="🧪" title="测验 + 术语速查" desc="52+ 组测验巩固理解，术语表贯穿全文，边学边查。" />
            <FeatureCard icon="🎮" title="11 个互动组件" desc="订单簿、过拟合、破产模拟、Regime 对比……动手体验比死记公式更牢。" />
            <FeatureCard icon="🛡️" title="风控先于收益" desc="仓位、止损、爆仓概率独立成章，生存是量化的第一性原理。" />
            <FeatureCard icon="🚀" title="通往实盘" desc="模拟盘 SOP、监控清单、策略下架决策——学完能上线，而不是停在回测截图。" />
          </div>
        </div>
      </section>

      <section className="border-t border-ink-800/60 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">成长路径</span>
            <h2 className="section-title">七大阶段一览</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stages.map((stage) => {
              const mods = curriculum.modules.filter((m) => m.id >= stage.range[0] && m.id <= stage.range[1]);
              return (
                <Link key={stage.id} to="/roadmap" className="card card-hover p-5">
                  <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${stage.color} px-2.5 py-1 text-xs font-bold text-white`}>
                    阶段 {stage.id}
                  </div>
                  <h3 className="font-semibold text-ink-50">{stage.name}</h3>
                  <p className="mt-2 text-xs text-ink-400">
                    M{stage.range[0]}
                    {stage.range[0] !== stage.range[1] ? `–M${stage.range[1]}` : ""} · {mods.length} 模块
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-800/60 py-16">
        <div className="container-page">
          <div className="card overflow-hidden bg-gradient-to-br from-brand-500/10 to-transparent p-8 sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-50 sm:text-3xl">准备好了？从第一模块开始</h2>
                <p className="mt-2 text-ink-400">
                  {curriculum.modules[0].icon} {curriculum.modules[0].title} ·{" "}
                  <DifficultyBadge level={curriculum.modules[0].difficulty} />
                </p>
              </div>
              <Link to={`/curriculum/${curriculum.modules[0].id}`} className="btn-primary shrink-0">
                开始学习 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
