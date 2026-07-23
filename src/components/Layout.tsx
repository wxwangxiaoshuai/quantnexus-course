import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useLearnProgress } from "../hooks/useLearnProgress";
import { curriculum } from "../data/curriculum";
import { lessonOverallProgress } from "../lib/progress";

const navItems = [
  { to: "/", label: "首页", end: true },
  { to: "/curriculum", label: "课程大纲", end: false },
  { to: "/roadmap", label: "学习路线", end: false },
  { to: "/projects", label: "实战项目", end: false },
  { to: "/glossary", label: "术语", end: false },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl shadow-lg shadow-brand-700/30 transition-transform group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-sm font-bold tracking-tight text-ink-50">量化交易课程</span>
        <span className="text-[11px] text-ink-400">QuantNexus</span>
      </span>
    </Link>
  );
}

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { progress } = useLearnProgress();
  const overall = lessonOverallProgress(curriculum, progress);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-ink-50" : "text-ink-400 hover:text-ink-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-ink-400 sm:inline" title="学习进度（课节）">
              {overall.done}/{overall.total}
            </span>
            <ThemeToggle />
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 text-ink-200 md:hidden"
              aria-label="打开菜单"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-ink-800 px-5 py-3 md:hidden">
            <div className="mb-2 font-mono text-xs text-ink-500">
              进度 {overall.done}/{overall.total} · {overall.percent}%
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-ink-800 text-ink-50" : "text-ink-300"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-800/80 bg-ink-950/60">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-ink-400">量化交易课程 · QuantNexus · 从期货基础到生产级策略</p>
          <div className="text-xs text-ink-500">7 阶段 · 14 模块 · 实战项目贯穿始终</div>
        </div>
      </footer>
    </div>
  );
}
