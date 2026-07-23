import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { COURSE_MODULES } from "../learn/data/courseContent";
import { useLearnProgress } from "../learn/hooks/useLearnProgress";
import "./LandingPage.css";

const STAGES = [
  {
    index: "01",
    title: "市场与数据",
    desc: "弄清期货合约、交易所与盘口，再把 Tick / K 线变成可计算的数据。",
    mods: ["M1", "M2", "M3", "M4"],
    project: false,
  },
  {
    index: "02",
    title: "策略与回测",
    desc: "把想法写成纯函数策略，用回测当单元测试，避开前视偏差等陷阱。",
    mods: ["M5", "M6"],
    project: false,
  },
  {
    index: "03",
    title: "风控与范式",
    desc: "仓位、止损与资金曲线；看清趋势、套利等范式，再走上实盘路径。",
    mods: ["M7", "M8", "M9"],
    project: false,
  },
  {
    index: "04",
    title: "生产级实战",
    desc: "三个完整项目：CTA 趋势、跨品种套利、多因子截面，走完上线运维。",
    mods: ["M12", "M13", "M14"],
    project: true,
  },
] as const;

function shortTitle(title: string): string {
  return title.replace(/^第[一二三四五六七八九十]+模块：/, "");
}

function HeroChart() {
  return (
    <svg
      className="landing-hero__chart"
      viewBox="0 0 720 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="landingAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ec4a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2ec4a6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Candles */}
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="48" y1="210" x2="48" y2="290" />
        <rect x="40" y="230" width="16" height="42" fill="#1a9e84" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="96" y1="180" x2="96" y2="270" />
        <rect x="88" y="195" width="16" height="50" fill="#c45c4a" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="144" y1="160" x2="144" y2="250" />
        <rect x="136" y="175" width="16" height="55" fill="#1a9e84" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="192" y1="140" x2="192" y2="230" />
        <rect x="184" y="155" width="16" height="48" fill="#1a9e84" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="240" y1="170" x2="240" y2="265" />
        <rect x="232" y="190" width="16" height="52" fill="#c45c4a" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="288" y1="150" x2="288" y2="240" />
        <rect x="280" y="165" width="16" height="50" fill="#1a9e84" stroke="none" />
      </g>
      <g className="candle" stroke="#9aa8bc" strokeWidth="1.5">
        <line x1="336" y1="120" x2="336" y2="210" />
        <rect x="328" y="135" width="16" height="55" fill="#1a9e84" stroke="none" />
      </g>

      <path
        className="area"
        d="M40 300 C 120 280, 160 240, 220 250 C 300 265, 340 180, 420 160 C 500 140, 560 190, 640 110 L 640 380 L 40 380 Z"
      />
      <path
        className="line"
        d="M40 300 C 120 280, 160 240, 220 250 C 300 265, 340 180, 420 160 C 500 140, 560 190, 640 110"
      />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { progress } = useLearnProgress();
  const rootRef = useRef<HTMLElement>(null);

  const firstIncomplete = useMemo(
    () =>
      COURSE_MODULES.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id }))).find(
        ({ lessonId }) => !progress.completedLessons.includes(lessonId),
      ),
    [progress.completedLessons],
  );

  const started = progress.completedLessons.length > 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>(".landing-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const startLearning = () => {
    if (firstIncomplete) {
      navigate(`/learn/${firstIncomplete.moduleId}/${firstIncomplete.lessonId}`);
      return;
    }
    navigate("/learn");
  };

  const scrollToCurriculum = () => {
    document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="landing" ref={rootRef}>
      <section className="landing-hero" aria-label="课程介绍">
        <div className="landing-hero__bg" />
        <div className="landing-hero__grid" />
        <HeroChart />

        <h1 className="landing-hero__brand">
          <span>QuantNexus Course</span>
          量化交易课程
        </h1>
        <p className="landing-hero__headline">从程序员到准专家：用代码读懂期货量化</p>
        <p className="landing-hero__lede">
          面向有编程背景、金融零基础的学习者。十四个模块、互动实验与三个生产级实战项目，走完策略发现到实盘运维的完整路径。
        </p>
        <div className="landing-hero__cta">
          <button type="button" className="landing-btn landing-btn--primary" onClick={startLearning}>
            {started ? "继续学习" : "开始学习"}
          </button>
          <button type="button" className="landing-btn landing-btn--ghost" onClick={scrollToCurriculum}>
            查看课程大纲
          </button>
        </div>
      </section>

      <section className="landing-section landing-goal" aria-labelledby="goal-title">
        <div className="landing-section__inner landing-reveal">
          <p className="landing-kicker">课程目标</p>
          <h2 id="goal-title" className="landing-section__title">
            学完之后，你能独立完成什么
          </h2>
          <p className="landing-section__desc">
            不是堆砌名词，而是建立可迁移的量化工程能力：读懂市场、写出策略、验证有效、管住风险，并推进到可运维的实盘流程。
          </p>
          <ol className="landing-goal__list">
            <li>
              <span className="landing-goal__num">01</span>
              <div>
                <strong>建立正确的市场认知</strong>
                <p>理解期货合约、保证金与微观结构，知道订单如何成交、成本从哪里来。</p>
              </div>
            </li>
            <li>
              <span className="landing-goal__num">02</span>
              <div>
                <strong>独立研发并验证策略</strong>
                <p>把策略写成可测试的代码，用回测与稳健性检查回答「它是否真的有效」。</p>
              </div>
            </li>
            <li>
              <span className="landing-goal__num">03</span>
              <div>
                <strong>用风控守住生存底线</strong>
                <p>仓位、止损、资金曲线与尾部风险——先保证活下来，再谈收益。</p>
              </div>
            </li>
            <li>
              <span className="landing-goal__num">04</span>
              <div>
                <strong>推进到生产级流程</strong>
                <p>完成 CTA、套利、多因子三类项目演练，掌握从数据到上线运维的 SOP。</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-section landing-path" aria-labelledby="path-title">
        <div className="landing-section__inner landing-reveal">
          <p className="landing-kicker">学习路径</p>
          <h2 id="path-title" className="landing-section__title">
            四段旅程，由浅入深
          </h2>
          <p className="landing-section__desc">
            主线从零基础到实盘路径；因子与机器学习为选修进阶；最后三个模块是必须动手的生产实战。
          </p>
          <div className="landing-path__track">
            {STAGES.map((stage) => (
              <article
                key={stage.index}
                className={`landing-stage${stage.project ? " landing-stage--project" : ""}`}
              >
                <span className="landing-stage__index">STAGE {stage.index}</span>
                <h3>{stage.title}</h3>
                <p>{stage.desc}</p>
                <div className="landing-stage__mods">
                  {stage.mods.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="curriculum"
        className="landing-section landing-curriculum"
        aria-labelledby="curriculum-title"
      >
        <div className="landing-section__inner landing-reveal">
          <p className="landing-kicker">课程大纲</p>
          <h2 id="curriculum-title" className="landing-section__title">
            十四个模块，覆盖从入门到生产
          </h2>
          <div className="landing-curriculum__meta">
            <div>
              <strong>14</strong>
              模块
            </div>
            <div>
              <strong>68</strong>
              课节
            </div>
            <div>
              <strong>11</strong>
              互动组件
            </div>
            <div>
              <strong>3</strong>
              生产级项目
            </div>
          </div>
          <ul className="landing-modules">
            {COURSE_MODULES.map((mod, i) => {
              const isProject = mod.id === "m12" || mod.id === "m13" || mod.id === "m14";
              const tag = mod.elective ? "选修" : isProject ? "实战" : null;
              return (
                <li
                  key={mod.id}
                  onClick={() => navigate(`/learn/${mod.id}/${mod.lessons[0].id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/learn/${mod.id}/${mod.lessons[0].id}`);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <span className="landing-modules__id">M{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="landing-modules__title">{shortTitle(mod.title)}</p>
                    <p className="landing-modules__desc">{mod.description}</p>
                  </div>
                  {tag ? (
                    <span
                      className={`landing-modules__tag${
                        mod.elective
                          ? " landing-modules__tag--elective"
                          : " landing-modules__tag--project"
                      }`}
                    >
                      {tag}
                    </span>
                  ) : (
                    <span className="landing-modules__tag">{mod.lessons.length} 课</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="landing-section landing-practice" aria-labelledby="practice-title">
        <div className="landing-section__inner landing-reveal">
          <p className="landing-kicker">怎么学</p>
          <h2 id="practice-title" className="landing-section__title">
            读、做、测，缺一不可
          </h2>
          <p className="landing-section__desc">
            课程按程序员习惯组织：概念讲清原理，互动组件让你亲手试，测验与项目把理解压实。
          </p>
          <div className="landing-practice__row">
            <div className="landing-practice__item">
              <h3>互动实验</h3>
              <p>杠杆、破产模拟、前视偏差、订单簿等 11 个组件，把抽象概念变成可操作的直觉。</p>
            </div>
            <div className="landing-practice__item">
              <h3>课末自检</h3>
              <p>每课配测验与术语表，进度保存在本地，方便断点续学，不依赖账号体系。</p>
            </div>
            <div className="landing-practice__item">
              <h3>生产项目</h3>
              <p>最后三个模块要求你跑完整 SOP：数据、策略、回测、风控，直到上线演练。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-close" aria-labelledby="close-title">
        <div className="landing-section__inner landing-reveal">
          <p className="landing-kicker">开始</p>
          <h2 id="close-title" className="landing-close__title">
            打开第一课，用工程师的方式进入市场
          </h2>
          <p className="landing-close__desc">
            主线约十三小时可完成核心路径。建议按模块顺序推进；选修内容可在主线毕业后再学。
          </p>
          <div className="landing-hero__cta">
            <button type="button" className="landing-btn landing-btn--primary" onClick={startLearning}>
              {started ? "继续上次进度" : "从第一课开始"}
            </button>
            <button
              type="button"
              className="landing-btn landing-btn--ghost"
              onClick={() => navigate("/learn")}
            >
              进入学习面板
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>QuantNexus Course · MIT License</span>
        <a href="https://github.com/wxwangxiaoshuai/quantnexus-course" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </main>
  );
}
